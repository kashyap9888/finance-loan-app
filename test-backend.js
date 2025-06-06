const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Admin = require('./server/models/Admin');
const User = require('./server/models/User');
const Loan = require('./server/models/Loan');

// Load environment variables
dotenv.config();

async function testBackend() {
  // Create an in-memory MongoDB server
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  console.log(`MongoDB Memory Server started at ${mongoUri}`);
  
  try {
    // Connect to the in-memory database
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to in-memory MongoDB');
    
    // Create default admin
    await Admin.createDefaultAdmin();
    console.log('Default admin created successfully');
    
    // Create a test user
    const testUser = new User({
      name: 'Test User',
      mobile: '1234567890',
      city: 'Test City',
      permissions: {
        location: true,
        contacts: true
      },
      location: {
        lat: 12.9716,
        lng: 77.5946
      },
      contacts: [
        { name: 'Contact 1', phone: '9876543210' },
        { name: 'Contact 2', phone: '8765432109' }
      ]
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    
    // Create a test loan
    const testLoan = new Loan({
      userId: testUser._id,
      amount: 1000,
      status: 'Applied',
      pan: 'ABCDE1234F',
      aadhaar: '123456789012'
    });
    
    await testLoan.save();
    console.log('Test loan created successfully');
    
    // Verify data
    const admins = await Admin.find();
    const users = await User.find();
    const loans = await Loan.find();
    
    console.log(`\nDatabase contains:`);
    console.log(`- ${admins.length} admin(s)`);
    console.log(`- ${users.length} user(s)`);
    console.log(`- ${loans.length} loan(s)`);
    
    console.log('\nBackend setup and test completed successfully');
    console.log('You can now start the server with: npm start');
    
    // Close connections
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('MongoDB connections closed');
    
  } catch (error) {
    console.error('Error during backend test:', error);
  }
}

// Run the test
testBackend();