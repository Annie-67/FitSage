import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  time: String, // e.g., "8:00 AM"
  ingredients: [String],
  instructions: String,
  nutrition: {
    calories: Number,
    protein: Number, // in grams
    carbs: Number, // in grams
    fat: Number, // in grams
    fiber: Number // in grams
  },
  imageUrl: String,
  prepTime: Number, // in minutes
  tags: [String] // e.g., "quick", "vegetarian", "high-protein"
});

const dailyPlanSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  meals: [mealSchema],
  totalNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  waterIntake: {
    target: Number, // in liters
    actual: Number
  },
  notes: String
});

const nutritionPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  duration: {
    type: Number, // in weeks
    required: true
  },
  weeklyPlan: [dailyPlanSchema],
  goals: [{
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'maintenance', 'energy-boost', 'general-health']
  }],
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'none']
  }],
  dailyTargets: {
    calories: {
      type: Number,
      required: true
    },
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    water: Number // in liters
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  generatedBy: {
    type: String,
    enum: ['ai', 'manual', 'template'],
    default: 'ai'
  },
  aiPrompt: String,
  notes: String
}, {
  timestamps: true
});

// Calculate end date before saving
nutritionPlanSchema.pre('save', function(next) {
  if (this.startDate && this.duration) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + (this.duration * 7));
    this.endDate = endDate;
  }
  next();
});

const NutritionPlan = mongoose.model('NutritionPlan', nutritionPlanSchema);

export default NutritionPlan;
