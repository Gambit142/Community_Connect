const Joi = require('joi');
const Event = require('../../models/Event.js');
const Notification = require('../../models/Notification.js');
const nodemailer = require('nodemailer');
const User = require('../../models/User.js');
const { cloudinary } = require('../../config/cloudinary.js');

// Joi validation schema for update event (similar to create, but partial)
const updateEventSchema = Joi.object({
  title: Joi.string().trim().max(200).messages({ 'string.max': 'Title too long (max 200 chars)' }),
  description: Joi.string().trim().max(2000).messages({ 'string.max': 'Description too long (max 2000 chars)' }),
  date: Joi.date().iso().messages({ 'date.format': 'Invalid date format (use ISO string)' }),
  time: Joi.string().trim().max(10).messages({ 'string.max': 'Time too long (max 10 chars, e.g., "14:00")' }),
  location: Joi.string().trim().max(200).messages({ 'string.max': 'Location too long (max 200 chars)' }),
  category: Joi.string().valid('Workshop', 'Volunteer', 'Market', 'Tech', 'Charity', 'Fair', 'Social', 'Other').messages({ 'any.only': 'Invalid category—choose from available options' }),
  price: Joi.number().min(0).messages({ 'number.min': 'Price cannot be negative' }),
  status: Joi.string().valid('Pending Approval', 'Published', 'Rejected').optional().allow(null), // Optional for user updates
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

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = updateEventSchema.validate(req.body, { allowUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Find and check ownership
    const existingEvent = await Event.findOne({ _id: id, userID: req.user._id });
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found or you do not own this event' });
    }

    // Handle image updates (delete old if new uploaded)
    let imageUrls = existingEvent.images || [];
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (imageUrls.length > 0) {
        for (let url of imageUrls) {
          const publicId = url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }
      // Upload new images
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }).end(file.buffer);
        });
      });
      imageUrls = await Promise.all(uploadPromises);
    }

    // Check if resubmission (status changing to Pending Approval)
    const isResubmission = existingEvent.status !== 'Pending Approval' && req.body.status === 'Pending Approval';

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title: req.body.title || existingEvent.title,
        description: req.body.description || existingEvent.description,
        date: req.body.date ? new Date(req.body.date) : existingEvent.date,
        time: req.body.time || existingEvent.time,
        location: req.body.location || existingEvent.location,
        category: req.body.category || existingEvent.category,
        price: req.body.price !== undefined ? req.body.price : existingEvent.price,
        images: imageUrls,
        status: req.body.status || existingEvent.status, // Allow status update only if provided
        ...(isResubmission && { rejectionReason: '' }), // Clear rejection reason on resubmission
      },
      { new: true, runValidators: true }
    ).select('-userID'); // Hide userID

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event update failed' });
    }

    // Send confirmation email to user
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: isResubmission ? 'Event Resubmitted - Community Connect' : 'Event Updated - Community Connect',
      html: `
        <h1>Your Event Has Been ${isResubmission ? 'Resubmitted' : 'Updated'}</h1>
        <p>Dear ${req.user.username},</p>
        <p>Your event "<strong>${updatedEvent.title}</strong>" has been ${isResubmission ? 'resubmitted' : 'updated'} successfully.${isResubmission ? ' It is now pending approval.' : ''}</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Date:</strong> ${new Date(updatedEvent.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${updatedEvent.time}</li>
          <li><strong>Location:</strong> ${updatedEvent.location}</li>
          <li><strong>Category:</strong> ${updatedEvent.category}</li>
          ${updatedEvent.price > 0 ? `<li><strong>Price:</strong> $${updatedEvent.price}</li>` : ''}
        </ul>
        <p>View your event <a href="${frontendUrl}/events/${updatedEvent._id}" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">here</a></p>
        ${isResubmission ? `<p><a href="${frontendUrl}/events/my-events" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Events</a></p>` : ''}
        <p>Best regards,<br>Community Connect Team</p>
      `,
    };
    await transporter.sendMail(userMailOptions);
    console.log(`Update confirmation email sent to ${req.user.email}`);

    // Notify admins if pending (in-app only, no email)
    if (updatedEvent.status === 'Pending Approval') {
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (admins.length > 0) {
        // In-app notifications for admins
        const adminNotifications = admins.map(admin => new Notification({
          userID: admin._id,
          message: `${isResubmission ? 'Resubmitted' : 'Updated'} event "${updatedEvent.title}" in ${updatedEvent.category} category awaiting your review.`,
          type: 'new_event_review',
          relatedID: updatedEvent._id,
          relatedType: 'event',
          isRead: false,
        }));

        await Notification.insertMany(adminNotifications);
        console.log(`Created ${adminNotifications.length} in-app notifications for admins`);

        // Socket to admins (real-time)
        global.io.to('role-admin').emit('new-event-pending', {
          eventID: updatedEvent._id,
          title: updatedEvent.title,
          category: updatedEvent.category,
          user: { username: req.user.username, email: req.user.email },
          timestamp: new Date().toISOString(),
          isResubmission,
        });
        console.log('Socket.io notification emitted to admins');
      }
    }

    res.status(200).json({
      message: isResubmission ? 'Event resubmitted successfully and pending approval' : 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error during event update' });
  }
};

module.exports = { updateEvent };