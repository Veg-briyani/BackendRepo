const Razorpay = require('razorpay');
const crypto = require('crypto');
const Book = require('../models/Book');
const Order = require('../models/Order');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
const createOrder = async (req, res) => {
  try {
    const { bookId, quantity, paymentMethod } = req.body;
    
    // Get book with price validation
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Use regular price if author copy price doesn't exist
    const unitPrice = book.authorCopyPrice || book.price;

    // Calculate total cost
    const totalCost = unitPrice * quantity;
    
    // Handle payment method-specific logic
    if (paymentMethod === 'wallet') {
      // Check if user has sufficient balance
      const user = await User.findById(req.user._id);
      if (user.walletBalance < totalCost) {
        return res.status(400).json({ 
          message: 'Insufficient balance in wallet',
          details: [`Required: ₹${totalCost}, Available: ₹${user.walletBalance}`] 
        });
      }
      
      // Create order with wallet payment
      const order = new Order({
        userId: req.user._id,
        book: bookId,
        author: req.user._id,
        quantity,
        unitPrice,
        totalCost: totalCost,
        paymentMethod,
        status: 'processing',
        isAuthorCopy: true
      });
      
      await order.save();
      
      // Update user wallet balance
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { walletBalance: -totalCost }
      });
      
      return res.status(201).json({ 
        message: 'Order placed successfully', 
        order,
        paymentMethod: 'wallet'
      });
      
    } else if (paymentMethod === 'razorpay') {
      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: totalCost * 100, // Amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`
      });
      
      // Create local order with pending status
      const order = new Order({
        userId: req.user._id,
        book: bookId,
        author: req.user._id,
        quantity,
        unitPrice,
        totalCost: totalCost,
        paymentMethod,
        status: 'pending',
        razorpayOrderId: razorpayOrder.id,
        isAuthorCopy: true
      });
      
      await order.save();
      
      return res.status(201).json({
        message: 'Razorpay order created',
        paymentMethod: 'razorpay',
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        user: {
          name: req.user.name,
          email: req.user.email
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      details: error.message 
    });
  }
};

// Verify Razorpay payment
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    
    // Find the order by Razorpay order ID
    const order = await Order.findOne({ razorpayOrderId: orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    if (generatedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid signature', success: false });
    }
    
    // Update order status
    order.status = 'processing';
    order.razorpayPaymentId = paymentId;
    order.paymentCompleted = true;
    await order.save();
    
    // Update book stock
    await Book.findByIdAndUpdate(order.bookId, {
      $inc: { stock: -order.quantity }
    });
    
    return res.status(200).json({ 
      message: 'Payment verified successfully',
      success: true,
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying payment',
      success: false,
      details: error.message 
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
  // Other controller methods
}; 