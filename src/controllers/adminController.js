// controllers/adminController.js
const mongoose = require('mongoose');
const FakePurchase = require('../models/FakePurchase');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Book = require('../models/Book');

// ===== FAKE PURCHASES OPERATIONS =====

// Get all fake purchases (Admin)
const getFakePurchases = async (req, res) => {
  try {
    const { page = 1, limit = 10, authorId } = req.query;
    const query = authorId ? { authorId } : {};

    const purchases = await FakePurchase.find(query)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await FakePurchase.countDocuments(query);

    res.json({
      purchases,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fake purchases', error: error.message });
  }
};

// Get single fake purchase (Admin)
const getFakePurchaseById = async (req, res) => {
  try {
    const purchase = await FakePurchase.findById(req.params.id)
      .populate('authorId', 'name email');
    
    if (!purchase) {
      return res.status(404).json({ message: 'Fake purchase not found' });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase', error: error.message });
  }
};

// Create fake purchase (Admin)
const createFakePurchase = async (req, res) => {
  try {
    const { customerName, bookTitle, price, status = 'completed', authorId } = req.body;
    
    // Validate required fields
    if (!customerName || !bookTitle || !price || !authorId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify author exists
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    
    const newPurchase = new FakePurchase({
      customerName,
      bookTitle,
      price,
      status,
      authorId,
      createdAt: new Date()
    });

    await newPurchase.save();
    res.status(201).json(newPurchase);
  } catch (error) {
    res.status(500).json({ message: 'Error creating fake purchase', error: error.message });
  }
};

// Update fake purchase (Admin)
const updateFakePurchase = async (req, res) => {
  try {
    const { customerName, bookTitle, price, status } = req.body;
    
    const purchase = await FakePurchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Fake purchase not found' });
    }
    
    // Update fields
    if (customerName) purchase.customerName = customerName;
    if (bookTitle) purchase.bookTitle = bookTitle;
    if (price) purchase.price = price;
    if (status) purchase.status = status;
    
    await purchase.save();
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Error updating purchase', error: error.message });
  }
};

// Delete fake purchase (Admin)
const deleteFakePurchase = async (req, res) => {
  try {
    const result = await FakePurchase.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Fake purchase not found' });
    }
    res.json({ message: 'Fake purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting purchase', error: error.message });
  }
};

// Get authors for dropdown (Admin)
const getAuthorsForDropdown = async (req, res) => {
  try {
    const authors = await User.find({ role: 'author' })
      .select('_id name email');
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching authors', error: error.message });
  }
}; 

// ===== AUTHOR DASHBOARD API =====

// Get recent purchases for author dashboard (including fake purchases)
const getAuthorRecentPurchases = async (req, res) => {
  try {
    const authorId = req.user._id; // From auth middleware
    
    // Get real purchases for this author
    const realPurchases = await Purchase.aggregate([
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book'
        }
      },
      {
        $unwind: '$book'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'book.authorId': mongoose.Types.ObjectId(authorId)
        }
      },
      {
        $project: {
          customerName: '$user.name',
          bookTitle: '$book.title',
          price: '$amount',
          status: 1,
          createdAt: 1,
          isReal: { $literal: true }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Get fake purchases for this author
    const fakePurchases = await FakePurchase.find({ authorId })
      .select('customerName bookTitle price status createdAt')
      .lean()
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Add isReal flag
    const formattedFakePurchases = fakePurchases.map(purchase => ({
      ...purchase,
      isReal: false
    }));
    
    // Combine and sort by createdAt
    const allPurchases = [...realPurchases, ...formattedFakePurchases]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5); // Limit to 5
    
    res.json(allPurchases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent purchases', error: error.message });
  }
};

// ===== BOOK OPERATIONS =====

// Create a new book (Admin)
const createBook = async (req, res) => {
  try {
    const { authorId } = req.body;
    
    // Verify that the author exists
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    
    // Create the book with admin privileges
    const bookData = {
      ...req.body,
      // Make sure authorId is set properly
      authorId: authorId
    };

    const book = new Book(bookData);
    await book.save();

    // Update author's stats
    await User.findByIdAndUpdate(authorId, {
      $inc: {
        'authorStats.numberOfPublications': 1,
        'authorStats.totalWorks': 1
      }
    });

    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating book',
      error: error.message
    });
  }
};

// ===== REVENUE OPERATIONS =====

// Update user monthly revenue
const updateUserMonthlyRevenue = async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    const { revenue } = req.body;

    // Validate month format
    const monthNumber = parseInt(month);
    if (monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({ message: 'Invalid month (1-12)' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'author') {
      return res.status(400).json({ 
        message: 'Revenue can only be updated for authors' 
      });
    }

    // Find or create yearly performance entry
    let yearlyEntry = user.yearlyPerformance.find(entry => entry.year === parseInt(year));
    if (!yearlyEntry) {
      yearlyEntry = { year: parseInt(year), monthlyRevenue: [] };
      user.yearlyPerformance.push(yearlyEntry);
    }

    // Update or create monthly entry
    const monthlyEntry = yearlyEntry.monthlyRevenue.find(m => m.month === monthNumber);
    if (monthlyEntry) {
      monthlyEntry.revenue = revenue;
    } else {
      yearlyEntry.monthlyRevenue.push({
        month: monthNumber,
        revenue: revenue
      });
    }

    await user.save();
    
    res.status(200).json({
      message: 'Monthly revenue updated successfully',
      updatedRevenue: {
        year: parseInt(year),
        month: monthNumber,
        revenue
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating monthly revenue',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  // Fake purchases operations
  getFakePurchases,
  getFakePurchaseById,
  createFakePurchase,
  updateFakePurchase,
  deleteFakePurchase,
  getAuthorsForDropdown,
  
  // Author dashboard API
  getAuthorRecentPurchases,
  
  // Book operations
  createBook,
  
  // Revenue operations
  updateUserMonthlyRevenue
};