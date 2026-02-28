const nodemailer = require('nodemailer');

const sendAttendanceAlert = async ({ email, name, date, status }) => {
  try {
    // Create a transporter
    // TODO: User needs to configure these in .env
    // For now, using a dummy Ethereal account or similar is not possible without network, 
    // so we'll structure it for Gmail/SMTP and log the output if auth fails.
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use host/port
      auth: {
        user: process.env.EMAIL_USER, // e.g., 'school.admin@gmail.com'
        pass: process.env.EMAIL_PASSWORD  // App Password
      }
    });

    // Customize message based on status
    const statusColor = status === 'Leave' ? '#4f46e5' : '#ef4444';
    const statusBg = status === 'Leave' ? '#eef2ff' : '#fef2f2';
    const icon = status === 'Leave' ? '🏖️' : '⚠️';
    const message = status === 'Leave' 
      ? 'Your attendance was not marked by 8:00 PM today, so the system has automatically recorded this as a Leave day.'
      : 'Your attendance was not recorded by the end of the day.';

    const mailOptions = {
      from: '"Result Portal System" <no-reply@resultportal.com>',
      to: email,
      subject: `${icon} Attendance Auto-Marked: ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <h2 style="color: #1f2937; margin: 0;">${icon} Attendance Alert</h2>
          </div>
          
          <div style="padding: 20px 0;">
            <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              This is to inform you that your attendance for <strong>${new Date(date).toDateString()}</strong> has been automatically marked by the system.
            </p>
            
            <div style="background-color: ${statusBg}; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Status</p>
              <h3 style="color: ${statusColor}; font-size: 24px; margin: 0; font-weight: 700;">
                ${status}
              </h3>
            </div>
            
            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid ${statusColor};">
              <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>Note:</strong> ${message}
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              ${status === 'Leave' ? 'If you have any concerns about this automatic leave marking, please contact your administrator or mark your attendance before 8:00 PM daily.' : 'If this is an error, please contact the administrator immediately.'}
            </p>
          </div>
          
          <div style="border-top: 2px solid #f3f4f6; padding-top: 16px; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">Result Portal Automated System</p>
            <p style="font-size: 11px; color: #d1d5db; margin: 4px 0 0 0;">Please do not reply to this automated email</p>
          </div>
        </div>
      `
    };

    if (!process.env.EMAIL_USER) {
      console.log('⚠️ EMAIL_USER not set. Skipping email send.');
      console.log('Would have sent to:', email);
      return;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent: %s', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Don't throw, just log. We don't want to crash the cron job.
  }
};

// Send welcome email to new teacher with credentials
const sendTeacherWelcomeEmail = async ({ email, name, password, employeeId }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: '"Result Portal System" <no-reply@resultportal.com>',
      to: email,
      subject: '🎉 Welcome to Result Portal - Your Teacher Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <h2 style="color: #1f2937; margin: 0;">🎓 Welcome to Result Portal</h2>
          </div>
          
          <div style="padding: 20px 0;">
            <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Your teacher account has been successfully created! You can now access the Result Portal system.
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
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/teacher/dashboard" 
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
    };

    if (!process.env.EMAIL_USER) {
      console.log('⚠️ EMAIL_USER not set. Email would be sent to:', email);
      console.log('📧 Teacher Login Details:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Employee ID: ${employeeId}`);
      return;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Welcome email sent to:', email);
    return info;

  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
    throw error; // Re-throw so caller knows it failed
  }
};

// Send email notification when teacher account is updated
const sendEmailUpdateNotification = async ({ email, name, password, employeeId }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const passwordSection = password ? `
      <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 16px;">🔐 New Password</h3>
        <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0; font-family: monospace; background-color: #ffffff; padding: 8px; border-radius: 4px;">${password}</p>
        <p style="color: #92400e; font-size: 12px; margin: 8px 0 0 0;">
          Please change this password after logging in.
        </p>
      </div>
    ` : '';

    const mailOptions = {
      from: '"Result Portal System" <no-reply@resultportal.com>',
      to: email,
      subject: '🔔 Account Updated - Result Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6;">
            <h2 style="color: #1f2937; margin: 0;">🔔 Account Update Notification</h2>
          </div>
          
          <div style="padding: 20px 0;">
            <p style="color: #374151; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Your teacher account has been updated by the administrator.
            </p>
            
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
      `
    };

    if (!process.env.EMAIL_USER) {
      console.log('⚠️ EMAIL_USER not set. Email would be sent to:', email);
      if (password) {
        console.log('📧 New Password:', password);
      }
      return;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Update notification sent to:', email);
    return info;

  } catch (error) {
    console.error('❌ Error sending update notification:', error.message);
    throw error;
  }
};

// Send password reset email with new credentials
const sendPasswordResetEmail = async ({ email, name, password }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: '"Result Portal System" <no-reply@resultportal.com>',
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
      `
    };

    if (!process.env.EMAIL_USER) {
      console.log('⚠️ EMAIL_USER not set. Email would be sent to:', email);
      console.log('📧 New Password:', password);
      return;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Password reset email sent to:', email);
    return info;

  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    throw error;
  }
};

module.exports = { 
  sendAttendanceAlert,
  sendTeacherWelcomeEmail,
  sendEmailUpdateNotification,
  sendPasswordResetEmail
};
