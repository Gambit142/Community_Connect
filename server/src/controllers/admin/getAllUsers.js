// controllers/admin/getAllUsers.js
const User = require('../../models/User.js');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('username email role userType bio location profilePic createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      users,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalUsers: users.length,
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getAllUsers;