const nodemailer = require('nodemailer');

/**
 * EMAIL TRANSPORT STRATEGY
 * ========================
 *
 * Problem: Render (and most cloud free-tiers) BLOCK all outbound TCP on SMTP
 *          ports (25, 465, 587). Both Gmail SMTP and Brevo SMTP fail with
 *          ETIMEDOUT because the TCP connection itself never completes.
 *
 * Solution: Use Brevo's HTTP REST API (port 443 / HTTPS) which is NEVER
 *           blocked — it's the same port as any normal web request.
 *
 * Priority:
 *   1. Brevo HTTP API  — BREVO_API_KEY is set → used on Render (production)
 *   2. Gmail SMTP      — EMAIL_USER is set    → used locally (development)
 *   3. Skip + log      — neither is set       → no crash, just a warning
 */

// ---------------------------------------------------------------------------
// Helper: which transport should we use?
// ---------------------------------------------------------------------------
const useBrevoAPI  = () => !!process.env.BREVO_API_KEY;
const useGmailSMTP = () => !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

const SENDER_EMAIL = () =>
  process.env.BREVO_SMTP_USER || process.env.EMAIL_USER || 'no-reply@resultportal.com';

const FROM_ADDRESS = () =>
  `"Kamli School - Result Portal" <${SENDER_EMAIL()}>`;

// Print active transport on every server start (visible in Render logs)
const _activeTransport = useBrevoAPI()
  ? `Brevo HTTP API (port 443) — sender: ${SENDER_EMAIL()}`
  : useGmailSMTP()
    ? `Gmail SMTP — sender: ${process.env.EMAIL_USER} [local dev only]`
    : 'NONE — set BREVO_API_KEY (Render) or EMAIL_USER + EMAIL_PASSWORD (local)';
console.log(`[Email] Active transport: ${_activeTransport}`);

// ---------------------------------------------------------------------------
// Guard: skip gracefully if no credentials are configured
// ---------------------------------------------------------------------------
const shouldSkipEmail = (label, details) => {
  if (!useBrevoAPI() && !useGmailSMTP()) {
    console.warn(`[Email] No credentials configured — skipping "${label}" email.`);
    console.warn('[Email] Add BREVO_API_KEY to Render or EMAIL_USER/EMAIL_PASSWORD to .env');
    console.warn('[Email] Details:', JSON.stringify(details));
    return true;
  }
  return false;
};

// ---------------------------------------------------------------------------
// Brevo HTTP API sender — uses HTTPS port 443, never blocked by Render
// ---------------------------------------------------------------------------
const _sendViaBrevoAPI = async ({ to, subject, html }) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: 'Kamli School - Result Portal',
        email: SENDER_EMAIL(),
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API ${response.status}: ${errText}`);
  }

  return response.json();
};

// ---------------------------------------------------------------------------
// Gmail SMTP sender — local development only
// ---------------------------------------------------------------------------
const _sendViaGmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return transporter.sendMail({ from: FROM_ADDRESS(), to, subject, html });
};

// ---------------------------------------------------------------------------
// Central send — automatically picks Brevo (prod) or Gmail (local)
// ---------------------------------------------------------------------------
const _sendEmail = async ({ to, subject, html }) => {
  if (useBrevoAPI()) {
    const result = await _sendViaBrevoAPI({ to, subject, html });
    return result;
  }
  return _sendViaGmail({ to, subject, html });
};

// ============================================================================
// 1. Attendance Auto-Mark Alert
// ============================================================================
const sendAttendanceAlert = async ({ email, name, date, status }) => {
  try {
    if (shouldSkipEmail('attendance alert', { email, name, date, status })) return;

    const statusColor = status === 'Leave' ? '#4f46e5' : '#ef4444';
    const statusBg   = status === 'Leave' ? '#eef2ff' : '#fef2f2';
    const statusWord = status === 'Leave' ? 'Leave' : 'Absent';
    const message    = status === 'Leave'
      ? 'Your attendance was not marked by 8:00 PM today, so the system automatically recorded this as a Leave day.'
      : 'Your attendance was not recorded by the end of the day.';

    await _sendEmail({
      to: email,
      subject: `Attendance Auto-Marked: ${statusWord} — ${new Date(date).toDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <h2 style="color: #1f2937; margin: 0;">⚠️ Attendance Alert</h2>
          </div>
          <div style="padding: 20px 0;">
            <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Your attendance for <strong>${new Date(date).toDateString()}</strong> has been automatically marked by the system.
            </p>
            <div style="background-color: ${statusBg}; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Status</p>
              <h3 style="color: ${statusColor}; font-size: 24px; margin: 0; font-weight: 700;">${statusWord}</h3>
            </div>
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid ${statusColor};">
              <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.6;"><strong>Note:</strong> ${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              ${status === 'Leave'
                ? 'If you have any concerns, please contact your administrator or ensure you mark attendance before 8:00 PM daily.'
                : 'If this is an error, please contact the administrator immediately.'}
            </p>
          </div>
          <div style="border-top: 2px solid #f3f4f6; padding-top: 16px; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">Result Portal Automated System</p>
            <p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0 0;">Please do not reply to this automated email</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Attendance alert sent to ${email}`);
  } catch (error) {
    console.error('[Email] Failed to send attendance alert:', error.message);
    // Do not throw — cron jobs must not crash
  }
};

// ============================================================================
// 2. Welcome Email — Teacher or Administrator
// ============================================================================
const sendTeacherWelcomeEmail = async ({ email, name, password, employeeId, role = 'teacher' }) => {
  const isAdmin  = role === 'admin';
  const roleLabel = isAdmin ? 'Administrator' : 'Teacher';
  const loginPath = isAdmin ? '/admin/dashboard' : '/teacher/dashboard';

  if (shouldSkipEmail(`${roleLabel} welcome`, { email, name, employeeId, role })) {
    console.log(`[Email] Temp password (no email sent): ${password}`);
    return;
  }

  try {
    const subject = isAdmin
      ? '🎉 Welcome to Result Portal - Your Administrator Account'
      : '🎉 Welcome to Result Portal - Your Teacher Account';

    const accountText = isAdmin
      ? 'Your administrator account has been successfully created! You can now access the Result Portal system.'
      : 'Your teacher account has been successfully created! You can now access the Result Portal system.';

    await _sendEmail({
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <h2 style="color: #1f2937; margin: 0;">🎓 Welcome to Result Portal</h2>
          </div>

          <div style="padding: 20px 0;">
            <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">${accountText}</p>

            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e3a8a; margin: 0 0 16px 0; font-size: 18px;">Your Login Credentials</h3>

              <div style="margin-bottom: 12px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">Employee ID:</p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace; background-color: #ffffff; padding: 8px; border-radius: 4px;">${employeeId}</p>
              </div>

              <div style="margin-bottom: 12px;">
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">Email:</p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace; background-color: #ffffff; padding: 8px; border-radius: 4px;">${email}</p>
              </div>

              <div>
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 4px 0;">Password:</p>
                <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace; background-color: #ffffff; padding: 8px; border-radius: 4px;">${password}</p>
              </div>
            </div>

            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}${loginPath}"
                 style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Login to Portal
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you have any questions or need assistance, please contact the school administrator.
            </p>
          </div>

          <div style="border-top: 2px solid #f3f4f6; padding-top: 16px; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">Result Portal Automated System</p>
            <p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0 0;">Please do not reply to this automated email</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Welcome email sent to ${email} [role: ${role}]`);
  } catch (error) {
    console.error(`[Email] Failed to send ${roleLabel} welcome email:`, error.message);
    throw error; // Re-throw so caller can show password fallback
  }
};

// ============================================================================
// 3. Account Update Notification
// ============================================================================
const sendEmailUpdateNotification = async ({ email, name, password, employeeId }) => {
  if (shouldSkipEmail('account update', { email, name, employeeId })) return;

  const passwordSection = password ? `
    <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
      <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">🔐 New Password</h3>
      <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace; background-color: #ffffff; padding: 8px; border-radius: 4px;">${password}</p>
      <p style="color: #92400e; font-size: 12px; margin: 8px 0 0 0;">Please change this password after logging in.</p>
    </div>
  ` : '';

  try {
    await _sendEmail({
      to: email,
      subject: '🔔 Account Updated - Result Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <h2 style="color: #1f2937; margin: 0;">🔔 Account Update Notification</h2>
          </div>
          <div style="padding: 20px 0;">
            <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Your account has been updated by the administrator.</p>
            ${passwordSection}
            <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="color: #1e3a8a; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>Your Current Email:</strong> ${email}<br>
                <strong>Employee ID:</strong> ${employeeId}
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you did not request this change or have any concerns, please contact the administrator immediately.
            </p>
          </div>
          <div style="border-top: 2px solid #f3f4f6; padding-top: 16px; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">Result Portal Automated System</p>
            <p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0 0;">Please do not reply to this automated email</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Update notification sent to ${email}`);
  } catch (error) {
    console.error('[Email] Failed to send update notification:', error.message);
    throw error;
  }
};

// ============================================================================
// 4. Password Reset Email
// ============================================================================
const sendPasswordResetEmail = async ({ email, name, password }) => {
  if (shouldSkipEmail('password reset', { email, name })) {
    console.log(`[Email] Reset password (no email sent): ${password}`);
    return;
  }

  try {
    await _sendEmail({
      to: email,
      subject: '🔑 Password Reset - Result Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <h2 style="color: #1f2937; margin: 0;">🔑 Password Reset</h2>
          </div>
          <div style="padding: 20px 0;">
            <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password. Your new password has been generated below.
            </p>
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your New Password</p>
              <p style="color: #1e3a8a; font-size: 28px; font-weight: 700; margin: 0; font-family: monospace; background-color: #ffffff; padding: 12px 20px; border-radius: 8px; display: inline-block; letter-spacing: 4px;">${password}</p>
            </div>
            <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>⚠️ Important:</strong> Click the button below to set a new permanent password.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/?resetPassword=${encodeURIComponent(email)}"
                 style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Complete Password Reset
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If you did not request this password reset, please contact the administrator immediately.
            </p>
          </div>
          <div style="border-top: 2px solid #f3f4f6; padding-top: 16px; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">Result Portal Automated System</p>
            <p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0 0;">Please do not reply to this automated email</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Password reset email sent to ${email}`);
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error.message);
    throw error;
  }
};

module.exports = {
  sendAttendanceAlert,
  sendTeacherWelcomeEmail,
  sendEmailUpdateNotification,
  sendPasswordResetEmail,
};
