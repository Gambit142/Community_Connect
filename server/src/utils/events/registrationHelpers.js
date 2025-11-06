const Event = require('../../models/Event.js');
const User = require('../../models/User.js'); 
const { createNotifications } = require('./notificationHelpers.js');
const { sendConfirmationEmail, sendReceiptEmail } = require('./emailHelpers.js');

const fulfillRegistration = async (event, user, order, isPaid) => {
  // Add to attendees if not already (safety check)
  if (!event.attendees.includes(user._id)) {
    event.attendees.push(user._id);
    await event.save();
  }

  // Add event to user's attendedEvents if not already present
  const userDoc = await User.findById(user._id);
  if (!userDoc.attendedEvents.includes(event._id)) {
    userDoc.attendedEvents.push(event._id);
    await userDoc.save();
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