const Book = require('../models/Book');
const User = require('../models/User');

const createBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      authorId: req.user._id
    };

    const book = new Book(bookData);
    await book.save();

    // Update author's stats
    await User.findByIdAndUpdate(req.user._id, {
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

const getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = { authorId: req.user._id };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalBooks: count
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching books',
      error: error.message
    });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      authorId: req.user._id
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching book',
      error: error.message
    });
  }
};

const updateBook = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.authorId; // Prevent author change

    const book = await Book.findOneAndUpdate(
      {
        _id: req.params.id,
        authorId: req.user._id
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating book',
      error: error.message
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      authorId: req.user._id
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update author's stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'authorStats.numberOfPublications': -1,
        'authorStats.totalWorks': -1
      }
    });

    res.json({
      message: 'Book deleted successfully',
      book
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting book',
      error: error.message
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const books = await Book.find({ authorId: req.user._id });
    
    const stats = {
      totalRoyaltyEarned: books.reduce((sum, book) => sum + book.royalties, 0),
      outstandingRoyalty: books.reduce((sum, book) => sum + (book.soldCopies * book.price * 0.7 - book.royalties), 0),
      copiesSold: books.reduce((sum, book) => sum + book.soldCopies, 0),
      royaltyReceived: books.reduce((sum, book) => sum + book.royalties, 0),
      currentMonthGrowth: books.reduce((sum, book) => sum + book.lastMonthSale, 0),
      genres: [...new Set(books.map(book => book.category))],
      totalInventory: books.reduce((sum, book) => sum + book.stock, 0),
      books: books.map(book => ({
        name: book.title,
        price: book.price,
        stock: book.stock,
        royalty: book.royalties,
        copiesSold: book.soldCopies,
        lastMonthSale: book.lastMonthSale
      }))
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

const uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { coverImage: req.file.filename },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      message: 'Cover image updated successfully',
      coverImage: `${process.env.BASE_URL}/book-covers/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error uploading cover image',
      error: error.message 
    });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getDashboardStats,
  uploadCoverImage
};