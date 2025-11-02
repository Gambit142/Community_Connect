const Event = require('../../models/Event.js');
const { createNotifications } = require('./notificationHelpers.js');
const { sendConfirmationEmail, sendReceiptEmail } = require('./emailHelpers.js');

const fulfillRegistration = async (event, user, order, isPaid) => {
  // Add to attendees if not already (safety check)
  if (!event.attendees.includes(user._id)) {
    event.attendees.push(user._id);
    await event.save();
  }

  // Create notifications
  await createNotifications(event, user, order);

  // Send email
  if (isPaid) {
    await sendReceiptEmail(user, event, order);
  } else {
    await sendConfirmationEmail(user, event, order);
  }
};

module.exports = { fulfillRegistration };