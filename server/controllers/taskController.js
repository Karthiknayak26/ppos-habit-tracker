import Task from '../models/Task.js';

// Helper function
function getCurrentWeekNumber() {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

// @desc    Get user tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    if (req.user._id === 'mock_user_123') return res.json([]);
    
    const { weekNumber, year, day, category } = req.query;
    
    const query = { user: req.user._id };
    if (weekNumber) query.weekNumber = parseInt(weekNumber);
    if (year) query.year = parseInt(year);
    if (day !== undefined) query.day = parseInt(day);
    if (category) query.category = category;

    const tasks = await Task.find(query).sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, day, date, priority, category, weekNumber, year } = req.body;

    // Get highest order for the specific day to append to the end
    const lastTask = await Task.findOne({ user: req.user._id, day, weekNumber: weekNumber || getCurrentWeekNumber() }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = new Task({
      user: req.user._id,
      title,
      description,
      day,
      date,
      priority,
      category,
      order,
      weekNumber: weekNumber || getCurrentWeekNumber(),
      year: year || new Date().getFullYear(),
    });

    const createdTask = await task.save();
    req.app.get('io').to(req.user._id.toString()).emit('tasks_updated');
    res.status(201).json(createdTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (task.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
      }

      task.title = req.body.title || task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.priority = req.body.priority || task.priority;
      task.category = req.body.category || task.category;
      task.day = req.body.day !== undefined ? req.body.day : task.day;
      
      const updatedTask = await task.save();
      req.app.get('io').to(req.user._id.toString()).emit('tasks_updated');
      res.json(updatedTask);
    } else {
      res.status(404);
      throw new Error('Task not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task completion status
// @route   PUT /api/tasks/:id/toggle
// @access  Private
export const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (task.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
      }

      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date() : null;
      
      const updatedTask = await task.save();
      req.app.get('io').to(req.user._id.toString()).emit('tasks_updated');
      res.json(updatedTask);
    } else {
      res.status(404);
      throw new Error('Task not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder tasks (drag and drop)
// @route   PUT /api/tasks/reorder
// @access  Private
export const reorderTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body; // Array of { id, order, day }
    
    // In a production app, do this in a bulkWrite transaction
    for (let i = 0; i < tasks.length; i++) {
       await Task.updateOne(
         { _id: tasks[i].id, user: req.user._id },
         { $set: { order: tasks[i].order, day: tasks[i].day } }
       );
    }
    
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (task) {
      if (task.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
      }

      await task.deleteOne();
      res.json({ message: 'Task removed' });
    } else {
      res.status(404);
      throw new Error('Task not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Copy tasks from a previous week to a target week
// @route   POST /api/tasks/copy-previous
// @access  Private
export const copyPreviousWeekTasks = async (req, res, next) => {
  try {
    const { fromWeek, fromYear, toWeek, toYear } = req.body;

    if (!fromWeek || !fromYear || !toWeek || !toYear) {
      res.status(400);
      throw new Error('Missing required fields');
    }

    const previousTasks = await Task.find({
      user: req.user._id,
      weekNumber: parseInt(fromWeek),
      year: parseInt(fromYear)
    });

    if (!previousTasks || previousTasks.length === 0) {
      return res.json({ message: 'No tasks to copy' });
    }

    const newTasks = previousTasks.map(task => ({
      user: req.user._id,
      title: task.title,
      description: task.description,
      day: task.day,
      date: null, // Reset specific date
      priority: task.priority,
      category: task.category,
      order: task.order,
      weekNumber: parseInt(toWeek),
      year: parseInt(toYear),
      completed: false,
      completedAt: null
    }));

    await Task.insertMany(newTasks);
    
    req.app.get('io').to(req.user._id.toString()).emit('tasks_updated');
    res.status(201).json({ message: 'Tasks copied successfully', count: newTasks.length });
  } catch (error) {
    next(error);
  }
};
