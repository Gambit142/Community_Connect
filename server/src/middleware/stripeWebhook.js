const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { handleFreeRegistration } = require('../controllers/events/registerEventController.js');
const Event = require('../models/Event.js');
const User = require('../models/User.js');

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let eventStripe;

  try {
    eventStripe = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (eventStripe.type === 'checkout.session.completed') {
    const session = eventStripe.data.object;
    const userId = session.metadata.userId;
    const eventId = session.metadata.eventId;

    // Find event and user
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);
    if (event && user && !event.attendees.includes(userId)) {
      // Fulfill registration (reuse handleFreeRegistration logic) - it will handle notifications to creator
      await handleFreeRegistration(event, user, { status: () => {}, json: () => {} }); // Mock res (no response needed)
      console.log(`Paid registration fulfilled for user ${userId} on event ${eventId}`);
    } else {
      console.log(`Registration skipped: Invalid event/user or already registered`);
    }
  }

  res.json({ received: true });
};

module.exports = { stripeWebhook };