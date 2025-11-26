const bcrypt = require('bcryptjs');
const Joi = require('joi');
const User = require('../../models/User.js');
const PendingUser = require('../../models/PendingUser.js');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/emailService.js');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match password',
  }),
  userType: Joi.string().valid('individual', 'company', 'organization').required(),
  bio: Joi.string().optional(),
  location: Joi.string().optional(),
  interests: Joi.array().items(Joi.string()).optional(),
  profilePic: Joi.string().optional(),
  organizationDetails: Joi.object().optional(),
});

const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password, userType, bio, location, interests, profilePic, organizationDetails } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const pendingUser = new PendingUser({
      username,
      email,
      passwordHash: hashedPassword,
      userType,
      bio,
      location,
      interests,
      profilePic,
      organizationDetails,
      verificationToken,
    });

    await pendingUser.save();

    const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify/${verificationToken}`;

    // Fire-and-forget verification email
    sendEmail({
      to: email,
      subject: 'Verify Your Email - CommunityConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
          <h2 style="color: #1e40af; text-align: center;">Welcome to CommunityConnect!</h2>
          <p>Hi <strong>${username}</strong>,</p>
          <p>You're almost there! Please confirm your email to activate your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background:#3b82f6; color:white; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:16px;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste:<br><a href="${verificationUrl}" style="color:#3b82f6; word-break:break-all;">${verificationUrl}</a></p>
          <p><small>This link expires in 24 hours.</small></p>
          <hr style="border: 1px dashed #ddd; margin: 30px 0;">
          <small style="color:#6b7280;">If you didn't sign up, ignore this email.</small>
        </div>
      `,
    });

    return res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const verify = async (req, res) => {
  const { token } = req.params;

  try {
    const pendingUser = await PendingUser.findOne({ verificationToken: token });
    if (!pendingUser) {
      return res.status(400).send(`
        <h2>Invalid or Expired Link</h2>
        <p>This verification link is no longer valid.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">← Go Home</a>
      `);
    }

    const newUser = new User({
      username: pendingUser.username,
      email: pendingUser.email,
      passwordHash: pendingUser.passwordHash,
      userType: pendingUser.userType,
      bio: pendingUser.bio,
      location: pendingUser.location,
      interests: pendingUser.interests,
      profilePic: pendingUser.profilePic,
      organizationDetails: pendingUser.organizationDetails,
      isVerified: true,
    });

    await newUser.save();
    await PendingUser.deleteOne({ verificationToken: token });

    // Welcome email
    sendEmail({
      to: newUser.email,
      subject: 'Welcome to CommunityConnect!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #10b981; border-radius: 12px; background: #f0fdf4;">
          <h2 style="color: #10b981; text-align: center;">Welcome, ${newUser.username}!</h2>
          <p>Your email has been verified successfully.</p>
          <p>You're now part of the community!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/login" style="background:#10b981; color:white; padding:14px 32px; text-decoration:none; border-radius:8px; font-weight:bold;">
              Login Now
            </a>
          </div>
        </div>
      `,
    });

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/login?verified=true`);
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).send('<h2>Server Error</h2><p>Please try again later.</p>');
  }
};

module.exports = { register, verify, registerSchema };