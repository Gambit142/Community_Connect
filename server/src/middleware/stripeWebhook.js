const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order.js');
const Event = require('../models/Event.js');
const User = require('../models/User.js');
const { sendReceiptEmail, fulfillRegistration } = require('../utils/events/registrationHelpers.js');

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
    const orderId = session.metadata.orderId;

    console.log(`Webhook received for session ${session.id}: Processing payment for user ${userId}, event ${eventId}, order ${orderId}`);

    // Find event, user, and order
    const event = await Event.findById(eventId).populate('userID');
    const user = await User.findById(userId);
    const order = await Order.findById(orderId).populate('userID eventID');
    if (event && user && order && !event.attendees.includes(userId)) {
      // Update order to completed
      let paymentMethod = null;
      if (session.payment_intent) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          paymentMethod = `Card ending in ${paymentIntent.card?.last4 || '****'}`;
        } catch (piErr) {
          console.error('Failed to retrieve payment intent:', piErr);
          paymentMethod = 'Stripe Payment';
        }
      }
      await Order.findByIdAndUpdate(orderId, { 
        status: 'completed',
        paymentMethod,
      });

      // Update order ref
      order.status = 'completed';
      order.paymentMethod = paymentMethod;

      // Fulfill registration (add attendee, notifications, send receipt) - Await to ensure completion
      try {
        await fulfillRegistration(event, user, order, true);
        console.log(`Paid registration fulfilled successfully for user ${userId} on event ${eventId} (Order: ${orderId})`);
      } catch (fulfillErr) {
        console.error('Fulfillment failed after payment:', fulfillErr);
        // Don't fail webhook; payment succeeded, but log for manual retry
      }
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