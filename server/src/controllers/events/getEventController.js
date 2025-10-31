const Event = require('../../models/Event.js');
const jwt = require('jsonwebtoken');

// Get single event by ID (public for published, auth+owner/admin for others)
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Basic ID validation (MongoDB ObjectId format)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // Manually decode token if present (for optional auth)
    let decodedUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    // Fetch full event
    const fullEvent = await Event.findOne({ _id: id });
    if (!fullEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If published, anyone can view
    if (fullEvent.status === 'Published') {
      const eventData = fullEvent.toObject();
      delete eventData.userID;
      return res.status(200).json({
        message: 'Event retrieved successfully',
        event: eventData,
      });
    }

    // For unpublished, require auth and check ownership or admin role
    if (!decodedUser) {
      return res.status(401).json({ message: 'Authentication required to view unpublished event' });
    }

    // Safely check ownership (use 'id' from JWT payload)
    const userIdStr = fullEvent.userID ? fullEvent.userID.toString() : null;
    if (userIdStr !== decodedUser.id.toString() && decodedUser.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view this event' });
    }

    // Authorized, return event without userID
    const eventData = fullEvent.toObject();
    delete eventData.userID;

    res.status(200).json({
      message: 'Event retrieved successfully',
      event: eventData,
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ message: 'Server error during fetching event' });
  }
};

// Get similar events (public, based on category, exclude current ID)
const getSimilarEvents = async (req, res) => {
  try {
    const { id } = req.params;

    // Basic ID validation
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }

    // First, get the current event's category
    const currentEvent = await Event.findOne({ _id: id, status: 'Published' }).select('category').lean();
    if (!currentEvent) {
      return res.status(404).json({ message: 'Event not found or not published' });
    }

    // Fetch similar events: same category, exclude current ID, published only, upcoming only
    const similarEvents = await Event.find({
      category: currentEvent.category,
      _id: { $ne: id },
      status: 'Published',
      date: { $gte: new Date() }, // Upcoming only
    })
      .sort({ date: 1 }) // Soonest first
      .limit(5) // Max 5
      .select('-userID') // Hide userID
      .lean();

    res.status(200).json({
      message: 'Similar events retrieved successfully',
      similarEvents,
    });
  } catch (error) {
    console.error('Get similar events error:', error);
    res.status(500).json({ message: 'Server error during fetching similar events' });
  }
};

module.exports = { getEventById, getSimilarEvents };