const Post = require('../../models/Post.js');
const Notification = require('../../models/Notification.js');
const User = require('../../models/User.js');
const { sendEmail } = require('../../utils/emailService.js');

const io = global.io;

const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Rejection reason must be at least 10 characters' });
    }

    // Find and update post + populate user
    const post = await Post.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: 'Rejected', 
          rejectionReason: reason.trim() 
        } 
      },
      { new: true }
    ).populate({ path: 'userID', select: 'username email' });

    if (!post) {
      return res.status(404).json({ message: 'Post not found or already processed' });
    }

    // CRITICAL: Handle case where user was deleted
    if (!post.userID) {
      console.warn(`Post ${post._id} has no user (was deleted). Skipping notifications.`);
      
      return res.status(200).json({
        message: 'Post rejected (user no longer exists)',
        post,
        note: 'No notifications sent — user account was deleted'
      });
    }

    const user = post.userID;

    // Background email (safe)
    sendEmail({
      to: user.email,
      subject: 'Your Post Has Been Rejected - CommunityConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #fca5a5; border-radius: 12px; background: #fef2f2;">
          <h2 style="color: #dc2626; text-align: center;">Post Rejected</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>We're sorry, but your post has been rejected.</p>
          <div style="background:#fee2e2; padding:15px; border-left:4px solid #dc2626; margin:20px 0; border-radius:8px;">
            <p><strong>Title:</strong> ${post.title}</p>
            <p><strong>Category:</strong> ${post.category}</p>
            <p><strong>Reason:</strong><br>${reason.trim()}</p>
          </div>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/posts/my-posts">View My Posts</a></p>
          <hr style="border:1px dashed #fca5a5;">
          <small>CommunityConnect Team</small>
        </div>
      `,
    });

    // Create notification (only if user exists)
    const notification = new Notification({
      userID: user._id,
      message: `Your post "${post.title}" was rejected: ${reason.trim()}`,
      type: 'post_status',
      relatedID: post._id,
      relatedType: 'post',
      isRead: false,
    });
    await notification.save();

    // Real-time notification
    io.to(`user-${user._id}`).emit('newNotification', notification);

    // Instant response
    res.status(200).json({
      message: 'Post rejected successfully',
      post,
      notification,
    });

  } catch (error) {
    console.error('Reject post error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = { rejectPost };