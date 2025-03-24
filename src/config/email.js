const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Email templates
const getWelcomeEmailTemplate = (username) => ({
  subject: 'Welcome to Author Dashboard!',
  html: `
    <h1>Welcome to Author Dashboard!</h1>
    <p>Hello ${username},</p>
    <p>Thank you for registering with us. We're excited to have you on board!</p>
    <p>You can now start managing your books and tracking your progress.</p>
    <p>Best regards,<br>Author Dashboard Team</p>
  `
});

const getLoginNotificationTemplate = (username) => ({
  subject: 'New Login Detected',
  html: `
    <h1>New Login Alert</h1>
    <p>Hello ${username},</p>
    <p>We detected a new login to your Author Dashboard account.</p>
    <p>If this wasn't you, please contact support immediately.</p>
    <p>Best regards,<br>Author Dashboard Team</p>
  `
});

const getPasswordResetTemplate = (username, resetLink) => ({
  subject: 'Password Reset Request',
  html: `
    <h1>Password Reset Request</h1>
    <p>Hello ${username},</p>
    <p>You recently requested to reset your password.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,<br>Author Dashboard Team</p>
  `
});

const getKYCStatusTemplate = (user, status, rejectionReason) => ({
  subject: `KYC Verification ${status}`,
  html: `
    <h1>KYC Verification Update</h1>
    <p>Hello ${user.name},</p>
    <p>Your KYC verification has been <strong>${status}</strong>.</p>
    ${status === 'rejected' ? `
    <p>Reason: ${rejectionReason}</p>
    <p>Please update your details and resubmit for verification.</p>
    ` : ''}
    <p>Best regards,<br>Author Dashboard Team</p>
  `
});

module.exports = {
  sendEmail,
  getWelcomeEmailTemplate,
  getLoginNotificationTemplate,
  getPasswordResetTemplate,
  getKYCStatusTemplate
};