import mongoose from 'mongoose';

const workoutLogSchema = new mongoose.Schema({
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
  workoutPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutPlan'
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  status: {
    type: String,
    enum: ['goal-achieved', 'stopped-midway', 'too-busy'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one log per user per date
workoutLogSchema.index({ user: 1, date: 1 }, { unique: true });

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);

export default WorkoutLog;
