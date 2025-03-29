const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
  sendEmail, 
  getWelcomeEmailTemplate, 
  getLoginNotificationTemplate,
  getPasswordResetTemplate 
} = require('../config/email');
const { OAuth2Client } = require('google-auth-library');
const Royalty = require('../models/Royalty');
const { sendSMS } = require('../services/notificationService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

const register = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User(req.body);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send welcome email
    const emailTemplate = getWelcomeEmailTemplate(name);
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    // Send SMS notification
    await sendSMS(user.phone, `Welcome ${user.name}! Your author account is ready.`);

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Send login notification email
    const emailTemplate = getLoginNotificationTemplate(user.name);
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error logging in',
      error: error.message 
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate password reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create password reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailTemplate = getPasswordResetTemplate(user.name, resetLink);
    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    res.json({ 
      message: 'Password reset instructions sent to your email' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing forgot password request',
      error: error.message 
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by decoded ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password and save
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        message: 'Invalid or expired token',
        error: error.message 
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      message: 'Error resetting password',
      error: error.message 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('+aadhaarNumber +panNumber')
      .lean();

    const response = {
      ...user,
      bankAccount: user.bankAccount // Full details now
    };

    delete response.password;
    delete response.tokens;
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Handle top-level profilePhoto field by moving it to the profile object
    if (updates.profilePhoto && typeof updates.profilePhoto === 'string') {
      // Create profile object if it doesn't exist
      if (!updates.profile) {
        updates.profile = {};
      }

      // Move profilePhoto into the profile object
      updates.profile.profilePhoto = updates.profilePhoto;

      // Remove the top-level profilePhoto to avoid validation issues
      delete updates.profilePhoto;
    }

    // Only allow certain fields to be updated
    const allowedUpdates = [
      'name', 'phoneNumber', 'address', 'bankAccount',
      'about', 'profilePhoto', 'governmentId', 'authorStats',
      'profile' // Make sure 'profile' is here to allow updating nested fields
    ];

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // If KYC details are updated, reset status to pending
    if (filteredUpdates.governmentId || filteredUpdates.bankAccount) {
      filteredUpdates.kycStatus = 'pending';
    }

    console.log('Filtered updates being applied:', JSON.stringify(filteredUpdates));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-password -governmentId');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};
 
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // Check if user already exists
    let user = await User.findOne({ 
      $or: [{ googleId: payload.sub }, { email: payload.email }]
    });

    if (!user) {
      // Create new user
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        authMethod: 'google',
        verified: true,
        profile: {
          photo: payload.picture
        }
      });
      await user.save();
    }

    // Generate JWT
    const jwtToken = generateToken(user._id);
    
    // Return user data
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Google login successful',
      user: userData,
      token: jwtToken
    });

  } catch (error) {
    res.status(401).json({
      message: 'Google authentication failed',
      error: error.message
    });
  }
};

const requestPayout = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    
    // Check available royalty balance
    const author = await User.findById(req.user._id);
    if (author.outstandingRoyalty < amount) {
      return res.status(400).json({ 
        message: 'Insufficient royalty balance' 
      });
    }

    // Create payout request
    const royalty = new Royalty({
      authorId: req.user._id,
      amount,
      paymentMethod,
      status: 'Pending'
    });

    await royalty.save();

    // Update royalty balances
    author.outstandingRoyalty -= amount;
    author.royaltyReceived += amount;
    await author.save();

    res.status(201).json({
      message: 'Payout request submitted',
      royalty
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating payout request',
      error: error.message 
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) return res.sendStatus(403);
    
    const accessToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.json({ token: accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  googleLogin,
  requestPayout,
  refreshToken: exports.refreshToken
};