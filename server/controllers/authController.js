import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import mongoose from 'mongoose';

// Helper to check DB connection
const isDbConnected = () => mongoose.connection.readyState === 1;

// Mock user for offline UI testing
const mockUser = {
  _id: 'mock_user_123',
  name: 'Test User',
  email: 'test@example.com',
  theme: 'dark'
};

// @desc    Register a new user
export const registerUser = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      generateToken(res, mockUser._id);
      return res.status(201).json(mockUser);
    }

    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, theme: user.theme });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
export const loginUser = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      generateToken(res, mockUser._id);
      return res.json(mockUser);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({ _id: user._id, name: user.name, email: user.email, theme: user.theme });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0) 
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    if (!isDbConnected() || req.user._id === 'mock_user_123') {
      return res.json(mockUser);
    }

    const user = await User.findById(req.user._id);
    if (user) {
      res.json({ _id: user._id, name: user.name, email: user.email, theme: user.theme });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        theme: updatedUser.theme
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
