import express from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitDay,
  copyPreviousWeekHabits
} from '../controllers/habitController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getHabits)
  .post(protect, createHabit);

router.post('/copy-previous', protect, copyPreviousWeekHabits);

router.route('/:id')
  .put(protect, updateHabit)
  .delete(protect, deleteHabit);

router.put('/:id/toggle', protect, toggleHabitDay);

export default router;
