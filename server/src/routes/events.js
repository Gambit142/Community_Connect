// Edited file: routes/events.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const { uploadMiddleware } = require('../middleware/multerConfig.js');
const { createEvent } = require('../controllers/events/createEventController.js');
const { getMyEvents } = require('../controllers/events/getMyEventsController.js');
const { getEvents } = require('../controllers/events/eventsController.js');
const { getEventById, getSimilarEvents } = require('../controllers/events/getEventController.js');

// Create event (member only, pending approval) with image upload (up to 5 images)
router.post('/', authenticateToken, uploadMiddleware, createEvent);

// Request Structure for Create Event with Images:
// - Method: POST /api/events (multipart/form-data)
// - Headers: Authorization: Bearer <jwt_token> (required)
// - Form Fields: 
//   - title: string (required)
//   - description: string (required)
//   - date: date string (required, ISO format)
//   - time: string (required, e.g., "14:00")
//   - location: string (required)
//   - category: string enum (required)
//   - price: number (optional)
// - Files: images (multiple files, field name 'images', up to 5, images only)
// Response Structure:
// - Success (201): { "message": "string", "event": { ...event with images array of URLs } }
// - Errors: 400 { "message": "validation/file error" }, 401 { "message": "unauthorized" }, 500 { "message": "server error" }

// Get my events (authenticated user only, with filters/pagination)
router.get('/my-events', authenticateToken, getMyEvents);

// Request Structure for Get My Events:
// - Method: GET /api/events/my-events
// - Headers: Authorization: Bearer <jwt_token> (required)
// - Query Params: 
//   ?status=Pending Approval (optional filter)
//   ?page=1 (optional, default 1)
//   ?limit=10 (optional, default 10, max 50)
// Response Structure:
// - Success (200): { "message": "string", "events": [event objects], "pagination": { currentPage, totalPages, totalEvents, hasNext } }
// - Errors: 400 { "message": "validation error" }, 401 { "message": "unauthorized" }, 500 { "message": "server error" }

// Get all published events (public, with filters/search/pagination)
router.get('/', getEvents);

// Request Structure for Get All Events:
// - Method: GET /api/events
// - Query Params: 
//   ?search=query (title/description/location, optional)
//   ?category=Workshop (filter, optional)
//   ?tags=free,urgent (comma-separated, optional - if implemented)
//   ?page=1 (optional, default 1)
//   ?limit=6 (optional, default 6, max 12)
// Response Structure:
// - Success (200): { "message": "string", "events": [event objects], "pagination": { currentPage, totalPages, totalEvents, hasNext } }
// - Errors: 400 { "message": "validation error" }, 500 { "message": "server error" }

// Get single event by ID (public, only published events)
router.get('/:id', getEventById);

// Request Structure for Get Event by ID:
// - Method: GET /api/events/:id
// - No body/headers required
// Response Structure:
// - Success (200): { "message": "string", "event": { ...event object } }
// - Errors: 404 { "message": "Event not found" }, 500 { "message": "server error" }

// Get similar events (public, based on category, exclude current event)
router.get('/:id/similar', getSimilarEvents);

// Request Structure for Get Similar Events:
// - Method: GET /api/events/:id/similar
// - No body/headers required
// Response Structure:
// - Success (200): { "message": "string", "similarEvents": [event objects, max 5] }
// - Errors: 404 { "message": "Event not found" }, 500 { "message": "server error" }

module.exports = router;