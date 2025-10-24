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

const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // New: Rejection reason

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Rejection reason must be at least 10 characters' });
    }

    // Find and update post
    const post = await Post.findOneAndUpdate(
      { _id: id, status: 'Pending Approval' },
      { status: 'Rejected', rejectionReason: reason.trim() },
      { new: true }
    ).populate('userID', 'username email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found or already processed' });
    }

    // Create notification
    const notification = new Notification({
      userID: post.userID._id,
      message: `Your post "${post.title}" has been rejected: ${reason}`,
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
      subject: 'Post Rejected - Community Connect',
      html: `
        <h1>Your Post Has Been Rejected</h1>
        <p>Dear ${post.userID.username},</p>
        <p>Your post "<strong>${post.title}</strong>" in the <strong>${post.category}</strong> category did not meet our guidelines.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review our community standards and resubmit if appropriate.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/posts/my-posts" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Posts</a>
        <p>Best regards,<br>Community Connect Team</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${post.userID.email}`);

    res.status(200).json({
      message: 'Post rejected successfully',
      post,
      notification,
    });
  } catch (error) {
    console.error('Reject post error:', error);
    res.status(500).json({ message: 'Server error during rejection' });
  }
};

module.exports = { rejectPost };