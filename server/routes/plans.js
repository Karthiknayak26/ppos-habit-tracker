import express from 'express';
import { getPlan, upsertPlan } from '../controllers/planController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getPlan)
  .post(protect, upsertPlan);

export default router;
