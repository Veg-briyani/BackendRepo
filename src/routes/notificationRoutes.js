const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const NotificationHistory = require('../models/NotificationHistory');

// ===== SEND NOTIFICATIONS =====

// Send admin notification to a single user
router.post('/admin', 
  auth, 
  authorizeRole(['admin']), 
  [
    check('authorId')
      .isMongoId()
      .withMessage('Invalid author ID format'),
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
      .optional()
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

      const { authorId, title, message, type = 'admin', data } = req.body;
      
      const author = await User.findById(authorId);
      if (!author) {
        return res.status(404).json({ message: 'Author not found' });
      }

      const notification = new Notification({
        recipient: authorId,
        title,
        message,
        type,
        data
      });

      await notification.save();

      res.status(201).json({
        message: 'Notification sent',
        notification
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error sending notification',
        error: error.message 
      });
    }
  }
);

// Send notification to multiple recipients (bulk)
router.post('/bulk', 
  auth, 
  authorizeRole(['admin']), 
  [
    check('recipients')
      .isArray()
      .withMessage('Recipients must be an array'),
    check('recipients.*')
      .isMongoId()
      .withMessage('Invalid recipient ID format'),
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
      
      // Validate that all recipients exist
      const users = await User.find({ _id: { $in: recipients } });
      if (users.length !== recipients.length) {
        return res.status(400).json({ message: 'One or more recipients not found' });
      }

      // Create notifications for all recipients
      const notifications = recipients.map(recipient => ({
        recipient,
        title,
        message,
        type,
        data
      }));

      const saved = await Notification.insertMany(notifications);

      res.status(201).json({
        message: 'Bulk notifications sent',
        count: saved.length
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error sending bulk notifications',
        error: error.message 
      });
    }
  }
);

// ===== FETCH NOTIFICATIONS =====

// Get user's own notifications (basic)
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching notifications',
      error: error.message 
    });
  }
});

// Get user notifications with filtering
router.get('/filtered', auth, async (req, res) => {
  try {
    const { 
      type, 
      read, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    // Build query
    const query = { recipient: req.user._id };
    
    // Filter by type if provided
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Filter by read status if provided
    if (read === 'true') {
      query.read = true;
    } else if (read === 'false') {
      query.read = false;
    }
    
    // Search by content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching notifications',
      error: error.message 
    });
  }
});

// Get admin notifications dashboard (for admins only)
router.get('/admin', 
  auth, 
  authorizeRole(['admin']), 
  async (req, res) => {
    try {
      const { 
        type, 
        read, 
        search, 
        page = 1, 
        limit = 20 
      } = req.query;
      
      // Build query
      const query = {};
      
      // Filter by type if provided
      if (type && type !== 'all') {
        query.type = type;
      }
      
      // Filter by read status if provided
      if (read === 'true') {
        query.read = true;
      } else if (read === 'false') {
        query.read = false;
      }
      
      // Search by content
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get notifications with pagination
      const notifications = await Notification.find(query)
        .populate('recipient', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count for pagination
      const total = await Notification.countDocuments(query);
      
      res.json({
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching admin notifications',
        error: error.message 
      });
    }
  }
);

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting unread count',
      error: error.message 
    });
  }
});

// ===== UPDATE NOTIFICATIONS =====

// Mark single notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating notification',
      error: error.message 
    });
  }
});

// Mark all as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error marking all as read',
      error: error.message 
    });
  }
});

// Process notification action (for approvals, rejections, etc.)
router.post('/:id/action',
  auth,
  [
    check('action')
      .trim()
      .notEmpty()
      .withMessage('Action is required')
      .escape(),
    check('data')
      .optional()
  ],
  async (req, res) => {
    try {
      const { action, data } = req.body;
      const notification = await Notification.findById(req.params.id);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      // Check if user is authorized to take action
      if (
        notification.recipient.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Process different actions based on notification type
      switch (notification.type) {
        case 'payout':
          if (action === 'approve') {
            // Logic to approve payout
            // This might call another service/API
          } else if (action === 'reject') {
            // Logic to reject payout
          } else {
            return res.status(400).json({ 
              message: `Action '${action}' not supported for payout notifications` 
            });
          }
          break;
          
        case 'kyc':
          if (action === 'review') {
            // Logic to mark KYC as reviewed
          } else {
            return res.status(400).json({ 
              message: `Action '${action}' not supported for KYC notifications` 
            });
          }
          break;
          
        case 'author':
          if (action === 'view') {
            // Just mark as viewed, no special handling needed
          } else {
            return res.status(400).json({ 
              message: `Action '${action}' not supported for author notifications` 
            });
          }
          break;
          
        default:
          return res.status(400).json({ 
            message: `Actions are not supported for notification type '${notification.type}'` 
          });
      }
      
      // Mark notification as actioned and read
      notification.actioned = true;
      notification.actionTaken = action;
      notification.actionData = data;
      notification.actionedAt = new Date();
      notification.actionedBy = req.user._id;
      notification.read = true;
      
      await notification.save();
      
      res.json({
        message: 'Action processed successfully',
        notification
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error processing notification action',
        error: error.message 
      });
    }
  }
);

// ===== DELETE NOTIFICATIONS =====

// Delete notification
router.delete('/:id', 
  auth, 
  async (req, res) => {
    try {
      // Allow users to delete their own notifications
      // or admins to delete any notification
      const query = { _id: req.params.id };
      
      if (req.user.role !== 'admin') {
        query.recipient = req.user._id;
      }
      
      const notification = await Notification.findOneAndDelete(query);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.json({ 
        message: 'Notification deleted',
        id: notification._id
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error deleting notification',
        error: error.message 
      });
    }
  }
);

// Add this route to your user routes (might be in userRoutes.js)
router.get('/admin/users', 
  auth,
  authorizeRole(['admin']),
  async (req, res) => {
    try {
      const users = await User.find({})
        .select('name email role')
        .lean();
        
      res.json({ users });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching users',
        error: error.message
      });
    }
  }
);

// ===== NOTIFICATION HISTORY =====
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { recipients, title, message, type, data } = req.body;
      
      const notificationHistory = new NotificationHistory({
        admin: req.user._id,
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
      
      const query = {};
      
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      if (type && type !== 'all') {
        query.type = type;
      }
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const history = await NotificationHistory.find(query)
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
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