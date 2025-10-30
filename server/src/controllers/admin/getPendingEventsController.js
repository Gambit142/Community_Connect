const Event = require('../../models/Event.js');
const Joi = require('joi');

// Validation schema for query params (search, page, limit)
const querySchema = Joi.object({
  search: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(20).default(10),
});

const getPendingEvents = async (req, res) => {
  try {
    const { error } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query: only pending events
    let query = { status: 'Pending Approval' };

    // Search in title/description
    if (search && search !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch events populated with user (for author info)
    const events = await Event.find(query)
      .populate('userID', 'username email') // Basic user info
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Total count
    const total = await Event.countDocuments(query);

    res.status(200).json({
      message: 'Pending events retrieved successfully',
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalEvents: total,
        hasNext: skip + events.length < total,
      },
    });
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({ message: 'Server error during fetching pending events' });
  }
};

module.exports = { getPendingEvents };