# Mini Messenger Frontend

React + Vite frontend for the Mini Messenger chat application.

## Features

- 🔐 JWT Authentication
- 💬 Real-time messaging with Socket.io
- 🏠 Room management (create and switch rooms)
- 📱 Responsive design
- 🎨 Clean, modern UI

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

If not set, defaults to `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx      # Login page
│   │   └── Chat.jsx       # Chat page
│   ├── components/
│   │   ├── MessageList.jsx    # Message display component
│   │   ├── MessageInput.jsx   # Message input component
│   │   └── RoomSelector.jsx   # Room selection component
│   ├── App.jsx            # Main app with routing
│   ├── api.js             # API utility with JWT
│   ├── socket.js          # Socket.io client setup
│   ├── styles.css         # Global styles
│   └── main.jsx           # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## Usage

1. **Login:**
   - Enter username and password
   - Token is saved to localStorage
   - Redirects to chat page

2. **Chat:**
   - Select or create a room
   - Send and receive messages in real-time
   - Messages are displayed with username and timestamp

3. **Logout:**
   - Click logout button
   - Clears token and redirects to login

## API Integration

- Uses `api.js` for REST API calls with automatic JWT token inclusion
- Uses `socket.js` for Socket.io connection with JWT authentication
- All API requests include `Authorization: Bearer <token>` header

## Technologies

- React 18
- Vite
- React Router
- Socket.io Client
- CSS (no external UI libraries)

