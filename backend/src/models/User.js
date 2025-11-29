/**
 * User Model
 * Represents a user in the chat application
 * 
 * Features:
 * - Unique username constraint (database and application level)
 * - Automatic password hashing using bcrypt before saving
 * - Password comparison method for authentication
 * - Password excluded from JSON output for security
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: [false, 'Email is optional'], // Changed to optional to not break existing users
    unique: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    sparse: true // Allows multiple users to have no email (null) while keeping unique constraint for those who do
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

/**
 * Pre-save hook: Hash password before saving to database
 * Only hashes if password has been modified (new user or password change)
 * Uses bcrypt with salt rounds of 10 for secure hashing
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with cost factor of 10 (higher = more secure but slower)
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method: Compare candidate password with stored hashed password
 * Used during login to verify user credentials
 * 
 * @param {string} candidatePassword - Plain text password to verify
 * @returns {Promise<boolean>} - True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Override toJSON method to exclude password from JSON output
 * Ensures password hash is never sent in API responses
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);

