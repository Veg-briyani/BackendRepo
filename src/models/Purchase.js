const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
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
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Purchase', purchaseSchema); 