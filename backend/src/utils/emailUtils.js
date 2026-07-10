const nodemailer = require('nodemailer');
const config = require('../config/env');

const createTransporter = () => {
  // If SMTP configs are not fully configured, return a mock transporter
  if (!config.email.user || !config.email.pass) {
    console.warn('⚠️  Nodemailer: Email credentials missing. Falling back to console-logging emails.');
    return {
      sendMail: async (mailOptions) => {
        console.log('\n📧 --- OUTBOUND EMAIL SIMULATOR ---');
        console.log(`To      : ${mailOptions.to}`);
        console.log(`From    : ${mailOptions.from}`);
        console.log(`Subject : ${mailOptions.subject}`);
        console.log(`Body    :\n${mailOptions.text}`);
        console.log('───────────────────────────────────\n');
        return { messageId: 'mock-id-' + Date.now() };
      },
    };
  }

  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for others
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

const transporter = createTransporter();

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${config.client.url}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'AttendAssist — Reset Your Password',
    text: `Hello,

We received a request to reset your password for your AttendAssist account.

Please click the link below to set a new password. This link is valid for 15 minutes:
${resetLink}

If you did not request a password reset, you can safely ignore this email.

Thanks,
The AttendAssist Team`,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail,
};
