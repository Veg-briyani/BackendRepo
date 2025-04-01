const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

exports.sendSMS = async (to, message) => {
  try {
    // Ensure phone number has correct format
    const formattedPhone = to.startsWith('+') ? to : `+${to}`;
    
    await twilio.messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: formattedPhone
    });
    
    return { success: true };
  } catch (error) {
    console.error('SMS send failed:', error);
    return { success: false, error: error.message };
  }
};

// Generate a 6-digit OTP code
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS
exports.sendOTP = async (phone, otp) => {
  const message = `Your verification code for Maximus is: ${otp}. This code will expire in 5 minutes.`;
  return await exports.sendSMS(phone, message);
};