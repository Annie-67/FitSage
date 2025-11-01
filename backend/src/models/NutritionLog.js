import mongoose from 'mongoose';

const nutritionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  nutritionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NutritionPlan'
  },
  status: {
    type: String,
    enum: ['followed-completely', 'followed-partially', 'did-not-follow'],
    required: true
  },
  mealsFollowed: {
    type: Number, // How many meals from the plan were followed
    min: 0
  },
  totalMeals: {
    type: Number, // Total meals in the plan for that day
    min: 0
  },
  notes: String
}, {
  timestamps: true
});

// Compound index to ensure one log per user per date
nutritionLogSchema.index({ user: 1, date: 1 }, { unique: true });

const NutritionLog = mongoose.model('NutritionLog', nutritionLogSchema);

export default NutritionLog;
