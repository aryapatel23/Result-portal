const nodemailer = require('nodemailer');

/**
 * SMTP Transporter Strategy:
 *
 *  On Render (cloud) → Gmail SMTP times out because Google blocks raw TCP
 *  connections from cloud-provider IP ranges (spam prevention).
 *
 *  Fix: Use Brevo (smtp-relay.brevo.com) which is a transactional email
 *  relay designed for cloud deployments and is NOT blocked by Render.
 *
 *  Priority:
 *    1. Brevo SMTP  — used when BREVO_SMTP_USER + BREVO_SMTP_PASS are set
 *                     (required for Render / any cloud deployment)
 *    2. Gmail SMTP  — fallback for local development only
 */
const createTransporter = () => {
  if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS) {
    // ✅ Cloud-safe: Brevo relay (works from Render, AWS, GCP, etc.)
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.BREVO_SMTP_USER, // Your Brevo account login email
        pass: process.env.BREVO_SMTP_PASS, // Brevo SMTP key (from Brevo dashboard)
      },
    });
  }

  // ⚠️  Local dev only — Gmail blocks this from cloud server IPs
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Determine the sender address:
//   On Render (Brevo)  → use BREVO_SMTP_USER (your Gmail address registered in Brevo)
//   Locally (Gmail)    → use EMAIL_USER
const SENDER_EMAIL = () =>
  process.env.BREVO_SMTP_USER || process.env.EMAIL_USER || 'no-reply@resultportal.com';

const FROM_ADDRESS = () =>
  `"Kamli School - Result Portal" <${SENDER_EMAIL()}>`;

/**
 * Guard: skip sending if neither BREVO nor Gmail credentials are configured.
 * Accepts EITHER BREVO_SMTP_USER (cloud) OR EMAIL_USER (local) as valid.
 */
const shouldSkipEmail = (label, details) => {
  const hasBrevo = !!(process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS);
  const hasGmail = !!process.env.EMAIL_USER;
  if (!hasBrevo && !hasGmail) {
    console.log(`[Email] No email credentials configured — skipping ${label} email.`);
    console.log('[Email] Set BREVO_SMTP_USER + BREVO_SMTP_PASS (Render) or EMAIL_USER + EMAIL_PASSWORD (local).');
    console.log('[Email] Would have sent to:', JSON.stringify(details, null, 2));
    return true;
  }
  return false;
};

// Log which transport is active on startup
const activeTransport = (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS)
  ? `Brevo SMTP (smtp-relay.brevo.com:587) as ${process.env.BREVO_SMTP_USER}`
  : process.env.EMAIL_USER
    ? `Gmail SMTP as ${process.env.EMAIL_USER} [local dev only]`
    : 'NONE — no email credentials set';
console.log(`[Email] Transport: ${activeTransport}`);

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
// Send welcome email to new staff (teacher or admin) with credentials
const sendTeacherWelcomeEmail = async ({ email, name, password, employeeId, role = 'teacher' }) => {
  const isSystemAdmin = role === 'admin';
  const roleLabel = isSystemAdmin ? 'Administrator' : 'Teacher';
  const loginPath = isSystemAdmin ? '/admin/dashboard' : '/teacher/dashboard';

  if (shouldSkipEmail(`${roleLabel} welcome`, { email, name, employeeId, role })) {
    console.log(`[Email] Temporary password (log only): ${password}`);
    return;
  }

  try {
    const transporter = createTransporter();
    
    // Choose appropriate subject & message based on role
    const subject = isSystemAdmin 
      ? '🎉 Welcome to Result Portal - Your Administrator Account'
      : '🎉 Welcome to Result Portal - Your Teacher Account';
      
    const accountCreatedText = isSystemAdmin
      ? 'Your administrator account has been successfully created! You can now access the Result Portal system.'
      : 'Your teacher account has been successfully created! You can now access the Result Portal system.';

    await transporter.sendMail({
      from: FROM_ADDRESS(),
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <h2 style="color: #1f2937; margin: 0;">🎓 Welcome to Result Portal</h2>
          </div>
          
          <div style="padding: 20px 0;">
            <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              ${accountCreatedText}
            </p>
            
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
      `
    });
    console.log(`[Email] Welcome email sent to ${email} [role: ${role}]`);
  } catch (error) {
    console.error(`[Email] Failed to send ${roleLabel} welcome email:`, error.message);
    throw error;
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
