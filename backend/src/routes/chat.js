/**
 * Chat Routes
 * REST API endpoints for chat-related operations
 * All routes are protected with authMiddleware
 */

const express = require('express');
const { body, query } = require('express-validator');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/chat/messages
 * Get messages from a specific room
 * Query params: room (required), limit (optional, default: 50), skip (optional, default: 0)
 * Protected route - requires JWT authentication
 */
router.get(
  '/messages',
  [
    query('room')
      .trim()
      .notEmpty()
      .withMessage('Room parameter is required'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('skip')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Skip must be a non-negative integer'),
  ],
  validate,
  authMiddleware,
  async (req, res, next) => {
    try {
      const { room } = req.query;
      const limit = Number.parseInt(req.query.limit, 10) || 50;
      const skip = Number.parseInt(req.query.skip, 10) || 0;

      // Fetch messages from the room, sorted by timestamp (newest first)
      const messages = await Message.find({ room: room.trim() })
        .sort({ ts: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      // Reverse to show oldest first (chronological order)
      messages.reverse();

      res.json({
        success: true,
        room: room.trim(),
        count: messages.length,
        messages,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/chat/messages
 * Create a new message in a room
 * Body: { room, text }
 * Protected route - requires JWT authentication
 */
router.post(
  '/messages',
  [
    body('room')
      .trim()
      .notEmpty()
      .withMessage('Room is required'),
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Message text is required')
      .isLength({ max: 1000 })
      .withMessage('Message cannot exceed 1000 characters'),
  ],
  validate,
  authMiddleware,
  async (req, res, next) => {
    try {
      const { room, text } = req.body;

      // Create new message
      const message = new Message({
        room: room.trim(),
        username: req.user.username, // Use authenticated user's username
        text: text.trim(),
        ts: new Date(),
      });

      await message.save();

      res.status(201).json({
        success: true,
        message: 'Message created successfully',
        data: {
          _id: message._id,
          room: message.room,
          username: message.username,
          text: message.text,
          ts: message.ts,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/chat/rooms
 * Get list of all available rooms (with message counts)
 * Protected route - requires JWT authentication
 */
router.get(
  '/rooms',
  authMiddleware,
  async (req, res, next) => {
    try {
      // Aggregate to get distinct rooms with message counts
      const rooms = await Message.aggregate([
        {
          $group: {
            _id: '$room',
            messageCount: { $sum: 1 },
            lastMessage: { $max: '$ts' },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            messageCount: 1,
            lastMessage: 1,
          },
        },
        {
          $sort: { lastMessage: -1 },
        },
      ]);

      res.json({
        success: true,
        count: rooms.length,
        rooms,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/chat/messages/:roomId
 * Get messages from a specific room (alternative endpoint using route parameter)
 * Query params: limit (optional, default: 50), skip (optional, default: 0)
 * Protected route - requires JWT authentication
 */
router.get(
  '/messages/:roomId',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('skip')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Skip must be a non-negative integer'),
  ],
  validate,
  authMiddleware,
  async (req, res, next) => {
    try {
      const { roomId } = req.params;
      const limit = Number.parseInt(req.query.limit, 10) || 50;
      const skip = Number.parseInt(req.query.skip, 10) || 0;

      // Fetch messages from the room
      const messages = await Message.find({ room: roomId.trim() })
        .sort({ ts: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      messages.reverse();

      res.json({
        success: true,
        room: roomId.trim(),
        count: messages.length,
        messages,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

