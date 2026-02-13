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

    const mailOptions = {
      from: '"Result Portal System" <no-reply@resultportal.com>',
      to: email,
      subject: `⚠️ Attendance Alert: Marked as ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #d9534f;">Attendance Alert</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>This is to inform you that your attendance for <strong>${new Date(date).toDateString()}</strong> has been automatically marked as:</p>
          <h3 style="background-color: #fcefdc; padding: 10px; display: inline-block; border-radius: 5px; color: #d9534f;">
            ${status}
          </h3>
          <p>If this is an error or you were on approved leave, please contact the administrator immediately.</p>
          <hr>
          <p style="font-size: 12px; color: #888;">Result Portal Automated System</p>
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
