const mongoose = require('mongoose');

const printLogSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  printDate: Date,
  quantity: Number,
  pressName: String,
  cost: Number,
  edition: String,
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('PrintLog', printLogSchema); 