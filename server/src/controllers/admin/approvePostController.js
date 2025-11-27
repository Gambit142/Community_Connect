const Post = require('../../models/Post.js');
const Notification = require('../../models/Notification.js');
const User = require('../../models/User.js');
const { sendEmail } = require('../../utils/emailService.js');

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

    // Use centralized sendEmail (fire-and-forget)
    sendEmail({
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
    });


    // Create notification for user
    const notification = new Notification({
      userID: post.userID._id,
      message: `Your post "${post.title}" has been approved and published!`,
      type: 'post_status',
      relatedID: post._id,
      relatedType: 'post',
    });
    await notification.save();

    // Emit socket notification if user online
    global.io.to(`user-${post.userID._id}`).emit('newNotification', notification);

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