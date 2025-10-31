const Event = require('../../models/Event.js');
const nodemailer = require('nodemailer');

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and check ownership
    const event = await Event.findOne({ _id: id, userID: req.user._id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found or you do not own this event' });
    }

    // Delete event
    await Event.findByIdAndDelete(id);

    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: 'Event Deleted - Community Connect',
      html: `
        <h1>Your Event Has Been Deleted</h1>
        <p>Dear ${req.user.username},</p>
        <p>Your event "<strong>${event.title}</strong>" has been deleted successfully.</p>
        <p>If this was a mistake, you can create a new event anytime.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/create" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Create New Event</a>
        <p>Best regards,<br>Community Connect Team</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Delete confirmation email sent to ${req.user.email}`);

    res.status(200).json({
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error during event deletion' });
  }
};

module.exports = { deleteEvent };