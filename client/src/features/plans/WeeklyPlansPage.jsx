import { useState, useEffect } from 'react';
import { Target, Gift, Quote, Save, CheckCircle, BookOpen, Flag, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../../store/useStore';
import { getStartOfWeek } from '../../utils/dateUtils';

const WeeklyPlansPage = () => {
  const { currentPlan, fetchPlan, savePlan, selectedDate, setSelectedDate, loadingPlan } = useStore();
  
  const [formData, setFormData] = useState({
    focus: '',
    reward: '',
    affirmation: '',
    goals: '',
    notes: '',
    reflection: ''
  });
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan, selectedDate]);

  // Data Migration & Pre-fill
  useEffect(() => {
    if (currentPlan) {
      setFormData({
        focus: currentPlan.focus || '',
        reward: currentPlan.reward || '',
        affirmation: currentPlan.affirmation || '',
        goals: currentPlan.goals || '',
        notes: currentPlan.notes || '',
        reflection: currentPlan.reflection || ''
      });
    } else if (!loadingPlan) {
      // Check for legacy local storage data for migration
      const legacyDataStr = localStorage.getItem('ppos_weekly_focus');
      if (legacyDataStr) {
        try {
          const legacyData = JSON.parse(legacyDataStr);
          const migratedData = {
            focus: legacyData.focus || '',
            reward: legacyData.reward || '',
            affirmation: legacyData.affirmation || '',
            goals: '', notes: '', reflection: ''
          };
          setFormData(migratedData);
          // Automatically save to DB and clear local storage to complete migration
          savePlan(migratedData).then(() => {
            localStorage.removeItem('ppos_weekly_focus');
            showToast('Migrated old data to Database!');
          });
        } catch (e) {
          console.error('Migration failed', e);
        }
      } else {
        setFormData({ focus: '', reward: '', affirmation: '', goals: '', notes: '', reflection: '' });
      }
    }
  }, [currentPlan, loadingPlan, savePlan]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePlan(formData);
      showToast('Weekly plan saved!');
    } catch (error) {
      showToast('Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const startOfWeek = getStartOfWeek(selectedDate);
  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };
  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  // Generate history list (last 10 weeks)
  const historyList = Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i * 7));
    const monday = getStartOfWeek(d);
    return monday;
  });

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Compass className="text-[var(--primary-color)]" size={32} />
            Weekly Plans & Reflections
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Set intentions, track goals, and reflect on your week.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--surface-color)] p-2 rounded-xl border border-[var(--border-color)] relative">
          <button onClick={handlePrevWeek} className="p-2 hover:bg-[var(--bg-color)] rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold min-w-[120px] text-center">
            {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
            {new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button onClick={handleNextWeek} className="p-2 hover:bg-[var(--bg-color)] rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
          
          {toast && (
            <div className="absolute -top-14 right-0 bg-[var(--success)] text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap z-50">
              <CheckCircle size={16} />
              {toast}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar: History */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 sticky top-0 bg-[var(--bg-color)] z-10 py-2">Plan History</h3>
          {historyList.map((monday, i) => {
            const isSelected = startOfWeek.toDateString() === monday.toDateString();
            const sunday = new Date(monday);
            sunday.setDate(sunday.getDate() + 6);
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(monday)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  isSelected 
                    ? 'bg-[var(--surface-color)] border-[var(--primary-color)] shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' 
                    : 'bg-transparent border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-secondary)]'
                }`}
              >
                <div className={`font-bold text-sm ${isSelected ? 'text-[var(--primary-color)]' : ''}`}>
                  {monday.toLocaleDateString('en-US', { month: 'short' })} Week {Math.ceil(monday.getDate() / 7)}
                </div>
                <div className="text-xs mt-1 opacity-70">
                  {monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content: Forms */}
        <div className="flex-1 glass-card p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {loadingPlan && !currentPlan ? (
            <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)]">Loading plan...</div>
          ) : (
            <>
              {/* Intentions Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3">
                    <Target size={16} className="text-[var(--primary-color)]" /> Main Focus
                  </label>
                  <textarea
                    className="input-field min-h-[100px] resize-none"
                    value={formData.focus}
                    onChange={(e) => setFormData({...formData, focus: e.target.value})}
                    placeholder="What is the ONE thing you must accomplish this week?"
                  />
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3">
                      <Gift size={16} className="text-yellow-500" /> Reward
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.reward}
                      onChange={(e) => setFormData({...formData, reward: e.target.value})}
                      placeholder="How will you celebrate a successful week?"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold mb-3">
                      <Quote size={16} className="text-purple-500" /> Affirmation
                    </label>
                    <input
                      type="text"
                      className="input-field italic"
                      value={formData.affirmation}
                      onChange={(e) => setFormData({...formData, affirmation: e.target.value})}
                      placeholder="Your mantra for the week"
                    />
                  </div>
                </div>
              </div>

              {/* Expansion Row */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold mb-3 mt-4">
                  <Flag size={16} className="text-orange-500" /> Weekly Goals
                </label>
                <textarea
                  className="input-field min-h-[120px]"
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  placeholder="- Launch new feature\n- Go to gym 3 times\n- Read chapter 4"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3">
                    <BookOpen size={16} className="text-blue-500" /> Weekly Notes
                  </label>
                  <textarea
                    className="input-field min-h-[150px]"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Jot down important thoughts, links, or ideas for the week."
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3">
                    <Compass size={16} className="text-[var(--success)]" /> Weekly Reflection
                  </label>
                  <textarea
                    className="input-field min-h-[150px] bg-[var(--surface-color)]/30 border-[var(--success)]/30 focus:border-[var(--success)]"
                    value={formData.reflection}
                    onChange={(e) => setFormData({...formData, reflection: e.target.value})}
                    placeholder="End of week review: What went well? What could be improved?"
                  />
                </div>
              </div>

              {/* Save Footer */}
              <div className="mt-auto pt-6 border-t border-[var(--border-color)] flex justify-end">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 px-8"
                >
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlansPage;
