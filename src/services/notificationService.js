const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID || 'AC24585ea056747d4d795dbe4db617dcc3',
  process.env.TWILIO_AUTH_TOKEN || '86f931253b7906ad487499ea53088eb6'
);

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || '+18577998044';

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