/**
 * Rooms Routes
 * REST API endpoints for room management
 * All routes are protected with authMiddleware
 */

const express = require('express');
const { body } = require('express-validator');
const Room = require('../models/Room');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

/**
 * GET /rooms
 * Get list of all available rooms
 * Protected route - requires JWT authentication
 * 
 * Response:
 *   - 200: List of rooms with creation dates
 */
router.get(
  '/',
  authMiddleware,
  async (req, res, next) => {
    try {
      // Fetch all rooms, sorted by creation date (newest first)
      const rooms = await Room.find({})
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        success: true,
        count: rooms.length,
        rooms: rooms.map(room => ({
          name: room.name,
          createdAt: room.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /rooms
 * Create a new room
 * Protected route - requires JWT authentication
 * 
 * Request Body:
 *   - name: string (required, unique, 1-50 chars, alphanumeric + hyphens/underscores)
 * 
 * Response:
 *   - 201: Room created successfully
 *   - 409: Room name already exists
 *   - 400: Validation error
 */
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Room name is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Room name must be between 1 and 50 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Room name can only contain letters, numbers, hyphens, and underscores'),
  ],
  validate,
  authMiddleware,
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const roomName = name.trim();

      // Check if room already exists (database-level unique constraint also exists)
      const existingRoom = await Room.findOne({ name: roomName });
      if (existingRoom) {
        return res.status(409).json({
          success: false,
          message: 'Room name already exists',
        });
      }

      // Create new room
      const room = new Room({
        name: roomName,
        createdAt: new Date(),
      });

      await room.save();

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        room: {
          name: room.name,
          createdAt: room.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

