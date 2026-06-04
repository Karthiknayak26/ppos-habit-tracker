import { useEffect, useState } from 'react';
import { Plus, Award, Activity, Check, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useStore from '../../store/useStore';
import CreateHabitModal from '../../components/modals/CreateHabitModal';

const HabitTrackerWidget = () => {
  const { habits, fetchHabits, toggleHabitDay, loadingHabits, deleteHabit } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const getBadgeColor = (progress) => {
    if (progress === 100) return 'text-yellow-400';
    if (progress >= 70) return 'text-gray-300';
    if (progress >= 40) return 'text-amber-600';
    return 'text-[var(--border-color)]';
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-[var(--primary-color)]" size={24} />
            Habits Overview
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">This week's consistency</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="p-2 hover:bg-[var(--bg-color)] rounded-lg transition-colors border border-dashed border-[var(--border-color)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] text-[var(--text-secondary)]"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-x-auto min-h-0">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th className="pb-4 font-medium text-[var(--text-secondary)] text-sm">Habit</th>
              <th className="pb-4 font-medium text-[var(--text-secondary)] text-sm">Days</th>
              <th className="pb-4 font-medium text-[var(--text-secondary)] text-sm text-right w-16">Progress</th>
            </tr>
          </thead>
          <tbody>
            {loadingHabits ? (
              <tr>
                <td colSpan="3" className="py-8 text-center text-[var(--text-secondary)]">Loading habits...</td>
              </tr>
            ) : habits.map((habit) => {
              const weekDataValues = habit.weekData ? dayKeys.map(key => habit.weekData[key]) : Array(7).fill(false);
              const completedCount = weekDataValues.filter(Boolean).length;
              const progress = Math.round((completedCount / 7) * 100);
              
              return (
                <tr key={habit._id} className="border-t border-[var(--border-color)] group hover:bg-[var(--bg-color)] transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[var(--surface-color)] rounded-lg text-[var(--primary-color)]">
                        <Activity size={16} />
                      </div>
                      <span className="font-medium text-sm whitespace-nowrap">{habit.name}</span>
                    </div>
                  </td>
                  
                  <td className="py-3 w-48">
                    <div className="flex gap-2">
                      {daysOfWeek.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => toggleHabitDay(habit._id, i)}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-300 ${
                            habit.weekData && habit.weekData[dayKeys[i]]
                              ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-black shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]'
                              : 'border-[var(--border-color)] text-transparent hover:border-[var(--text-secondary)]'
                          }`}
                        >
                          <motion.div
                            initial={false}
                            animate={{ scale: habit.weekData && habit.weekData[dayKeys[i]] ? 1 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <Check size={14} strokeWidth={3} className="text-black" />
                          </motion.div>
                        </button>
                      ))}
                    </div>
                  </td>
                  
                  <td className="py-3 pr-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-sm">{progress}%</span>
                      <Award size={16} className={`${getBadgeColor(progress)} ${progress === 100 ? 'drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : ''}`} />
                      <button 
                        onClick={() => deleteHabit(habit._id)}
                        className="p-1.5 ml-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Habit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {!loadingHabits && habits.length === 0 && (
              <tr>
                <td colSpan="3" className="py-12 text-center text-[var(--text-secondary)]">
                  <div className="flex flex-col items-center gap-3">
                    <Activity size={32} className="opacity-20" />
                    <p>No habits created yet.</p>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-2 text-sm text-[var(--primary-color)] hover:underline"
                    >
                      Create your first habit
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CreateHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default HabitTrackerWidget;
