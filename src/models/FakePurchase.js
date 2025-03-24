const mongoose = require('mongoose');

const fakePurchaseSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  bookTitle: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
fakePurchaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FakePurchase', fakePurchaseSchema); 