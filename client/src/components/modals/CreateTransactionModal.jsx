import { useState } from 'react';
import { X, DollarSign, Loader } from 'lucide-react';
import useStore from '../../store/useStore';
import useToast from '../../store/useToast';

const CreateTransactionModal = ({ isOpen, onClose }) => {
  const { addTransaction } = useStore();
  const { addToast } = useToast();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    setLoading(true);
    try {
      await addTransaction({
        description,
        amount: Number(amount),
        type,
        category,
        date: new Date()
      });
      addToast('Transaction added successfully!');
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('other');
      onClose();
    } catch (error) {
      addToast('Failed to add transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[var(--surface-color)] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-[var(--border-color)] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="text-[var(--primary-color)]" size={20} />
            New Transaction
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-color)] transition-colors text-[var(--text-secondary)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Groceries"
              className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              >
                {type === 'expense' ? (
                  <>
                    <option value="housing">Housing</option>
                    <option value="food">Food</option>
                    <option value="transportation">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="salary">Salary</option>
                    <option value="freelance">Freelance</option>
                    <option value="investments">Investments</option>
                    <option value="other">Other</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !description || !amount}
              className="btn-primary flex items-center gap-2"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransactionModal;
