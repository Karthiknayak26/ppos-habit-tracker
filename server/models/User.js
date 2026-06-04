import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required unless they use Google Auth
      return !this.googleId;
    }
  },
  googleId: {
    type: String
  },
  avatar: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    enum: ['dark', 'light', 'bw'],
    default: 'dark'
  },
  startOfWeek: {
    type: Number, // 0 for Sunday, 1 for Monday
    default: 1
  },
  weeklyFocus: {
    type: String,
    default: ''
  },
  weeklyReward: {
    type: String,
    default: ''
  },
  weeklyAffirmation: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
