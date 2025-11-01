import NutritionPlan from '../models/NutritionPlan.js';
import WorkoutPlan from '../models/WorkoutPlan.js';
import aiService from '../services/aiServiceInstance.js';

export const generateNutritionPlan = async (req, res) => {
  try {
    // Fetch active workout plan
    const activeWorkoutPlan = await WorkoutPlan.findOne({
      user: req.user._id,
      isActive: true
    });

    const userProfile = {
      ...req.user.profile,
      ...req.body,
      activeWorkoutPlan: activeWorkoutPlan || null
    };

    // Generate plan using AI
    const aiPlan = await aiService.generateNutritionPlan(userProfile);

    // Create nutrition plan in database
    const nutritionPlan = await NutritionPlan.create({
      user: req.user._id,
      title: aiPlan.title,
      description: aiPlan.description,
      duration: aiPlan.duration,
      weeklyPlan: aiPlan.weeklyPlan,
      goals: userProfile.goals || req.user.profile.goals,
      dietaryPreferences: userProfile.dietaryPreferences || req.user.profile.dietaryPreferences,
      dailyTargets: aiPlan.dailyTargets,
      generatedBy: 'ai',
      aiPrompt: JSON.stringify(userProfile)
    });

    res.status(201).json({
      success: true,
      message: 'Nutrition plan generated successfully',
      nutritionPlan
    });
  } catch (error) {
    console.error('Generate nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating nutrition plan',
      error: error.message
    });
  }
};

export const getNutritionPlans = async (req, res) => {
  try {
    const nutritionPlans = await NutritionPlan.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: nutritionPlans.length,
      nutritionPlans
    });
  } catch (error) {
    console.error('Get nutrition plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nutrition plans',
      error: error.message
    });
  }
};

export const getNutritionPlan = async (req, res) => {
  try {
    const nutritionPlan = await NutritionPlan.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!nutritionPlan) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition plan not found'
      });
    }

    res.json({
      success: true,
      nutritionPlan
    });
  } catch (error) {
    console.error('Get nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nutrition plan',
      error: error.message
    });
  }
};

export const getActiveNutritionPlan = async (req, res) => {
  try {
    const nutritionPlan = await NutritionPlan.findOne({
      user: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 });

    if (!nutritionPlan) {
      return res.status(404).json({
        success: false,
        message: 'No active nutrition plan found'
      });
    }

    res.json({
      success: true,
      nutritionPlan
    });
  } catch (error) {
    console.error('Get active nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active nutrition plan',
      error: error.message
    });
  }
};

export const updateNutritionPlan = async (req, res) => {
  try {
    const nutritionPlan = await NutritionPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!nutritionPlan) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Nutrition plan updated successfully',
      nutritionPlan
    });
  } catch (error) {
    console.error('Update nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating nutrition plan',
      error: error.message
    });
  }
};

export const deleteNutritionPlan = async (req, res) => {
  try {
    const nutritionPlan = await NutritionPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!nutritionPlan) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Nutrition plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting nutrition plan',
      error: error.message
    });
  }
};

export const setActiveNutritionPlan = async (req, res) => {
  try {
    // Deactivate all other plans
    await NutritionPlan.updateMany(
      { user: req.user._id },
      { isActive: false }
    );

    // Activate the selected plan
    const nutritionPlan = await NutritionPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: true },
      { new: true }
    );

    if (!nutritionPlan) {
      return res.status(404).json({
        success: false,
        message: 'Nutrition plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Nutrition plan activated successfully',
      nutritionPlan
    });
  } catch (error) {
    console.error('Set active nutrition plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating nutrition plan',
      error: error.message
    });
  }
};
