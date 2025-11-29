/**
 * Room Model
 * Represents a chat room in the application
 * 
 * Features:
 * - Unique room name constraint (database and application level)
 * - Automatic timestamp for creation date
 * - Indexed for efficient queries
 */

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    unique: true,
    trim: true,
    minlength: [1, 'Room name cannot be empty'],
    maxlength: [50, 'Room name cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Room name can only contain letters, numbers, hyphens, and underscores'],
    index: true, // Index for faster lookups
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Index for sorting by creation date
  },
}, {
  timestamps: false, // We use custom createdAt field instead
});

// Compound index for efficient queries
roomSchema.index({ name: 1, createdAt: -1 });

module.exports = mongoose.model('Room', roomSchema);

