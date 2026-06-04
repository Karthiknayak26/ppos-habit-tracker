/**
 * Progress Calculation Engine
 * Pure functions to derive analytics data from raw tasks and habits
 */

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const calculateWeeklyProgress = (tasks, habits) => {
  // Initialize data structure for Recharts BarChart
  const weeklyData = daysOfWeek.map((dayName, index) => ({
    day: dayName,
    completed: 0,
    total: 0
  }));

  let totalCompleted = 0;
  let totalTasks = 0;

  // Tally Tasks
  tasks.forEach(task => {
    if (task.day >= 0 && task.day <= 6) {
      weeklyData[task.day].total += 1;
      totalTasks += 1;
      if (task.completed) {
        weeklyData[task.day].completed += 1;
        totalCompleted += 1;
      }
    }
  });

  // Tally Habits
  habits.forEach(habit => {
    if (habit.weekData) {
      for (let i = 0; i < 7; i++) {
        weeklyData[i].total += 1;
        totalTasks += 1;
        if (habit.weekData[dayKeys[i]]) {
          weeklyData[i].completed += 1;
          totalCompleted += 1;
        }
      }
    }
  });

  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return {
    weeklyData,
    totalCompleted,
    totalTasks,
    completionRate
  };
};

export const calculateCategoryDistribution = (tasks) => {
  const categoryCounts = {};
  
  tasks.forEach(task => {
    if (!categoryCounts[task.category]) {
      categoryCounts[task.category] = { total: 0, completed: 0 };
    }
    categoryCounts[task.category].total += 1;
    if (task.completed) categoryCounts[task.category].completed += 1;
  });

  // Format for Recharts RadarChart
  return Object.keys(categoryCounts).map(cat => ({
    subject: cat.charAt(0).toUpperCase() + cat.slice(1),
    A: categoryCounts[cat].completed,
    fullMark: categoryCounts[cat].total > 0 ? categoryCounts[cat].total : 1 // prevent divide by zero visually
  }));
};

export const calculateHabitStreaks = (habits) => {
  let longestStreak = 0;
  let bestHabit = 'None';

  habits.forEach(habit => {
    let currentStreak = 0;
    if (habit.weekData) {
      // Just a simple streak calculator for the current week for MVP
      for (let i = 0; i < 7; i++) {
        if (habit.weekData[dayKeys[i]]) currentStreak++;
        else currentStreak = 0;
        
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          bestHabit = habit.name;
        }
      }
    }
  });

  return { longestStreak, bestHabit };
};

export const calculateAnalytics = (tasks, habits) => {
  const { totalCompleted, totalTasks, weeklyData } = calculateWeeklyProgress(tasks, habits);
  const { longestStreak } = calculateHabitStreaks(habits);

  const formattedWeeklyData = weeklyData.map(d => ({
    name: d.day,
    tasks: tasks.filter(t => t.day === daysOfWeek.indexOf(d.day) && t.completed).length,
    habits: habits.filter(h => h.weekData && h.weekData[dayKeys[daysOfWeek.indexOf(d.day)]]).length
  }));

  // Generate 4-week monthly mock projection until DB stores historical weeks
  const monthlyData = [
    { name: 'Week 1', tasks: Math.round(formattedWeeklyData.reduce((acc, curr) => acc + curr.tasks, 0) * 0.8), habits: Math.round(habits.length * 4) },
    { name: 'Week 2', tasks: Math.round(formattedWeeklyData.reduce((acc, curr) => acc + curr.tasks, 0) * 1.1), habits: Math.round(habits.length * 5) },
    { name: 'Week 3', tasks: Math.round(formattedWeeklyData.reduce((acc, curr) => acc + curr.tasks, 0) * 0.9), habits: Math.round(habits.length * 3) },
    { name: 'Week 4', tasks: formattedWeeklyData.reduce((acc, curr) => acc + curr.tasks, 0), habits: formattedWeeklyData.reduce((acc, curr) => acc + curr.habits, 0) }
  ];

  return {
    totalTasksCompleted: tasks.filter(t => t.completed).length,
    currentStreak: longestStreak, // simplified for MVP
    longestStreak,
    productivityScore: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    weeklyData: formattedWeeklyData,
    monthlyData
  };
};
