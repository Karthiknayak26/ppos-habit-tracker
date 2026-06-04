import mongoose from 'mongoose';

const weeklyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  focus: {
    type: String,
    default: '',
  },
  reward: {
    type: String,
    default: '',
  },
  affirmation: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  goals: {
    type: String,
    default: '',
  },
  reflection: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

// Compound index to ensure 1 plan per user per week/year combination
weeklyPlanSchema.index({ user: 1, weekNumber: 1, year: 1 }, { unique: true });

const WeeklyPlan = mongoose.model('WeeklyPlan', weeklyPlanSchema);

export default WeeklyPlan;
