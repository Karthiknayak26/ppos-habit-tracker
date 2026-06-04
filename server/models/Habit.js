import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // lucide-react icon name as string
    default: 'activity'
  },
  weekData: {
    mon: { type: Boolean, default: false },
    tue: { type: Boolean, default: false },
    wed: { type: Boolean, default: false },
    thu: { type: Boolean, default: false },
    fri: { type: Boolean, default: false },
    sat: { type: Boolean, default: false },
    sun: { type: Boolean, default: false },
  },
  weekNumber: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  progress: {
    type: Number,
    default: 0
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate progress % automatically
habitSchema.pre('save', function(next) {
  if (this.isModified('weekData')) {
    const days = Object.values(this.weekData);
    const completedDays = days.filter(day => day === true).length;
    this.progress = Math.round((completedDays / 7) * 100);
  }
  next();
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
