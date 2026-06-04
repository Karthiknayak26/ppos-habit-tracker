import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Target, Flame, PieChart, Calendar as CalendarIcon } from 'lucide-react';
import useStore from '../../store/useStore';
import { calculateAnalytics, calculateCategoryDistribution } from '../../utils/progressEngine';
import api from '../../services/api';

const AnalyticsPage = () => {
  const { tasks, habits } = useStore();
  const [timeRange, setTimeRange] = useState('week'); // 'week' | 'month'
  
  // Real-time synchronization calculation
  const data = calculateAnalytics(tasks, habits);
  const categoryData = calculateCategoryDistribution(tasks);
  
  // Fetch real analytics from backend for the heatmap and other stats
  const [backendData, setBackendData] = useState(null);
  
  useEffect(() => {
    const fetchBackendAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setBackendData(res.data);
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      }
    };
    fetchBackendAnalytics();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-3 rounded-lg shadow-xl">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-[var(--primary-color)]" size={32} />
            Analytics & Insights
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Visualize your progress and consistency.</p>
        </div>
        <div className="flex bg-[var(--surface-color)] p-1 rounded-xl border border-[var(--border-color)]">
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${timeRange === 'week' ? 'bg-[var(--bg-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${timeRange === 'month' ? 'bg-[var(--bg-color)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-white'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-l-[var(--primary-color)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-2">
            <Target size={18} /> <h3 className="text-sm font-medium">Total Tasks Done</h3>
          </div>
          <p className="text-3xl font-bold">{data.totalTasksCompleted}</p>
        </div>
        
        <div className="glass-card p-5 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-2">
            <Flame size={18} className="text-orange-500" /> <h3 className="text-sm font-medium">Current Streak</h3>
          </div>
          <p className="text-3xl font-bold">{data.currentStreak} <span className="text-sm font-normal text-[var(--text-secondary)]">days</span></p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-2">
            <Award size={18} className="text-purple-500" /> <h3 className="text-sm font-medium">Longest Streak</h3>
          </div>
          <p className="text-3xl font-bold">{data.longestStreak} <span className="text-sm font-normal text-[var(--text-secondary)]">days</span></p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-[var(--success)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)] mb-2">
            <TrendingUp size={18} className="text-[var(--success)]" /> <h3 className="text-sm font-medium">Productivity Score</h3>
          </div>
          <p className="text-3xl font-bold">{data.productivityScore}<span className="text-lg text-[var(--text-secondary)]">/100</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Main Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
            {timeRange === 'week' ? 'Weekly Output' : 'Monthly Trend'}
            {timeRange === 'month' && <span className="text-xs font-normal text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded-full">+12% from last month</span>}
          </h2>
          <div className="h-[350px] w-full">
            {tasks.length === 0 && habits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-60">
                <TrendingUp size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">No data available yet</p>
                <p className="text-sm">Create tasks and habits to visualize your progress.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeRange === 'week' ? data.weeklyData : data.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="tasks" name="Tasks Completed" stroke="var(--primary-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
                  <Area type="monotone" dataKey="habits" name="Habits Checked" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorHabits)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Radar Chart */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <PieChart size={20} className="text-[var(--primary-color)]" />
            Category Performance
          </h2>
          {categoryData.length > 0 ? (
            <div className="flex-1 min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-primary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="Completed" dataKey="A" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.6} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)] opacity-50 min-h-[300px]">
              No task data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Heatmap Overview */}
      {timeRange === 'month' && (
        <div className="glass-card p-6 mt-2 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CalendarIcon size={20} className="text-[var(--primary-color)]" />
              Monthly Consistency Heatmap
            </h2>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-[var(--bg-color)] border border-[var(--border-color)]"></div>
              <div className="w-3 h-3 rounded-sm bg-[var(--primary-color)] opacity-40"></div>
              <div className="w-3 h-3 rounded-sm bg-[var(--primary-color)] opacity-70"></div>
              <div className="w-3 h-3 rounded-sm bg-[var(--primary-color)]"></div>
              <span>More</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {backendData?.heatmapData ? backendData.heatmapData.map((dayData, i) => {
              const count = dayData.count;
              let bgColor = 'bg-[var(--bg-color)] border border-[var(--border-color)]';
              
              if (count > 5) bgColor = 'bg-[var(--primary-color)] shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]';
              else if (count > 3) bgColor = 'bg-[var(--primary-color)] opacity-70';
              else if (count > 0) bgColor = 'bg-[var(--primary-color)] opacity-40';

              const dateObj = new Date(dayData.date);
              
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md ${bgColor} transition-colors hover:border-white cursor-pointer group relative`}
                >
                  <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[var(--surface-color)] text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-[var(--border-color)] z-10">
                    {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {count} actions
                  </div>
                </div>
              );
            }) : (
               <div className="col-span-7 text-center text-sm text-[var(--text-secondary)] py-4">Loading heatmap data...</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AnalyticsPage;
