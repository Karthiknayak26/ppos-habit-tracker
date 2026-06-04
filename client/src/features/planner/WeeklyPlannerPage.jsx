import { useEffect, useState } from 'react';
import DayCard from './DayCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../../store/useStore';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import { getStartOfWeek } from '../../utils/dateUtils';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const WeeklyPlannerPage = () => {
  const { tasks, fetchTasks, toggleTask, deleteTask, loadingTasks, selectedDate, setSelectedDate } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, selectedDate]);

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // 0 = Mon, 6 = Sun
  
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

  const handleOpenModal = (dayIndex) => {
    setSelectedDayIndex(dayIndex);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarIcon className="text-[var(--primary-color)]" size={32} />
            Weekly Routine Planner
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Organize your recurring weekly tasks and routines.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--surface-color)] p-2 rounded-xl border border-[var(--border-color)]">
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
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="flex-1 min-h-0 overflow-x-auto pb-4">
        {loadingTasks ? (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">Loading tasks...</div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-4 h-full xl:min-w-[1200px]">
            {daysOfWeek.map((dayName, index) => {
              const dayTasks = tasks.filter(t => t.day === index);
              
              // Calculate actual date for this column
              const columnDate = new Date(startOfWeek);
              columnDate.setDate(startOfWeek.getDate() + index);
              
              return (
              <div key={index} className="flex-1 min-w-[280px]">
                <DayCard 
                  dayName={dayName}
                  dateString={columnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  isToday={new Date().toDateString() === columnDate.toDateString()}
                  tasks={dayTasks}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onAddTask={() => handleOpenModal(index)}
                />
              </div>
            );
          })}
        </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultDay={selectedDayIndex} 
      />
    </div>
  );
};

export default WeeklyPlannerPage;
