# Chat Application

A real-time chat application built with React, Firebase Authentication, and Socket.IO.

## Features

- 🔐 **Firebase Authentication** - Secure user registration and login
- 💬 **Real-time Messaging** - Instant message delivery using Socket.IO
- 👥 **User Presence** - See when users join and leave the chat
- 🎨 **Modern UI** - Clean and responsive design
- 🔄 **Auto-scroll** - Messages automatically scroll to bottom
- 📱 **Responsive** - Works on desktop and mobile devices

## Project Structure

```
chat_application/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── App.jsx           # Main app component
│   │   ├── firebase.js       # Firebase configuration
│   │   └── main.jsx          # App entry point
│   └── package.json
├── backend/                  # Node.js backend server
│   ├── server.js             # Express server with Socket.IO
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project (for authentication)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd chat_application
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Backend Setup
```bash
cd ../backend
npm install
```

### 4. Environment Configuration

Create a `.env` file in the backend directory:
```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=3001
NODE_ENV=development
```

### 5. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password
3. Get your Firebase config from Project Settings
4. Update `frontend/src/firebase.js` with your Firebase configuration

## Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3001`

### Start the Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Create a new account or login with existing credentials
3. Start chatting! Messages will be delivered in real-time to all connected users

## Key Features Explained

### Authentication Flow
- Users can register with email and password
- Firebase handles authentication securely
- JWT tokens are stored in localStorage
- Protected routes redirect to login if not authenticated

### Real-time Messaging
- Socket.IO handles real-time communication
- Messages are broadcast to all connected users
- System notifications for user join/leave events
- Optimistic UI updates for better user experience

### State Management
- React Context for global state management
- Separate contexts for authentication and chat
- Proper error handling and loading states

## Technologies Used

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Firebase** - Authentication
- **Socket.IO Client** - Real-time communication
- **Vite** - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - Real-time communication
- **CORS** - Cross-origin resource sharing

## Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Code Structure

The application follows a clean architecture pattern:
- **Components** are reusable UI elements
- **Pages** are route-specific components
- **Context** manages global state
- **Services** handle external API calls

## Deployment

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy to services like Heroku, Railway, or DigitalOcean

## Security Considerations

- Firebase handles authentication securely
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- CORS is configured for development
- Input validation is implemented on both frontend and backend

## Future Enhancements

- [ ] Message persistence with database
- [ ] User profiles and avatars
- [ ] File sharing capabilities
- [ ] Private messaging
- [ ] Message reactions and emojis
- [ ] Typing indicators
- [ ] Message search functionality
- [ ] Dark mode theme

## Troubleshooting

### Common Issues

1. **Socket connection failed**
   - Ensure backend server is running on port 3001
   - Check CORS configuration

2. **Firebase authentication errors**
   - Verify Firebase configuration in `firebase.js`
   - Ensure Authentication is enabled in Firebase Console

3. **Messages not appearing**
   - Check browser console for errors
   - Verify Socket.IO connection status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
