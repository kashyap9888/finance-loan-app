const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Admin = require('../models/Admin');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    
    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Server error during admin login' });
  }
});

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token belongs to an admin
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Get all loan applications
router.get('/loans', async (req, res) => {
  try {
    const { city } = req.query;
    
    // Build query
    const query = { isDeleted: { $ne: true } };
    
    // Get all loans with user details
    const loans = await Loan.find(query).populate('userId');
    
    // Filter by city if provided
    const filteredLoans = city 
      ? loans.filter(loan => loan.userId && loan.userId.city.toLowerCase() === city.toLowerCase())
      : loans;
    
    // Format response
    const formattedLoans = filteredLoans.map(loan => ({
      id: loan._id,
      user: {
        id: loan.userId._id,
        fullName: loan.userId.name,
        mobile: loan.userId.mobile,
        city: loan.userId.city,
        location: loan.userId.location,
        contacts: loan.userId.contacts || [],
        profilePhoto: loan.userId.profilePhoto,
        livePhoto: loan.userId.livePhoto
      },
      amount: loan.amount,
      status: loan.status,
      documents: loan.documents,
      pan: loan.pan,
      aadhaar: loan.aadhaar,
      createdAt: loan.createdAt,
      dueDate: loan.dueDate,
      repaymentAmount: loan.repaymentAmount,
      rejectionReason: loan.rejectionReason
    }));
    
    res.status(200).json({
      success: true,
      count: formattedLoans.length,
      loans: formattedLoans
    });
  } catch (error) {
    console.error('Admin loans fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching loans' });
  }
});

// Get unique cities for filtering
router.get('/cities', async (req, res) => {
  try {
    const users = await User.find().distinct('city');
    res.status(200).json({
      success: true,
      cities: users
    });
  } catch (error) {
    console.error('Cities fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching cities' });
  }
});

// Approve a loan
router.put('/loans/:id/approve', async (req, res) => {
  try {
    const loanId = req.params.id;
    
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    
    // Update loan status
    loan.status = 'Approved';
    loan.rejectionReason = undefined;
    await loan.save();
    
    res.status(200).json({
      success: true,
      message: 'Loan approved successfully',
      loan: {
        id: loan._id,
        status: loan.status
      }
    });
  } catch (error) {
    console.error('Loan approval error:', error);
    res.status(500).json({ success: false, message: 'Server error during loan approval' });
  }
});

// Reject a loan
router.put('/loans/:id/reject', async (req, res) => {
  try {
    const loanId = req.params.id;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    
    if (rejectionReason.length > 200) {
      return res.status(400).json({ success: false, message: 'Rejection reason must be 200 characters or less' });
    }
    
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    
    // Update loan status
    loan.status = 'Rejected';
    loan.rejectionReason = rejectionReason.trim();
    await loan.save();
    
    res.status(200).json({
      success: true,
      message: 'Loan rejected successfully',
      loan: {
        id: loan._id,
        status: loan.status,
        rejectionReason: loan.rejectionReason
      }
    });
  } catch (error) {
    console.error('Loan rejection error:', error);
    res.status(500).json({ success: false, message: 'Server error during loan rejection' });
  }
});

// Delete a loan (soft delete)
router.delete('/loans/:id', async (req, res) => {
  try {
    const loanId = req.params.id;
    
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    
    // Soft delete
    loan.isDeleted = true;
    await loan.save();
    
    res.status(200).json({
      success: true,
      message: 'Loan deleted successfully'
    });
  } catch (error) {
    console.error('Loan deletion error:', error);
    res.status(500).json({ success: false, message: 'Server error during loan deletion' });
  }
});

// Create default admin if none exists
router.post('/setup', async (req, res) => {
  try {
    await Admin.createDefaultAdmin();
    res.status(200).json({ success: true, message: 'Admin setup completed' });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ success: false, message: 'Server error during admin setup' });
  }
});

module.exports = router;