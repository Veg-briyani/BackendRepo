const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  authorCopyPrice: {
    type: Number,
    min: [0, 'Author copy price cannot be negative'],
    default: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  soldCopies: {
    type: Number,
    default: 0
  },
  royalties: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true
  },
  marketplaceLinks: {
    amazon: String,
    flipkart: String
  },
  lastMonthSale: {
    type: Number,
    default: 0
  },
  publication: {
    publicationId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    publishedDate: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  sku: String,
  gsm: Number,
  coverType: {
    type: String,
    enum: ['Hardcover', 'Paperback']
  },
  pageSize: String,
  interiorColor: {
    type: String,
    enum: ['Colored', 'Black & White']
  },
  weight: Number,
  language: String,
  launchDate: Date,
  royaltyPercentage: Number,
  mrp: Number,
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  coverImage: {
    type: String,
    default: `${process.env.BASE_URL}/book-covers/default-cover.jpg`
  },
  printingTimeline: [{
    stage: {
      type: String,
      enum: ['ISBN Applied', 'Formatting', 'Cover Design', 'Approval', 'Printing', 'Dispatch', 'Delivered']
    },
    date: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating total revenue
bookSchema.virtual('totalRevenue').get(function() {
  return this.soldCopies * this.price;
});

// Index for faster queries
bookSchema.index({ authorId: 1, title: 1 });
bookSchema.index({ isbn: 1 }, { unique: true });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;