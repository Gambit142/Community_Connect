const Joi = require('joi');
const Event = require('../../models/Event.js');
const Notification = require('../../models/Notification.js');
const User = require('../../models/User.js');
const { cloudinary } = require('../../config/cloudinary.js');
const { sendEmail } = require('../../utils/emailService.js'); 

// Joi validation schema
const createEventSchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({ 'string.max': 'Title too long (max 200 chars)' }),
  description: Joi.string().trim().max(2000).required().messages({ 'string.max': 'Description too long (max 2000 chars)' }),
  date: Joi.date().iso().min('now').required().messages({ 'date.min': 'Date must be in the future', 'date.format': 'Invalid date format' }),
  time: Joi.string().required().messages({ 'string.empty': 'Time is required' }),
  location: Joi.string().trim().max(200).required().messages({ 'string.max': 'Location too long (max 200 chars)' }),
  category: Joi.string().valid('Workshop', 'Volunteer', 'Market', 'Tech', 'Charity', 'Fair', 'Social', 'Other').required().messages({ 'any.only': 'Invalid category' }),
  price: Joi.number().min(0).messages({ 'number.min': 'Price cannot be negative' }),
});

const createEvent = async (req, res) => {
  try {
    // Validate input
    const { error } = createEventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, date, time, location, category, price } = req.body;

    // Handle image uploads to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    // Create new event
    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      time: time.trim(),
      location: location.trim(),
      category,
      userID: req.user._id,
      price: parseFloat(price) || 0,
      images: imageUrls,
      status: 'Pending Approval',
    });

    await newEvent.save();

    // Use centralized sendEmail (fire-and-forget, wrapped in try-catch for legacy)
    try {
      sendEmail({
        to: req.user.email,
        subject: 'Event Created - Community Connect',
        html: `
          <h1>Your Event Has Been Created!</h1>
          <p>Dear ${req.user.username},</p>
          <p>Your event "<strong>${newEvent.title}</strong>" has been created successfully and is pending admin approval.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/my-events" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View My Events</a>
          <p>Best regards,<br>Community Connect Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send user confirmation email:', emailError.message);
    }

    // Notify admins of new event pending approval
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      if (admins.length > 0) {
        const adminNotifications = admins.map(admin => new Notification({
          userID: admin._id,
          message: `New event "${newEvent.title}" in ${newEvent.category} category awaiting your review.`,
          type: 'new_event_review',
          relatedID: newEvent._id,
          relatedType: 'event',
          isRead: false,
        }));

        await Notification.insertMany(adminNotifications);

        global.io.to('role-admin').emit('new-event-pending', {
          eventID: newEvent._id,
          title: newEvent.title,
          category: newEvent.category,
          user: { username: req.user.username, email: req.user.email },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (notificationError) {
      console.error('Failed to create admin notifications:', notificationError.message);
    }

    res.status(201).json({
      message: 'Event created successfully and pending approval',
      event: newEvent,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error during event creation' });
  }
};

module.exports = { createEvent };