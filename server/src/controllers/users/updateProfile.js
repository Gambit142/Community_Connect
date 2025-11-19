const User = require('../../models/User.js');
const { uploadProfilePic } = require('../../utils/users/uploadProfilePic.js');

const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Handle profile picture
    if (req.file) {
      const { url, public_id } = await uploadProfilePic(req.file.buffer);
      updates.profilePic = url;
      updates.profilePicPublicId = public_id; // optional: for future deletion
    }

    // Prevent users from changing role/userType
    delete updates.role;
    delete updates.userType;
    delete updates.isVerified;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -verificationToken');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = updateProfile;