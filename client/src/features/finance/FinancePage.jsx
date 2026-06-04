import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Plus, CreditCard, Trash2 } from 'lucide-react';
import useStore from '../../store/useStore';
import useToast from '../../store/useToast';
import CreateTransactionModal from '../../components/modals/CreateTransactionModal';

const FinancePage = () => {
  const { transactions, fetchTransactions, loadingTransactions, deleteTransaction } = useStore();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  if (loadingTransactions) return <div className="p-8 text-[var(--text-secondary)]">Loading finance...</div>;

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="text-[var(--primary-color)]" size={32} />
            Finance Tracker
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Keep an eye on your income and expenses.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-black font-bold py-2 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
        >
          <Plus size={20} /> Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Total Balance</h3>
          <p className="text-4xl font-bold">₹{balance.toFixed(2)}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-[var(--success)]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Income</h3>
            <div className="p-2 bg-[var(--success)]/10 rounded-lg text-[var(--success)]">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">₹{totalIncome.toFixed(2)}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Expenses</h3>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold">₹{totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-2xl p-6 mt-4 flex-1">
        <h2 className="text-xl font-bold mb-6">Recent Transactions</h2>
        
        <div className="space-y-4">
          {transactions.map(t => (
            <div key={t._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-[var(--bg-color)] border border-transparent hover:border-[var(--border-color)] transition-all group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-red-500/10 text-red-500'}`}>
                  {t.type === 'income' ? <ArrowUpRight size={20} /> : <CreditCard size={20} />}
                </div>
                <div>
                  <h4 className="font-bold">{t.description}</h4>
                  <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-lg font-bold ${t.type === 'income' ? 'text-[var(--success)]' : 'text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                </div>
                <button 
                  onClick={async () => {
                    try {
                      await deleteTransaction(t._id);
                      addToast('Transaction deleted', 'success');
                    } catch(e) {
                      addToast('Failed to delete', 'error');
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default FinancePage;
