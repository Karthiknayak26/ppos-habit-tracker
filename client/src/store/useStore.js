import { create } from 'zustand';
import api from '../services/api';
import { getWeekNumber } from '../utils/dateUtils';

const initialDate = new Date();
const initialWeek = getWeekNumber(initialDate);

const useStore = create((set, get) => ({
  // --- GLOBALS ---
  selectedDate: initialDate,
  selectedWeek: initialWeek.weekNumber,
  selectedYear: initialWeek.year,
  setSelectedDate: (date) => {
    const { weekNumber, year } = getWeekNumber(date);
    set({ selectedDate: date, selectedWeek: weekNumber, selectedYear: year });
    get().fetchTasks();
    get().fetchHabits();
    get().fetchPlan();
  },

  // --- USER STATE ---
  user: null,
  setUser: (user) => set({ user }),
  
  // --- HABITS STATE ---
  habits: [],
  loadingHabits: false,
  fetchHabits: async () => {
    set({ loadingHabits: true });
    try {
      const { selectedWeek, selectedYear } = get();
      const res = await api.get(`/habits?weekNumber=${selectedWeek}&year=${selectedYear}`);
      set({ habits: res.data, loadingHabits: false });
    } catch (error) {
      console.error('Failed to fetch habits', error);
      set({ loadingHabits: false });
    }
  },
  toggleHabitDay: async (habitId, dayIndex) => {
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayKey = dayKeys[dayIndex];

    // Optimistic Update
    const currentHabits = get().habits;
    set({
      habits: currentHabits.map(h => {
        if (h._id === habitId) {
          const newWeekData = { ...h.weekData };
          newWeekData[dayKey] = !newWeekData[dayKey];
          return { ...h, weekData: newWeekData };
        }
        return h;
      })
    });
    
    // API Call
    try {
      await api.put(`/habits/${habitId}/toggle`, { day: dayKey });
    } catch (error) {
      // Revert on failure
      set({ habits: currentHabits });
      console.error('Failed to toggle habit', error);
    }
  },
  addHabit: async (habitData) => {
    try {
      const res = await api.post('/habits', habitData);
      set((state) => ({ habits: [...state.habits, res.data] }));
      return res.data;
    } catch (error) {
      console.error('Failed to add habit', error);
      throw error;
    }
  },
  deleteHabit: async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`);
      set((state) => ({ habits: state.habits.filter(h => h._id !== habitId) }));
    } catch (error) {
      console.error('Failed to delete habit', error);
      throw error;
    }
  },
  copyPreviousWeekHabits: async (fromWeek, fromYear) => {
    try {
      const { selectedWeek, selectedYear } = get();
      await api.post('/habits/copy-previous', {
        fromWeek,
        fromYear,
        toWeek: selectedWeek,
        toYear: selectedYear
      });
      get().fetchHabits();
    } catch (error) {
      console.error('Failed to copy previous habits', error);
      throw error;
    }
  },


  // --- TASKS STATE ---
  tasks: [],
  loadingTasks: false,
  fetchTasks: async () => {
    set({ loadingTasks: true });
    try {
      const { selectedWeek, selectedYear } = get();
      const res = await api.get(`/tasks?weekNumber=${selectedWeek}&year=${selectedYear}`);
      set({ tasks: res.data, loadingTasks: false });
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      set({ loadingTasks: false });
    }
  },
  toggleTask: async (taskId) => {
    // Optimistic Update
    const currentTasks = get().tasks;
    set({
      tasks: currentTasks.map(t => t._id === taskId ? { ...t, completed: !t.completed } : t)
    });
    
    // API Call
    try {
      await api.put(`/tasks/${taskId}/toggle`);
    } catch (error) {
      // Revert on failure
      set({ tasks: currentTasks });
      console.error('Failed to toggle task', error);
    }
  },
  addTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      set((state) => ({ tasks: [...state.tasks, res.data] }));
      return res.data;
    } catch (error) {
      console.error('Failed to add task', error);
      throw error;
    }
  },
  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      set((state) => ({ tasks: state.tasks.filter(t => t._id !== taskId) }));
    } catch (error) {
      console.error('Failed to delete task', error);
      throw error;
    }
  },
  copyPreviousWeekTasks: async (fromWeek, fromYear) => {
    try {
      const { selectedWeek, selectedYear } = get();
      await api.post('/tasks/copy-previous', {
        fromWeek,
        fromYear,
        toWeek: selectedWeek,
        toYear: selectedYear
      });
      get().fetchTasks();
    } catch (error) {
      console.error('Failed to copy previous tasks', error);
      throw error;
    }
  },


  // --- NOTES STATE ---
  notes: [],
  loadingNotes: false,
  fetchNotes: async () => {
    set({ loadingNotes: true });
    try {
      const res = await api.get('/notes');
      set({ notes: res.data, loadingNotes: false });
    } catch (error) {
      console.error('Failed to fetch notes', error);
      set({ loadingNotes: false });
    }
  },
  addNote: async (noteData) => {
    try {
      const res = await api.post('/notes', noteData);
      set((state) => ({ notes: [res.data, ...state.notes] }));
      return res.data;
    } catch (error) {
      console.error('Failed to add note', error);
      throw error;
    }
  },
  updateNote: async (noteId, noteData) => {
    try {
      const res = await api.put(`/notes/${noteId}`, noteData);
      set((state) => ({
        notes: state.notes.map(n => n._id === noteId ? res.data : n)
      }));
      return res.data;
    } catch (error) {
      console.error('Failed to update note', error);
      throw error;
    }
  },
  deleteNote: async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      set((state) => ({ notes: state.notes.filter(n => n._id !== noteId) }));
    } catch (error) {
      console.error('Failed to delete note', error);
      throw error;
    }
  },

  // --- FINANCE STATE ---
  transactions: [],
  loadingTransactions: false,
  fetchTransactions: async () => {
    set({ loadingTransactions: true });
    try {
      const res = await api.get('/finance');
      set({ transactions: res.data, loadingTransactions: false });
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      set({ loadingTransactions: false });
    }
  },
  addTransaction: async (transactionData) => {
    try {
      const res = await api.post('/finance', transactionData);
      set((state) => ({ transactions: [res.data, ...state.transactions] }));
      return res.data;
    } catch (error) {
      console.error('Failed to add transaction', error);
      throw error;
    }
  },
  deleteTransaction: async (id) => {
    try {
      await api.delete(`/finance/${id}`);
      set((state) => ({ transactions: state.transactions.filter(t => t._id !== id) }));
    } catch (error) {
      console.error('Failed to delete transaction', error);
      throw error;
    }
  },

  // --- WEEKLY PLANS STATE ---
  currentPlan: null,
  loadingPlan: false,
  fetchPlan: async () => {
    set({ loadingPlan: true });
    try {
      const { selectedWeek, selectedYear } = get();
      const res = await api.get(`/plans?weekNumber=${selectedWeek}&year=${selectedYear}`);
      set({ currentPlan: res.data, loadingPlan: false });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        set({ currentPlan: null }); // Expected if no plan created yet
      } else {
        console.error('Failed to fetch plan', error);
      }
      set({ loadingPlan: false });
    }
  },
  savePlan: async (planData) => {
    try {
      const { selectedWeek, selectedYear } = get();
      const res = await api.post('/plans', {
        ...planData,
        weekNumber: selectedWeek,
        year: selectedYear
      });
      set({ currentPlan: res.data });
      return res.data;
    } catch (error) {
      console.error('Failed to save plan', error);
      throw error;
    }
  },

  // --- REALTIME SYNC HELPER ---
  syncState: (entityType, data) => {
    set({ [entityType]: data });
  }
}));

export default useStore;
