const axios = require('axios');

// Base URL for API requests
const API_URL = 'http://localhost:3000/api';

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
async function testOTPVerification(mobile, otp = '123456') {
  try {
    console.log('\n--- Testing OTP Verification ---');
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

// Run all tests
async function runTests() {
  console.log('=== Starting API Tests ===');
  
  // Start the server separately with: npm run dev
  console.log('Make sure the server is running with: npm run dev');
  
  // Test admin login
  const adminToken = await testAdminLogin();
  
  // Test user registration
  const registrationResult = await testUserRegistration();
  
  // Test user login
  if (registrationResult) {
    const loginResult = await testUserLogin('9876543210');
    
    // Test OTP verification
    if (loginResult) {
      const userToken = await testOTPVerification('9876543210');
      
      // Test getting admin loans
      if (adminToken) {
        await testGetAdminLoans(adminToken);
      }
    }
  }
  
  console.log('\n=== API Tests Completed ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Test error:', error);
});