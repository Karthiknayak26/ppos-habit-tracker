import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useStore from '../../store/useStore';

const CATEGORIES = ['work', 'personal', 'health', 'learning', 'finance', 'life'];
const PRIORITIES = [
  { value: 'low', label: 'Low Priority', color: 'bg-[var(--text-secondary)]' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

const CreateTaskModal = ({ isOpen, onClose, defaultDay = 0 }) => {
  const { addTask, selectedWeek, selectedYear } = useStore();
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'work',
    priority: 'medium',
    day: defaultDay
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Synchronize the day state when the modal opens with a different defaultDay
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, day: defaultDay }));
    }
  }, [isOpen, defaultDay]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await addTask({
        ...formData,
        weekNumber: selectedWeek,
        year: selectedYear
      });
      setFormData({ ...formData, title: '' }); // reset title but keep preferences
      onClose();
    } catch (err) {
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold">Create New Task</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-5">
          {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Task Title</label>
            <input 
              type="text" 
              placeholder="e.g. Finish quarterly report"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Priority</label>
              <div className="flex flex-col gap-2">
                {PRIORITIES.map(p => (
                  <button 
                    key={p.value} 
                    type="button"
                    onClick={() => setFormData({...formData, priority: p.value})}
                    className={`px-3 py-2 text-left rounded-lg text-sm font-medium transition-all border flex items-center gap-2 ${
                      formData.priority === p.value 
                        ? 'bg-[var(--bg-color)] border-[var(--primary-color)] text-white' 
                        : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${p.color}`}></span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    type="button"
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`px-3 py-2 text-left rounded-lg text-sm font-medium capitalize transition-all border ${
                      formData.category === cat 
                        ? 'bg-[var(--bg-color)] border-[var(--primary-color)] text-white' 
                        : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-color)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-color)] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-bold bg-[var(--primary-color)] text-black hover:bg-[var(--primary-hover)] hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
