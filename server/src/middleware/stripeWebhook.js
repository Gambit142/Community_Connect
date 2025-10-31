const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { handleFreeRegistration } = require('../controllers/events/registerEventController.js');
const Event = require('../models/Event.js');
const User = require('../models/User.js');
const Order = require('../models/Order.js');

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
    const orderId = session.metadata.orderId; // NEW: From metadata

    // Find event, user, and order
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);
    const order = await Order.findById(orderId);
    if (event && user && order && !event.attendees.includes(userId)) {
      // Update order to completed
      await Order.findByIdAndUpdate(orderId, { 
        status: 'completed',
        paymentMethod: session.payment_intent ? session.payment_intent.payment_method : null,
      });

      // Fulfill registration (reuse handleFreeRegistration logic) - it will handle notifications to creator
      await handleFreeRegistration(event, user, { status: () => {}, json: () => {} }); // Mock res
      console.log(`Paid registration fulfilled for user ${userId} on event ${eventId} (Order: ${orderId})`);
    } else {
      console.log(`Registration skipped: Invalid event/user/order or already registered`);
    }
  } else if (eventStripe.type === 'checkout.session.expired') {
    // Optional: Handle expired sessions
    const session = eventStripe.data.object;
    const orderId = session.metadata.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: 'failed' });
      console.log(`Order ${orderId} marked as failed (session expired)`);
    }
  }

  res.json({ received: true });
};

module.exports = { stripeWebhook };