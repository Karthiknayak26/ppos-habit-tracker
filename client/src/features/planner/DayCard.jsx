import TaskItem from './TaskItem';
import { Plus, CopyRight } from 'lucide-react';
import ProgressRing from '../../components/charts/ProgressRing';

const DayCard = ({ dayName, dateString, isToday, tasks, onToggleTask, onDeleteTask, onAddTask, onCopyToNextDay }) => {
  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className={`flex flex-col h-full rounded-2xl border ${isToday ? 'border-[var(--primary-color)] shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] bg-[var(--surface-color)]' : 'border-[var(--border-color)] bg-[var(--surface-color)]/50'}`}>
      
      {/* Header */}
      <div className={`p-4 border-b border-[var(--border-color)] flex items-center justify-between ${isToday ? 'bg-[var(--primary-color)]/5 rounded-t-2xl' : ''}`}>
        <div>
          <h3 className={`font-bold text-lg ${isToday ? 'text-[var(--primary-color)]' : ''}`}>{dayName}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{dateString}</p>
        </div>
        <div className="flex items-center gap-2">
          {tasks.length > 0 && onCopyToNextDay && (
            <button 
              onClick={onCopyToNextDay}
              className="p-1.5 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
              title="Copy to next day"
            >
              <CopyRight size={18} />
            </button>
          )}
          <div className="w-10 h-10">
            {tasks.length > 0 && (
              <ProgressRing progress={progress} size={40} strokeWidth={4} />
            )}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[300px]">
        {tasks.map(task => (
          <TaskItem key={task._id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
        ))}
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
            <span className="text-sm">No tasks</span>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-3 border-t border-[var(--border-color)]">
        <button 
          onClick={onAddTask}
          className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors border border-dashed border-[var(--border-color)] hover:border-[var(--primary-color)]"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

    </div>
  );
};

export default DayCard;
