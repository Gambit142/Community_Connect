const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const { uploadMiddleware } = require('../middleware/multerConfig.js');
const { stripeWebhook } = require('../middleware/stripeWebhook.js');
const { createEvent } = require('../controllers/events/createEventController.js');
const { getMyEvents } = require('../controllers/events/getMyEventsController.js');
const { getEvents } = require('../controllers/events/eventsController.js');
const { getEventById, getSimilarEvents } = require('../controllers/events/getEventController.js');
const { updateEvent } = require('../controllers/events/updateEventController.js');
const { deleteEvent } = require('../controllers/events/deleteEventController.js');
const { registerEvent } = require('../controllers/events/registerEventController.js');
const { getRegisteredEvents } = require('../controllers/events/getRegisteredEventsController.js');
const { toggleResourceLikeGeneric } = require('../controllers/commentsController.js');

// Create event (member only, pending approval) with image upload (up to 5 images)
router.post('/', authenticateToken, uploadMiddleware, createEvent);

// Get my events (authenticated user only, with filters/pagination)
router.get('/my-events', authenticateToken, getMyEvents);

// Get registered events (authenticated user only, with filters/pagination)
router.get('/registered', authenticateToken, getRegisteredEvents);

// Get all published events (public, with filters/search/pagination)
router.get('/', getEvents);

// Get single event by ID (public, only published events)
router.get('/:id', getEventById);

// Get similar events (public, based on category, exclude current event)
router.get('/:id/similar', getSimilarEvents);

// Update event (member only, ownership check)
router.put('/:id', authenticateToken, uploadMiddleware, updateEvent);

// Delete event (member only, ownership check)
router.delete('/:id', authenticateToken, deleteEvent);

// Register for event (authenticated users only)
router.post('/:id/register', authenticateToken, registerEvent);

// Like event (toggle)
router.post('/:id/like', authenticateToken, (req, res) => toggleResourceLikeGeneric(req, res, 'event', req.params.id));

// Stripe webhook for paid event fulfillment (public, no auth - signature verified in middleware)
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);

module.exports = router;