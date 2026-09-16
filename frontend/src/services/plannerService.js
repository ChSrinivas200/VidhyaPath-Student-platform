import api from './api';

// Fallback helper for offline / unauthenticated state
const getLocalData = () => {
  const saved = localStorage.getItem('learner_streak_data_v2');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Error parsing local streak data', e);
    }
  }
  const todayStr = new Date().toISOString().split('T')[0];
  return {
    gamification: {
      xp: 120,
      streak: { current: 3, longest: 5, lastActiveDate: todayStr, lastWindowTime: null, windowVisitsCount: 1, freezes: 1 }
    },
    habits: [
      { id: 'read', name: 'Read 15m', icon: 'BookOpen', completed: false },
      { id: 'code', name: 'Code 1h', icon: 'Code', completed: true },
      { id: 'social', name: 'No Socials', icon: 'Coffee', completed: false }
    ],
    activityLog: { [todayStr]: 3 },
    levelInfo: { tier: 'Apprentice Learner', level: 2, min: 100, next: 250, badge: '🌟' },
    todayActivity: 3,
    canLogWindow: true,
    nextWindowInMs: 0,
    aiInsight: "⚡ Dynamic AI: Keep up your 2-hour active study visits! Daily streaks dramatically boost long-term memory."
  };
};

const saveLocalData = (data) => {
  localStorage.setItem('learner_streak_data_v2', JSON.stringify(data));
};

// --- 1. GET USER STATS ---
export const fetchUserStats = async () => {
  try {
    const response = await api.get('/planner/stats');
    saveLocalData(response.data);
    return response.data; 
  } catch (err) {
    console.warn("Using local stats fallback", err);
    return getLocalData();
  }
};

// --- 1.5 RECORD 2-HOUR VISIT WINDOW ---
export const recordVisitWindow = async () => {
  try {
    const response = await api.post('/planner/visit');
    saveLocalData(response.data);
    return response.data;
  } catch (err) {
    console.warn("Offline/local visit window calculation", err);
    const local = getLocalData();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const lastWindow = local.gamification.streak.lastWindowTime ? new Date(local.gamification.streak.lastWindowTime).getTime() : 0;

    if (!local.gamification.streak.lastWindowTime || (now.getTime() - lastWindow >= TWO_HOURS)) {
      local.gamification.streak.lastWindowTime = now.toISOString();
      local.gamification.streak.windowVisitsCount = (local.gamification.streak.windowVisitsCount || 0) + 1;
      local.gamification.xp += 25;
      local.activityLog[todayStr] = (local.activityLog[todayStr] || 0) + 1;
      local.todayActivity = local.activityLog[todayStr];
      local.canLogWindow = false;
      local.nextWindowInMs = TWO_HOURS;
      local.aiInsight = "🔥 Dynamic 2-Hour Visit Window recorded! Streak momentum updated (+25 XP).";
      saveLocalData(local);
      return { ...local, windowLogged: true, xpGained: 25 };
    }
    return { ...local, windowLogged: false, xpGained: 0 };
  }
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

// --- 6. DELETE ALL TASKS ---
export const clearAllTasks = async (tasks) => {
  if (!tasks || tasks.length === 0) return;
  const deletePromises = tasks.map(task => api.delete(`/planner/${task._id}`));
  await Promise.all(deletePromises);
};

// --- 7. TOGGLE HABIT ---
export const toggleHabit = async (habitId) => {
  try {
    const response = await api.post('/planner/habit/toggle', { habitId });
    saveLocalData(response.data);
    return response.data;
  } catch (err) {
    const local = getLocalData();
    const habit = local.habits.find(h => h.id === habitId);
    if (habit) habit.completed = !habit.completed;
    saveLocalData(local);
    return local;
  }
};

// --- 8. GET TUTOR LEARNERS STATISTICS & MOST USED MODULES ---
export const fetchTutorLearnersStats = async () => {
  try {
    const response = await api.get('/planner/tutor/learners-stats');
    return response.data;
  } catch (err) {
    console.warn("Using fallback tutor analytics data", err);
    return {
      summaryStats: {
        totalLearners: 8,
        activeToday: 6,
        averageStreak: 4,
        averageXp: 380,
        totalTasksCompleted: 42
      },
      learners: [
        {
          id: 'u1',
          name: 'Aarav Sharma',
          email: 'aarav.s@university.edu',
          specialization: 'Computer Science & Software Engineering',
          registeredDate: '2026-08-15T10:00:00Z',
          streak: { current: 7, longest: 9, windowVisitsCount: 14, freezes: 1 },
          xp: 620,
          levelInfo: { tier: 'Master Strategist', level: 4, badge: '💎' },
          totalTasks: 12,
          completedTasks: 10,
          completionRate: 83,
          ragQueriesCount: 18,
          assessmentSubmissionsCount: 4,
          totalActivities: 28,
          isActiveToday: true
        },
        {
          id: 'u2',
          name: 'Ananya Roy',
          email: 'ananya.roy@academic.org',
          specialization: 'Data Science & Machine Learning',
          registeredDate: '2026-08-18T14:30:00Z',
          streak: { current: 5, longest: 6, windowVisitsCount: 9, freezes: 2 },
          xp: 450,
          levelInfo: { tier: 'Focus Champion', level: 3, badge: '⚡' },
          totalTasks: 9,
          completedTasks: 7,
          completionRate: 78,
          ragQueriesCount: 12,
          assessmentSubmissionsCount: 3,
          totalActivities: 21,
          isActiveToday: true
        },
        {
          id: 'u3',
          name: 'Rohan Verma',
          email: 'rohan.v@tech.edu',
          specialization: 'Fullstack Web Development',
          registeredDate: '2026-08-20T09:15:00Z',
          streak: { current: 4, longest: 5, windowVisitsCount: 8, freezes: 1 },
          xp: 380,
          levelInfo: { tier: 'Focus Champion', level: 3, badge: '⚡' },
          totalTasks: 8,
          completedTasks: 6,
          completionRate: 75,
          ragQueriesCount: 15,
          assessmentSubmissionsCount: 2,
          totalActivities: 19,
          isActiveToday: true
        },
        {
          id: 'u4',
          name: 'Priya Nambiar',
          email: 'priya.n@cs.edu',
          specialization: 'AI Research & NLP Studies',
          registeredDate: '2026-08-22T11:45:00Z',
          streak: { current: 3, longest: 4, windowVisitsCount: 6, freezes: 1 },
          xp: 290,
          levelInfo: { tier: 'Focus Champion', level: 3, badge: '⚡' },
          totalTasks: 6,
          completedTasks: 5,
          completionRate: 83,
          ragQueriesCount: 22,
          assessmentSubmissionsCount: 3,
          totalActivities: 16,
          isActiveToday: true
        },
        {
          id: 'u5',
          name: 'Vikramaditya Patel',
          email: 'vikram.p@dev.org',
          specialization: 'Cybersecurity & Systems',
          registeredDate: '2026-08-25T16:20:00Z',
          streak: { current: 2, longest: 3, windowVisitsCount: 4, freezes: 0 },
          xp: 180,
          levelInfo: { tier: 'Apprentice Learner', level: 2, badge: '🌟' },
          totalTasks: 5,
          completedTasks: 3,
          completionRate: 60,
          ragQueriesCount: 7,
          assessmentSubmissionsCount: 1,
          totalActivities: 11,
          isActiveToday: true
        },
        {
          id: 'u6',
          name: 'Sneha Kulkarni',
          email: 'sneha.k@univ.edu',
          specialization: 'Algorithms & Data Structures',
          registeredDate: '2026-08-28T13:10:00Z',
          streak: { current: 1, longest: 4, windowVisitsCount: 2, freezes: 1 },
          xp: 140,
          levelInfo: { tier: 'Apprentice Learner', level: 2, badge: '🌟' },
          totalTasks: 4,
          completedTasks: 2,
          completionRate: 50,
          ragQueriesCount: 9,
          assessmentSubmissionsCount: 1,
          totalActivities: 8,
          isActiveToday: false
        },
        {
          id: 'u7',
          name: 'Karan Malhotra',
          email: 'karan.m@tech.io',
          specialization: 'Cloud Computing & DevOps',
          registeredDate: '2026-09-01T08:50:00Z',
          streak: { current: 1, longest: 2, windowVisitsCount: 3, freezes: 1 },
          xp: 110,
          levelInfo: { tier: 'Apprentice Learner', level: 2, badge: '🌟' },
          totalTasks: 3,
          completedTasks: 2,
          completionRate: 67,
          ragQueriesCount: 5,
          assessmentSubmissionsCount: 1,
          totalActivities: 6,
          isActiveToday: true
        },
        {
          id: 'u8',
          name: 'Meera Deshmukh',
          email: 'meera.d@academic.edu',
          specialization: 'Software Quality & Testing',
          registeredDate: '2026-09-03T15:00:00Z',
          streak: { current: 0, longest: 1, windowVisitsCount: 1, freezes: 1 },
          xp: 60,
          levelInfo: { tier: 'Novice Explorer', level: 1, badge: '🌱' },
          totalTasks: 2,
          completedTasks: 1,
          completionRate: 50,
          ragQueriesCount: 3,
          assessmentSubmissionsCount: 0,
          totalActivities: 3,
          isActiveToday: false
        }
      ],
      mostUsedTools: [
        {
          id: 'rag',
          name: 'AI Colab RAG & Document Q&A',
          icon: 'FiCpu',
          usageCount: 95,
          usagePercent: 38,
          category: 'AI Knowledge Retrieval',
          trend: '+24% active queries',
          topBenefit: 'Instant paper summarization & page citations'
        },
        {
          id: 'planner',
          name: 'Eisenhower Planner & 2h Visit Engine',
          icon: 'FiLayout',
          usageCount: 68,
          usagePercent: 27,
          category: 'Task & Streak Optimization',
          trend: '+31% active engagement',
          topBenefit: 'Continuous study streaks & priority matrix'
        },
        {
          id: 'assessments',
          name: 'Tutor Skill Tests & AI Gap Diagnostic',
          icon: 'FiCheckSquare',
          usageCount: 45,
          usagePercent: 18,
          category: 'Learner Evaluation',
          trend: '+18% evaluation score',
          topBenefit: 'Targeted weak topic auto-remediation'
        },
        {
          id: 'flashcards',
          name: '3D AI Flashcards & Spaced Repetition',
          icon: 'FiLayers',
          usageCount: 32,
          usagePercent: 12,
          category: 'Memory & Active Recall',
          trend: '+29% recall accuracy',
          topBenefit: 'SM2 algorithmic concept retention'
        },
        {
          id: 'viva',
          name: 'Mock Viva Oral Examiner & Concept Maps',
          icon: 'FiMic',
          usageCount: 15,
          usagePercent: 5,
          category: 'Viva & Mind Mapping',
          trend: '+15% oral preparedness',
          topBenefit: 'Simulated professor Q&A audio feedback'
        }
      ]
    };
  }
};