import Transaction from '../models/Transaction.js';

export const getTransactions = async (req, res, next) => {
  try {
    if (req.user._id === 'mock_user_123') return res.json([]);
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    if (req.user._id === 'mock_user_123') return res.status(201).json(req.body);
    const transaction = await Transaction.create({ user: req.user._id, ...req.body });
    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    next(error);
  }
};
