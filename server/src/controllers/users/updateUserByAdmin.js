const User = require('../../models/User.js');
const { uploadProfilePic } = require('../../utils/users/uploadProfilePic.js');

const updateUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = { ...req.body };

    if (req.file) {
      const { url } = await uploadProfilePic(req.file.buffer);
      updates.profilePic = url;
    }

    // Allow admin to change role & userType
    const allowedFields = [
      'username', 'email', 'bio', 'location', 'interests',
      'role', 'userType', 'organizationDetails', 'profilePic'
    ];

    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
    }

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

module.exports = updateUserByAdmin;