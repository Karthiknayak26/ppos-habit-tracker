import cron from 'node-cron';
import Habit from '../models/Habit.js';
import User from '../models/User.js';

function getCurrentWeekNumber() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// Runs every Monday at 00:00 (Midnight)
export const startCronJobs = () => {
  cron.schedule('0 0 * * 1', async () => {
    console.log('[CRON] Starting Weekly Habit Rollover...');
    try {
      const currentWeek = getCurrentWeekNumber();
      const currentYear = new Date().getFullYear();
      
      // The week that just ended
      let previousWeek = currentWeek - 1;
      let previousYear = currentYear;
      if (previousWeek === 0) {
        previousWeek = 52; // Approximation, ISO weeks can have 53
        previousYear -= 1;
      }

      // Find all habits from the previous week
      const oldHabits = await Habit.find({ weekNumber: previousWeek, year: previousYear });
      
      console.log(`[CRON] Found ${oldHabits.length} habits from Week ${previousWeek} to rollover.`);

      const newHabitsToInsert = [];

      for (const habit of oldHabits) {
        // Check if habit already rolled over manually by the user
        const alreadyExists = await Habit.findOne({
          user: habit.user,
          name: habit.name,
          weekNumber: currentWeek,
          year: currentYear
        });

        if (!alreadyExists) {
          // Carry over the habit, resetting completion data but keeping the streak
          newHabitsToInsert.push({
            user: habit.user,
            name: habit.name,
            category: habit.category,
            icon: habit.icon,
            weekData: {
              mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false
            },
            weekNumber: currentWeek,
            year: currentYear,
            progress: 0,
            streak: {
              current: habit.streak.current,
              longest: habit.streak.longest
            }
          });
        }
      }

      if (newHabitsToInsert.length > 0) {
        await Habit.insertMany(newHabitsToInsert);
        console.log(`[CRON] Successfully rolled over ${newHabitsToInsert.length} habits to Week ${currentWeek}.`);
      } else {
        console.log('[CRON] No new habits needed rolling over.');
      }

    } catch (error) {
      console.error('[CRON] Error during habit rollover:', error);
    }
  });

  console.log('[CRON] Weekly Habit Rollover job scheduled.');
};
