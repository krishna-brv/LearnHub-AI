const nodemailer = require('nodemailer');

/**
 * Create Nodemailer SMTP transporter
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT || '2525', 10),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Verify SMTP transport connection
 */
const verifyEmailConnection = async () => {
  try {
    if (process.env.NODE_ENV === 'test' || process.env.EMAIL_USER === 'dev_user') return;
    await transporter.verify();
    console.log('✅ Email transport ready');
  } catch (error) {
    console.log('ℹ️ Email transport using fallback mode');
  }
};

module.exports = {
  transporter,
  verifyEmailConnection
};
