const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('../../models/User.js');
const Event = require('../../models/Event.js');

// Query validation: strings for page/limit to handle URL params safely
const querySchema = Joi.object({
  // FIX 1: Default to 'Published' if status is missing or empty
  status: Joi.string().valid('Published').allow('').optional().default('Published'),
  page: Joi.string().allow('').optional(),
  limit: Joi.string().allow('').optional(),
});

const getRegisteredEvents = async (req, res) => {
  try {
    // Early check for user (safety net)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized - user ID not found in session/token' });
    }

    // Validate query params
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Safe parse with validated values
    const page = Math.max(1, parseInt(value.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(value.limit) || 10));
    const status = value.status; 

    const userIdString = req.user._id.toString(); // Guaranteed string from auth.js

    // FIX 2: Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
      return res.status(400).json({ message: 'Invalid user ID format detected from token.' });
    }
    
    // Convert the validated string back to a Mongoose ObjectId for the query
    const userId = new mongoose.Types.ObjectId(userIdString); 

    // Fetch user with attendedEvents populated
    const user = await User.findById(userId).populate({
      path: 'attendedEvents',
      match: { status }, // Filter by status
      options: { sort: { date: 1 } }, // Upcoming first
    }).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allEvents = user.attendedEvents || []; // Populated array
    const total = allEvents.length;

    // Pagination: Slice array
    const skip = (page - 1) * limit;
    const events = allEvents.slice(skip, skip + limit);

    res.status(200).json({
      message: 'Registered events retrieved successfully',
      events,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: skip + events.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get registered events error:', error);
    res.status(500).json({ message: 'Server error fetching registered events' });
  }
};

module.exports = { getRegisteredEvents };