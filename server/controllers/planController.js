import WeeklyPlan from '../models/WeeklyPlan.js';

// @desc    Get weekly plan by weekNumber and year
// @route   GET /api/plans
// @access  Private
export const getPlan = async (req, res, next) => {
  try {
    const { weekNumber, year } = req.query;
    
    if (!weekNumber || !year) {
      res.status(400);
      throw new Error('Please provide weekNumber and year query parameters');
    }

    const plan = await WeeklyPlan.findOne({
      user: req.user._id,
      weekNumber: parseInt(weekNumber),
      year: parseInt(year)
    });

    if (plan) {
      res.json(plan);
    } else {
      res.status(404).json({ message: 'No plan found for this week' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update weekly plan
// @route   POST /api/plans
// @access  Private
export const upsertPlan = async (req, res, next) => {
  try {
    const { weekNumber, year, focus, reward, affirmation, notes, goals, reflection } = req.body;

    if (!weekNumber || !year) {
      res.status(400);
      throw new Error('Please provide weekNumber and year');
    }

    // Upsert operation
    const plan = await WeeklyPlan.findOneAndUpdate(
      { 
        user: req.user._id, 
        weekNumber: parseInt(weekNumber), 
        year: parseInt(year) 
      },
      {
        user: req.user._id,
        weekNumber,
        year,
        focus: focus !== undefined ? focus : '',
        reward: reward !== undefined ? reward : '',
        affirmation: affirmation !== undefined ? affirmation : '',
        notes: notes !== undefined ? notes : '',
        goals: goals !== undefined ? goals : '',
        reflection: reflection !== undefined ? reflection : ''
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(plan);
  } catch (error) {
    next(error);
  }
};
