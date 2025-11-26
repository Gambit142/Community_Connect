const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../models/User.js');

// Reusable transporter (cached globally)
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
    });
  }
  return transporter;
};

// Generate secure reset token
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // Security: don't reveal if email exists
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
    }

    const token = generateResetToken();
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset?token=${token}`;

    // Fire-and-forget email (instant response!)
    getTransporter().sendMail({
      from: `"CommunityConnect" <${process.env.EMAIL_HOST_USER}>`,
      to: email,
      subject: 'Password Reset Request - CommunityConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background:#f9fafb;">
          <h2 style="color: #dc2626; text-align:center;">Password Reset Request</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>You requested to reset your password. Click the button below to set a new one:</p>
          <div style="text-align:center; margin:30px 0;">
            <a href="${resetUrl}" style="background:#dc2626; color:white; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link:<br/>
            <a href="${resetUrl}" style="color:#3b82f6; word-break:break-all;">${resetUrl}</a>
          </p>
          <p><strong>This link expires in 1 hour.</strong></p>
          <hr style="border:1px dashed #ddd; margin:30px 0"/>
          <small style="color:#6b7280;">If you didn't request this, please ignore this email. Your password will remain unchanged.</small>
        </div>
      `,
    }).catch(err => {
      console.error('Failed to send password reset email:', err.message);
    });

    // Instant success
    return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Valid token and password (min 6 chars) required' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    user.passwordHash = passwordHash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    // Send confirmation email (fire-and-forget)
    getTransporter().sendMail({
      from: `"CommunityConnect" <${process.env.EMAIL_HOST_USER}>`,
      to: user.email,
      subject: 'Your Password Has Been Changed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color:#10b981; text-align:center;">Password Updated Successfully</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Your password was changed successfully.</p>
          <p>If you made this change, you're all set!</p>
          <p>If you didn't request this, please secure your account immediately.</p>
          <hr/>
          <small>Need help? Contact support.</small>
        </div>
      `,
    }).catch(err => console.error('Password changed email failed:', err));

    return res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { forgotPassword, resetPassword };