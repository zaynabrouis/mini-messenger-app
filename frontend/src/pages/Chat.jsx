/**
 * Chat Page
 * Main chat interface with Socket.io real-time messaging
 * - Connects to socket.io server with JWT authentication
 * - Manages room switching
 * - Displays and sends messages
 * - Handles logout
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSocket } from '../socket';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import RoomSelector from '../components/RoomSelector';
import { get } from '../api';
import '../styles.css';

const Chat = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const socketRef = useRef(null);

  /**
   * Fetch current user info
   */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await get('/api/user');
        if (response.success) {
          setCurrentUser(response.user);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  /**
   * Initialize Socket.io connection on component mount
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Redirect to login if no token
    if (!token) {
      navigate('/');
      return;
    }

    try {
      // Create socket connection with JWT token
      const newSocket = createSocket();
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        setError('');
        
        // Join default room on connection
        newSocket.emit('joinRoom', currentRoom);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        const errorMessage = err.message || 'Failed to connect to server';
        
        // If authentication error, clear token and redirect to login
        if (errorMessage.includes('Authentication') || errorMessage.includes('token')) {
          localStorage.removeItem('token');
          setError('Session expired. Please login again.');
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError('Failed to connect to server. Please check your connection.');
        }
        setConnected(false);
      });

      // Message event handlers
      newSocket.on('roomHistory', (data) => {
        console.log('Room history received:', data);
        if (data.room === currentRoom) {
          setMessages(data.messages || []);
        }
      });

      newSocket.on('message', (message) => {
        console.log('New message received:', message);
        if (message.room === currentRoom) {
          setMessages((prev) => [...prev, message]);
        }
      });

      newSocket.on('error', (errorData) => {
        console.error('Socket error:', errorData);
        setError(errorData.message || 'An error occurred');
      });

      // Cleanup on unmount
      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } catch (err) {
      console.error('Error creating socket:', err);
      setError(err.message || 'Failed to initialize connection');
    }
  }, []); // Run only on mount

  /**
   * Handle room change
   * Leaves current room and joins new room
   */
  useEffect(() => {
    if (socket && connected && currentRoom) {
      // Leave previous room
      socket.emit('leaveRoom', currentRoom);
      
      // Clear messages for room switch
      setMessages([]);
      
      // Join new room
      socket.emit('joinRoom', currentRoom);
    }
  }, [currentRoom, socket, connected]);

  /**
   * Handle sending a message
   * @param {string} text - Message text
   */
  const handleSendMessage = (text) => {
    if (socket && connected && currentRoom) {
      socket.emit('chatMessage', {
        room: currentRoom,
        text: text,
      });
    }
  };

  /**
   * Handle logout
   * Clears token and redirects to login
   */
  const handleLogout = () => {
    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }
    
    // Clear token
    localStorage.removeItem('token');
    
    // Redirect to login
    navigate('/');
  };

  // Redirect to login if no token
  if (!localStorage.getItem('token')) {
    return null;
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <div className="user-info">
            <div className="user-avatar">
              {currentUser ? currentUser.username.charAt(0).toUpperCase() : 'Z'}
            </div>
            <div className="user-details">
              <span className="username">{currentUser ? currentUser.username : 'Loading...'}</span>
              <div className="connection-status">
                <span className={`status-indicator ${connected ? 'connected' : 'disconnected'}`}>
                  {connected ? '●' : '○'}
                </span>
                <span>{connected ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        <RoomSelector
          currentRoom={currentRoom}
          onRoomChange={setCurrentRoom}
        />

        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="chat-main">
        <div className="chat-room-header">
          <h2>#{currentRoom}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <MessageList messages={messages} currentUser={currentUser} />

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!connected}
        />
      </div>
    </div>
  );
};

export default Chat;

