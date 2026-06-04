import express from 'express';
import { getTransactions, createTransaction, deleteTransaction } from '../controllers/financeController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

router.route('/:id')
  .delete(protect, deleteTransaction);

export default router;
