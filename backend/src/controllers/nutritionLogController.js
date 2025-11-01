import NutritionLog from '../models/NutritionLog.js';

// Log nutrition adherence
export const logNutrition = async (req, res) => {
  try {
    const { date, status, mealsFollowed, totalMeals, nutritionPlan, notes } = req.body;

    // Check if log already exists for this date
    const existingLog = await NutritionLog.findOne({
      user: req.user._id,
      date: new Date(date)
    });

    if (existingLog) {
      // Update existing log
      existingLog.status = status;
      if (mealsFollowed !== undefined) existingLog.mealsFollowed = mealsFollowed;
      if (totalMeals !== undefined) existingLog.totalMeals = totalMeals;
      if (nutritionPlan) existingLog.nutritionPlan = nutritionPlan;
      if (notes) existingLog.notes = notes;
      await existingLog.save();

      return res.json({
        success: true,
        message: 'Nutrition log updated successfully',
        nutritionLog: existingLog
      });
    }

    // Create new log
    const nutritionLog = await NutritionLog.create({
      user: req.user._id,
      date: new Date(date),
      status,
      mealsFollowed,
      totalMeals,
      nutritionPlan,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Nutrition logged successfully',
      nutritionLog
    });
  } catch (error) {
    console.error('Log nutrition error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging nutrition',
      error: error.message
    });
  }
};

// Get nutrition logs
export const getNutritionLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await NutritionLog.find(query)
      .populate('nutritionPlan', 'title')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: logs.length,
      nutritionLogs: logs
    });
  } catch (error) {
    console.error('Get nutrition logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nutrition logs',
      error: error.message
    });
  }
};

// Get nutrition log for specific date
export const getNutritionLogByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const log = await NutritionLog.findOne({
      user: req.user._id,
      date: new Date(date)
    }).populate('nutritionPlan', 'title');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'No nutrition log found for this date'
      });
    }

    res.json({
      success: true,
      nutritionLog: log
    });
  } catch (error) {
    console.error('Get nutrition log by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nutrition log',
      error: error.message
    });
  }
};

// Delete nutrition log
export const deleteNutritionLog = async (req, res) => {
  try {
    const log = await NutritionLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition log not found'
      });
    }

    res.json({
      success: true,
      message: 'Nutrition log deleted successfully'
    });
  } catch (error) {
    console.error('Delete nutrition log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting nutrition log',
      error: error.message
    });
  }
};

// Get nutrition log statistics
export const getNutritionLogStats = async (req, res) => {
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

    // Get all logs in the period
    const logs = await NutritionLog.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: now }
    });

    // Calculate statistics
    const totalDays = logs.length;
    const followedCompletely = logs.filter(log => log.status === 'followed-completely').length;
    const followedPartially = logs.filter(log => log.status === 'followed-partially').length;
    const didNotFollow = logs.filter(log => log.status === 'did-not-follow').length;

    // Calculate adherence rate
    const adherenceRate = totalDays > 0
      ? Math.round((followedCompletely / totalDays) * 100)
      : 0;

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
      const log = await NutritionLog.findOne({
        user: req.user._id,
        date: {
          $gte: checkDate,
          $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
        },
        status: 'followed-completely'
      });

      if (!log) break;
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    res.json({
      success: true,
      stats: {
        totalDays,
        followedCompletely,
        followedPartially,
        didNotFollow,
        adherenceRate,
        currentStreak
      }
    });
  } catch (error) {
    console.error('Get nutrition log stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nutrition log statistics',
      error: error.message
    });
  }
};
