import express from 'express';
import dotenv from 'dotenv';
import dns from 'dns';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import './config/passport.js'; // Import passport config
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.js';
import habitRoutes from './routes/habits.js';
import taskRoutes from './routes/tasks.js';
import analyticsRoutes from './routes/analytics.js';
import noteRoutes from './routes/notes.js';
import financeRoutes from './routes/finance.js';
import planRoutes from './routes/plans.js';
import healthRoutes from './routes/health.js';
import { startCronJobs } from './services/cronService.js';

// Force Node to use Google and Cloudflare DNS to bypass local ISP blocks
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  }
});

app.set('io', io); // Make io accessible in controllers

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_user_room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Apply rate limiting to all API requests
app.use('/api/', apiLimiter);

// Route Placeholders (to be implemented)
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/health', healthRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/habits', habitRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('PPOS API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  // Initialize Cron Jobs
  startCronJobs();
});
