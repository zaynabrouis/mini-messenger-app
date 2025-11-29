/**
 * Message Model
 * Represents a chat message in a room
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true,
    index: true, // Index for faster queries
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  ts: {
    type: Date,
    default: Date.now,
    index: true, // Index for faster queries
  },
}, {
  timestamps: false, // We use custom ts field instead
});

// Compound index for efficient room message queries
messageSchema.index({ room: 1, ts: -1 });

module.exports = mongoose.model('Message', messageSchema);

