const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create default admin if none exists
adminSchema.statics.createDefaultAdmin = async function() {
  try {
    const adminCount = await this.countDocuments();
    if (adminCount === 0) {
      await this.create({
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin created: admin@example.com / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;