const mongoose = require('mongoose');

const kycUpdateRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bankAccount: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  kycInformation: {
    aadhaarNumber: String,
    panNumber: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('KycUpdateRequest', kycUpdateRequestSchema); 