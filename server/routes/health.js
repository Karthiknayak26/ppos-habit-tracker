import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  let dbStatusText = 'Disconnected';
  
  if (dbStatus === 1) dbStatusText = 'Connected';
  if (dbStatus === 2) dbStatusText = 'Connecting';
  if (dbStatus === 3) dbStatusText = 'Disconnecting';

  res.status(dbStatus === 1 ? 200 : 503).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatusText,
      code: dbStatus
    },
    version: '1.0.0'
  });
});

export default router;
