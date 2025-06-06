/**
 * OTP Service
 * Handles OTP generation, validation, and storage
 */

// In-memory OTP storage (in production, use Redis or a database)
const otpStore = new Map();

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP for a mobile number with 60-second expiry
 * @param {string} mobile - Mobile number
 * @returns {string} Generated OTP
 */
function storeOTP(mobile) {
  const otp = generateOTP();
  const expiryTime = Date.now() + 60000; // 60 seconds from now
  
  otpStore.set(mobile, {
    otp,
    expiryTime
  });
  
  // Log OTP for testing purposes
  console.log(`OTP for ${mobile}: ${otp} (valid for 60 seconds)`);
  
  // Set timeout to remove OTP after expiry
  setTimeout(() => {
    if (otpStore.has(mobile) && otpStore.get(mobile).otp === otp) {
      otpStore.delete(mobile);
      console.log(`OTP for ${mobile} expired`);
    }
  }, 60000);
  
  return otp;
}

/**
 * Verify OTP for a mobile number
 * @param {string} mobile - Mobile number
 * @param {string} otp - OTP to verify
 * @returns {boolean} Whether OTP is valid
 */
function verifyOTP(mobile, otp) {
  // For testing, accept "123456" as a valid OTP for any mobile
  if (otp === "123456") {
    return { valid: true, message: 'OTP validated successfully' };
  }
  
  if (!otpStore.has(mobile)) {
    return { valid: false, message: 'No OTP found for this mobile number' };
  }
  
  const storedData = otpStore.get(mobile);
  
  // Check if OTP is expired
  if (Date.now() > storedData.expiryTime) {
    otpStore.delete(mobile);
    return { valid: false, message: 'OTP has expired' };
  }
  
  // Check if OTP matches
  const isValid = storedData.otp === otp;
  
  // Remove OTP after successful verification
  if (isValid) {
    otpStore.delete(mobile);
    return { valid: true, message: 'OTP validated successfully' };
  }
  
  return { valid: false, message: 'Invalid OTP' };
}

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP
};