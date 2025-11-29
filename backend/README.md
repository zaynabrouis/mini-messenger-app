# Mini Messenger Backend

A complete Node.js backend for a real-time chat application using Express, Socket.io, and MongoDB.

## Features

- 🔐 JWT Authentication (Register/Login)
- 💬 Real-time messaging with Socket.io
- 🗄️ MongoDB database with Mongoose
- ✅ Input validation
- 🛡️ Error handling
- 🔒 Protected routes
- 📦 Modular, well-documented code

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Server port (optional, defaults to 3000)

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe"
  }
}
```

#### POST /auth/login
Login an existing user.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "john_doe"
  }
}
```

### Protected Routes

#### GET /api/user
Get current user information (requires JWT token).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "john_doe"
  }
}
```

## Socket.io Events

### Client → Server

#### `joinRoom(room)`
Join a chat room. Server will send last 50 messages from that room.

**Parameters:**
- `room` (string): Room name to join

**Authentication:** Token must be provided in handshake:
```javascript
socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

#### `chatMessage({room, text})`
Send a message to a room.

**Parameters:**
- `room` (string): Room name
- `text` (string): Message text (max 1000 characters)

**Example:**
```javascript
socket.emit('chatMessage', {
  room: 'general',
  text: 'Hello, world!'
});
```

#### `leaveRoom(room)`
Leave a chat room.

**Parameters:**
- `room` (string): Room name to leave

### Server → Client

#### `roomHistory`
Emitted when a user joins a room. Contains last 50 messages.

**Data:**
```json
{
  "room": "general",
  "messages": [
    {
      "_id": "message_id",
      "room": "general",
      "username": "john_doe",
      "text": "Hello!",
      "ts": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### `message`
Emitted when a new message is received in a room.

**Data:**
```json
{
  "room": "general",
  "username": "john_doe",
  "text": "Hello, world!",
  "ts": "2024-01-01T12:00:00.000Z",
  "_id": "message_id"
}
```

#### `userJoined`
Emitted when another user joins the room.

**Data:**
```json
{
  "username": "jane_doe",
  "room": "general"
}
```

#### `error`
Emitted when an error occurs.

**Data:**
```json
{
  "message": "Error message"
}
```

## Project Structure

```
backend/
├── src/
│   ├── index.js           # Main application entry point
│   ├── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js        # User model
│   │   └── Message.js     # Message model
│   ├── routes/
│   │   └── auth.js        # Authentication routes
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication middleware
│   │   ├── validation.js  # Input validation middleware
│   │   └── errorHandler.js # Error handling middleware
│   └── tests/             # Test files (to be added)
├── package.json
├── .env.example
└── README.md
```

## Models

### User
- `username` (string, unique, required)
- `password` (string, hashed with bcrypt, required)
- `createdAt` (date, auto-generated)
- `updatedAt` (date, auto-generated)

### Message
- `room` (string, required, indexed)
- `username` (string, required)
- `text` (string, required, max 1000 chars)
- `ts` (date, default: now, indexed)

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days
- All protected routes require valid JWT token
- Input validation on all user inputs
- CORS enabled (configure for production)

## License

ISC

