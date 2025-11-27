const nodemailer = require('nodemailer');

// Global cached transporter (reused across the app)
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const useTls = process.env.EMAIL_USE_TLS?.toString().toLowerCase() === 'true';

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: !useTls,
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
      pool: true,                 // ← ENABLE POOLING
      maxConnections: 5,          // ← Limit concurrent connections
      maxMessages: 100,           // ← Per connection
      rateLimit: 1000,            // ← Max 1 email per 1 second (adjust as needed)
      // Optional: retry on failure
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
};

/**
 * Send email (fire-and-forget with error logging)
 * @param {Object} options - Nodemailer mail options
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: options.from || `"CommunityConnect" <${process.env.EMAIL_HOST_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    };

    await getTransporter().sendMail(mailOptions);
    console.log(`Email sent successfully to: ${options.to}`);
  } catch (error) {
    console.error('Failed to send email:', {
      to: options.to,
      subject: options.subject,
      error: error.message,
    });
  }
};

module.exports = { sendEmail };