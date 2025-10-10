const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const User = require('../../models/User.js');
const crypto = require('crypto');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
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
      from: process.env.EMAIL_USER, 
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
  const { token, username, email, passwordHash, userType, bio, location, interests, profilePic, organizationDetails } = req.query;

  try {
    const decodedUsername = decodeURIComponent(username);
    const decodedEmail = decodeURIComponent(email);
    const decodedPasswordHash = decodeURIComponent(passwordHash);
    const decodedUserType = decodeURIComponent(userType);
    const decodedBio = decodeURIComponent(bio) || undefined;
    const decodedLocation = decodeURIComponent(location) || undefined;
    const decodedInterests = JSON.parse(decodeURIComponent(interests)) || undefined;
    const decodedProfilePic = decodeURIComponent(profilePic) || undefined;
    const decodedOrganizationDetails = JSON.parse(decodeURIComponent(organizationDetails)) || undefined;

    let user = await User.findOne({ email: decodedEmail });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      username: decodedUsername,
      email: decodedEmail,
      passwordHash: decodedPasswordHash,
      userType: decodedUserType,
      bio: decodedBio,
      location: decodedLocation,
      interests: decodedInterests,
      profilePic: decodedProfilePic,
      organizationDetails: decodedOrganizationDetails,
      verificationToken: token,
      isVerified: true,
    });

    await user.save();

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
      from: process.env.EMAIL_USER,
      to: decodedEmail,
      subject: 'Registration Confirmed',
      text: 'Your registration has been confirmed. You can now log in.',
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Registration confirmed' });
  } catch (err) {
    console.error('Verification error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, verify };