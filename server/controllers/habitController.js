import Habit from '../models/Habit.js';

// @desc    Get user habits for a specific week
// @route   GET /api/habits
// @access  Private
export const getHabits = async (req, res, next) => {
  try {
    if (req.user._id === 'mock_user_123') return res.json([]);
    
    const { weekNumber, year } = req.query;
    
    // If weekNumber and year are provided, filter by them, else return all
    const query = { user: req.user._id };
    if (weekNumber) query.weekNumber = parseInt(weekNumber);
    if (year) query.year = parseInt(year);

    const habits = await Habit.find(query).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
export const createHabit = async (req, res, next) => {
  try {
    const { name, category, icon, weekNumber, year } = req.body;

    const habit = await Habit.create({
      user: req.user._id,
      name,
      category,
      icon,
      weekNumber: weekNumber || getCurrentWeekNumber(),
      year: year || new Date().getFullYear(),
    });

    req.app.get('io').to(req.user._id.toString()).emit('habits_updated');
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a habit
// @route   PUT /api/habits/:id
// @access  Private
export const updateHabit = async (req, res, next) => {
  try {
    const { name, category, icon } = req.body;

    const habit = await Habit.findById(req.params.id);

    if (habit) {
      if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
      }

      habit.name = name || habit.name;
      habit.category = category || habit.category;
      habit.icon = icon || habit.icon;

      const updatedHabit = await habit.save();
      req.app.get('io').to(req.user._id.toString()).emit('habits_updated');
      res.json(updatedHabit);
    } else {
      res.status(404);
      throw new Error('Habit not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle a day's completion status
// @route   PUT /api/habits/:id/toggle
// @access  Private
export const toggleHabitDay = async (req, res, next) => {
  try {
    const { day } = req.body; // 'mon', 'tue', etc.

    const habit = await Habit.findById(req.params.id);

    if (habit) {
      if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
      }

      if (habit.weekData[day] !== undefined) {
        habit.weekData[day] = !habit.weekData[day];
        
        // Basic streak logic (this would be more complex in production to carry over weeks)
        if(habit.weekData[day]) {
           habit.streak.current += 1;
           if(habit.streak.current > habit.streak.longest) {
             habit.streak.longest = habit.streak.current;
           }
        } else {
           // We'll reset current streak for now, though a real system needs date checks
           habit.streak.current = 0;
        }

        const updatedHabit = await habit.save();
        res.json(updatedHabit);
      } else {
        res.status(400);
        throw new Error('Invalid day');
      }
    } else {
      res.status(404);
      throw new Error('Habit not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a habit
// @route   DELETE /api/habits/:id
// @access  Private
export const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (habit) {
      if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
      }

      await habit.deleteOne();
      res.json({ message: 'Habit removed' });
    } else {
      res.status(404);
      throw new Error('Habit not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Copy habits from a previous week to a target week
// @route   POST /api/habits/copy-previous
// @access  Private
export const copyPreviousWeekHabits = async (req, res, next) => {
  try {
    const { fromWeek, fromYear, toWeek, toYear } = req.body;

    if (!fromWeek || !fromYear || !toWeek || !toYear) {
      res.status(400);
      throw new Error('Missing required fields');
    }

    const previousHabits = await Habit.find({
      user: req.user._id,
      weekNumber: parseInt(fromWeek),
      year: parseInt(fromYear)
    });

    if (!previousHabits || previousHabits.length === 0) {
      return res.json({ message: 'No habits to copy' });
    }

    const newHabits = previousHabits.map(habit => ({
      user: req.user._id,
      name: habit.name,
      category: habit.category,
      icon: habit.icon,
      weekData: {
        mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false
      },
      progress: 0,
      streak: {
        current: habit.streak.current,
        longest: habit.streak.longest
      },
      weekNumber: parseInt(toWeek),
      year: parseInt(toYear)
    }));

    await Habit.insertMany(newHabits);
    
    req.app.get('io').to(req.user._id.toString()).emit('habits_updated');
    res.status(201).json({ message: 'Habits copied successfully', count: newHabits.length });
  } catch (error) {
    next(error);
  }
};

// Helper function
function getCurrentWeekNumber() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}
