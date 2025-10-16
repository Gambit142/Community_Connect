const Joi = require('joi');
const Post = require('../../models/Post.js');
const Notification = require('../../models/Notification.js');
const nodemailer = require('nodemailer');
const User = require('../../models/User.js');

// Joi validation schema for create post
const postSchema = Joi.object({
  title: Joi.string().required().trim().max(200).messages({ 'string.empty': 'Title is required', 'string.max': 'Title too long' }),
  description: Joi.string().required().trim().max(2000).messages({ 'string.empty': 'Description is required', 'string.max': 'Description too long' }),
  category: Joi.string().required().valid('food', 'tutoring', 'ridesharing', 'housing', 'jobs', 'health', 'education', 'goods', 'events', 'transportation', 'financial').messages({ 'any.only': 'Invalid category' }),
  tags: Joi.array().items(Joi.string().trim().lowercase().max(50)).optional(),
  type: Joi.string().required().valid('donation', 'service', 'request').messages({ 'any.only': 'Invalid post type' }),
  price: Joi.number().min(0).optional(),
  location: Joi.string().trim().max(200).optional(),
  details: Joi.object().optional(),
  images: Joi.array().items(Joi.string()).optional(),
});

// Nodemailer transporter for admin notifications (reuse from auth)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createPost = async (req, res) => {
  try {
    const { error } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, category, tags = [], type, price = 0, location, details = {}, images = [] } = req.body;

    // Ensure authenticated user (from middleware)
    const userID = req.user._id;

    // Create post with pending status
    const newPost = new Post({
      title,
      description,
      category,
      tags,
      userID,
      status: 'Pending Approval',
      type,
      price,
      location,
      details,
      images,
    });

    const savedPost = await newPost.save();

    // Notify admins: Email + In-App Notification
    const admins = await User.find({ role: 'admin' }).select('email username _id');
    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email).join(',');
      
      // Email notification (existing logic)
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmails,
        subject: 'New Post Awaiting Review',
        html: `
          <h1>New Resource Post Pending Approval</h1>
          <p>A new post has been submitted for review:</p>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Type:</strong> ${type}</li>
            <li><strong>User:</strong> ${req.user.username} (${req.user.email})</li>
          </ul>
          <p>Log in to the admin dashboard to review: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin">Admin Dashboard</a></p>
        `,
      };
      await transporter.sendMail(mailOptions);
      console.log('Admin email notification sent for new post');

      // In-app notifications (one per admin)
      const notifications = admins.map(admin => new Notification({
        userID: admin._id,
        message: `New post "${title}" in ${category} category awaiting your review.`,
        type: 'new_post_review',
        relatedID: savedPost._id,
        relatedType: 'post',
        isRead: false,
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} in-app notifications for admins`);
    }

    // Response: Exclude sensitive fields
    const { __v, ...postResponse } = savedPost.toObject();
    res.status(201).json({
      message: 'Post created successfully and pending approval',
      post: postResponse,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error during post creation' });
  }
};

module.exports = { createPost };