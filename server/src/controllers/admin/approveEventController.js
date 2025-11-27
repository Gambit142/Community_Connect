const Event = require('../../models/Event.js');
const Notification = require('../../models/Notification.js');
const User = require('../../models/User.js');
const { sendEmail } = require('../../utils/emailService.js');

const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update event
    const event = await Event.findOneAndUpdate(
      { _id: id, status: 'Pending Approval' },
      { status: 'Published' },
      { new: true }
    ).populate('userID', 'username email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found or already processed' });
    }

    // Create notification
    const notification = new Notification({
      userID: event.userID._id,
      message: `Your event "${event.title}" has been approved and published!`,
      type: 'event_status',
      relatedID: event._id,
      relatedType: 'event',
    });
    await notification.save();

    // Emit socket notification
    global.io.to(`user-${event.userID._id}`).emit('newNotification', notification);

    // Use centralized sendEmail (fire-and-forget)
    sendEmail({
      to: event.userID.email,
      subject: 'Event Approved - Community Connect',
      html: `
        <h1>Your Event Has Been Approved!</h1>
        <p>Dear ${event.userID.username},</p>
        <p>Your event "<strong>${event.title}</strong>" in the <strong>${event.category}</strong> category has been reviewed and published.</p>
        <p>It is scheduled for ${event.date.toLocaleDateString()} at ${event.time} in ${event.location}.</p>
        <p>Thank you for contributing to the community!</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event._id}" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Event</a>
        <p>Best regards,<br>Community Connect Team</p>
      `,
    });

    res.status(200).json({
      message: 'Event approved successfully',
      event,
      notification,
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ message: 'Server error during event approval' });
  }
};

module.exports = { approveEvent };