const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Processing'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'razorpay'],
    required: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  orderStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered'],
    default: 'Processing'
  },
  transactionId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 