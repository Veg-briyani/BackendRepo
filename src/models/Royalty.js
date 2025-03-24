const mongoose = require('mongoose');

const royaltySchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'paypal'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Paid', 'Failed'],
    default: 'Pending'
  },
  transactionId: String,
  paymentDate: Date,
  payoutDate: Date,
  previousBalance: Number,
  newBalance: Number,
  rejectionReason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Royalty', royaltySchema); 