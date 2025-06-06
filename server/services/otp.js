// Dummy OTP service (replace with Twilio or similar in production)
const otpStore = new Map(); // In-memory store for OTPs (use Redis in production)

const generateOTP = (mobile) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 60000; // 60 seconds expiry
  
  // Store OTP with expiry
  otpStore.set(mobile, { otp, expiry });
  
  console.log(`Generated OTP for ${mobile}: ${otp} (valid for 60 seconds)`);
  return { otp, expiry };
};

const validateOTP = (mobile, inputOTP) => {
  const storedData = otpStore.get(mobile);
  
  if (!storedData) {
    return { valid: false, message: 'No OTP found for this mobile number' };
  }
  
  const { otp, expiry } = storedData;
  
  if (Date.now() > expiry) {
    otpStore.delete(mobile); // Clean up expired OTP
    return { valid: false, message: 'OTP has expired' };
  }
  
  if (otp !== inputOTP) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid, clean up
  otpStore.delete(mobile);
  return { valid: true, message: 'OTP validated successfully' };
};

module.exports = { generateOTP, validateOTP };