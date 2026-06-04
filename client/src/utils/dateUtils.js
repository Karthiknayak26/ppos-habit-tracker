/**
 * Standardized Date Utilities for Frontend
 */

/**
 * Calculates the ISO week number and year for a given Date object.
 * This matches the backend calculation identically.
 * @param {Date} d - The date to calculate for
 * @returns {{ weekNumber: number, year: number }}
 */
export const getWeekNumber = (d) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return {
    weekNumber: weekNo,
    year: date.getUTCFullYear()
  };
};

/**
 * Returns the Monday (start) of the week for a given Date.
 */
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
};
