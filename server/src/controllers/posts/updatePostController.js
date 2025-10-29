const Joi = require('joi');
const Post = require('../../models/Post.js');
const Notification = require('../../models/Notification.js');
const nodemailer = require('nodemailer');
const User = require('../../models/User.js');
const { cloudinary } = require('../../config/cloudinary.js');

// Joi validation schema for update post (similar to create, but partial)
const updatePostSchema = Joi.object({
  title: Joi.string().trim().max(200).messages({ 'string.max': 'Title too long (max 200 chars)' }),
  description: Joi.string().trim().max(2000).messages({ 'string.max': 'Description too long (max 2000 chars)' }),
  category: Joi.string().valid('food', 'tutoring', 'ridesharing', 'housing', 'jobs', 'health', 'education', 'goods', 'events', 'transportation', 'financial').messages({ 'any.only': 'Invalid category—choose from available options' }),
  tags: Joi.string().optional().allow('').max(500).messages({ 'string.max': 'Tags too long (max 500 chars)' }),
  type: Joi.string().valid('donation', 'service', 'request').messages({ 'any.only': 'Invalid post type—choose donation, service, or request' }),
  price: Joi.number().min(0).messages({ 'number.min': 'Price cannot be negative' }),
  location: Joi.string().trim().max(200).messages({ 'string.max': 'Location too long (max 200 chars)' }),
  details: Joi.string().optional().allow('').max(2000).messages({ 'string.max': 'Details too long (max 2000 chars)' }),
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = updatePostSchema.validate(req.body, { allowUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, category, tags: tagsStr, type, price, location, details: detailsStr } = req.body;

    // Find existing post and check ownership
    const existingPost = await Post.findOne({ _id: id, userID: req.user._id });
    if (!existingPost) {
      return res.status(404).json({ message: 'Post not found or you do not own this post' });
    }

    // Parse updates
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category !== undefined) updates.category = category;
    if (tagsStr !== undefined) {
      updates.tags = tagsStr.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
    }
    if (type !== undefined) updates.type = type;
    if (price !== undefined) updates.price = parseFloat(price) || 0;
    if (location !== undefined) updates.location = location.trim();
    if (detailsStr !== undefined) {
      try {
        updates.details = detailsStr ? JSON.parse(detailsStr) : {};
      } catch (parseErr) {
        return res.status(400).json({ message: 'Invalid JSON in details—use valid format like {"quantity": 5}' });
      }
    }

    // Handle image updates
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
                reject(new Error(`Image upload failed: ${error.message}`));
              } else {
                resolve(result.secure_url);
              }
            }
          ).end(file.buffer);
        });
      });
      updates.images = await Promise.all(uploadPromises);
    }

    let updatedPost;
    let isResubmission = false;

    if (existingPost.status === 'Rejected') {
      // Recreate as new post for resubmission
      isResubmission = true;
      const newPost = new Post({
        ...updates,
        userID: req.user._id,
        status: 'Pending Approval',
        rejectionReason: '', // Clear rejection reason
        originalPostId: existingPost._id, // Reference original for trail
      });
      updatedPost = await newPost.save();

      // Mark original as Archived
      await Post.findByIdAndUpdate(existingPost._id, { status: 'Archived' });

      // User notification
      const userNotification = new Notification({
        userID: req.user._id,
        message: `Your edited post "${updatedPost.title}" has been resubmitted for review.`,
        type: 'post_status',
        relatedID: updatedPost._id,
        relatedType: 'post',
        isRead: false,
      });
      await userNotification.save();

      // Emit to user
      global.io.to(`user-${req.user._id}`).emit('newNotification', userNotification);
    } else {
      // Direct update
      updatedPost = await Post.findOneAndUpdate(
        { _id: id, userID: req.user._id },
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedPost) {
        return res.status(404).json({ message: 'Post update failed' });
      }

      // If originally Published, set to Pending
      if (existingPost.status === 'Published') {
        updatedPost.status = 'Pending Approval';
        await Post.findByIdAndUpdate(id, { status: 'Pending Approval' });
      }
    }

    // Send confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: 'Post Updated - Community Connect',
      html: `
        <h1>Your Post Has Been Updated!</h1>
        <p>Dear ${req.user.username},</p>
        <p>Your post "<strong>${updatedPost.title}</strong>" has been updated successfully.</p>
        ${updatedPost.status === 'Pending Approval' ? '<p>Note: It has been sent for admin review.</p>' : ''}
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/posts/my-posts" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Posts</a>
        <p>Best regards,<br>Community Connect Team</p>
      `,
    };
    await transporter.sendMail(userMailOptions);
    console.log(`Update confirmation email sent to ${req.user.email}`);

    // Notify admins if pending (in-app only, no email)
    if (updatedPost.status === 'Pending Approval') {
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (admins.length > 0) {
        // In-app notifications for admins
        const adminNotifications = admins.map(admin => new Notification({
          userID: admin._id,
          message: `${isResubmission ? 'Resubmitted' : 'Updated'} post "${updatedPost.title}" in ${updatedPost.category} category awaiting your review.`,
          type: 'new_post_review',
          relatedID: updatedPost._id,
          relatedType: 'post',
          isRead: false,
        }));

        await Notification.insertMany(adminNotifications);
        console.log(`Created ${adminNotifications.length} in-app notifications for admins`);

        // Socket to admins (real-time)
        global.io.to('role-admin').emit('new-post-pending', {
          postID: updatedPost._id,
          title: updatedPost.title,
          category: updatedPost.category,
          type: updatedPost.type,
          user: { username: req.user.username, email: req.user.email },
          timestamp: new Date().toISOString(),
          isResubmission,
        });
        console.log('Socket.io notification emitted to admins');
      }
    }

    res.status(200).json({
      message: isResubmission ? 'Post resubmitted successfully and pending approval' : 'Post updated successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error during post update' });
  }
};

module.exports = { updatePost };