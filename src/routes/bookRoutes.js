const express = require('express');
const router = express.Router();
const { auth, authorizeRole } = require('../middleware/auth');
const { validateBook, validateAuthorPrice } = require('../middleware/validation');
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getDashboardStats,
  uploadCoverImage
} = require('../controllers/bookController');
const upload = require('../config/multer');
const Book = require('../models/Book');

// All routes require authentication
router.use(auth);

// Book CRUD operations
router.post('/', validateBook, createBook);
router.get('/', getBooks);
router.get('/dashboard', getDashboardStats);
router.get('/:id', getBookById);
router.put('/:id', validateBook, updateBook);
router.put('/:id/cover',
  authorizeRole(['admin']),
  upload.single('coverImage'),
  uploadCoverImage
);
router.delete('/:id', deleteBook);

// Admin routes
router.get('/admin/all', authorizeRole(['admin']), async (req, res) => {
  try {
    const books = await Book.find()
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching all books',
      error: error.message
    });
  }
});

router.put('/:id/author-price', 
  auth,
  validateAuthorPrice,
  async (req, res) => {
    try {
      const book = await Book.findOneAndUpdate(
        { 
          _id: req.params.id,
          authorId: req.user._id // Ensure only author can update
        },
        { $set: { authorCopyPrice: req.body.price } },
        { new: true, runValidators: true }
      );

      if (!book) {
        return res.status(404).json({ message: 'Book not found or unauthorized' });
      }

      res.json({
        message: 'Author price updated successfully',
        book
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error updating author price',
        error: error.message
      });
    }
  }
);

module.exports = router;