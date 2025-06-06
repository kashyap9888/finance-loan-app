const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  permissions: {
    location: {
      type: Boolean,
      default: false
    },
    contacts: {
      type: Boolean,
      default: false
    }
  },
  locationData: {
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  panCard: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return v === '' || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: props => `${props.value} is not a valid PAN number!`
    }
  },
  aadhaar: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return v === '' || /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid 12-digit Aadhaar number!`
    }
  },
  bankDetails: {
    accountNumber: String,
    ifsc: String,
    bankName: String
  },
  salarySlips: [String],
  livePhoto: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;