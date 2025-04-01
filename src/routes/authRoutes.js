// const express = require('express');
// const router = express.Router();
// const { auth } = require('../middleware/auth');
// const {
//   validateUser,
//   validateLogin,
//   validateProfileUpdate,
//   validateForgotPassword,
//   validateResetPassword,
//   validateGoogleLogin,
//   validateKycUpdateRequest,
//   validatePhotoUpdate,
//   validateRequestOTP,
//   validateVerifyOTP
// } = require('../middleware/validation');
// const {
//   register,
//   login,
//   forgotPassword,
//   resetPassword,
//   getProfile,
//   updateProfile,
//   updateProfilePhoto,
//   googleLogin,
//   requestOTP,
//   verifyOTP
// } = require('../controllers/authController');
// const KycUpdateRequest = require('../models/KycUpdateRequest');

const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Your user model
const { auth } = require('../middleware/auth');
const {
  validateUser,
  validateLogin,
  validateProfileUpdate,
  validateForgotPassword,
  validateResetPassword,
  validateGoogleLogin,
  validateKycUpdateRequest,
  validatePhotoUpdate,
  validateRequestOTP,
  validateVerifyOTP
} = require('../middleware/validation');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  updateProfilePhoto,
  googleLogin,
  requestOTP,
  verifyOTP
} = require('../controllers/authController');
const KycUpdateRequest = require('../models/KycUpdateRequest');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login Route
router.post('/google-login', validateGoogleLogin, async (req, res) => {
  try {
    // 1. Get the credential token from the request
    const { credential } = req.body;
    
    // For testing/debug purposes, allow bypassing token verification
    // IMPORTANT: This is only for testing, remove in production!
    if (process.env.NODE_ENV === 'development' && credential.startsWith('ya29.')) {
      // Extract email from request if available, or use a default test email
      const email = req.body.testEmail || 'test@example.com';
      
      // Find or create user with this email
      let user = await User.findOne({ email });
      
      if (!user) {
        user = new User({
          email,
          name: 'Test User',
          profileImage: 'https://via.placeholder.com/150',
          googleId: 'test-google-id'
        });
        
        await user.save();
      }
      
      // 3. Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      // 4. Send response
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
        }
      });
    }

    // Regular verification path (for production)
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const { email, name, picture, sub } = payload;

      // 2. Find or create user
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          email,
          name,
          profileImage: picture,
          googleId: sub,
        });

        await user.save();
      }

      // 3. Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // 4. Send response
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
        }
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      throw new Error(`Google token verification failed: ${verifyError.message}`);
    }
  } catch (error) {
    console.error('Google login error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    });
  }
});

// Public routes
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/request-otp', validateRequestOTP, requestOTP);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);

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
