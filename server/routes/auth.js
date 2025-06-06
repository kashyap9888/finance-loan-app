const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { generateOTP, validateOTP } = require('../services/otp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, .png, and .pdf files are allowed'));
    }
  }
});

// Register a new user
router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, mobile, city } = req.body;
    let permissions = req.body.permissions;
    
    // Validate input
    if (!name || !mobile || !city) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be 10 digits' });
    }
    
    // Parse permissions if it's a string
    if (typeof permissions === 'string') {
      try {
        permissions = JSON.parse(permissions);
      } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid permissions format' });
      }
    }
    
    // Check if location permission is granted
    if (!permissions || !permissions.location) {
      return res.status(400).json({ success: false, message: 'Location permission is required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this mobile number already exists' });
    }
    
    // Create new user
    const user = new User({
      name,
      mobile,
      city,
      permissions,
      profilePhoto: req.file ? '/uploads/' + req.file.filename : null
    });
    
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful! Please log in.',
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        city: user.city
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login (send OTP)
router.post('/login', async (req, res) => {
  try {
    const { mobile } = req.body;
    
    // Validate mobile number
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Valid mobile number is required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }
    
    // Generate OTP
    generateOTP(mobile);
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully. Check console for the OTP (valid for 60 seconds).',
      mobile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    // Validate input
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }
    
    // Validate OTP
    const validation = validateOTP(mobile, otp);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }
    
    // Find user
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        city: user.city
      },
      loanEligibility: {
        amount: 1000,
        days: 7,
        interestRate: 2,
        processingFee: 115,
        amountToCredit: 900,
        totalRepayment: 1100,
        latePaymentCharges: 20
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
});

// Update user location
router.post('/update-location', async (req, res) => {
  try {
    const { userId, location } = req.body;
    
    if (!userId || !location || !location.lat || !location.lng) {
      return res.status(400).json({ success: false, message: 'User ID and location coordinates are required' });
    }
    
    await User.findByIdAndUpdate(userId, { location });
    
    res.status(200).json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ success: false, message: 'Server error during location update' });
  }
});

// Update user contacts
router.post('/update-contacts', async (req, res) => {
  try {
    const { userId, contacts } = req.body;
    
    if (!userId || !contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ success: false, message: 'User ID and contacts array are required' });
    }
    
    await User.findByIdAndUpdate(userId, { contacts });
    
    res.status(200).json({ success: true, message: 'Contacts updated successfully' });
  } catch (error) {
    console.error('Contacts update error:', error);
    res.status(500).json({ success: false, message: 'Server error during contacts update' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Get user profile (protected route)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-__v');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching profile' });
  }
});

module.exports = router;