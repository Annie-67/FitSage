import Progress from '../models/Progress.js';
import User from '../models/User.js';

export const logProgress = async (req, res) => {
  try {
    const progressData = {
      user: req.user._id,
      date: req.body.date || new Date(),
      ...req.body
    };

    const progress = await Progress.create(progressData);

    // Update user streak if workout is logged
    if (progressData.workoutLog) {
      const user = await User.findById(req.user._id);
      user.updateStreak();
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Progress logged successfully',
      progress
    });
  } catch (error) {
    console.error('Log progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging progress',
      error: error.message
    });
  }
};

export const getProgress = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const progress = await Progress.find(query).sort({ date: -1 });

    res.json({
      success: true,
      count: progress.length,
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

export const getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get progress by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

export const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Progress entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting progress',
      error: error.message
    });
  }
};

export const getStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const progress = await Progress.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: now }
    }).sort({ date: 1 });

    // Calculate statistics
    const stats = {
      totalWorkouts: 0,
      totalCaloriesBurned: 0,
      totalWorkoutDuration: 0,
      averageCaloriesConsumed: 0,
      weightProgress: [],
      workoutFrequency: {},
      nutritionTrends: []
    };

    let totalCaloriesConsumed = 0;
    let nutritionDays = 0;

    progress.forEach(entry => {
      if (entry.workoutLog) {
        stats.totalWorkouts++;
        stats.totalCaloriesBurned += entry.workoutLog.caloriesBurned || 0;
        stats.totalWorkoutDuration += entry.workoutLog.duration || 0;
      }

      if (entry.nutritionLog) {
        totalCaloriesConsumed += entry.nutritionLog.totalNutrition?.calories || 0;
        nutritionDays++;
      }

      if (entry.bodyMetrics && entry.bodyMetrics.weight) {
        stats.weightProgress.push({
          date: entry.date,
          weight: entry.bodyMetrics.weight
        });
      }
    });

    if (nutritionDays > 0) {
      stats.averageCaloriesConsumed = Math.round(totalCaloriesConsumed / nutritionDays);
    }

    res.json({
      success: true,
      period,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
