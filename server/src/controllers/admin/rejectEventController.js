const Event = require('../../models/Event.js');
const Notification = require('../../models/Notification.js');
const nodemailer = require('nodemailer');

// Use global io to avoid circular dependency
const io = global.io;

// Nodemailer transporter (same config as post controllers)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body; // Rejection reason is required

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Rejection reason must be at least 10 characters' });
    }

    // Find and update event
    const event = await Event.findOneAndUpdate(
      { _id: id, status: 'Pending Approval' },
      { status: 'Rejected', rejectionReason: reason.trim() },
      { new: true }
    ).populate('userID', 'username email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found or already processed' });
    }

    // Create notification
    const notification = new Notification({
      userID: event.userID._id,
      message: `Your event "${event.title}" has been rejected: ${reason}`,
      type: 'event_status', // Use 'event_status'
      relatedID: event._id,
      relatedType: 'event', // Set relatedType to 'event'
    });
    await notification.save();

    // Emit socket notification if user online
    io.to(`user-${event.userID._id}`).emit('newNotification', notification);

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: event.userID.email,
      subject: 'Event Rejected - Community Connect',
      html: `
        <h1>Your Event Has Been Rejected</h1>
        <p>Dear ${event.userID.username},</p>
        <p>Your event "<strong>${event.title}</strong>" in the <strong>${event.category}</strong> category did not meet our guidelines.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review our community standards and resubmit if appropriate.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/my-events" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Events</a>
        <p>Best regards,<br>Community Connect Team</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Event rejection email sent to ${event.userID.email}`);

    res.status(200).json({
      message: 'Event rejected successfully',
      event,
      notification,
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({ message: 'Server error during event rejection' });
  }
};

module.exports = { rejectEvent };