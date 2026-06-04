import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ProgressRing from '../../components/charts/ProgressRing';
import { CheckCircle, Clock } from 'lucide-react';
import useStore from '../../store/useStore';
import { calculateWeeklyProgress } from '../../utils/progressEngine';

const OverallProgress = () => {
  const { tasks, habits } = useStore();
  const { weeklyData, totalCompleted, totalTasks, completionRate } = calculateWeeklyProgress(tasks, habits);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-[var(--success)]">{`Completed: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-6">Overall Progress</h2>

      <div className="flex items-center justify-around mb-8">
        <ProgressRing progress={completionRate} size={140} strokeWidth={12} color="var(--success)" />
        
        <div className="space-y-4">
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-xl min-w-[140px]">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-1">
              <CheckCircle size={16} className="text-[var(--success)]" />
              Completed
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalCompleted}</p>
          </div>
          
          <div className="bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-xl min-w-[140px]">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-1">
              <Clock size={16} className="text-[var(--warning)]" />
              Pending
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{totalTasks - totalCompleted}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 mt-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Weekly Completion Rate</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: 'var(--bg-color)' }} content={<CustomTooltip />} />
              <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.completed === entry.total ? 'var(--success)' : 'var(--primary-color)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OverallProgress;
