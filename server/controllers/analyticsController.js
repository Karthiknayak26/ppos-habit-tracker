import Task from '../models/Task.js';
import Habit from '../models/Habit.js';
import mongoose from 'mongoose';

// Helper
function getWeekNumberForDate(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
}

function getCurrentWeekNumber() {
    return getWeekNumberForDate(new Date());
}

// @desc    Get user analytics and stats
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Total Tasks Completed (All-time archive)
    const totalTasksCompleted = await Task.countDocuments({ user: userId, completed: true });
    
    // 2. Streaks (Calculate from all habits)
    const allHabits = await Habit.find({ user: userId });
    let currentStreak = 0;
    let longestStreak = 0;
    
    allHabits.forEach(habit => {
      if (habit.streak.current > currentStreak) currentStreak = habit.streak.current;
      if (habit.streak.longest > longestStreak) longestStreak = habit.streak.longest;
    });

    // 3. Weekly Data Aggregation (Current Week)
    const currentWeek = getCurrentWeekNumber();
    const currentYear = new Date().getFullYear();

    const weekTasks = await Task.find({ user: userId, weekNumber: currentWeek, year: currentYear });
    const weekHabits = await Habit.find({ user: userId, weekNumber: currentWeek, year: currentYear });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const keys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    const weeklyData = days.map((dayName, index) => {
      const dayTasks = weekTasks.filter(t => t.day === index);
      const completedTasksCount = dayTasks.filter(t => t.completed).length;

      const dayKey = keys[index];
      const completedHabitsCount = weekHabits.filter(h => h.weekData[dayKey] === true).length;

      return {
        name: dayName,
        tasks: completedTasksCount,
        habits: completedHabitsCount
      };
    });

    // 4. Productivity Score
    const totalTasksEver = await Task.countDocuments({ user: userId });
    const productivityScore = totalTasksEver === 0 ? 0 : Math.round((totalTasksCompleted / totalTasksEver) * 100);

    // 5. Heatmap Data (Last 30 days)
    const heatmapData = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Fetch all tasks and habits from the last 5 weeks to cover 30 days
    const recentWeekNumberStart = currentWeek - 5 > 0 ? currentWeek - 5 : 1; 
    const allRecentTasks = await Task.find({ user: userId, weekNumber: { $gte: recentWeekNumberStart } });
    const allRecentHabits = await Habit.find({ user: userId, weekNumber: { $gte: recentWeekNumberStart } });

    for (let i = 29; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      
      const targetWeek = getWeekNumberForDate(targetDate);
      const targetYear = targetDate.getFullYear();
      
      // Convert Sunday (0) to 6, Monday (1) to 0
      let targetDayIndex = targetDate.getDay() - 1;
      if (targetDayIndex === -1) targetDayIndex = 6; 
      
      const dayKey = keys[targetDayIndex];

      const tasksOnDay = allRecentTasks.filter(t => t.weekNumber === targetWeek && t.year === targetYear && t.day === targetDayIndex && t.completed);
      const habitsOnDay = allRecentHabits.filter(h => h.weekNumber === targetWeek && h.year === targetYear && h.weekData[dayKey] === true);
      
      const intensityCount = tasksOnDay.length + habitsOnDay.length;
      
      heatmapData.push({
        date: targetDate.toISOString(),
        count: intensityCount
      });
    }

    // Send a structured response
    res.json({
      totalTasksCompleted,
      currentStreak,
      longestStreak,
      productivityScore,
      weeklyData,
      heatmapData
    });
  } catch (error) {
    next(error);
  }
};
