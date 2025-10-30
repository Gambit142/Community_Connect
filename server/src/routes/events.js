const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const { uploadMiddleware } = require('../middleware/multerConfig.js');
const { createEvent } = require('../controllers/events/createEventController.js');
const { getMyEvents } = require('../controllers/events/getMyEventsController.js');

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

module.exports = router;