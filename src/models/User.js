// src/models/User.js - Update User Schema
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['author', 'admin'],
    default: 'author'
  },
  badges: {
    type: [String],
    default: []
  },
  monthlyRevenue: {
    type: [Number],
    default: Array(12).fill(0)
  },
  yearlyPerformance: {
    type: [{
      year: Number,
      monthlyRevenue: [{
        month: Number,
        revenue: { type: Number, default: 0 }
      }]
    }],
    default: [{
      year: new Date().getFullYear(),
      monthlyRevenue: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        revenue: 0
      }))
    }]
  },
  profile: {
    title: { type: String, default: '' },
    location: { type: String, default: '' },
    memberSince: {
      type: Date,
      default: Date.now
    },
    bio: { type: String, default: '' },
    profilePhoto: { type: String, default: '' } // Explicitly defined here
  },
  authorStats: {
    numberOfPublications: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    numberOfFollowers: { type: Number, default: 0 },
    totalWorks: { type: Number, default: 0 }
  },
  achievements: {
    type: [String],
    default: []
  },
  phoneNumber: String,
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    zipCode: { type: String, default: '' }
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  kycSubmittedAt: Date,
  kycApprovedAt: Date,
  kycRejectedAt: Date,
  kycRejectionReason: String,
  aadhaarNumber: {
    type: String,
    match: [/^\d{12}$/, 'Aadhaar must be 12 digits'],
    select: false
  },
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  panNumber: {
    type: String,
    match: [/^[A-Z]{5}\d{4}[A-Z]$/, 'Invalid PAN format'],
    select: false
  },
  panVerified: {
    type: Boolean,
    default: false
  },
  bankAccount: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  documents: {
    aadhaarFront: String,
    aadhaarBack: String,
    panCard: String,
    bankStatement: String,
    other: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tokens: {
    type: [{
      token: String
    }],
    default: []
  },
  about: String,
  authMethod: {
    type: String,
    enum: ['email', 'phone', 'google'],
    default: 'email'
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  outstandingRoyalty: {
    type: Number,
    default: 0,
    min: 0
  },
  royaltyReceived: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.tokens;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
