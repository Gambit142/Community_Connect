const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../../models/User.js');
const { sendEmail } = require('../../utils/emailService.js');

const generateResetToken = () => crypto.randomBytes(32).toString('hex');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
    }

    const token = generateResetToken();
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset?token=${token}`;

    sendEmail({
      to: email,
      subject: 'Password Reset Request - CommunityConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #fecaca; border-radius: 12px; background: #fef2f2;">
          <h2 style="color: #dc2626; text-align: center;">Password Reset Request</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Click below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background:#dc2626; color:white; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:bold;">
              Reset Password
            </a>
          </div>
          <p>Or use: <a href="${resetUrl}">${resetUrl}</a></p>
          <p><strong>Expires in 1 hour</strong></p>
          <hr style="border: 1px dashed #fca5a5;">
          <small style="color:#6b7280;">Didn't request this? Ignore this email.</small>
        </div>
      `,
    });

    res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
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
    user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    sendEmail({
      to: user.email,
      subject: 'Your Password Has Been Changed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #bbf7d0; border-radius: 12px; background: #f0fdf4;">
          <h2 style="color: #10b981; text-align: center;">Password Updated Successfully</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Your password was changed successfully.</p>
          <p>If this wasn't you, secure your account immediately.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { forgotPassword, resetPassword };