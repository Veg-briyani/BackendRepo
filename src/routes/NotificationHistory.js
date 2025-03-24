// routes/notificationHistory.js
const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middleware/auth');
const NotificationHistory = require('../models/NotificationHistory');
const { check, validationResult } = require('express-validator');

// Create a notification history record (admin only)
router.post('/history', 
  auth, 
  authorizeRole(['admin']), 
  [
    check('recipients')
      .isArray()
      .withMessage('Recipients must be an array'),
    check('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .escape(),
    check('message')
      .trim()
      .notEmpty()
      .withMessage('Message content is required')
      .escape(),
    check('type')
      .isIn(['admin', 'system', 'payout', 'kyc', 'order', 'author', 'other'])
      .withMessage('Invalid notification type')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { recipients, title, message, type, data } = req.body;
      
      // Create notification history entry
      const notificationHistory = new NotificationHistory({
        admin: req.user._id, // Store the admin who sent it
        recipients: recipients,
        recipientCount: recipients.length,
        title,
        message,
        type,
        data
      });

      await notificationHistory.save();

      res.status(201).json({
        message: 'Notification history recorded',
        history: notificationHistory
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error recording notification history',
        error: error.message 
      });
    }
  }
);

// Get notification history (admin only)
router.get('/history', 
  auth, 
  authorizeRole(['admin']), 
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20,
        startDate,
        endDate,
        type
      } = req.query;
      
      // Build query
      const query = {};
      
      // Filter by date range if provided
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // Filter by type if provided
      if (type && type !== 'all') {
        query.type = type;
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get history with pagination
      const history = await NotificationHistory.find(query)
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count for pagination
      const total = await NotificationHistory.countDocuments(query);
      
      res.json({
        history,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching notification history',
        error: error.message 
      });
    }
  }
);

module.exports = router;