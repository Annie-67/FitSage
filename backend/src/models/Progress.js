import mongoose from 'mongoose';

const workoutLogSchema = new mongoose.Schema({
  workoutPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  },
  exercises: [{
    exerciseName: String,
    setsCompleted: Number,
    repsCompleted: String,
    weight: Number, // in kg
    duration: Number, // in minutes
    notes: String
  }],
  duration: Number, // total workout duration in minutes
  caloriesBurned: Number,
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'hard']
  },
  feeling: {
    type: String,
    enum: ['great', 'good', 'okay', 'tired', 'exhausted']
  },
  notes: String
});

const nutritionLogSchema = new mongoose.Schema({
  nutritionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NutritionPlan'
  },
  mealsConsumed: [{
    mealName: String,
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number
    }
  }],
  waterIntake: Number, // in liters
  totalNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  notes: String
});

const bodyMetricsSchema = new mongoose.Schema({
  weight: Number, // in kg
  bodyFat: Number, // percentage
  muscleMass: Number, // in kg
  measurements: {
    chest: Number, // in cm
    waist: Number,
    hips: Number,
    arms: Number,
    thighs: Number
  },
  photos: [{
    url: String,
    angle: {
      type: String,
      enum: ['front', 'side', 'back']
    }
  }]
});

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  workoutLog: workoutLogSchema,
  nutritionLog: nutritionLogSchema,
  bodyMetrics: bodyMetricsSchema,
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'tired', 'stressed']
  },
  sleepQuality: {
    hours: Number,
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    }
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  notes: String,
  achievements: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
progressSchema.index({ user: 1, date: -1 });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
