const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');
const Royalty = require('../models/Royalty');
const Notification = require('../models/Notification');
const { validateAuthorPrice, validateUserRevenue, validateBook } = require('../middleware/validation');
const Order = require('../models/Order');
const PrintLog = require('../models/PrintLog');
const adminController = require('../controllers/adminController');
const { updateUserMonthlyRevenue } = require('../controllers/adminController');
const { validateMonthlyRevenueUpdate } = require('../middleware/validation');
const KycUpdateRequest = require('../models/KycUpdateRequest');
const {
  getFakePurchases,
  getFakePurchaseById,
  createFakePurchase,
  updateFakePurchase,
  deleteFakePurchase,
  getAuthorsForDropdown
} = require('../controllers/adminController');


// Admin Fake Purchases Routes
router.get('/fake-purchases', auth, authorizeRole(['admin']), getFakePurchases);
router.get('/fake-purchases/:id', auth, authorizeRole(['admin']), getFakePurchaseById);
router.post('/fake-purchases', auth, authorizeRole(['admin']), createFakePurchase);
router.put('/fake-purchases/:id', auth, authorizeRole(['admin']), updateFakePurchase);
router.delete('/fake-purchases/:id', auth, authorizeRole(['admin']), deleteFakePurchase);
router.get('/authors', auth, authorizeRole(['admin']), getAuthorsForDropdown);

// All routes require authentication and admin role
router.use(auth, authorizeRole(['admin']));

// User Management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Prevent password update through this route

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -governmentId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating user',
      error: error.message
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all books associated with the user
    await Book.deleteMany({ authorId: req.params.id });

    res.json({
      message: 'User and associated books deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Book Management
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find()
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching books',
      error: error.message
    });
  }
});

router.put('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('authorId', 'name email');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating book',
      error: error.message
    });
  }
});

router.delete('/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update author's stats
    await User.findByIdAndUpdate(book.authorId, {
      $inc: {
        'authorStats.numberOfPublications': -1,
        'authorStats.totalWorks': -1
      }
    });

    res.json({
      message: 'Book deleted successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting book',
      error: error.message
    });
  }
});

router.post('/kyc/approve/:userId', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const update = { 
      kycStatus: status,
      ...(status === 'rejected' && { rejectionReason })
    };

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      update,
      { new: true }
    ).select('-password -governmentId');

    // Send notification email to author
    const emailTemplate = getKYCStatusTemplate(user, status, rejectionReason);
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.json({ message: `KYC ${status} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating KYC status', error: error.message });
  }
});

router.get('/kyc', async (req, res) => {
  try {
    const pendingKYCs = await User.find({ kycStatus: 'pending' })
      .select('name email phoneNumber createdAt')
      .sort({ createdAt: -1 });
    res.json(pendingKYCs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending KYCs', error: error.message });
  }
});

router.post('/royalties/:id/approve', async (req, res) => {
  try {
    const royalty = await Royalty.findById(req.params.id)
      .populate('authorId', 'name email');
    
    if (!royalty) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    if (royalty.status !== 'Pending') {
      return res.status(400).json({ message: 'Payout already processed' });
    }

    // Update payout status
    royalty.status = 'Approved';
    royalty.paymentDate = new Date();
    await royalty.save();

    // Send notification to author
    const notification = new Notification({
      recipient: royalty.authorId._id,
      message: `Your payout request of ₹${royalty.amount} has been approved`,
      type: 'payout',
      metadata: {
        payoutId: royalty._id,
        status: 'approved'
      }
    });
    await notification.save();

    res.json({ 
      message: 'Payout approved successfully',
      royalty 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error approving payout',
      error: error.message 
    });
  }
});

router.post('/royalties/:id/reject', async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const royalty = await Royalty.findById(req.params.id)
      .populate('authorId', 'name email');

    if (!royalty) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    if (royalty.status !== 'Pending') {
      return res.status(400).json({ message: 'Payout already processed' });
    }

    // Update payout status and rejection reason
    royalty.status = 'Rejected';
    royalty.rejectionReason = rejectionReason;
    await royalty.save();

    // Send notification to author
    const notification = new Notification({
      recipient: royalty.authorId._id,
      message: `Your payout request of ₹${royalty.amount} was rejected. Reason: ${rejectionReason}`,
      type: 'payout',
      metadata: {
        payoutId: royalty._id,
        status: 'rejected'
      }
    });
    await notification.save();

    res.json({ 
      message: 'Payout rejected successfully',
      royalty 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error rejecting payout',
      error: error.message 
    });
  }
});

router.put('/books/:id/author-price', 
  validateAuthorPrice,
  async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { $set: { authorCopyPrice: req.body.price } },
        { new: true, runValidators: true }
      );

      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      res.json({
        message: 'Author price updated successfully',
        book
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating author price',
        error: error.message
      });
    }
  }
);

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('author', 'name email')
      .populate('book', 'title price authorCopyPrice')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// User Management
router.get('/users/kyc', async (req, res) => {
  try {
    const pendingKYCs = await User.find({ kycStatus: 'pending' })
      .select('name email phoneNumber createdAt governmentId')
      .sort({ createdAt: -1 });
    res.json(pendingKYCs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending KYCs', error: error.message });
  }
});

// Print Management
router.get('/print-logs', async (req, res) => {
  try {
    const printLogs = await PrintLog.find()
      .populate('bookId authorId', 'title name')
      .sort({ printDate: -1 });
    res.json(printLogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching print logs', error: error.message });
  }
});

// Royalty Management
router.get('/payouts/history', async (req, res) => {
  try {
    const payouts = await Royalty.find()
      .populate('authorId', 'name email')
      .sort({ paymentDate: -1 });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payout history', error: error.message });
  }
});

// Notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ type: 'admin' })
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Add single user GET endpoint
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -governmentId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

router.put('/users/:id/revenue', 
  auth, 
  authorizeRole(['admin']), 
  validateUserRevenue,
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { 
          $set: { 
            monthlyRevenue: req.body.monthlyRevenue,
            yearlyPerformance: req.body.yearlyPerformance
          }
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) return res.status(404).json({ message: 'User not found' });
      
      res.json({ 
        message: 'Revenue data updated successfully',
        user
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Error updating revenue data',
        error: error.message 
      });
    }
  }
);

// Add new book creation route
router.post('/books/create', auth, authorizeRole(['admin']), validateBook, adminController.createBook);

// Add this new route
router.put('/users/:userId/yearlyPerformance/:year/monthlyRevenue/:month', 
    authorizeRole('admin'),
    validateMonthlyRevenueUpdate,
    updateUserMonthlyRevenue
);

// Get pending KYC update requests
router.get('/kyc/update-requests', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const requests = await KycUpdateRequest.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Approve KYC update request
router.post('/kyc/update-requests/:id/approve', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const request = await KycUpdateRequest.findById(req.params.id)
      .populate('user');
    
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Update user's KYC details
    request.user.bankAccount = request.bankAccount;
    request.user.aadhaarNumber = request.kycInformation.aadhaarNumber;
    request.user.panNumber = request.kycInformation.panNumber;
    await request.user.save();

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    await request.save();

    res.json({ message: 'KYC update approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request' });
  }
});

// Reject KYC update request
router.post('/kyc/update-requests/:id/reject', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const request = await KycUpdateRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    request.rejectionReason = req.body.rejectionReason;
    request.reviewedBy = req.user._id;
    await request.save();

    res.json({ message: 'KYC update rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting request' });
  }
});

module.exports = router;