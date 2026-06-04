import { Activity } from 'lucide-react';
import HabitTrackerWidget from '../dashboard/HabitTrackerWidget';

const HabitTrackerPage = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="text-[var(--primary-color)]" size={32} />
          Habit Tracker
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Build consistency and achieve your goals.</p>
      </div>

      <div className="flex-1 min-h-0">
        <HabitTrackerWidget />
      </div>
    </div>
  );
};

export default HabitTrackerPage;
