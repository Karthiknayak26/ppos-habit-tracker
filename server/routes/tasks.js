import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  reorderTasks
} from '../controllers/taskController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.put('/reorder', protect, reorderTasks);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.put('/:id/toggle', protect, toggleTask);

export default router;
