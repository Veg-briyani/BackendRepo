const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middleware/auth');
const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const orderController = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validation');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order with payment options
router.post('/', auth, validateOrder, orderController.createOrder);

// Verify Razorpay payment
router.post('/verify-payment', auth, orderController.verifyPayment);

// Razorpay Webhook
router.post('/razorpay-webhook', async (req, res) => {
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== req.headers['x-razorpay-signature']) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const { payload } = req.body;
  const order = await Order.findOne({ razorpayOrderId: payload.payment.entity.order_id });

  if (payload.event === 'payment.captured') {
    order.paymentStatus = 'Paid';
    order.razorpayPaymentId = payload.payment.entity.id;
    order.razorpaySignature = digest;
    await order.save();
    
    // Notify admin
    const notification = new Notification({
      recipient: 'admin',
      message: `New order payment received for ${order.quantity} copies`,
      type: 'order',
      metadata: { orderId: order._id }
    });
    await notification.save();
  }

  res.json({ status: 'ok' });
});

// Get author's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ author: req.user._id })
      .populate('book', 'title coverImage');
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// Admin get all orders
router.get('/admin', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('book', 'title')
      .populate('author', 'name email');
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching orders',
      error: error.message 
    });
  }
});

// Update order status (Admin)
router.put('/:id/status', auth, authorizeRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );

    res.json({
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating order',
      error: error.message 
    });
  }
});

module.exports = router; 