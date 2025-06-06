const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  permissions: { 
    location: { type: Boolean, default: false },
    contacts: { type: Boolean, default: false }
  },
  profilePhoto: String,
  livePhoto: String,
  location: {
    lat: Number,
    lng: Number
  },
  contacts: [{ 
    name: String, 
    phone: String 
  }],
  bankDetails: { 
    accountNumber: String, 
    ifsc: String, 
    bankName: String 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);