const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middleware/auth');
const Royalty = require('../models/Royalty');
const User = require('../models/User');
const { validatePayoutRequest } = require('../middleware/validation');
const Notification = require('../models/Notification');

// Get author's royalty payouts
router.get('/', auth, async (req, res) => {
  try {
    const royalties = await Royalty.find({ authorId: req.user._id })
      .populate('bookId', 'title isbn')
      .sort({ createdAt: -1 });
      
    res.json(royalties);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching royalties',
      error: error.message 
    });
  }
});

// Request royalty payout
router.post('/request', auth, validatePayoutRequest, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    // Check available balance
    const author = await User.findById(req.user._id);
    if (author.walletBalance < amount) {
      return res.status(400).json({ 
        message: 'Insufficient wallet balance' 
      });
    }

    // Create payout request
    const royalty = new Royalty({
      authorId: req.user._id,
      amount,
      paymentMethod,
      status: 'Pending'
    });

    await royalty.save();

    // Deduct from wallet balance
    author.walletBalance -= amount;
    await author.save();

    res.status(201).json({
      message: 'Payout request submitted',
      royalty
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating payout request',
      error: error.message 
    });
  }
});

// Process payout (Admin)
router.post('/process-payout/:id', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const royalty = await Royalty.findById(req.params.id);
    
    if (!royalty) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    if (royalty.status !== 'Pending') {
      return res.status(400).json({ 
        message: 'Payout already processed' 
      });
    }

    // Add balance tracking
    const author = await User.findById(royalty.authorId);
    royalty.previousBalance = author.outstandingRoyalty;
    
    // Process payment here (integrate with payment gateway)
    // For now, simulate successful payment
    royalty.status = 'Paid';
    royalty.transactionId = `TX${Date.now()}`;
    royalty.paymentDate = new Date();
    royalty.newBalance = royalty.previousBalance - royalty.amount;
    
    await royalty.save();

    // After processing payout
    const notification = new Notification({
      recipient: royalty.authorId,
      message: `Your payout of ₹${royalty.amount} via ${royalty.paymentMethod} has been processed`,
      type: 'payout',
      metadata: {
        payoutId: royalty._id,
        status: 'processed'
      }
    });
    await notification.save();

    res.json({ 
      message: 'Payout processed successfully',
      royalty
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing payout',
      error: error.message 
    });
  }
});

// Get all payouts (Admin)
router.get('/all', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const royalties = await Royalty.find()
      .populate('authorId', 'name email')
      .populate('bookId', 'title')
      .sort({ createdAt: -1 });

    res.json(royalties);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching payouts',
      error: error.message 
    });
  }
});

// Add this route above the existing process-payout route
router.post('/:id/approve', auth, authorizeRole(['admin']), async (req, res) => {
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

module.exports = router; 