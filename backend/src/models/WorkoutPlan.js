import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sets: Number,
  reps: String, // Can be "10-12" or "30 seconds"
  duration: Number, // in minutes for cardio
  restTime: Number, // in seconds
  instructions: String,
  muscleGroups: [String],
  equipment: [String],
  videoUrl: String
});

const workoutDaySchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  focus: String, // e.g., "Upper Body", "Cardio", "Rest"
  exercises: [exerciseSchema],
  totalDuration: Number, // in minutes
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'hard'],
    default: 'moderate'
  }
});

const workoutPlanSchema = new mongoose.Schema({
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
  weeklySchedule: [workoutDaySchema],
  goals: [{
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'general-fitness', 'endurance', 'flexibility', 'strength']
  }],
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
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
  aiPrompt: String, // Store the original prompt used to generate this plan
  notes: String
}, {
  timestamps: true
});

// Calculate end date before saving
workoutPlanSchema.pre('save', function(next) {
  if (this.startDate && this.duration) {
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + (this.duration * 7));
    this.endDate = endDate;
  }
  next();
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;
