# Quick Start Guide

## ✅ Step 1: Dependencies Installed
Great! You've already run `npm install` successfully.

## ⚠️ Step 2: MongoDB Setup Required

Before starting the server, you need MongoDB running. Choose one option:

### Option A: Local MongoDB (if installed)
1. Make sure MongoDB service is running
2. Your `.env` file should have:
   ```
   MONGODB_URI=mongodb://localhost:27017/mini-messenger
   ```

### Option B: MongoDB Atlas (Cloud - Recommended for beginners)
1. Go to https://www.mongodb.com/cloud/atlas (free tier available)
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/mini-messenger`)
4. Update your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-messenger
   ```

## 🚀 Step 3: Start the Server

Once MongoDB is ready, start the server:

```cmd
npm start
```

Or for development with auto-reload:
```cmd
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 3000
📡 Socket.io server ready
```

## 🧪 Step 4: Test the API

Open a new terminal and test the registration endpoint:

```cmd
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"password123\"}"
```

Or use a tool like Postman to test the endpoints.

## 📝 Note for Windows CMD

In Windows CMD (not PowerShell), use:
- `dir` instead of `ls` to list files
- `cd` to change directories (same as PowerShell)

