const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, templateId, dynamicData) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM,
      templateId,
      dynamic_template_data: dynamicData
    });
  } catch (error) {
    console.error('Email send error:', error);
  }
};

// Email Templates
const TEMPLATES = {
  WELCOME: 'd-1234567890',
  PRINT_TIMELINE: 'd-2345678901',
  ROYALTY_PAYOUT: 'd-3456789012',
  SALES_REPORT: 'd-4567890123',
  NEWSLETTER: 'd-5678901234'
};

// Send welcome email
exports.sendWelcomeEmail = (authorEmail, authorName) => {
  return sendEmail(authorEmail, TEMPLATES.WELCOME, {
    name: authorName,
    dashboard_url: `${process.env.CLIENT_URL}/dashboard`
  });
};

// Send printing timeline update
exports.sendPrintTimelineEmail = (authorEmail, bookDetails, timeline) => {
  return sendEmail(authorEmail, TEMPLATES.PRINT_TIMELINE, {
    book_title: bookDetails.title,
    timeline_stages: timeline,
    marketplaces: bookDetails.marketplaces
  });
};

// Send royalty payout notification
exports.sendRoyaltyEmail = (authorEmail, amount, period) => {
  return sendEmail(authorEmail, TEMPLATES.ROYALTY_PAYOUT, {
    amount,
    period,
    statement_url: `${process.env.CLIENT_URL}/royalties`
  });
};

// Send sales report
exports.sendSalesReport = (authorEmail, reportData) => {
  return sendEmail(authorEmail, TEMPLATES.SALES_REPORT, {
    ...reportData,
    report_period: reportData.period
  });
};

// Send newsletter to subscribers
exports.sendNewsletter = (subscribers, newsletterData) => {
  return sendEmail(subscribers, TEMPLATES.NEWSLETTER, {
    ...newsletterData,
    unsubscribe_url: `${process.env.CLIENT_URL}/unsubscribe`
  });
}; 