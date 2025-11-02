const Notification = require('../../models/Notification.js');

const createNotifications = async (event, user, order) => {
  // Registrant notification
  try {
    const registrantNotification = new Notification({
      userID: user._id,
      message: `You are registered for "${event.title}" (${order.tickets} ticket${order.tickets > 1 ? 's' : ''}). Confirmation #CC-${order._id.toString().slice(-8)}`, // Fixed: toString()
      type: 'event_registration',
      relatedID: event._id,
      relatedType: 'event',
      isRead: false,
    });
    await registrantNotification.save();

    // Socket to registrant
    global.io.to(`user-${user._id}`).emit('event_registered', {
      eventId: event._id,
      title: event.title,
      date: event.date,
    });
    console.log(`Registrant notification created for user ${user._id}`);
  } catch (notifError) {
    console.error('Failed to create registrant notification:', notifError.message);
  }

  // Notify event creator (if different)
  if (event.userID._id.toString() !== user._id.toString()) {
    try {
      const creatorNotification = new Notification({
        userID: event.userID._id,
        message: `New registration for "${event.title}" by ${user.username} (${order.tickets} ticket${order.tickets > 1 ? 's' : ''}).`,
        type: 'new_event_registration',
        relatedID: event._id,
        relatedType: 'event',
        isRead: false,
      });
      await creatorNotification.save();

      // Socket to creator
      global.io.to(`user-${event.userID._id}`).emit('new_event_registration', {
        registrant: user.username,
        eventId: event._id,
        title: event.title,
        tickets: order.tickets,
        timestamp: new Date().toISOString(),
      });
      console.log(`Creator notification created for ${event.userID._id}`);
    } catch (creatorNotifError) {
      console.error('Failed to create creator notification:', creatorNotifError.message);
    }
  }
};

module.exports = { createNotifications };