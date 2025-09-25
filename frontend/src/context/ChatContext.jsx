import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import io from "socket.io-client";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [authToken, setAuthToken] = useState(null);
  const [connected, setConnected] = useState(false);

  // Obtain a fresh Firebase ID token when the user changes
  useEffect(() => {
    let cancelled = false;
    const fetchToken = async () => {
      try {
        if (!user) {
          setAuthToken(null);
          return;
        }
        const token = await user.getIdToken(/* forceRefresh */ true);
        if (!cancelled) setAuthToken(token);
      } catch (e) {
        console.error("Failed to get ID token:", e);
        if (!cancelled) setAuthToken(null);
      }
    };
    fetchToken();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Load existing messages from database once token is ready
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (!authToken) return; // wait for token
        const response = await fetch("http://localhost:3001/api/messages", {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(
            data.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.createdAt).toLocaleTimeString(),
            }))
          );
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [authToken]);

  useEffect(() => {
    if (user && authToken) {
      // Connect to Socket.IO server with token auth and basic identity hints
      const newSocket = io("http://localhost:3001", {
        auth: {
          token: authToken,
          email: user.email,
          displayName: user.displayName || (user.email && user.email.split("@")[0]) || "User",
          avatarUrl: user.photoURL || undefined
        }
      });
      setSocket(newSocket);

      newSocket.on("connect", () => setConnected(true));
      newSocket.on("disconnect", () => setConnected(false));

      // Join the chat room (server will prefer token identity)
      newSocket.emit("join", { email: user.email, displayName: user.displayName, avatarUrl: user.photoURL });

      // Listen for new messages
      newSocket.on("newMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      // Listen for user joined notifications
      newSocket.on("userJoined", (data) => {
        setMessages((prev) => [
          ...prev,
          {
            _id: data._id,
            text: data.message,
            sender: "System",
            timestamp: data.timestamp,
            type: "system",
          },
        ]);
      });

      // Listen for user left notifications
      newSocket.on("userLeft", (data) => {
        setMessages((prev) => [
          ...prev,
          {
            _id: data._id,
            text: data.message,
            sender: "System",
            timestamp: data.timestamp,
            type: "system",
          },
        ]);
      });

      // Listen for full user list updates
      newSocket.on("users", (users) => {
        setConnectedUsers(users);
      });

      // Listen for typing indicator updates
      newSocket.on("typing", ({ email, isTyping }) => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          if (isTyping) next.add(email); else next.delete(email);
          return next;
        });
      });

      return () => {
        setConnected(false);
        newSocket.close();
      };
    }
  }, [user, authToken]);

  const sendMessage = (messageData) => {
    if (socket && messageData.text.trim()) {
      // Send message to server
      socket.emit("sendMessage", { text: messageData.text });
    }
  };

  const startTyping = () => {
    if (socket) socket.emit("typing", { isTyping: true });
  };

  const stopTyping = () => {
    if (socket) socket.emit("typing", { isTyping: false });
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        connectedUsers,
        typingUsers,
        startTyping,
        stopTyping,
        isConnected: connected,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
