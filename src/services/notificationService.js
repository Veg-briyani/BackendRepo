const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (to, message) => {
  try {
    await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+${to}`
    });
  } catch (error) {
    console.error('SMS send failed:', error);
  }
}; 