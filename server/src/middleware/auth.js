const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find user and explicitly select everything *except* password hash
    const userDoc = await User.findById(decoded.id, '-passwordHash'); 
    
    if (!userDoc) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Convert the Mongoose document to a plain JavaScript object
    const userObject = userDoc.toObject();
    
    // CRITICAL FIX: Ensure _id is a string before attaching to req.user
    userObject._id = userDoc._id.toString(); 

    req.user = userObject; // Attach the plain object to the request
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
       return res.status(403).json({ message: 'Token has expired' });
    }
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user is guaranteed to exist by authenticateToken
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role ${req.user.role} not authorized for this action. Required: ${roles.join(', ')}` });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };