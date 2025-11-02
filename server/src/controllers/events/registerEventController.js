const Joi = require('joi');
const Event = require('../../models/Event.js');
const Order = require('../../models/Order.js'); 
const { createOrder } = require('../../utils/events/orderHelpers.js');
const { fulfillRegistration } = require('../../utils/events/registrationHelpers.js');
const { createStripeSession } = require('../../utils/events/stripeHelpers.js');

// Validation schema
const registrationSchema = Joi.object({
  attendees: Joi.number().min(1).max(10).default(1),
  specialRequests: Joi.string().max(500).allow('').default(''),
});

const registerEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user._id;

    // Validate body
    const { error, value } = registrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { attendees, specialRequests } = value;

    // Find event
    const event = await Event.findById(eventId).populate('userID', 'username email');
    if (!event || event.status !== 'Published') {
      return res.status(404).json({ message: 'Event not found or not published' });
    }

    // Check if already registered (via attendees)
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check for existing completed order
    const existingOrder = await Order.findOne({ 
      userID: userId, 
      eventID: eventId, 
      status: 'completed' 
    });
    if (existingOrder) {
      return res.status(400).json({ message: 'Already paid and registered for this event' });
    }

    if (event.price === 0) {
      // Free event: Create completed order, fulfill registration
      const totalAmount = 0;
      const order = await createOrder(event, req.user, totalAmount, attendees, specialRequests, 'completed', 'Free Registration', `free_${Date.now()}_${userId}`);
      await fulfillRegistration(event, req.user, order, false);
      res.status(201).json({
        message: 'Registration successful',
        event: { ...event.toObject(), attendees: event.attendees.length },
        order: order._id,
      });
    } else {
      // Paid event: Create pending order, then Stripe session
      const totalAmount = event.price * attendees;
      const order = await createOrder(event, req.user, totalAmount, attendees, specialRequests, 'pending', null, null);
      const session = await createStripeSession(event, req.user, order._id, attendees);
      res.status(200).json({
        message: 'Redirect to checkout',
        sessionId: session.id,
        url: session.url,
      });
    }
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

module.exports = { registerEvent };