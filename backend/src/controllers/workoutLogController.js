import WorkoutLog from '../models/WorkoutLog.js';

// Log a workout
export const logWorkout = async (req, res) => {
  try {
    const { date, status, dayOfWeek, workoutPlan } = req.body;

    // Check if log already exists for this date
    const existingLog = await WorkoutLog.findOne({
      user: req.user._id,
      date: new Date(date)
    });

    if (existingLog) {
      // Update existing log
      existingLog.status = status;
      if (dayOfWeek) existingLog.dayOfWeek = dayOfWeek;
      if (workoutPlan) existingLog.workoutPlan = workoutPlan;
      await existingLog.save();

      return res.json({
        success: true,
        message: 'Workout log updated successfully',
        workoutLog: existingLog
      });
    }

    // Create new log
    const workoutLog = await WorkoutLog.create({
      user: req.user._id,
      date: new Date(date),
      status,
      dayOfWeek,
      workoutPlan
    });

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      workoutLog
    });
  } catch (error) {
    console.error('Log workout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging workout',
      error: error.message
    });
  }
};

// Get workout logs
export const getWorkoutLogs = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await WorkoutLog.find(query)
      .populate('workoutPlan', 'title')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: logs.length,
      workoutLogs: logs
    });
  } catch (error) {
    console.error('Get workout logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout logs',
      error: error.message
    });
  }
};

// Get workout log for specific date
export const getWorkoutLogByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const log = await WorkoutLog.findOne({
      user: req.user._id,
      date: new Date(date)
    }).populate('workoutPlan', 'title');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'No workout log found for this date'
      });
    }

    res.json({
      success: true,
      workoutLog: log
    });
  } catch (error) {
    console.error('Get workout log by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout log',
      error: error.message
    });
  }
};

// Delete workout log
export const deleteWorkoutLog = async (req, res) => {
  try {
    const log = await WorkoutLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Workout log not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout log deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting workout log',
      error: error.message
    });
  }
};

// Get workout log statistics
export const getWorkoutLogStats = async (req, res) => {
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
    const logs = await WorkoutLog.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: now }
    });

    // Calculate statistics
    const totalWorkouts = logs.length;
    const goalsAchieved = logs.filter(log => log.status === 'goal-achieved').length;
    const stoppedMidway = logs.filter(log => log.status === 'stopped-midway').length;
    const tooBusy = logs.filter(log => log.status === 'too-busy').length;

    // Calculate completion rate
    const completionRate = totalWorkouts > 0
      ? Math.round((goalsAchieved / totalWorkouts) * 100)
      : 0;

    // Get current week streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
      const log = await WorkoutLog.findOne({
        user: req.user._id,
        date: {
          $gte: checkDate,
          $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
        },
        status: 'goal-achieved'
      });

      if (!log) break;
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    res.json({
      success: true,
      stats: {
        totalWorkouts,
        goalsAchieved,
        stoppedMidway,
        tooBusy,
        completionRate,
        currentStreak
      }
    });
  } catch (error) {
    console.error('Get workout log stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout log statistics',
      error: error.message
    });
  }
};
