const { spawn } = require('child_process');
const axios = require('axios');

// Start the server
console.log('Starting the server...');
const server = spawn('node', ['server-dev.js'], { stdio: 'pipe' });

let serverOutput = '';
server.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  console.log(`[SERVER]: ${output.trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER ERROR]: ${data.toString().trim()}`);
});

// Base URL for API requests
const API_URL = 'http://localhost:3000/api';

// Wait for server to start
const waitForServer = async () => {
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    try {
      await axios.get('http://localhost:3000');
      console.log('Server is up and running!');
      return true;
    } catch (error) {
      if (error.code !== 'ECONNREFUSED') {
        console.log('Server is up and running!');
        return true;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.error('Server failed to start after 30 seconds');
  return false;
};

// Test admin login
async function testAdminLogin() {
  try {
    console.log('\n--- Testing Admin Login ---');
    const response = await axios.post(`${API_URL}/admin/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('Admin login successful');
    console.log('Token:', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test user registration
async function testUserRegistration() {
  try {
    console.log('\n--- Testing User Registration ---');
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: 'John Doe',
      mobile: '9876543210',
      city: 'Mumbai',
      permissions: { location: true, contacts: true }
    });
    
    console.log('User registration successful');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('User registration failed:', error.response?.data || error.message);
    return null;
  }
}

// Test user login (OTP generation)
async function testUserLogin(mobile) {
  try {
    console.log('\n--- Testing User Login (OTP Generation) ---');
    const response = await axios.post(`${API_URL}/auth/login`, { mobile });
    
    console.log('OTP generation successful');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('OTP generation failed:', error.response?.data || error.message);
    return null;
  }
}

// Test OTP verification
async function testOTPVerification(mobile, serverLogs) {
  try {
    console.log('\n--- Testing OTP Verification ---');
    
    // Extract OTP from server logs
    const otpMatch = serverLogs.match(new RegExp(`Generated OTP for ${mobile}: (\\d+)`));
    const otp = otpMatch ? otpMatch[1] : '123456';
    
    console.log(`Using OTP: ${otp} extracted from logs`);
    
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { mobile, otp });
    
    console.log('OTP verification successful');
    console.log('Token:', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('OTP verification failed:', error.response?.data || error.message);
    return null;
  }
}

// Test getting admin loans
async function testGetAdminLoans(token) {
  try {
    console.log('\n--- Testing Get Admin Loans ---');
    const response = await axios.get(`${API_URL}/admin/loans`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Get admin loans successful');
    console.log(`Found ${response.data.loans.length} loans`);
    return response.data;
  } catch (error) {
    console.error('Get admin loans failed:', error.response?.data || error.message);
    return null;
  }
}

// Test loan application (simplified without file uploads)
async function testLoanApplication(userToken) {
  try {
    console.log('\n--- Testing Loan Application (Simplified) ---');
    
    // In a real application, we would upload files here
    // For this test, we're simplifying by not including file uploads
    const response = await axios.post(
      `${API_URL}/loan/apply`, 
      {
        pan: 'ABCPD1234Z',
        aadhaar: '123456789012',
        bankDetails: JSON.stringify({
          accountNumber: '1234567890',
          ifsc: 'ABCD0001234',
          bankName: 'Test Bank'
        })
      },
      {
        headers: { 
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Loan application test completed');
    console.log('Note: This test is expected to fail without file uploads');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.log('Loan application test completed (expected error due to missing files)');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('=== Starting API Tests ===');
  
  // Wait for server to start
  const serverStarted = await waitForServer();
  if (!serverStarted) {
    console.error('Failed to start server. Exiting tests.');
    process.exit(1);
  }
  
  // Test admin login
  const adminToken = await testAdminLogin();
  
  // Test user registration
  const registrationResult = await testUserRegistration();
  
  // Test user login
  if (registrationResult) {
    const loginResult = await testUserLogin('9876543210');
    
    // Test OTP verification
    if (loginResult) {
      const userToken = await testOTPVerification('9876543210', serverOutput);
      
      // Test loan application (will fail without file uploads, but tests the route)
      if (userToken) {
        await testLoanApplication(userToken);
      }
      
      // Test getting admin loans
      if (adminToken) {
        await testGetAdminLoans(adminToken);
      }
    }
  }
  
  console.log('\n=== API Tests Completed ===');
  
  // Kill the server
  console.log('Shutting down server...');
  server.kill();
  process.exit(0);
}

// Run the tests after a short delay to allow server to start
setTimeout(() => {
  runTests().catch(error => {
    console.error('Test error:', error);
    server.kill();
    process.exit(1);
  });
}, 5000);