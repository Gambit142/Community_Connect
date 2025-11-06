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
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (eventStripe.type === 'checkout.session.completed') {
    const session = eventStripe.data.object;
    const userId = session.metadata.userId;
    const eventId = session.metadata.eventId;
    const orderId = session.metadata.orderId;
    // Find event, user, and order
    let event, user, order;
    try {
      event = await Event.findById(eventId).populate('userID');
      user = await User.findById(userId);
      order = await Order.findById(orderId).populate('userID eventID');
      console.log(`Found resources: event=${!!event}, user=${!!user}, order=${!!order}`); // Added: Confirm fetches
    } catch (fetchErr) {
      console.error('Failed to fetch event/user/order:', fetchErr.message);
      return res.status(500).json({ error: 'Internal fetch error' });
    }

    if (event && user && order) {
      // Fixed: Proper string comparison for attendee check (ObjectId vs string)
      const alreadyAttending = event.attendees.some(att => att.toString() === userId);
      console.log(`Already attending check: ${alreadyAttending}`); // Added: Log check result
      if (!alreadyAttending) {
        console.log('Proceeding with fulfillment (not already attending)'); // Added: Confirm branch

        // Update order to completed
        let paymentMethod = 'Stripe Payment'; // Default
        if (session.payment_intent) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
            paymentMethod = `Card ending in ${paymentIntent.card?.last4 || '****'}`;
            console.log('Payment method retrieved successfully'); // Sanitized: No details
          } catch (piErr) {
            console.error('Failed to retrieve payment intent:', piErr.message);
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
          console.log('Paid registration fulfilled successfully'); // Confirm success
        } catch (fulfillErr) {
          console.error('Fulfillment failed after payment:', fulfillErr.message); // Enhanced: Include message
          // Don't fail webhook; payment succeeded, but log for manual retry
        }
      } else {
        console.log('Registration skipped: Already attending'); // Sanitized: No user ID
      }
    } else {
      console.log('Webhook skipped: Missing event/user/order'); // Sanitized: No session ID
    }
  } else if (eventStripe.type === 'checkout.session.expired') {
    // Optional: Handle expired sessions
    const session = eventStripe.data.object;
    const orderId = session.metadata.orderId;
    console.log('Handling expired session, marking order as failed'); // Sanitized: No IDs
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { status: 'failed' });
    }
  } else {
    console.log(`Unhandled webhook event type: ${eventStripe.type}`); // Added: Catch unknowns
  }

  res.json({ received: true });
};

module.exports = { stripeWebhook };