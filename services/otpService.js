/**
 * OTP generation and verification service
 */
const axios = require('axios');
// const config = require('../config/config');

// Generate 6-digit OTP
exports.generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS
exports.sendOtp = async (mobile, otp) => {
  try {
    console.log(`Sending OTP ${otp} to ${mobile}`);
    
    // In production, use SMS API
    // if (process.env.NODE_ENV === 'production' && config.SMS_API_KEY) {
    //   // Example with MSG91 API
    //   const response = await axios.post(
    //     'https://api.msg91.com/api/v5/otp',
    //     {
    //       template_id: 'YOUR_TEMPLATE_ID',
    //       mobile: mobile,
    //       authkey: config.SMS_API_KEY,
    //       otp: otp,
    //     },
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     }
    //   );
      
    //   return response.data;
    // }
    
    // For development or testing, just log the OTP
    console.log(`[DEVELOPMENT MODE] OTP for ${mobile}: ${otp}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

// Verify OTP (moved to middleware)
exports.verifyOtp = async (mobile, userOtp, storedOtp, expiresAt) => {
  // Check if OTP is valid and not expired
  if (!storedOtp || storedOtp !== userOtp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  if (expiresAt < Date.now()) {
    return { valid: false, message: 'OTP has expired' };
  }
  
  return { valid: true, message: 'OTP verified successfully' };
};

// Format mobile number for international standards (example)
exports.formatMobileNumber = (mobile) => {
  // Remove any non-digit characters
  const digitsOnly = mobile.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  
  // If already has country code
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }
  
  // Return as is if already formatted or for other countries
  return mobile.startsWith('+') ? mobile : `+${mobile}`;
};
