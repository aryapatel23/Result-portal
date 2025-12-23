// Email Configuration
// For Gmail: Enable 2-Step Verification and create App Password
// https://myaccount.google.com/apppasswords

module.exports = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your app password (not regular password)
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'School Management System',
    address: process.env.EMAIL_USER,
  },
};
