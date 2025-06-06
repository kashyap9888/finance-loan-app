const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./server/models/User');
const Loan = require('./server/models/Loan');
const Admin = require('./server/models/Admin');
const path = require('path');
const fs = require('fs');

async function createTestData() {
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
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create a test user
    const testUser = new User({
      name: 'John Doe',
      mobile: '9876543210',
      city: 'Mumbai',
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
      ],
      bankDetails: {
        accountNumber: '1234567890',
        ifsc: 'ABCD0001234',
        bankName: 'Test Bank'
      }
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    
    // Create a test loan
    const testLoan = new Loan({
      userId: testUser._id,
      amount: 1000,
      status: 'Applied',
      pan: 'ABCDE1234F',
      aadhaar: '123456789012',
      documents: ['/uploads/dummy-doc1.pdf', '/uploads/dummy-doc2.pdf', '/uploads/dummy-doc3.pdf'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    
    await testLoan.save();
    console.log('Test loan created successfully');
    
    // Create a second test user
    const testUser2 = new User({
      name: 'Jane Smith',
      mobile: '8765432109',
      city: 'Delhi',
      permissions: {
        location: true,
        contacts: true
      },
      location: {
        lat: 28.7041,
        lng: 77.1025
      },
      contacts: [
        { name: 'Contact 1', phone: '7654321098' },
        { name: 'Contact 2', phone: '6543210987' }
      ],
      bankDetails: {
        accountNumber: '0987654321',
        ifsc: 'EFGH0005678',
        bankName: 'Another Bank'
      }
    });
    
    await testUser2.save();
    console.log('Second test user created successfully');
    
    // Create a second test loan (approved)
    const testLoan2 = new Loan({
      userId: testUser2._id,
      amount: 2000,
      status: 'Approved',
      pan: 'FGHIJ5678K',
      aadhaar: '987654321012',
      documents: ['/uploads/dummy-doc4.pdf', '/uploads/dummy-doc5.pdf', '/uploads/dummy-doc6.pdf'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    
    await testLoan2.save();
    console.log('Second test loan created successfully');
    
    // Create a third test user
    const testUser3 = new User({
      name: 'Robert Johnson',
      mobile: '7654321098',
      city: 'Bangalore',
      permissions: {
        location: true,
        contacts: true
      },
      location: {
        lat: 12.9716,
        lng: 77.5946
      },
      contacts: [
        { name: 'Contact 1', phone: '6543210987' },
        { name: 'Contact 2', phone: '5432109876' }
      ],
      bankDetails: {
        accountNumber: '5678901234',
        ifsc: 'IJKL0009012',
        bankName: 'Third Bank'
      }
    });
    
    await testUser3.save();
    console.log('Third test user created successfully');
    
    // Create a third test loan (rejected)
    const testLoan3 = new Loan({
      userId: testUser3._id,
      amount: 3000,
      status: 'Rejected',
      pan: 'LMNOP9012Q',
      aadhaar: '567890123456',
      documents: ['/uploads/dummy-doc7.pdf', '/uploads/dummy-doc8.pdf', '/uploads/dummy-doc9.pdf'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      rejectionReason: 'Insufficient documentation provided'
    });
    
    await testLoan3.save();
    console.log('Third test loan created successfully');
    
    // Create dummy document files
    for (let i = 1; i <= 9; i++) {
      const filePath = path.join(uploadsDir, `dummy-doc${i}.pdf`);
      fs.writeFileSync(filePath, `This is a dummy document ${i}`);
    }
    console.log('Dummy documents created successfully');
    
    // Verify data
    const admins = await Admin.find();
    const users = await User.find();
    const loans = await Loan.find();
    
    console.log(`\nDatabase contains:`);
    console.log(`- ${admins.length} admin(s)`);
    console.log(`- ${users.length} user(s)`);
    console.log(`- ${loans.length} loan(s)`);
    
    console.log('\nTest data created successfully');
    console.log('\nTest User Credentials:');
    console.log('1. Mobile: 9876543210');
    console.log('2. Mobile: 8765432109');
    console.log('3. Mobile: 7654321098');
    console.log('\nAdmin Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    // Close connections
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('MongoDB connections closed');
    
  } catch (error) {
    console.error('Error during test data creation:', error);
  }
}

// Run the function
createTestData();