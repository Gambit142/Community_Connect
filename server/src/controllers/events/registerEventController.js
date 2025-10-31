const Joi = require('joi');
const Event = require('../../models/Event.js');
const Order = require('../../models/Order.js'); 
const Notification = require('../../models/Notification.js');
const nodemailer = require('nodemailer');
const User = require('../../models/User.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe init

// Nodemailer transporter (reuse from createEvent)
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const registerEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user._id;

    // Find event
    const event = await Event.findById(eventId).populate('userID', 'username email');
    if (!event || event.status !== 'Published') {
      return res.status(404).json({ message: 'Event not found or not published' });
    }

    // Check if already registered (via attendees)
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check for existing completed order
    const existingOrder = await Order.findOne({ 
      userID: userId, 
      eventID: eventId, 
      status: 'completed' 
    });
    if (existingOrder) {
      return res.status(400).json({ message: 'Already paid and registered for this event' });
    }

    if (event.price === 0) {
      // Free event: Direct registration (no Order)
      await handleFreeRegistration(event, req.user, res);
    } else {
      // Paid event: Create pending Order, then Stripe session
      const order = await createPendingOrder(event, req.user);
      const session = await createStripeSession(event, req.user, order._id);
      res.status(200).json({
        message: 'Redirect to checkout',
        sessionId: session.id,
        url: session.url, // For immediate redirect
      });
    }
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// NEW: Helper to create pending Order for paid events
const createPendingOrder = async (event, user) => {
  const order = new Order({
    userID: user._id,
    eventID: event._id,
    amount: event.price,
    currency: 'usd',
    status: 'pending',
    stripeSessionId: '', // To be updated after session creation
  });
  await order.save();
  return order;
};

// Helper: Handle free registration (also used by webhook for paid fulfillment)
const handleFreeRegistration = async (event, user, res) => {
  // Add to attendees
  event.attendees.push(user._id);
  await event.save();

  // Confirmation email to registrant (non-blocking)
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Event Registration Confirmed - Community Connect',
      html: `
        <h1>Registration Confirmed!</h1>
        <p>Dear ${user.username},</p>
        <p>You are registered for "<strong>${event.title}</strong>" on ${new Date(event.date).toLocaleDateString()}.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event._id}" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Event Details</a>
        <p>Best regards,<br>Community Connect Team</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${user.email}`);
  } catch (emailError) {
    console.error('Failed to send confirmation email:', emailError.message);
  }

  // In-app notification for registrant
  try {
    const registrantNotification = new Notification({
      userID: user._id,
      message: `You registered for "${event.title}" on ${new Date(event.date).toLocaleDateString()}.`,
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
  } catch (notifError) {
    console.error('Failed to create registrant notification:', notifError.message);
  }

  // Notify event creator (if different from registrant)
  if (event.userID._id.toString() !== user._id.toString()) {
    try {
      const creatorNotification = new Notification({
        userID: event.userID._id,
        message: `New registration for your event "${event.title}" by ${user.username}.`,
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
        timestamp: new Date().toISOString(),
      });
      console.log(`Notification sent to event creator ${event.userID.username}`);
    } catch (creatorNotifError) {
      console.error('Failed to create creator notification:', creatorNotifError.message);
    }
  }

  // Respond (only if res is real; skip for webhook mock)
  if (res && res.status && res.json) {
    res.status(201).json({
      message: 'Registration successful',
      event: { ...event.toObject(), attendees: event.attendees.length }, // Return attendee count
    });
  }
};

// Updated: Create Stripe checkout session (include order ID in metadata)
const createStripeSession = async (event, user, orderId) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${event.title} - ${new Date(event.date).toLocaleDateString()}`,
            description: event.description.substring(0, 100) + '...',
          },
          unit_amount: Math.round(event.price * 100), // Cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event._id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/events/${event._id}?canceled=true`,
    metadata: {
      userId: user._id.toString(),
      eventId: event._id.toString(),
      orderId: orderId.toString(), // NEW: Track order
    },
  });

  // Update order with session ID
  await Order.findByIdAndUpdate(orderId, { stripeSessionId: session.id });

  return session;
};

module.exports = { registerEvent, handleFreeRegistration }; // Export for webhook