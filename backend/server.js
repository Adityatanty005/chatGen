// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database'); // update path if needed
const Message = require('./models/Message');
const User = require('./models/User');
const mongoose = require('mongoose');
const { verifyIdToken } = require('./config/firebaseAdmin');

// Determine if auth should be optional (dev-friendly default when Admin SDK isn't configured)
const AUTH_OPTIONAL = (process.env.AUTH_OPTIONAL === 'true') || (!process.env.FIREBASE_SERVICE_ACCOUNT && !process.env.GOOGLE_APPLICATION_CREDENTIALS);
const DEBUG_ROUTES = process.env.DEBUG_ROUTES === 'true';

const app = express();
const server = http.createServer(app);

// Resolve allowed origins for CORS/Socket.IO from env (comma-separated)
const DEFAULT_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
const ENV_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = ENV_ORIGINS.length > 0 ? ENV_ORIGINS : DEFAULT_ORIGINS;
const allowAll = ALLOWED_ORIGINS.length === 1 && ALLOWED_ORIGINS[0] === "*";

const io = socketIo(server, {
  cors: {
    origin: allowAll ? true : ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

// Debug routes are exposed only when explicitly enabled
if (DEBUG_ROUTES) {
  // Count users (debug)
  app.get('/api/users/count', async (req, res) => {
    try {
      const count = await User.countDocuments();
      res.json({ count });
    } catch (e) {
      res.status(500).json({ error: 'Failed to count users' });
    }
  });

  // Seed a user (debug) - creates a unique email based on timestamp
  app.post('/api/users/seed', async (req, res) => {
    try {
      const email = `seed_${Date.now()}@example.com`;
      const user = await User.create({ email, displayName: 'Seed User' });
      res.status(201).json(user);
    } catch (e) {
      res.status(500).json({ error: 'Failed to seed user' });
    }
  });
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: allowAll ? true : ALLOWED_ORIGINS, credentials: false }));
app.use(express.json());

// Warn if running in production with optional auth
if (process.env.NODE_ENV === 'production' && AUTH_OPTIONAL) {
  console.warn('WARNING: AUTH_OPTIONAL is enabled in production. Routes and sockets accept unauthenticated traffic.');
}

// Auth middleware for REST routes using Firebase ID token from Authorization: Bearer <token>
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) {
      if (AUTH_OPTIONAL) return next();
      return res.status(401).json({ error: 'Missing bearer token' });
    }
    const decoded = await verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name || (decoded.email && decoded.email.split('@')[0]) || 'User',
      provider: 'firebase'
    };
    return next();
  } catch (e) {
    if (AUTH_OPTIONAL) return next();
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Store connected users
const connectedUsers = new Map();
const getUserList = () => Array.from(connectedUsers.values()).map(u => u.email);

// Authenticate Socket.IO connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      if (AUTH_OPTIONAL) {
        const hintEmail = socket.handshake.auth && socket.handshake.auth.email;
        const hintName = socket.handshake.auth && socket.handshake.auth.displayName;
        const hintAvatar = socket.handshake.auth && socket.handshake.auth.avatarUrl;
        socket.user = {
          email: hintEmail || 'anonymous@local',
          displayName: hintName || (hintEmail && hintEmail.split('@')[0]) || 'User',
          avatarUrl: hintAvatar,
          provider: 'dev'
        };
        return next();
      }
      return next(new Error('Unauthorized'));
    }
    const decoded = await verifyIdToken(token);
    socket.user = {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name || (decoded.email && decoded.email.split('@')[0]) || 'User',
      avatarUrl: decoded.picture,
      provider: 'firebase'
    };
    next();
  } catch (e) {
    if (AUTH_OPTIONAL) {
      const hintEmail = socket.handshake.auth && socket.handshake.auth.email;
      const hintName = socket.handshake.auth && socket.handshake.auth.displayName;
      const hintAvatar = socket.handshake.auth && socket.handshake.auth.avatarUrl;
      socket.user = {
        email: hintEmail || 'anonymous@local',
        displayName: hintName || (hintEmail && hintEmail.split('@')[0]) || 'User',
        avatarUrl: hintAvatar,
        provider: 'dev'
      };
      return next();
    }
    next(new Error('Unauthorized'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (userData) => {
    // Prefer authenticated identity from token over client payload
    const authedUser = socket.user || userData || {};
    connectedUsers.set(socket.id, authedUser);
    console.log('User joined:', authedUser.email);
    
    try {
      // Ensure user exists and update presence
      try {
        const now = new Date();
        await User.findOneAndUpdate(
          { email: authedUser.email },
          {
            $setOnInsert: {
              email: authedUser.email,
              provider: authedUser.provider || 'firebase'
            },
            $set: {
              status: 'online',
              lastSeen: now,
              // refresh profile fields on each join if provided
              displayName: authedUser.displayName || (authedUser.email && authedUser.email.split('@')[0]) || 'User',
              avatarUrl: authedUser.avatarUrl
            }
          },
          { upsert: true, new: true, runValidators: true }
        );
      } catch (e) {
        console.error('Upsert user failed:', e);
      }

      const systemMessage = new Message({
        text: `${authedUser.email} joined the chat`,
        sender: 'System',
        type: 'system'
      });
      const savedMessage = await systemMessage.save();

      socket.broadcast.emit('userJoined', {
        user: authedUser.email,
        message: `${authedUser.email} joined the chat`,
        _id: savedMessage._id,
        timestamp: savedMessage.createdAt.toLocaleTimeString()
      });
      // Broadcast updated user list to everyone
      io.emit('users', getUserList());
    } catch (error) {
      console.error('Error saving system message:', error);
    }
  });

  socket.on('sendMessage', async (messageData) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    try {
      const text = (messageData && typeof messageData.text === 'string') ? messageData.text.trim() : '';
      if (!text) {
        return socket.emit('sendMessageError', { error: 'Message text is required' });
      }
      if (text.length > 2000) {
        return socket.emit('sendMessageError', { error: 'Message too long' });
      }
      const newMessage = new Message({
        text,
        sender: user.email,
        type: 'message'
      });
      const savedMessage = await newMessage.save();

      const message = {
        _id: savedMessage._id,
        text: savedMessage.text,
        sender: savedMessage.sender,
        timestamp: savedMessage.createdAt.toLocaleTimeString(),
        type: savedMessage.type
      };

      io.emit('newMessage', message);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('sendMessageError', { error: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (payload) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;
    const isTyping = !!(payload && payload.isTyping);
    socket.broadcast.emit('typing', { email: user.email, isTyping });
  });

  socket.on('disconnect', async () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      // Remove from connected users before broadcasting updates
      connectedUsers.delete(socket.id);
      console.log('User disconnected:', user.email);

      try {
        // Update presence to offline
        try {
          await User.findOneAndUpdate(
            { email: user.email },
            { $set: { status: 'offline', lastSeen: new Date() } },
            { new: true }
          );
        } catch (e) {
          console.error('Set user offline failed:', e);
        }

        const systemMessage = new Message({
          text: `${user.email} left the chat`,
          sender: 'System',
          type: 'system'
        });
        const savedMessage = await systemMessage.save();

        socket.broadcast.emit('userLeft', {
          user: user.email,
          message: `${user.email} left the chat`,
          _id: savedMessage._id,
          timestamp: savedMessage.createdAt.toLocaleTimeString()
        });
        // Broadcast updated user list to everyone (after removal)
        io.emit('users', getUserList());
        // Clear typing state for this user for others
        socket.broadcast.emit('typing', { email: user.email, isTyping: false });
      } catch (error) {
        console.error('Error saving system message:', error);
      }
    }
  });
});

// API Routes
app.get('/api/messages', requireAuth, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Minimal Users API to create and view users (ensures collection appears)
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(50).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', requireAuth, async (req, res) => {
  try {
    const { email = req.user.email, displayName = req.user.displayName, avatarUrl, roles, provider = 'firebase' } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }
    const payload = {
      email,
      displayName,
      avatarUrl,
      roles,
      provider
    };
    const user = await User.create(payload);
    console.log('User created:', user._id, email);
    res.status(201).json(user);
  } catch (error) {
    console.error('Create user failed:', error);
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', connectedUsers: connectedUsers.size });
});

// DB health details: current db name and collection list
app.get('/health/db', async (req, res) => {
  try {
    const connection = mongoose.connection;
    if (!connection || connection.readyState !== 1 || !connection.db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const collections = await connection.db.listCollections().toArray();
    res.json({
      dbName: connection.name,
      host: (connection && connection.host) || undefined,
      collections: collections.map(c => c.name)
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch DB health' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});
