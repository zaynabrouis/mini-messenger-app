/**
 * Database connection module
 * Handles MongoDB connection using Mongoose
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string from environment variables
 * @param {boolean} exitOnError - Whether to exit process on error (default: true)
 * @returns {Promise<void>}
 */
const connectDB = async (exitOnError = true) => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // If already connected, return
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    if (error.code === 18 || error.codeName === 'AuthenticationFailed') {
      console.error('⚠️  MongoDB Authentication Failed. Please check your connection string credentials.');
      console.error('   Make sure your MongoDB username and password are correct.');
    }
    if (exitOnError) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

module.exports = connectDB;

