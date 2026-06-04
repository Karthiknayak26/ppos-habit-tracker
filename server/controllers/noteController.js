import Note from '../models/Note.js';

export const getNotes = async (req, res, next) => {
  try {
    if (req.user._id === 'mock_user_123') return res.json([]);
    const notes = await Note.find({ user: req.user._id }).sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    if (req.user._id === 'mock_user_123') return res.status(201).json(req.body);
    const note = await Note.create({ user: req.user._id, ...req.body });
    
    // Broadcast via socket if io is available
    if (req.app.get('io')) {
      req.app.get('io').to(req.user._id.toString()).emit('notes_updated');
    }
    
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    if (req.app.get('io')) {
      req.app.get('io').to(req.user._id.toString()).emit('notes_updated');
    }

    res.json(note);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }

    if (req.app.get('io')) {
      req.app.get('io').to(req.user._id.toString()).emit('notes_updated');
    }

    res.json({ message: 'Note removed' });
  } catch (error) {
    next(error);
  }
};
