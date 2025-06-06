const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
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
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    message: 'Simple static file server is running'
  });
});

// Serve the portal page as the default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portal.html'));
});

// Catch-all route to serve portal.html for any HTML request
app.get('*', (req, res) => {
  // Check if the request is for an HTML file
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    // Check if the file exists
    const requestedPath = req.path.substring(1); // Remove leading slash
    const filePath = path.join(__dirname, 'public', requestedPath);
    
    try {
      if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
      } else {
        res.sendFile(path.join(__dirname, 'public', 'portal.html'));
      }
    } catch (error) {
      res.sendFile(path.join(__dirname, 'public', 'portal.html'));
    }
  } else {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 12000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Simple static file server running on ${HOST}:${PORT}`);
  console.log(`Server accessible at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`For runtime environment, use: https://work-1-dubiqgqjwebrttye.prod-runtime.all-hands.dev:${PORT}`);
});