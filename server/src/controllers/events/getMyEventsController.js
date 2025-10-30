const Joi = require('joi');
const Event = require('../../models/Event.js');

// Query validation for my events (status, page, limit)
const querySchema = Joi.object({
  status: Joi.string().valid('Pending Approval', 'Published', 'Rejected').allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const getMyEvents = async (req, res) => {
  try {
    const { error } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userID = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query: user's events only
    let query = { userID };

    // Status filter
    if (status && status !== '') {
      query.status = status;
    }

    // Fetch events
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Total count
    const total = await Event.countDocuments(query);

    res.status(200).json({
      message: 'Your events retrieved successfully',
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalEvents: total,
        hasNext: skip + events.length < total,
      },
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Server error during fetching your events' });
  }
};

module.exports = { getMyEvents };