const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    default: 1000 
  },
  status: { 
    type: String, 
    enum: ['Applied', 'Approved', 'Rejected', 'Disbursed', 'Repaid'], 
    default: 'Applied' 
  },
  purpose: {
    type: String,
    default: 'Personal'
  },
  duration: {
    type: Number,
    default: 7, // 7 days
  },
  panCard: String,
  aadhaar: String,
  bankAccount: String,
  ifsc: String,
  rejectionReason: String,
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  approvedAt: Date,
  disbursedAt: Date,
  repaidAt: Date,
  dueDate: { 
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 7); // Default 7 days
      return date;
    }
  },
  amountToCredit: { 
    type: Number, 
    default: 900 // Amount - Processing Fee
  },
  repaymentAmount: { 
    type: Number, 
    default: 1100 
  },
  interestRate: { 
    type: Number, 
    default: 2 // 2%
  },
  interestAmount: {
    type: Number,
    default: 20 // 2% of 1000
  },
  processingFee: { 
    type: Number, 
    default: 115 
  },
  latePaymentCharges: { 
    type: Number, 
    default: 20 // per day
  },
  latePaymentDays: {
    type: Number,
    default: 0
  },
  totalLateCharges: {
    type: Number,
    default: 0
  },
  termsAccepted: {
    type: Boolean,
    default: false
  }
});

// Update the updatedAt field on save
loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;