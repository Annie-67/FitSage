import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profile: { ...req.user.profile, ...updates } } },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

export const getStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      streak: user.streak
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching streak',
      error: error.message
    });
  }
};

export const updateStreak = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.updateStreak();
    await user.save();

    res.json({
      success: true,
      message: 'Streak updated successfully',
      streak: user.streak
    });
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating streak',
      error: error.message
    });
  }
};

export const addAchievement = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    const user = await User.findById(req.user._id);
    user.achievements.push({
      name,
      description,
      icon,
      dateEarned: new Date()
    });
    await user.save();

    res.json({
      success: true,
      message: 'Achievement added successfully',
      achievements: user.achievements
    });
  } catch (error) {
    console.error('Add achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding achievement',
      error: error.message
    });
  }
};

export const getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      achievements: user.achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching achievements',
      error: error.message
    });
  }
};
