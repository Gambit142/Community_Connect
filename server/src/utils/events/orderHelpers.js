const Order = require('../../models/Order.js');

const createOrder = async (event, user, amount, attendees, specialRequests, status, paymentMethod, stripeSessionId) => {
  const order = new Order({
    userID: user._id,
    eventID: event._id,
    amount,
    tickets: attendees,
    specialRequests,
    status,
    paymentMethod,
    stripeSessionId: stripeSessionId || null, // Pass null for pending (will be updated later)
  });
  await order.save();
  return order;
};

module.exports = { createOrder };