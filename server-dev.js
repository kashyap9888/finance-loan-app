const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('./server/routes/auth');
const loanRoutes = require('./server/routes/loan');
const adminRoutes = require('./server/routes/admin');
const Admin = require('./server/models/Admin');
const User = require('./server/models/User');
const Loan = require('./server/models/Loan');

dotenv.config();

// Set JWT_SECRET if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'finance-loan-app-secret-key';
  console.log('JWT_SECRET not found in .env, using default secret key');
}

async function startServer() {
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-loan-app';
  
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB at', mongoUri);
  } catch (error) {
    console.log('Failed to connect to MongoDB, falling back to in-memory database');
    // Create an in-memory MongoDB server as fallback
    const mongoServer = await MongoMemoryServer.create();
    const inMemoryUri = mongoServer.getUri();
    
    console.log(`MongoDB Memory Server started at ${inMemoryUri}`);
    
    // Connect to the in-memory database
    await mongoose.connect(inMemoryUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to in-memory MongoDB');
  }
  
  // Create default admin
  await Admin.createDefaultAdmin();
  
  // Create test users and loans
  const testUser = new User({
    fullName: 'John Doe',
    mobile: '9876543210',
    city: 'Mumbai',
    permissions: {
      location: true,
      contacts: true
    },
    locationData: {
      latitude: 12.9716,
      longitude: 77.5946,
      timestamp: new Date()
    },
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
    fullName: 'Jane Smith',
    mobile: '8765432109',
    city: 'Delhi',
    permissions: {
      location: true,
      contacts: true
    },
    locationData: {
      latitude: 28.7041,
      longitude: 77.1025,
      timestamp: new Date()
    },
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
    fullName: 'Robert Johnson',
    mobile: '7654321098',
    city: 'Bangalore',
    permissions: {
      location: true,
      contacts: true
    },
    locationData: {
      latitude: 12.9716,
      longitude: 77.5946,
      timestamp: new Date()
    },
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
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  for (let i = 1; i <= 9; i++) {
    const filePath = path.join(uploadsDir, `dummy-doc${i}.pdf`);
    fs.writeFileSync(filePath, `This is a dummy document ${i}`);
  }
  console.log('Dummy documents created successfully');
  
  const app = express();
  
  // Configure CORS
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
  // Add additional CORS headers for all responses
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });
  
  // Configure middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Test endpoints
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API is working!' });
  });
  
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  });
  
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/loan', loanRoutes);
  app.use('/api/admin', adminRoutes);
  
  // Serve static files from the React app in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
  } else {
    // Serve the portal page as the default route
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'portal.html'));
    });
    
    // Catch-all route for development
    app.get('*', (req, res) => {
      // Check if the request is for an HTML file
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        // Check if the file exists
        const requestedPath = req.path.substring(1); // Remove leading slash
        const filePath = path.join(__dirname, 'public', requestedPath);
        
        if (fs.existsSync(filePath)) {
          res.sendFile(filePath);
        } else {
          res.sendFile(path.join(__dirname, 'public', 'portal.html'));
        }
      } else {
        res.status(404).json({ success: false, message: 'API endpoint not found' });
      }
    });
  }
  
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0';
  
  app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log(`Server accessible at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`For runtime environment, use: https://work-1-dubiqgqjwebrttye.prod-runtime.all-hands.dev:${PORT}`);
    console.log('\nDefault admin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  });
  
  // Handle shutdown
  process.on('SIGINT', async () => {
    await mongoose.disconnect();
    console.log('MongoDB connections closed');
    process.exit(0);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});