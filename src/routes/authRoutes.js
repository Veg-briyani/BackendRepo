const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  validateUser,
  validateLogin,
  validateProfileUpdate,
  validateForgotPassword,
  validateResetPassword,
  validateGoogleLogin,
  validateKycUpdateRequest,
  validatePhotoUpdate
} = require('../middleware/validation');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  updateProfilePhoto,
  googleLogin
} = require('../controllers/authController');
const KycUpdateRequest = require('../models/KycUpdateRequest');

// Public routes
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/google-login', validateGoogleLogin, googleLogin);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validateProfileUpdate, updateProfile);


// Submit KYC update request
router.post('/kyc/update-request', auth, validateKycUpdateRequest, async (req, res) => {
  try {
    const existingRequest = await KycUpdateRequest.findOne({
      user: req.user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request' });
    }

    const newRequest = new KycUpdateRequest({
      user: req.user._id,
      ...req.body
    });

    await newRequest.save();

    res.status(201).json({
      message: 'KYC update request submitted for review',
      requestId: newRequest._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting request' });
  }
});

module.exports = router;