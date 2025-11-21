const Joi = require('joi');
const Event = require('../../models/Event.js');

// Query validation for public events (search, category, pagination)
const querySchema = Joi.object({
  search: Joi.string().allow('').optional(), // Search title/description/location
  category: Joi.string().valid('Workshop', 'Volunteer', 'Market', 'Tech', 'Charity', 'Fair', 'Social', 'Other').allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(6), // Increased max to 100 for calendar use case
});

const getEvents = async (req, res) => {
  try {
    const { error } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { search, category, tags, page = 1, limit = 6 } = req.query;
    const skip = (page - 1) * limit;

    // Build query: only published events and future events
    let query = { 
      status: 'Published',
      date: { $gte: new Date() } // Only future events
    };

    // Category filter
    if (category && category !== '') {
      query.category = category;
    }

    // Search: text index on title/description/location (add index in schema if not)
    if (search && search !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch with pagination, sort by date asc (upcoming first)
    const events = await Event.find(query)
      .sort({ date: 1 }) // Upcoming first
      .skip(skip)
      .limit(parseInt(limit))
      .select('-userID') // Hide userID for public view
      .lean();

    // Total count
    const total = await Event.countDocuments(query);

    res.status(200).json({
      message: 'Events retrieved successfully',
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalEvents: total,
        hasNext: skip + events.length < total,
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error during fetching events' });
  }
};

module.exports = { getEvents };