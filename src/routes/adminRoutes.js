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
    
    // Check if we need to update book royalties
    const updateRoyaltyReceived = updates.royaltyReceived !== undefined;
    const updateOutstandingRoyalty = updates.outstandingRoyalty !== undefined;
    const updateWalletBalance = updates.walletBalance !== undefined;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -governmentId');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If royaltyReceived, outstandingRoyalty, or walletBalance was updated, update related book fields
    if (updateRoyaltyReceived || updateOutstandingRoyalty || updateWalletBalance) {
      try {
        // Get all books by this author
        const books = await Book.find({ authorId: req.params.id });
        
        if (books.length > 0) {
          // Update books based on which fields were changed
          await Promise.all(books.map(book => {
            const bookUpdates = {};
            
            // If royaltyReceived was updated, distribute it equally among books as "royalties"
            if (updateRoyaltyReceived) {
              bookUpdates.royalties = req.body.royaltyReceived / books.length;
            }
            
            // If outstandingRoyalty was updated, adjust soldCopies to match the formula
            if (updateOutstandingRoyalty) {
              // We need to adjust book fields to match the outstandingRoyalty formula:
              // outstandingRoyalty = (soldCopies * price * 0.7 - royalties)
              
              // If we also updated royalties in this request, use that value
              const bookRoyalties = updateRoyaltyReceived 
                ? (req.body.royaltyReceived / books.length) 
                : book.royalties;
                
              // Calculate what soldCopies needs to be to achieve the desired outstandingRoyalty
              const outstandingPerBook = req.body.outstandingRoyalty / books.length;
              const targetSoldCopies = Math.round(
                (outstandingPerBook + bookRoyalties) / (book.price * 0.7)
              );
              
              bookUpdates.soldCopies = Math.max(0, targetSoldCopies); // Ensure it's not negative
            }
            
            // Only update if we have changes
            return Object.keys(bookUpdates).length > 0
              ? Book.findByIdAndUpdate(book._id, bookUpdates, { new: true })
              : Promise.resolve(book);
          }));
        }
        
        // Additional step: If the royaltyReceived was updated, we should update any related royalty entries
        if (updateRoyaltyReceived) {
          try {
            // Get Royalty model if it exists
            const Royalty = require('../models/Royalty');
            
            // Create or update a completed royalty record to reflect the total
            const existingRoyalty = await Royalty.findOne({ 
              authorId: req.params.id,
              status: 'completed'
            });
            
            if (existingRoyalty) {
              await Royalty.findByIdAndUpdate(
                existingRoyalty._id,
                { amount: req.body.royaltyReceived },
                { new: true }
              );
            } else {
              // Create a new royalty record if one doesn't exist
              const newRoyalty = new Royalty({
                authorId: req.params.id,
                amount: req.body.royaltyReceived,
                status: 'completed',
                payoutDate: new Date(),
                description: 'Administrative adjustment'
              });
              await newRoyalty.save();
            }
          } catch (err) {
            console.error('Error updating royalty records:', err);
            // Continue even if this fails
          }
        }
      } catch (bookError) {
        console.error('Error updating book data:', bookError);
        // Continue with the response even if book update fails
      }
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
      .populate('authorId', 'name email walletBalance outstandingRoyalty royaltyReceived');
    
    if (!royalty) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    if (royalty.status !== 'Pending') {
      return res.status(400).json({ message: 'Payout already processed' });
    }

    // Get the author
    const author = await User.findById(royalty.authorId._id);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Update author's financial data
    // Decrease outstanding royalty since this amount is being approved
    author.outstandingRoyalty = Math.max(0, author.outstandingRoyalty - royalty.amount);
    await author.save();

    // Update payout status
    royalty.status = 'Approved';
    royalty.paymentDate = new Date();
    await royalty.save();

    // Update related books' financial data
    try {
      // Get all books by this author
      const books = await Book.find({ authorId: author._id });
      
      if (books.length > 0) {
        // Distribute the approved royalty amount equally among all author's books
        const amountPerBook = royalty.amount / books.length;
        
        await Promise.all(books.map(book => {
          // Since we're approving a royalty that was part of outstanding,
          // we need to adjust the book's calculations accordingly
          const updatedSoldCopies = Math.max(0, 
            Math.round((book.royalties + (book.price * 0.7 * book.soldCopies) - amountPerBook) / (book.price * 0.7))
          );
          
          return Book.findByIdAndUpdate(
            book._id,
            { 
              soldCopies: updatedSoldCopies
            },
            { new: true }
          );
        }));
      }
    } catch (bookError) {
      console.error('Error updating book data:', bookError);
      // Continue even if book update fails
    }

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
    console.error('Error in royalty approval:', error);
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