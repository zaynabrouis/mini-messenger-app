/**
 * Socket.io Client Setup
 * Creates and manages Socket.io connection with JWT authentication
 */

import { io } from 'socket.io-client';

// Get server URL from environment or use default
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Get JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Create a Socket.io client instance
 * Automatically includes JWT token in connection auth
 * @returns {import('socket.io-client').Socket} Socket.io client instance
 */
export const createSocket = () => {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token found. Please login first.');
  }

  const socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
  });

  // Connection event handlers
  socket.on('connect', () => {
    console.log('✅ Connected to server:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected from server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
  });

  return socket;
};

export default createSocket;

