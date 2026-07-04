/**
 * Email Configuration
 *
 * This file documents the email transport strategy.
 * Actual transport logic is handled in utils/emailService.js.
 *
 * Transport Priority:
 *   1. Brevo SMTP (cloud/Render)  → Set BREVO_SMTP_USER + BREVO_SMTP_PASS
 *   2. Gmail SMTP (local dev only) → Set EMAIL_USER + EMAIL_PASSWORD
 *
 * WHY TWO SERVICES?
 *   Gmail SMTP connections are blocked by Google from cloud provider IPs
 *   (Render, AWS, GCP, etc.) causing "Connection timeout" errors in production.
 *   Brevo is a transactional email relay designed for cloud deployments.
 *
 * BREVO SETUP:
 *   1. Sign up free at https://www.brevo.com (300 emails/day free)
 *   2. Go to Profile → SMTP & API → SMTP tab
 *   3. Copy your SMTP login and generate an SMTP key
 *   4. Add to Render environment variables:
 *      BREVO_SMTP_USER = your-brevo-login@email.com
 *      BREVO_SMTP_PASS = your-brevo-smtp-key
 *
 * GMAIL SETUP (local dev only):
 *   1. Enable 2-Step Verification on your Google Account
 *   2. Go to https://myaccount.google.com/apppasswords
 *   3. Generate an App Password for "Mail"
 *   4. Add to .env:
 *      EMAIL_USER = your-gmail@gmail.com
 *      EMAIL_PASSWORD = xxxx xxxx xxxx xxxx  (16-char app password)
 */

module.exports = {
  // Brevo (production / Render)
  brevo: {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },

  // Gmail (local development only)
  gmail: {
    service: 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },

  // Sender identity (used as FROM address)
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Kamli School - Result Portal',
    address: process.env.BREVO_SMTP_USER || process.env.EMAIL_USER,
  },
};
