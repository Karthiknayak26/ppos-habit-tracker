import axios from 'axios';

// Offline Queue Management
const OFFLINE_QUEUE_KEY = 'ppos_offline_queue';

const getOfflineQueue = () => JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
const addToOfflineQueue = (request) => {
  const queue = getOfflineQueue();
  queue.push(request);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Important for sending/receiving HTTP-only cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to network disconnection
    if (!navigator.onLine || error.message === 'Network Error') {
      const { config } = error;
      // Only queue mutating requests
      if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
        addToOfflineQueue({
          url: config.url,
          method: config.method,
          data: config.data,
          headers: config.headers
        });
        console.warn('Network offline. Request queued for background sync.');
        // Return a mock success response so the optimistic UI doesn't crash
        return Promise.resolve({ data: { offline: true } });
      }
    }

    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Background Sync on Reconnect
window.addEventListener('online', async () => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  console.log(`Internet restored. Syncing ${queue.length} background requests...`);
  localStorage.setItem(OFFLINE_QUEUE_KEY, '[]'); // Clear queue

  for (const req of queue) {
    try {
      await api.request({
        url: req.url,
        method: req.method,
        data: req.data ? JSON.parse(req.data) : undefined,
      });
    } catch (err) {
      console.error('Failed to sync queued request:', err);
    }
  }
});

export default api;
