const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/Order.js');

const createStripeSession = async (event, user, orderId, attendees) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:10200';
  
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
          unit_amount: Math.round(event.price * 100), // in cents
        },
        quantity: attendees,
      },
    ],
    mode: 'payment',
    success_url: `${frontendUrl}/events/payment-success/${event._id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/events/${event._id}?canceled=true`,
    metadata: {
      userId: user._id.toString(),
      eventId: event._id.toString(),
      orderId: orderId.toString(),
    },
  });

  await Order.findByIdAndUpdate(orderId, { stripeSessionId: session.id });

  return session;
};

module.exports = { createStripeSession };