# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   Create a file named `.env` in the `backend` directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/mini-messenger
   JWT_SECRET=your-secret-key-change-this-in-production
   PORT=3000
   ```
   
   **Important:** 
   - Replace `MONGODB_URI` with your actual MongoDB connection string
   - Replace `JWT_SECRET` with a secure random string (use a long, random string in production)
   - `PORT` is optional (defaults to 3000)

3. **Start MongoDB:**
   Make sure MongoDB is running on your system or use a cloud MongoDB service like MongoDB Atlas.

4. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT token signing | Yes | - |
| `PORT` | Server port | No | 3000 |

## Testing the API

### Register a user:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Test protected route:
```bash
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Socket.io Testing

You can test Socket.io connections using a tool like Postman, Socket.io client, or create a simple test script.

Example Socket.io client connection:
```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Join a room
  socket.emit('joinRoom', 'general');
  
  // Listen for room history
  socket.on('roomHistory', (data) => {
    console.log('Room history:', data);
  });
  
  // Send a message
  socket.emit('chatMessage', {
    room: 'general',
    text: 'Hello, world!'
  });
  
  // Listen for new messages
  socket.on('message', (data) => {
    console.log('New message:', data);
  });
});
```

