const multer = require('multer');
const cloudinary = require('../config/cloudinary.js').cloudinary;

// Multer storage config (memory for processing, not disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  },
});

// Error-handling wrapper for multer
const uploadMiddleware = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large (max 5MB per image)' });
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Maximum 5 images allowed' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      if (err.message === 'Only image files allowed') {
        return res.status(400).json({ message: 'Only image files allowed' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    next();
  });
};

module.exports = { uploadMiddleware };