/**
 * Authentication Routes
 * Handles user registration and login endpoints
 * 
 * Features:
 * - User registration with unique username validation
 * - Password hashing using bcrypt (handled in User model)
 * - JWT token generation with 24-hour expiry
 * - Input validation using express-validator
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');
const validate = require('../middleware/validation');

const router = express.Router();

/**
 * POST /auth/register
 * Register a new user account
 * 
 * Request Body:
 *   - username: string (3-20 chars, alphanumeric + underscore only)
 *   - password: string (min 6 characters)
 * 
 * Response:
 *   - 201: User created successfully with JWT token
 *   - 409: Username already exists
 *   - 400: Validation error
 * 
 * The password is automatically hashed using bcrypt in the User model pre-save hook
 */
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password, email } = req.body;

      // Check if user already exists (username)
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists',
        });
      }

      // Check if email already exists (if provided)
      if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'Email already exists',
          });
        }
      }

      // Create new user
      const user = new User({ username, password, email });
      await user.save();

      // Generate JWT token with 24 hour expiry
      // Token contains userId and username for easy access
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /auth/login
 * Authenticate an existing user and return JWT token
 * 
 * Request Body:
 *   - username: string (required)
 *   - password: string (required)
 * 
 * Response:
 *   - 200: Login successful with JWT token
 *   - 401: Invalid username or password
 *   - 400: Validation error
 * 
 * Password verification uses bcrypt.compare() to check against hashed password
 */
router.post(
  '/login',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      // Find user by username
      const user = await User.findOne({ username });
      if (!user) {
        // Return generic error message to prevent username enumeration
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      // Verify password using bcrypt comparison
      // User model has comparePassword method that uses bcrypt.compare()
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }

      // Generate JWT token with 24 hour expiry
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

