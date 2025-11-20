const User = require('../../models/User.js');
const bcrypt = require('bcryptjs');

const createUserByAdmin = async (req, res) => {
  try {
    const { username, email, password, role, userType, bio, location } = req.body;

    if (!username || !email || (!password && !req.body.password)) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password || 'default123', 10);

    const user = await User.create({
      username,
      email,
      passwordHash,
      role: role || 'member',
      userType: userType || 'individual',
      bio,
      location,
      isVerified: true,
    });

    const userResponse = await User.findById(user._id).select('-passwordHash');

    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = createUserByAdmin;