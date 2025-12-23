const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

// Create reusable transporter
let transporter = null;

const createTransporter = () => {
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.warn('⚠️ Email credentials not configured. Emails will not be sent.');
    return null;
  }

  return nodemailer.createTransport({
    service: emailConfig.service,
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.auth.user,
      pass: emailConfig.auth.pass,
    },
  });
};

// Initialize transporter
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Send Welcome Email to New Teacher
const sendTeacherWelcomeEmail = async (teacherData) => {
  const { email, name, password, employeeId } = teacherData;

  const transporter = getTransporter();
  
  if (!transporter) {
    console.log('📧 Email not sent - credentials not configured');
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
    to: email,
    subject: '🎓 Welcome to School Management System - Your Teacher Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
          }
          .credentials-box {
            background: white;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .credential-item {
            margin: 10px 0;
            padding: 10px;
            background: #f3f4f6;
            border-radius: 4px;
          }
          .credential-label {
            font-weight: bold;
            color: #667eea;
            font-size: 12px;
            text-transform: uppercase;
          }
          .credential-value {
            font-size: 16px;
            color: #1f2937;
            font-family: monospace;
            margin-top: 5px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="icon">🎓</div>
          <h1 style="margin: 0;">Welcome to Our School!</h1>
          <p style="margin: 10px 0 0 0;">Your Teacher Account is Ready</p>
        </div>
        
        <div class="content">
          <h2>Hello ${name}! 👋</h2>
          
          <p>We're excited to have you join our teaching team! Your teacher account has been successfully created in our School Management System.</p>
          
          <div class="credentials-box">
            <h3 style="margin-top: 0; color: #667eea;">📋 Your Login Credentials</h3>
            
            <div class="credential-item">
              <div class="credential-label">Employee ID</div>
              <div class="credential-value">${employeeId}</div>
            </div>
            
            <div class="credential-item">
              <div class="credential-label">Email Address</div>
              <div class="credential-value">${email}</div>
            </div>
            
            <div class="credential-item">
              <div class="credential-label">Temporary Password</div>
              <div class="credential-value">${password}</div>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Please change your password after first login</li>
              <li>Keep your credentials secure and don't share them</li>
              <li>This is a temporary password for initial access</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">
              🔐 Login to Your Account
            </a>
          </div>
          
          <h3>📚 What You Can Do:</h3>
          <ul>
            <li>Upload and manage student results</li>
            <li>View your teaching timetable</li>
            <li>Access student records</li>
            <li>Update your profile information</li>
          </ul>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact the administration.</p>
          
          <p>Best regards,<br>
          <strong>School Administration Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} School Management System. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to School Management System, ${name}!

Your teacher account has been successfully created.

LOGIN CREDENTIALS:
------------------
Employee ID: ${employeeId}
Email: ${email}
Password: ${password}

IMPORTANT: Please change your password after first login for security.

Login URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}/login

What You Can Do:
- Upload and manage student results
- View your teaching timetable
- Access student records
- Update your profile information

If you have any questions, please contact the administration.

Best regards,
School Administration Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send Email Update Notification
const sendEmailUpdateNotification = async (teacherData) => {
  const { email, name, password, employeeId } = teacherData;

  const transporter = getTransporter();
  
  if (!transporter) {
    console.log('📧 Email not sent - credentials not configured');
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
    to: email,
    subject: '🔔 Your Teacher Account Has Been Updated',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
          }
          .info-box {
            background: white;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .info-item {
            margin: 10px 0;
            padding: 10px;
            background: #f3f4f6;
            border-radius: 4px;
          }
          .info-label {
            font-weight: bold;
            color: #667eea;
            font-size: 12px;
            text-transform: uppercase;
          }
          .info-value {
            font-size: 16px;
            color: #1f2937;
            font-family: monospace;
            margin-top: 5px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="icon">🔔</div>
          <h1 style="margin: 0;">Account Updated</h1>
          <p style="margin: 10px 0 0 0;">Your Information Has Been Changed</p>
        </div>
        
        <div class="content">
          <h2>Hello ${name}! 👋</h2>
          
          <p>Your teacher account information has been updated by the administration. Here are your updated details:</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #667eea;">📋 Updated Account Information</h3>
            
            <div class="info-item">
              <div class="info-label">Employee ID</div>
              <div class="info-value">${employeeId}</div>
            </div>
            
            <div class="info-item">
              <div class="info-label">New Email Address</div>
              <div class="info-value">${email}</div>
            </div>
            
            ${password ? `
            <div class="info-item">
              <div class="info-label">New Password</div>
              <div class="info-value">${password}</div>
            </div>
            ` : ''}
          </div>
          
          ${password ? `
          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Your password has been changed</li>
              <li>Please login with your new password</li>
              <li>Consider changing it to something memorable after login</li>
              <li>Keep your credentials secure</li>
            </ul>
          </div>
          ` : `
          <div class="info-box" style="background: #f0f9ff; border-left-color: #3b82f6;">
            <strong>ℹ️ Note:</strong> Your email address has been updated. Please use this new email for all future logins.
          </div>
          `}
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/login" class="button">
              🔐 Login to Your Account
            </a>
          </div>
          
          <p>If you did not request this change or believe this is an error, please contact the administration immediately.</p>
          
          <p>Best regards,<br>
          <strong>School Administration Team</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} School Management System. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    text: `
Account Updated - ${name}

Your teacher account information has been updated by the administration.

UPDATED INFORMATION:
------------------
Employee ID: ${employeeId}
New Email: ${email}
${password ? `New Password: ${password}` : ''}

${password ? 'IMPORTANT: Your password has been changed. Please login with your new password.' : 'NOTE: Your email address has been updated. Please use this new email for all future logins.'}

Login URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}/login

If you did not request this change, please contact the administration immediately.

Best regards,
School Administration Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Update notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending update notification:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConnection = async () => {
  const transporter = getTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return { success: true };
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendTeacherWelcomeEmail,
  sendEmailUpdateNotification,
  testEmailConnection,
};
