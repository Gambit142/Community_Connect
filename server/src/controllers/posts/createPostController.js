const Joi = require('joi');
const Post = require('../../models/Post.js');
const Notification = require('../../models/Notification.js');
const User = require('../../models/User.js');
const { cloudinary } = require('../../config/cloudinary.js');
const { initSocket } = require('../../config/socket.js');
const { sendEmail } = require('../../utils/emailService.js');

const io = initSocket();

const postSchema = Joi.object({
  title: Joi.string().required().trim().max(200),
  description: Joi.string().required().trim().max(2000),
  category: Joi.string().required().valid('food', 'tutoring', 'ridesharing', 'housing', 'jobs', 'health', 'education', 'goods', 'events', 'transportation', 'financial'),
  tags: Joi.string().optional().allow('').max(500),
  type: Joi.string().required().valid('donation', 'service', 'request'),
  price: Joi.number().min(0).optional(),
  location: Joi.string().trim().max(200).optional(),
  details: Joi.string().optional().allow('').max(2000),
});

const createPost = async (req, res) => {
  try {
    const { error } = postSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const {
      title, description, category, tags: tagsStr = '', type,
      price = 0, location, details: detailsStr = '{}'
    } = req.body;

    const tags = tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    let details = {};
    try { details = detailsStr ? JSON.parse(detailsStr) : {}; }
    catch { return res.status(400).json({ message: 'Invalid JSON in details' }); }

    const userID = req.user._id;

    let images = [];
    if (req.files?.length > 0) {
      if (req.files.length > 5) return res.status(400).json({ message: 'Max 5 images' });
      const uploads = req.files.map(file => 
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'community_posts' },
            (err, result) => err ? reject(err) : resolve(result.secure_url)
          ).end(file.buffer);
        })
      );
      images = await Promise.all(uploads).catch(() => 
        res.status(400).json({ message: 'Image upload failed' })
      );
    }

    const newPost = new Post({
      title, description, category, tags, userID,
      status: 'Pending Approval', type, price, location, details, images
    });

    const savedPost = await newPost.save();

    const { __v, ...postResponse } = savedPost.toObject();
    res.status(201).json({
      message: 'Post created successfully and pending approval',
      post: postResponse,
    });

    // Background admin notifications
    (async () => {
      try {
        const admins = await User.find({ role: 'admin' }).select('email username _id');
        if (admins.length === 0) return;

        sendEmail({
          to: admins.map(a => a.email).join(','),
          subject: 'New Post Awaiting Review - CommunityConnect',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:12px;">
              <h2>New Post Submitted</h2>
              <p><strong>${title}</strong> (${category} • ${type})</p>
              <p>By: ${req.user.username} (${req.user.email})</p>
              <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/posts">Review in Admin Panel</a></p>
            </div>
          `,
        });

        await Notification.insertMany(admins.map(admin => ({
          userID: admin._id,
          message: `New post "${title}" in ${category} awaiting review`,
          type: 'new_post_review',
          relatedID: savedPost._id,
          relatedType: 'post',
          isRead: false,
        })));

        io.to('role-admin').emit('new-post-pending', {
          postID: savedPost._id,
          title, category, type,
          user: { username: req.user.username, email: req.user.email },
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Admin notification failed:', err);
      }
    })();
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPost };