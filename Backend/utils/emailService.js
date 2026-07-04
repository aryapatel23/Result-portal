const nodemailer = require('nodemailer');

/**
 * Create a reusable Nodemailer transporter using explicit SMTP settings.
 * Using host/port/TLS instead of the `service:'gmail'` shortcut ensures
 * compatibility with hosting environments like Render that may block the
 * implicit port 465 used by the service shortcut.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true', // false = STARTTLS on port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certs (safe for Gmail)
    },
  });
};

const FROM_ADDRESS = () =>
  `"Kamli School - Result Portal" <${process.env.EMAIL_USER || 'no-reply@resultportal.com'}>`;

/**
 * Guard: if EMAIL_USER is not set, log the details and skip the actual send.
 * Returns true if we should skip sending.
 */
const shouldSkipEmail = (label, details) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[Email] EMAIL_USER not configured — skipping ${label} email.`);
    console.log('[Email] Would have sent:', JSON.stringify(details, null, 2));
    return true;
  }
  return false;
};

// ---------------------------------------------------------------------------
// 1. Attendance Auto-Mark Alert
// ---------------------------------------------------------------------------
const sendAttendanceAlert = async ({ email, name, date, status }) => {
  try {
    if (shouldSkipEmail('attendance alert', { email, name, date, status })) return;

    const statusColor = status === 'Leave' ? '#4f46e5' : '#ef4444';
    const statusBg   = status === 'Leave' ? '#eef2ff' : '#fef2f2';
    const statusWord = status === 'Leave' ? 'Leave' : 'Absent';
    const message    = status === 'Leave'
      ? 'Your attendance was not marked by 8:00 PM today, so the system has automatically recorded this as a Leave day.'
      : 'Your attendance was not recorded by the end of the day.';

    const transporter = createTransporter();
    await transporter.sendMail({
      from:    FROM_ADDRESS(),
      to:      email,
      subject: `[Result Portal] Attendance Auto-Marked: ${statusWord} — ${new Date(date).toDateString()}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
          <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #f3f4f6;">
            <h2 style="color:#1f2937;margin:0;">Attendance Alert</h2>
          </div>
          <div style="padding:20px 0;">
            <p style="color:#374151;font-size:16px;">Hello <strong>${name}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
              Your attendance for <strong>${new Date(date).toDateString()}</strong> has been automatically marked by the system.
            </p>
            <div style="background:${statusBg};padding:16px;border-radius:8px;margin:20px 0;text-align:center;">
              <p style="color:#6b7280;font-size:12px;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">Status</p>
              <h3 style="color:${statusColor};font-size:24px;margin:0;font-weight:700;">${statusWord}</h3>
            </div>
            <div style="background:#f9fafb;padding:16px;border-radius:8px;border-left:4px solid ${statusColor};">
              <p style="color:#374151;font-size:14px;margin:0;line-height:1.6;"><strong>Note:</strong> ${message}</p>
            </div>
            <p style="color:#6b7280;font-size:14px;margin-top:20px;">
              ${status === 'Leave'
                ? 'If you have any concerns, please contact your administrator or ensure you mark attendance before 8:00 PM daily.'
                : 'If this is an error, please contact the administrator immediately.'}
            </p>
          </div>
          <div style="border-top:2px solid #f3f4f6;padding-top:16px;text-align:center;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Result Portal — Automated System</p>
            <p style="font-size:11px;color:#d1d5db;margin:4px 0 0 0;">Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Attendance alert sent to ${email}`);
  } catch (error) {
    console.error('[Email] Failed to send attendance alert:', error.message);
    // Do not throw — we don't want to crash the cron job
  }
};

// ---------------------------------------------------------------------------
// 2. Welcome Email — new staff account (teacher OR admin)
// ---------------------------------------------------------------------------
const sendTeacherWelcomeEmail = async ({ email, name, password, employeeId, role = 'teacher' }) => {
  const roleLabel = role === 'admin' ? 'Administrator' : 'Teacher';
  const loginPath = role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';

  if (shouldSkipEmail(`${roleLabel} welcome`, { email, name, employeeId, role })) {
    console.log(`[Email] Temporary password (log only): ${password}`);
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    FROM_ADDRESS(),
      to:      email,
      subject: `[Result Portal] Welcome — Your ${roleLabel} Account Credentials`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
          <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #f3f4f6;">
            <h2 style="color:#1f2937;margin:0;">Welcome to Kamli School Result Portal</h2>
            <p style="color:#6b7280;margin:8px 0 0 0;font-size:14px;">Your ${roleLabel} account has been created</p>
          </div>

          <div style="padding:24px 0;">
            <p style="color:#374151;font-size:16px;">Hello <strong>${name}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
              Your <strong>${roleLabel.toLowerCase()}</strong> account has been successfully created.
              You can now log in to the Result Portal using the credentials below.
            </p>

            <div style="background:#f0f9ff;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #3b82f6;">
              <h3 style="color:#1e3a8a;margin:0 0 16px 0;font-size:16px;">Your Login Credentials</h3>

              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">Employee ID:</td>
                  <td style="padding:6px 0;">
                    <span style="font-family:monospace;font-size:15px;font-weight:600;color:#1f2937;background:#fff;padding:4px 10px;border-radius:4px;border:1px solid #e5e7eb;">${employeeId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;font-size:13px;">Email:</td>
                  <td style="padding:6px 0;">
                    <span style="font-family:monospace;font-size:15px;font-weight:600;color:#1f2937;background:#fff;padding:4px 10px;border-radius:4px;border:1px solid #e5e7eb;">${email}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#6b7280;font-size:13px;">Temporary Password:</td>
                  <td style="padding:6px 0;">
                    <span style="font-family:monospace;font-size:18px;font-weight:700;color:#1e3a8a;background:#fff;padding:4px 10px;border-radius:4px;border:1px solid #93c5fd;letter-spacing:3px;">${password}</span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background:#fef3c7;padding:14px 16px;border-radius:8px;border-left:4px solid #f59e0b;margin:20px 0;">
              <p style="color:#92400e;font-size:14px;margin:0;line-height:1.6;">
                <strong>Important:</strong> You will be prompted to change this temporary password when you first log in. Please keep it confidential.
              </p>
            </div>

            <div style="text-align:center;margin:28px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}${loginPath}"
                 style="display:inline-block;background:#3b82f6;color:#ffffff;padding:12px 36px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
                Log In to Portal
              </a>
            </div>

            <p style="color:#6b7280;font-size:13px;margin-top:20px;">
              If you have any questions, please contact the school administrator.
            </p>
          </div>

          <div style="border-top:2px solid #f3f4f6;padding-top:16px;text-align:center;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Kamli Anupam Primary School — Result Portal</p>
            <p style="font-size:11px;color:#d1d5db;margin:4px 0 0 0;">Please do not reply to this automated email.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Email] Welcome email sent to ${email} [role: ${role}]`);
  } catch (error) {
    console.error(`[Email] Failed to send ${roleLabel} welcome email:`, error.message);
    throw error; // Re-throw so caller can detect failure and show password as fallback
  }
};

// ---------------------------------------------------------------------------
// 3. Account Update Notification
// ---------------------------------------------------------------------------
const sendEmailUpdateNotification = async ({ email, name, password, employeeId }) => {
  if (shouldSkipEmail('account update', { email, name, employeeId })) return;

  const passwordSection = password ? `
    <div style="background:#fef3c7;padding:16px;border-radius:8px;border-left:4px solid #f59e0b;margin:20px 0;">
      <h3 style="color:#92400e;margin:0 0 10px 0;font-size:15px;">New Password</h3>
      <span style="font-family:monospace;font-size:18px;font-weight:700;color:#92400e;background:#ffffff;padding:6px 12px;border-radius:4px;border:1px solid #f59e0b;letter-spacing:3px;">${password}</span>
      <p style="color:#92400e;font-size:12px;margin:8px 0 0 0;">Please change this password after your next login.</p>
    </div>
  ` : '';

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    FROM_ADDRESS(),
      to:      email,
      subject: '[Result Portal] Your Account Has Been Updated',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
          <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #f3f4f6;">
            <h2 style="color:#1f2937;margin:0;">Account Update Notification</h2>
          </div>
          <div style="padding:20px 0;">
            <p style="color:#374151;font-size:16px;">Hello <strong>${name}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">Your account has been updated by the administrator.</p>
            ${passwordSection}
            <div style="background:#f0f9ff;padding:14px 16px;border-radius:8px;margin:20px 0;border-left:4px solid #3b82f6;">
              <p style="color:#1e3a8a;font-size:14px;margin:0;line-height:1.6;">
                <strong>Email:</strong> ${email}<br>
                <strong>Employee ID:</strong> ${employeeId}
              </p>
            </div>
            <p style="color:#6b7280;font-size:14px;">If you did not request this change, please contact the administrator immediately.</p>
          </div>
          <div style="border-top:2px solid #f3f4f6;padding-top:16px;text-align:center;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Result Portal — Automated System</p>
            <p style="font-size:11px;color:#d1d5db;margin:4px 0 0 0;">Please do not reply to this email.</p>
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

// ---------------------------------------------------------------------------
// 4. Password Reset Email
// ---------------------------------------------------------------------------
const sendPasswordResetEmail = async ({ email, name, password }) => {
  if (shouldSkipEmail('password reset', { email, name })) {
    console.log(`[Email] New temporary password (log only): ${password}`);
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    FROM_ADDRESS(),
      to:      email,
      subject: '[Result Portal] Password Reset — Your New Temporary Password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
          <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #f3f4f6;">
            <h2 style="color:#1f2937;margin:0;">Password Reset</h2>
          </div>
          <div style="padding:20px 0;">
            <p style="color:#374151;font-size:16px;">Hello <strong>${name}</strong>,</p>
            <p style="color:#6b7280;font-size:14px;line-height:1.6;">
              A password reset was requested for your account. Your new temporary password is shown below.
            </p>
            <div style="background:#f0f9ff;padding:20px;border-radius:8px;margin:20px 0;text-align:center;border-left:4px solid #3b82f6;">
              <p style="color:#6b7280;font-size:12px;margin:0 0 10px 0;text-transform:uppercase;letter-spacing:1px;">Your New Temporary Password</p>
              <span style="font-family:monospace;font-size:28px;font-weight:700;color:#1e3a8a;background:#ffffff;padding:10px 20px;border-radius:8px;border:1px solid #93c5fd;letter-spacing:5px;display:inline-block;">${password}</span>
            </div>
            <div style="background:#fef3c7;padding:14px 16px;border-radius:8px;border-left:4px solid #f59e0b;margin:20px 0;">
              <p style="color:#92400e;font-size:14px;margin:0;line-height:1.6;">
                <strong>Important:</strong> Use this password to log in, then you will be prompted to set a new permanent password.
              </p>
            </div>
            <div style="text-align:center;margin:28px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/?resetPassword=${encodeURIComponent(email)}"
                 style="display:inline-block;background:#3b82f6;color:#ffffff;padding:12px 36px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
                Log In &amp; Reset Password
              </a>
            </div>
            <p style="color:#6b7280;font-size:13px;">If you did not request this reset, please contact the administrator immediately.</p>
          </div>
          <div style="border-top:2px solid #f3f4f6;padding-top:16px;text-align:center;">
            <p style="font-size:12px;color:#9ca3af;margin:0;">Result Portal — Automated System</p>
            <p style="font-size:11px;color:#d1d5db;margin:4px 0 0 0;">Please do not reply to this email.</p>
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
