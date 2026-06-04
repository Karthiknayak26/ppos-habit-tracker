import { Check, Trash2 } from 'lucide-react';

const TaskItem = ({ task, onToggle, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-[var(--text-secondary)] bg-[var(--surface-color)]';
    }
  };

  return (
    <div className={`p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] group transition-all ${task.completed ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(task._id)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
            task.completed 
              ? 'bg-[var(--success)] border-[var(--success)] text-white' 
              : 'border-[var(--text-secondary)] hover:border-[var(--primary-color)]'
          }`}
        >
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--surface-color)] px-2 py-0.5 rounded-full capitalize">
              {task.category}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
          title="Delete Task"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
