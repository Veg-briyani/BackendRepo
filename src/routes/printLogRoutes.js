const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const PrintLog = require('../models/PrintLog');
const { validatePrintLog } = require('../middleware/validation');

// Create print log
router.post('/', auth, validatePrintLog, async (req, res) => {
  try {
    const printLog = new PrintLog({
      ...req.body,
      authorId: req.user._id
    });
    await printLog.save();
    res.status(201).json(printLog);
  } catch (error) {
    res.status(400).json({ message: 'Error creating print log', error: error.message });
  }
});

// Get all print logs for author
router.get('/', auth, async (req, res) => {
  try {
    const printLogs = await PrintLog.find({ authorId: req.user._id })
      .populate('bookId', 'title isbn');
    res.json(printLogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching print logs', error: error.message });
  }
});

// Get single print log
router.get('/:id', auth, async (req, res) => {
  try {
    const printLog = await PrintLog.findOne({
      _id: req.params.id,
      authorId: req.user._id
    }).populate('bookId', 'title isbn');
    
    if (!printLog) return res.status(404).json({ message: 'Print log not found' });
    res.json(printLog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching print log', error: error.message });
  }
});

// Update print log
router.put('/:id', auth, validatePrintLog, async (req, res) => {
  try {
    const printLog = await PrintLog.findOneAndUpdate(
      { _id: req.params.id, authorId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!printLog) return res.status(404).json({ message: 'Print log not found' });
    res.json(printLog);
  } catch (error) {
    res.status(400).json({ message: 'Error updating print log', error: error.message });
  }
});

// Delete print log
router.delete('/:id', auth, async (req, res) => {
  try {
    const printLog = await PrintLog.findOneAndDelete({
      _id: req.params.id,
      authorId: req.user._id
    });
    
    if (!printLog) return res.status(404).json({ message: 'Print log not found' });
    res.json({ message: 'Print log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting print log', error: error.message });
  }
});

module.exports = router; 