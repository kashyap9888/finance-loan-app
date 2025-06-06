const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, default: 1000 },
  status: { type: String, enum: ['Applied', 'Pending', 'Approved', 'Rejected'], default: 'Applied' },
  documents: [String],
  pan: String,
  aadhaar: String,
  rejectionReason: String,
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  repaymentAmount: { type: Number, default: 1100 },
  interestRate: { type: Number, default: 2 },
  processingFee: { type: Number, default: 115 },
  latePaymentCharges: { type: Number, default: 20 }
});

module.exports = mongoose.model('Loan', loanSchema);