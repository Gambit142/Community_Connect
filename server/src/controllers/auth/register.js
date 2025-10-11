const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const User = require('../../models/User.js');
const PendingUser = require('../../models/PendingUser.js');
const crypto = require('crypto');

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
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(20).toString('hex');

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

    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log('Mailtrap SMTP connection successful');
    } catch (err) {
      console.error('Mailtrap SMTP connection failed:', err.message);
      return res.status(500).json({ message: 'Failed to connect to email service' });
    }

    const mailOptions = {
      from: 'no-reply@demomailtrap.com',
      to: email,
      subject: 'Confirm Your Registration',
      text: `Please confirm your registration by clicking the link: http://localhost:5000/api/auth/verify/${verificationToken}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: 'Registration successful. Please check your email to confirm.' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const verify = async (req, res) => {
  const { token } = req.params;

  try {
    const pendingUser = await PendingUser.findOne({ verificationToken: token });
    if (!pendingUser) return res.status(400).json({ message: 'Invalid or expired verification token' });

    const { username, email, passwordHash, userType, bio, location, interests, profilePic, organizationDetails } = pendingUser;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      username,
      email,
      passwordHash,
      userType,
      bio,
      location,
      interests,
      profilePic,
      organizationDetails,
      verificationToken: token,
      isVerified: true,
    });

    await user.save();
    await PendingUser.deleteOne({ verificationToken: token });

    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log('Mailtrap SMTP connection successful for verification');
    } catch (err) {
      console.error('Mailtrap SMTP connection failed for verification:', err.message);
      return res.status(500).json({ message: 'Failed to connect to email service' });
    }

    const mailOptions = {
      from: 'no-reply@demomailtrap.com',
      to: email,
      subject: 'Registration Confirmed',
      text: 'Your registration has been confirmed. You can now log in at: http://localhost:5173/auth/login',
    };

    await transporter.sendMail(mailOptions);
    res.redirect('http://localhost:5173/auth/login');
  } catch (err) {
    console.error('Verification error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, verify };
