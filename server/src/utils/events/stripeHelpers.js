const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/Order.js');

const createStripeSession = async (event, user, orderId, attendees) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${event.title} - ${new Date(event.date).toLocaleDateString()} (${attendees} ticket${attendees > 1 ? 's' : ''})`,
            description: event.description.substring(0, 100) + '...',
          },
          unit_amount: Math.round(event.price * 100), // Cents per ticket
        },
        quantity: attendees,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/payment-success/${event._id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event._id}?canceled=true`,
    metadata: {
      userId: user._id.toString(),
      eventId: event._id.toString(),
      orderId: orderId.toString(),
    },
  });

  // Update order with session ID
  await Order.findByIdAndUpdate(orderId, { stripeSessionId: session.id });

  return session;
};

module.exports = { createStripeSession };