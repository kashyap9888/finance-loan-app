const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('./server/routes/auth');
const loanRoutes = require('./server/routes/loan');
const adminRoutes = require('./server/routes/admin');
const Admin = require('./server/models/Admin');

dotenv.config();

async function startServer() {
  // Create an in-memory MongoDB server
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  console.log(`MongoDB Memory Server started at ${mongoUri}`);
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to in-memory MongoDB');
  
  // Create default admin
  await Admin.createDefaultAdmin();
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
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
  }
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Server accessible at http://localhost:${PORT}`);
    console.log('\nDefault admin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  });
  
  // Handle shutdown
  process.on('SIGINT', async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('MongoDB connections closed');
    process.exit(0);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});