import api from './api';

// --- 1. GET USER STATS ---
// (Returns empty placeholder data if  streaks are disabled)
export const fetchUserStats = async () => {
  const response = await api.get('/planner/stats');
  return response.data; 
};

// --- 2. GET ALL TASKS ---
export const fetchTasks = async () => {
  const response = await api.get('/planner');
  return response.data;
};

// --- 3. CREATE TASK ---
export const createTask = async (taskData) => {
  const response = await api.post('/planner', taskData);
  return response.data;
};

// --- 4. UPDATE TASK ---
export const updateTask = async (taskId, updates) => {
  const response = await api.put(`/planner/${taskId}`, updates);
  return response.data;
};

// --- 5. DELETE TASK ---
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/planner/${taskId}`);
  return response.data;
};

// --- 6. DELETE ALL TASKS (Helper) ---
// Useful for resetting the dashboard
export const clearAllTasks = async (tasks) => {
  if (!tasks || tasks.length === 0) return;
  const deletePromises = tasks.map(task => api.delete(`/planner/${task._id}`));
  await Promise.all(deletePromises);
};

// --- 7. TOGGLE HABIT ---
// (Kept for compatibility, serves as placeholder if disabled)
export const toggleHabit = async (habitId) => {
  const response = await api.post('/planner/habit/toggle', { habitId });
  return response.data;
};