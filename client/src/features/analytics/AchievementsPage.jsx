import { Medal, Star, Trophy, Zap, Crown, Target, Heart } from 'lucide-react';
import useStore from '../../store/useStore';
import { calculateHabitStreaks } from '../../utils/progressEngine';

const AchievementsPage = () => {
  const { tasks, habits } = useStore();

  // Compute metrics
  const completedTasks = tasks.filter(t => t.completed).length;
  
  // Calculate total habit checkmarks
  let totalHabitChecks = 0;
  habits.forEach(h => {
    if (h.weekData) {
      totalHabitChecks += Object.values(h.weekData).filter(Boolean).length;
    }
  });

  const { longestStreak } = calculateHabitStreaks(habits);

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first task', icon: Target, unlocked: completedTasks >= 1, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 2, title: 'Consistency is Key', description: 'Hit a 3-day streak', icon: Zap, unlocked: longestStreak >= 3, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 3, title: 'Habit Builder', description: 'Complete 10 habits', icon: Heart, unlocked: totalHabitChecks >= 10, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 4, title: 'Productivity Ninja', description: 'Complete 50 tasks', icon: Star, unlocked: completedTasks >= 50, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 5, title: 'Unstoppable', description: 'Hit a 7-day streak', icon: Medal, unlocked: longestStreak >= 7, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 6, title: 'The Architect', description: 'Create 20 tasks', icon: Crown, unlocked: tasks.length >= 20, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];
  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trophy className="text-[var(--primary-color)]" size={32} />
          Achievements
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Unlock badges by staying consistent.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {achievements.map((badge) => (
          <div 
            key={badge.id} 
            className={`glass-card p-6 flex flex-col items-center text-center transition-all ${badge.unlocked ? 'border-[var(--primary-color)]/30 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]' : 'opacity-60 grayscale'}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${badge.unlocked ? badge.bg : 'bg-[var(--surface-color)]'}`}>
              <badge.icon size={36} className={badge.unlocked ? badge.color : 'text-[var(--text-secondary)]'} />
            </div>
            
            <h3 className="font-bold text-lg mb-1">{badge.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{badge.description}</p>
            
            <div className="mt-4 pt-4 border-t border-[var(--border-color)] w-full">
              <span className={`text-xs font-bold uppercase tracking-wider ${badge.unlocked ? 'text-[var(--success)]' : 'text-[var(--text-secondary)]'}`}>
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsPage;
