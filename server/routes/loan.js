const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Loan = require('../models/Loan');
const { verifyPayment, processLoanDisbursement } = require('../services/payment');

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

// Apply for a loan
router.post('/apply', verifyToken, async (req, res) => {
  try {
    const { amount, purpose, duration, panCard, aadhaar, bankAccount, ifsc } = req.body;
    const userId = req.user.userId;
    
    // Validate input
    if (!amount || !purpose || !duration || !panCard || !aadhaar || !bankAccount || !ifsc) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // For simplicity in this demo, we'll skip file uploads and some validations
    
    // Calculate due date based on duration (in months)
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + parseInt(duration));
    
    // Create new loan application
    const loan = new Loan({
      userId,
      amount: parseFloat(amount),
      purpose,
      duration: parseInt(duration),
      panCard,
      aadhaar,
      bankAccount,
      ifsc,
      status: 'Applied',
      dueDate
    });
    
    await loan.save();
    
    // Process dummy bank verification payment
    const payment = verifyPayment(userId, 20);
    
    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      loan: {
        id: loan._id,
        amount: loan.amount,
        status: loan.status,
        dueDate: loan.dueDate
      },
      payment
    });
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ success: false, message: 'Server error during loan application' });
  }
});

// Get loan status for a user
router.get('/status', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all non-deleted loans for the user
    const loans = await Loan.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    
    if (loans.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No loan applications found',
        loans: []
      });
    }
    
    res.status(200).json({
      success: true,
      loans: loans.map(loan => ({
        id: loan._id,
        amount: loan.amount,
        status: loan.status,
        createdAt: loan.createdAt,
        dueDate: loan.dueDate,
        repaymentAmount: loan.repaymentAmount,
        rejectionReason: loan.rejectionReason
      }))
    });
  } catch (error) {
    console.error('Loan status fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching loan status' });
  }
});

// Get loan details
router.get('/details/:id', verifyToken, async (req, res) => {
  try {
    const loanId = req.params.id;
    const userId = req.user.userId;
    
    const loan = await Loan.findOne({ _id: loanId, userId, isDeleted: { $ne: true } });
    
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    
    res.status(200).json({
      success: true,
      loan: {
        id: loan._id,
        amount: loan.amount,
        status: loan.status,
        createdAt: loan.createdAt,
        dueDate: loan.dueDate,
        repaymentAmount: loan.repaymentAmount,
        interestRate: loan.interestRate,
        processingFee: loan.processingFee,
        latePaymentCharges: loan.latePaymentCharges,
        documents: loan.documents,
        rejectionReason: loan.rejectionReason
      }
    });
  } catch (error) {
    console.error('Loan details fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching loan details' });
  }
});

// Process dummy loan disbursement (for approved loans)
router.post('/disburse/:id', verifyToken, async (req, res) => {
  try {
    const loanId = req.params.id;
    const userId = req.user.userId;
    
    const loan = await Loan.findOne({ _id: loanId, userId, status: 'Approved', isDeleted: { $ne: true } });
    
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Approved loan not found' });
    }
    
    // Process dummy disbursement
    const disbursement = processLoanDisbursement(userId, loanId, 900); // 1000 - 100 processing fee
    
    res.status(200).json({
      success: true,
      message: 'Loan disbursed successfully',
      disbursement
    });
  } catch (error) {
    console.error('Loan disbursement error:', error);
    res.status(500).json({ success: false, message: 'Server error during loan disbursement' });
  }
});

module.exports = router;