import { useState } from 'react';
import { X, Activity, Droplet, Dumbbell, Book, Moon, Sun, Coffee } from 'lucide-react';
import useStore from '../../store/useStore';

const ICONS = [
  { name: 'Activity', component: Activity },
  { name: 'Droplet', component: Droplet },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Book', component: Book },
  { name: 'Moon', component: Moon },
  { name: 'Sun', component: Sun },
  { name: 'Coffee', component: Coffee }
];

const CATEGORIES = ['health', 'work', 'personal', 'learning', 'financial'];

const CreateHabitModal = ({ isOpen, onClose }) => {
  const { addHabit, selectedWeek, selectedYear } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'health',
    icon: 'Activity'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await addHabit({
        ...formData,
        weekNumber: selectedWeek,
        year: selectedYear
      });
      setFormData({ name: '', category: 'health', icon: 'Activity' }); // reset
      onClose();
    } catch (err) {
      setError('Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold">Create New Habit</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6">
          {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Habit Name</label>
            <input 
              type="text" 
              placeholder="e.g. Drink 2L of Water"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border ${
                    formData.category === cat 
                      ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)]' 
                      : 'bg-[var(--bg-color)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--primary-color)] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Icon</label>
            <div className="flex flex-wrap gap-3">
              {ICONS.map(iconObj => {
                const IconComponent = iconObj.component;
                return (
                  <button 
                    key={iconObj.name} 
                    type="button"
                    onClick={() => setFormData({...formData, icon: iconObj.name})}
                    className={`p-3 rounded-xl transition-all border ${
                      formData.icon === iconObj.name
                        ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)] border-[var(--primary-color)]' 
                        : 'bg-[var(--bg-color)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-white'
                    }`}
                  >
                    <IconComponent size={24} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
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
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHabitModal;
