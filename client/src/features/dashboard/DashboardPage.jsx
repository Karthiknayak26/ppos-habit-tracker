import OverallProgress from './OverallProgress';
import HabitTrackerWidget from './HabitTrackerWidget';
import useStore from '../../store/useStore';

const DashboardPage = () => {
  const { user } = useStore();

  return (
    <div className="h-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent)] bg-clip-text text-transparent inline-block">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">Let's make today productive.</p>
      </div>

      {/* 2 Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Overall Progress */}
        <div className="lg:col-span-5 h-full">
          <OverallProgress />
        </div>

        {/* Right Panel: Habit Tracker */}
        <div className="lg:col-span-7 h-full overflow-hidden">
          <HabitTrackerWidget />
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
