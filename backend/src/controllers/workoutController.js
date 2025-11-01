import WorkoutPlan from '../models/WorkoutPlan.js';
import aiService from '../services/aiServiceInstance.js';

export const generateWorkoutPlan = async (req, res) => {
  try {
    const userProfile = {
      ...req.user.profile,
      ...req.body
    };

    // Generate plan using AI
    const aiPlan = await aiService.generateWorkoutPlan(userProfile);

    // Create workout plan in database
    const workoutPlan = await WorkoutPlan.create({
      user: req.user._id,
      title: aiPlan.title,
      description: aiPlan.description,
      duration: aiPlan.duration,
      weeklySchedule: aiPlan.weeklySchedule,
      goals: userProfile.goals || req.user.profile.goals,
      fitnessLevel: userProfile.fitnessLevel || req.user.profile.fitnessLevel,
      generatedBy: 'ai',
      aiPrompt: JSON.stringify(userProfile)
    });

    res.status(201).json({
      success: true,
      message: 'Workout plan generated successfully',
      workoutPlan
    });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating workout plan',
      error: error.message
    });
  }
};

export const getWorkoutPlans = async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: workoutPlans.length,
      workoutPlans
    });
  } catch (error) {
    console.error('Get workout plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout plans',
      error: error.message
    });
  }
};

export const getWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    res.json({
      success: true,
      workoutPlan
    });
  } catch (error) {
    console.error('Get workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workout plan',
      error: error.message
    });
  }
};

export const getActiveWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({
      user: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'No active workout plan found'
      });
    }

    res.json({
      success: true,
      workoutPlan
    });
  } catch (error) {
    console.error('Get active workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active workout plan',
      error: error.message
    });
  }
};

export const updateWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout plan updated successfully',
      workoutPlan
    });
  } catch (error) {
    console.error('Update workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating workout plan',
      error: error.message
    });
  }
};

export const deleteWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting workout plan',
      error: error.message
    });
  }
};

export const setActiveWorkoutPlan = async (req, res) => {
  try {
    // Deactivate all other plans
    await WorkoutPlan.updateMany(
      { user: req.user._id },
      { isActive: false }
    );

    // Activate the selected plan
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: true },
      { new: true }
    );

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Workout plan activated successfully',
      workoutPlan
    });
  } catch (error) {
    console.error('Set active workout plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating workout plan',
      error: error.message
    });
  }
};
