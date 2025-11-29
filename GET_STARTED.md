# Get Started - Mini Messenger

## Step 1: Set Up MongoDB (REQUIRED)

The backend needs MongoDB to work. Choose one option:

### Option A: MongoDB Atlas (Free Cloud - Easiest) ⭐ Recommended

1. **Sign up**: Go to https://www.mongodb.com/cloud/atlas/register
2. **Create cluster**: Click "Build a Database" → Choose FREE tier
3. **Create user**: 
   - Go to "Database Access" → "Add New Database User"
   - Username: `admin` (or any name)
   - Password: Create a strong password (SAVE IT!)
   - Click "Add User"
4. **Whitelist IP**: 
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
5. **Get connection string**:
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://username:password@cluster.mongodb.net/mini-messenger`

6. **Update backend/.env**:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mini-messenger
   JWT_SECRET=your-secret-key-here-make-it-long-and-random
   PORT=3000
   ```

### Option B: Local MongoDB

1. **Download**: https://www.mongodb.com/try/download/community
2. **Install**: Run installer, choose "Complete" installation
3. **Start**: MongoDB should start automatically as a Windows service
4. **Update backend/.env**:
   ```
   MONGODB_URI=mongodb://localhost:27017/mini-messenger
   JWT_SECRET=your-secret-key-here-make-it-long-and-random
   PORT=3000
   ```

## Step 2: Create .env File

In the `backend` directory, create a file named `.env`:

```bash
cd backend
```

Create `.env` file with:
```
MONGODB_URI=your-connection-string-here
JWT_SECRET=change-this-to-a-random-secret-key
PORT=3000
```

## Step 3: Start Backend

```bash
cd backend
npm start
```

**Wait for**: `✅ MongoDB connected successfully`

If you see `❌ MongoDB connection error`, go back to Step 1 and fix your MongoDB setup.

## Step 4: Register a User

**IMPORTANT**: Run this from the `backend` directory!

```bash
cd backend
node register-user.js testuser password123
```

Or use PowerShell (from backend directory):
```powershell
$body = @{username="testuser"; password="password123"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/auth/register -Method POST -Body $body -ContentType "application/json"
```

## Step 5: Start Frontend

Open a NEW terminal window:

```bash
cd frontend
npm install
npm run dev
```

## Step 6: Open Browser

Go to: **http://localhost:5173**

Login with:
- Username: `testuser`
- Password: `password123`

## Troubleshooting

### "MongoDB connection error"
- Check your `.env` file exists in `backend/` directory
- Verify `MONGODB_URI` is correct
- For Atlas: Check IP whitelist and password
- For local: Make sure MongoDB service is running

### "Cannot find module register-user.js"
- Make sure you're in the `backend` directory
- Run: `cd backend` first, then `node register-user.js ...`

### Backend won't start
- Check if port 3000 is already in use
- Verify `.env` file exists
- Check MongoDB connection string

### Frontend can't connect
- Make sure backend is running first
- Check backend shows: `✅ MongoDB connected successfully`
- Verify backend is on port 3000

## Quick Checklist

- [ ] MongoDB set up (Atlas or local)
- [ ] `backend/.env` file created with `MONGODB_URI`
- [ ] Backend running and shows "MongoDB connected"
- [ ] User registered successfully
- [ ] Frontend running on port 5173
- [ ] Can login in browser

