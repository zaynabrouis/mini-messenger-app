/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens from Authorization header
 * 
 * This middleware:
 * - Reads JWT token from Authorization header (Bearer token format)
 * - Verifies the token signature and expiry
 * - Fetches user data from database
 * - Attaches user object to req.user
 * - Returns 401 Unauthorized on authentication failure
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Express middleware to authenticate requests using JWT tokens
 * 
 * Usage: app.get('/protected-route', authMiddleware, handler)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * On success: Attaches user object to req.user and calls next()
 * On failure: Returns 401 status with error message
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header must be in format: Bearer <token>',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    next(error);
  }
};

// Export as both authMiddleware (new name) and authenticate (for backward compatibility)
module.exports = authMiddleware;
module.exports.authenticate = authMiddleware; // Alias for backward compatibility

