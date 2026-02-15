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
        pass: process.env.EMAIL_PASS  // App Password
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

module.exports = { sendAttendanceAlert };
