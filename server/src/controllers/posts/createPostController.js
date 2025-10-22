const Joi = require('joi');
const Post = require('../../models/Post.js');
const Notification = require('../../models/Notification.js');
const nodemailer = require('nodemailer');
const User = require('../../models/User.js');
const { cloudinary } = require('../../config/cloudinary.js'); // Cloudinary for images
const { initSocket } = require('../../config/socket.js');

// Get configured io
const io = initSocket();

// Joi validation schema for create post (allow string for tags/details)
const postSchema = Joi.object({
  title: Joi.string().required().trim().max(200).messages({ 'string.empty': 'Title is required', 'string.max': 'Title too long (max 200 chars)' }),
  description: Joi.string().required().trim().max(2000).messages({ 'string.empty': 'Description is required', 'string.max': 'Description too long (max 2000 chars)' }),
  category: Joi.string().required().valid('food', 'tutoring', 'ridesharing', 'housing', 'jobs', 'health', 'education', 'goods', 'events', 'transportation', 'financial').messages({ 'any.only': 'Invalid category—choose from available options' }),
  tags: Joi.string().optional().allow('').max(500).messages({ 'string.max': 'Tags too long (max 500 chars)' }), // String (comma-separated)
  type: Joi.string().required().valid('donation', 'service', 'request').messages({ 'any.only': 'Invalid post type—choose donation, service, or request' }),
  price: Joi.number().min(0).optional().messages({ 'number.min': 'Price cannot be negative' }),
  location: Joi.string().trim().max(200).optional().messages({ 'string.max': 'Location too long (max 200 chars)' }),
  details: Joi.string().optional().allow('').max(2000).messages({ 'string.max': 'Details too long (max 2000 chars)' }), // JSON string
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

    const { title, description, category, tags: tagsStr = '', type, price = 0, location, details: detailsStr = '{}' } = req.body;

    // Parse tags (string to array)
    const tags = tagsStr.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);

    // Parse details (string to object)
    let details = {};
    try {
      details = detailsStr ? JSON.parse(detailsStr) : {};
    } catch (parseErr) {
      return res.status(400).json({ message: 'Invalid JSON in details—use valid format like {"quantity": 5}' });
    }

    // Ensure authenticated user (from middleware)
    const userID = req.user._id;

    // Handle image uploads to Cloudinary (if files present)
    let images = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 images allowed' });
      }
      const uploadPromises = req.files.map(async (file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'community_posts', resource_type: 'image' },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(new Error(`Image upload failed: ${error.message}`));
              } else {
                resolve(result.secure_url);
              }
            }
          ).end(file.buffer); // Use memory buffer from multer
        });
      });

      images = await Promise.all(uploadPromises).catch(err => {
        console.error('Image upload failed:', err);
        return res.status(400).json({ message: `Image upload failed: ${err.message}` });
      });
    }

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

    // Notify admins: Email + In-App Notification + Socket.io
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

      // Real-time Socket.io push to admin room
      io.to('role-admin').emit('new-post-pending', {
        postID: savedPost._id,
        title,
        category,
        type,
        user: { username: req.user.username, email: req.user.email },
        timestamp: new Date().toISOString(),
      });
      console.log('Socket.io notification emitted to admins');
    }

    // Response: Exclude sensitive fields
    const { __v, ...postResponse } = savedPost.toObject();
    res.status(201).json({
      message: 'Post created successfully and pending approval',
      post: postResponse,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: `Server error during post creation: ${error.message}` });
  }
};

module.exports = { createPost };