const Post = require('../../models/Post.js');
const Notification = require('../../models/Notification.js');
const { io } = require('../../index.js'); // Import io (handles circular via caching)
const nodemailer = require('nodemailer');
const User = require('../../models/User.js');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const approvePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update post
    const post = await Post.findOneAndUpdate(
      { _id: id, status: 'Pending Approval' },
      { status: 'Published' },
      { new: true }
    ).populate('userID', 'username email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found or already processed' });
    }

    // Create notification
    const notification = new Notification({
      userID: post.userID._id,
      message: `Your post "${post.title}" has been approved and published!`,
      type: 'post_status',
      relatedID: post._id,
      relatedType: 'post',
    });
    await notification.save();

    // Emit socket notification if user online
    io.to(`user-${post.userID._id}`).emit('newNotification', notification);

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: post.userID.email,
      subject: 'Post Approved - Community Connect',
      html: `
        <h1>Your Post Has Been Approved!</h1>
        <p>Dear ${post.userID.username},</p>
        <p>Your post "<strong>${post.title}</strong>" in the <strong>${post.category}</strong> category has been reviewed and published.</p>
        <p>Thank you for contributing to the community!</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/posts/${post._id}" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Post</a>
        <p>Best regards,<br>Community Connect Team</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${post.userID.email}`);

    res.status(200).json({
      message: 'Post approved successfully',
      post,
      notification,
    });
  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({ message: 'Server error during approval' });
  }
};

module.exports = { approvePost };