const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// @desc    Get author's fake purchases
// @route   GET /api/author/fake-purchases
// @access  Author
router.get('/fake-purchases', 
  auth,
  async (req, res) => {
    try {
      // Add author filter to query parameters
      const modifiedReq = {
        ...req,
        query: {
          ...req.query,
          authorId: req.user._id // Force filter by authenticated author
        }
      };

      // Use existing controller with modified request
      await adminController.getFakePurchases(modifiedReq, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error fetching fake purchases',
        error: error.message
      });
    }
  }
);

module.exports = router; 