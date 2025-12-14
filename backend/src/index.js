/**
 * Main Application Entry Point
 * Sets up Express server, Socket.io, and connects to MongoDB
 */

require('dotenv').config();
const express = require('express');
const http = require('node:http');
const cors = require('cors');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const roomsRoutes = require('./routes/rooms');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const Message = require('./models/Message');
const Room = require('./models/Room');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS support
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST'],
  },
});

// Prometheus Metrics
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
const register = new client.Registry();
collectDefaultMetrics({ register });

// Add a custom metric (example: connected users)
const connectedUsersGauge = new client.Gauge({
  name: 'chat_connected_users_total',
  help: 'Total number of connected users',
  registers: [register],
});

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
const dbURI = process.env.MONGODB_URI || 'undefined';
console.log('Connection String:', dbURI.includes('@') ? dbURI.split('@')[1] : dbURI); // Log host only for security
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Public Routes
app.use('/auth', authRoutes);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Health check endpoint (public)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Protected Routes - All routes require JWT authentication
app.use('/api/chat', chatRoutes);
app.use('/rooms', roomsRoutes);

// Protected user info endpoint
app.get('/api/user', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.substring(7);

    if (!token) {
      console.error('Socket auth: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.error('Socket auth: User not found for userId:', decoded.userId);
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user._id.toString();
    socket.username = user.username;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      console.error('Socket auth: Invalid token -', error.message);
      return next(new Error('Authentication error: Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      console.error('Socket auth: Token expired');
      return next(new Error('Authentication error: Token expired'));
    }
    console.error('Socket auth error:', error.message);
    return next(new Error('Authentication error: ' + error.message));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.username} (${socket.id})`);
  connectedUsersGauge.inc();

  // Handle connection errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.username}:`, error);
  });

  /**
   * Handle joining a room
   * Validates room exists in database before allowing join
   * Emits last 50 messages from that room
   */
  socket.on('joinRoom', async (room) => {
    try {
      // Validate room name
      if (!room || typeof room !== 'string' || room.trim().length === 0) {
        socket.emit('error', { message: 'Invalid room name' });
        return;
      }

      const roomName = room.trim();

      // Check MongoDB connection before querying
      if (mongoose.connection.readyState !== 1) {
        console.error('MongoDB not connected, attempting to reconnect...');
        try {
          await connectDB(false); // Don't exit on error, just throw
          // Wait a bit for connection to stabilize
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (reconnectError) {
          console.error('Failed to reconnect to MongoDB:', reconnectError.message);
          socket.emit('error', { 
            message: 'Database connection lost. Please refresh the page.' 
          });
          return;
        }
      }

      // Check if room exists in database
      let roomExists;
      try {
        roomExists = await Room.findOne({ name: roomName });
      } catch (dbError) {
        console.error('Database error when checking room:', dbError);
        // If it's an authentication error, provide helpful message
        if (dbError.code === 18 || dbError.codeName === 'AuthenticationFailed') {
          socket.emit('error', { 
            message: 'Database authentication failed. Please check your MongoDB connection string.' 
          });
        } else {
          socket.emit('error', { 
            message: 'Database error. Please try again later.' 
          });
        }
        return;
      }

      if (!roomExists) {
        socket.emit('error', { 
          message: `Room "${roomName}" does not exist. Please create the room first.` 
        });
        return;
      }

      // Leave previous rooms (optional: if you want users to be in only one room at a time)
      // socket.rooms.forEach(room => {
      //   if (room !== socket.id) {
      //     socket.leave(room);
      //   }
      // });

      // Join the room
      socket.join(roomName);
      console.log(`📥 ${socket.username} joined room: ${roomName}`);

      // Get last 50 messages from the room
      const messages = await Message.find({ room: roomName })
        .sort({ ts: -1 })
        .limit(50)
        .lean();

      // Reverse to show oldest first
      messages.reverse();

      // Send room history to the user
      socket.emit('roomHistory', {
        room: roomName,
        messages,
      });

      // Notify others in the room (optional)
      socket.to(roomName).emit('userJoined', {
        username: socket.username,
        room: roomName,
      });
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  /**
   * Handle chat messages
   * Saves message to DB and broadcasts to room
   */
  socket.on('chatMessage', async (data) => {
    try {
      const { room, text } = data;

      // Validate input
      if (!room || typeof room !== 'string' || room.trim().length === 0) {
        socket.emit('error', { message: 'Invalid room name' });
        return;
      }

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        socket.emit('error', { message: 'Message text is required' });
        return;
      }

      if (text.length > 1000) {
        socket.emit('error', { message: 'Message cannot exceed 1000 characters' });
        return;
      }

      const roomName = room.trim();
      const messageText = text.trim();

      // Check if user is in the room
      if (!socket.rooms.has(roomName)) {
        socket.emit('error', { message: 'You must join the room first' });
        return;
      }

      // Create and save message
      const message = new Message({
        room: roomName,
        username: socket.username,
        text: messageText,
        ts: new Date(),
      });

      await message.save();

      // Broadcast message to all users in the room
      io.to(roomName).emit('message', {
        room: roomName,
        username: socket.username,
        text: messageText,
        ts: message.ts,
        _id: message._id,
      });

      console.log(`💬 ${socket.username} sent message in ${roomName}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * Handle leaving a room
   */
  socket.on('leaveRoom', (room) => {
    if (room && typeof room === 'string') {
      socket.leave(room.trim());
      console.log(`📤 ${socket.username} left room: ${room}`);
    }
  });

  /**
   * Handle disconnection
   */
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.username} (${socket.id})`);
    connectedUsersGauge.dec();
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

