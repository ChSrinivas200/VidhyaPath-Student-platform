import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiSearch, 
  FiZap, 
  FiCheckCircle, 
  FiClock, 
  FiCalendar, 
  FiTrash2, 
  FiX, 
  FiPlay,
  FiAward,
  FiGrid,
  FiColumns,
  FiCheckSquare,
  FiBookmark,
  FiCheck
} from 'react-icons/fi';
import confetti from 'canvas-confetti';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/plannerService';

const SUBJECT_PRESETS = [
  'All',
  'Official Statistics',
  'Python & AI',
  'Cadre Rules',
  'Mathematics',
  'General'
];

const INITIAL_HABITS = [
  { id: 'h1', title: '45m Deep Work Sprint', icon: '⚡', category: 'Focus', completed: false, streak: 5 },
  { id: 'h2', title: 'Review MoSPI Handbook & IIP', icon: '📊', category: 'Coursework', completed: false, streak: 3 },
  { id: 'h3', title: 'Python Pandas / Data Pipeline', icon: '🐍', category: 'Coding', completed: false, streak: 7 },
  { id: 'h4', title: 'Practice 5 Assessment MCQs', icon: '🎯', category: 'Evaluation', completed: false, streak: 4 },
  { id: 'h5', title: 'Read Cadre Guidelines / iGOT', icon: '🏛️', category: 'Policy', completed: false, streak: 2 }
];

export default function StudyPlanner() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // View Switcher: 'matrix' | 'kanban' | 'habits' | 'schedule'
  const [activeView, setActiveView] = useState('matrix');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Daily Habits State (persisted in localStorage)
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('study_habits_tracker');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_HABITS;
  });

  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    subject: 'Official Statistics',
    dueDate: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    priority: 'do_first',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Load Tasks from Backend
  useEffect(() => {
    loadTasksData();
  }, []);

  const loadTasksData = async () => {
    try {
      const data = await fetchTasks();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
    }
  };

  // 2. Habit Toggle Handler
  const handleToggleHabit = (habitId) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        const nextState = !h.completed;
        if (nextState) {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 },
            colors: ['#10B981', '#6366f1', '#F59E0B']
          });
        }
        return {
          ...h,
          completed: nextState,
          streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1)
        };
      }
      return h;
    });

    setHabits(updated);
    localStorage.setItem('study_habits_tracker', JSON.stringify(updated));
  };

  // 3. Action Handlers
  const handleCreateTask = async (e) => {
    if (e) e.preventDefault();
    if (!newTask.title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createTask(newTask);
      setTasks((prev) => [...prev, created]);
      setShowModal(false);
      setNewTask({
        title: '',
        subject: 'Official Statistics',
        dueDate: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        priority: 'do_first',
        notes: ''
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10B981', '#F59E0B']
      });
    } catch (error) {
      console.error("Error creating task", error);
      alert("Error creating task. Please check backend connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyTemplate = (title, subject, priority) => {
    setNewTask({
      title,
      subject,
      dueDate: new Date().toISOString().split('T')[0],
      time: '11:00 AM',
      priority,
      notes: 'Template generated study sprint deliverable.'
    });
    setShowModal(true);
  };

  const handleComplete = async (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, isCompleted: true } : t))
    );
    try {
      await updateTask(taskId, { isCompleted: true });
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#6366f1']
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePriority = async (taskId, newPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, priority: newPriority } : t))
    );
    try {
      await updateTask(taskId, { priority: newPriority });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Remove this task from your matrix?")) {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error(err);
      }
    }
  };



  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter((t) => t.isCompleted);
    if (completedTasks.length === 0) {
      alert("No completed tasks to clear.");
      return;
    }

    if (window.confirm(`Clear ${completedTasks.length} completed task(s)?`)) {
      setTasks((prev) => prev.filter((t) => !t.isCompleted));
      try {
        await Promise.all(completedTasks.map((t) => deleteTask(t._id)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject =
      selectedSubject === 'All' || t.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getTasksByPriority = (priority) => {
    return filteredTasks.filter((t) => t.priority === priority && !t.isCompleted);
  };

  // Metrics
  const pendingCount = tasks.filter((t) => !t.isCompleted).length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const doFirstCount = tasks.filter((t) => t.priority === 'do_first' && !t.isCompleted).length;
  const totalTasks = pendingCount + completedCount;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const completedHabitsCount = habits.filter((h) => h.completed).length;

  // Days of week helper for schedule view
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="max-w-7xl mx-auto space-y-7 animate-fadeIn pb-12 select-none overflow-x-hidden">
      
      {/* 1. HERO COCKPIT BANNER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiZap /> Academic Execution Matrix
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Study Planner & Matrix
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1.5 max-w-xl leading-relaxed">
              Prioritize study tasks across the 4 quadrants, schedule high-focus sprints, and eliminate academic friction.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/focus')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shadow-sm hover:scale-102 active:scale-98"
            >
              <FiPlay size={16} className="fill-current text-indigo-500" />
              <span>Launch Focus (25m)</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:scale-102 active:scale-98 transition-all"
            >
              <FiPlus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. PRODUCTIVITY STATS KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Urgent Priority */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900/60 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Urgent Focus
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              🔥
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {doFirstCount}
            </span>
            <span className="text-xs text-red-500 font-bold">Do First items</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            Highest-leverage academic deliverables
          </p>
        </div>

        {/* KPI 2: Total Pending */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-900/60 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Active Deliverables
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <FiClock size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {pendingCount}
            </span>
            <span className="text-xs text-slate-400">items pending</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, pendingCount * 15)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Completed Rate */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-900/60 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Completion Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FiCheckCircle size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {completedCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {completionRate}% success
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Daily Habits Score */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-900/60 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Daily Rituals Done
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <FiCheckSquare size={17} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {completedHabitsCount} / {habits.length}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
              habits
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            Consistent micro-actions build unstoppable momentum
          </p>
        </div>

      </div>

      {/* 3. INTERACTIVE VIEW SELECTOR TABS & SEARCH BAR */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 flex-wrap">
        
        {/* View Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto">
          <button
            onClick={() => setActiveView('matrix')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiGrid size={14} />
            <span>Eisenhower Matrix</span>
          </button>

          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'kanban'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiColumns size={14} />
            <span>Sprint Board</span>
          </button>

          <button
            onClick={() => setActiveView('habits')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'habits'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiCheckSquare size={14} />
            <span>Daily Rituals</span>
          </button>

          <button
            onClick={() => setActiveView('schedule')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeView === 'schedule'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FiCalendar size={14} />
            <span>Weekly Schedule</span>
          </button>
        </div>

        {/* Search & Clear Completed */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search tasks or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <FiX size={13} />
              </button>
            )}
          </div>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5"
              title="Clear Completed Tasks"
            >
              <FiTrash2 size={13} />
              <span className="hidden lg:inline">Clear Done</span>
            </button>
          )}
        </div>

      </div>

      {/* 4. SUBJECT FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
          Filter:
        </span>
        {SUBJECT_PRESETS.map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedSubject === sub
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 scale-102'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 5. VIEW 1: EISENHOWER PRIORITY MATRIX (4 QUADRANTS)                */}
      {/* ------------------------------------------------------------------ */}
      {activeView === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* QUADRANT 1: DO FIRST */}
          <div className="glass-card rounded-2xl p-4 border border-red-200/80 dark:border-red-900/50 flex flex-col space-y-4 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-red-50 dark:bg-red-950/60 rounded-xl text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-wider border border-red-200/50 dark:border-red-900/40">
              <span className="flex items-center gap-1.5">
                <span>🔥</span>
                <span>Do First</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900 text-[11px] font-bold">
                {getTasksByPriority('do_first').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
              {getTasksByPriority('do_first').map((task) => (
                <div key={task._id} className="space-y-1.5">
                  <div className="relative group">
                    <div className="p-4 rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-red-500/10 hover:border-red-300 dark:hover:border-red-800">
                      
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900/60">
                          {task.subject || 'Academic'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleChangePriority(task._id, 'schedule')}
                            title="Move to Schedule"
                            className="text-[10px] text-slate-400 hover:text-blue-500 p-1"
                          >
                            → 📅
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            title="Delete Task"
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug mb-2">
                        {task.title}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1 text-[11px]">
                          <FiCalendar size={11} className="text-red-500" />
                          <span>{new Date(task.dueDate || Date.now()).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate('/focus', { state: { task } })}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-[11px] font-bold hover:bg-red-100 transition"
                          >
                            <FiPlay size={11} className="fill-current" /> Sprint
                          </button>
                          <button
                            onClick={() => handleComplete(task._id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition shadow-sm"
                          >
                            <FiCheck size={11} /> Done
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}

              {getTasksByPriority('do_first').length === 0 && (
                <div className="text-center py-12 px-4 border-2 border-dashed border-red-200/50 dark:border-red-900/30 rounded-2xl text-slate-400 text-xs flex flex-col items-center justify-center">
                  <FiAward size={28} className="text-red-300 dark:text-red-800 mb-2" />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">All Urgent Tasks Cleared!</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">You're fully on track for today.</span>
                </div>
              )}
            </div>
          </div>

          {/* QUADRANT 2: SCHEDULE */}
          <div className="glass-card rounded-2xl p-4 border border-blue-200/80 dark:border-blue-900/50 flex flex-col space-y-4 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-wider border border-blue-200/50 dark:border-blue-900/40">
              <span className="flex items-center gap-1.5">
                <span>🗓️</span>
                <span>Schedule</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-[11px] font-bold">
                {getTasksByPriority('schedule').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
              {getTasksByPriority('schedule').map((task) => (
                <div key={task._id} className="space-y-1.5">
                  <div className="p-4 rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-800">
                    
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/60">
                        {task.subject || 'Academic'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleChangePriority(task._id, 'do_first')}
                          title="Move to Do First"
                          className="text-[10px] text-slate-400 hover:text-red-500 p-1"
                        >
                          → 🔥
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug mb-2">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1 text-[11px]">
                        <FiCalendar size={11} className="text-blue-500" />
                        <span>{new Date(task.dueDate || Date.now()).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate('/focus', { state: { task } })}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] font-bold hover:bg-blue-100 transition"
                        >
                          <FiPlay size={11} className="fill-current" /> Sprint
                        </button>
                        <button
                          onClick={() => handleComplete(task._id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition shadow-sm"
                        >
                          <FiCheck size={11} /> Done
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}

              {getTasksByPriority('schedule').length === 0 && (
                <div className="text-center py-12 px-4 border-2 border-dashed border-blue-200/50 dark:border-blue-900/30 rounded-2xl text-slate-400 text-xs flex flex-col items-center justify-center">
                  <FiCalendar size={28} className="text-blue-300 dark:text-blue-800 mb-2" />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Nothing Scheduled</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Plan long-term study goals here.</span>
                </div>
              )}
            </div>
          </div>

          {/* QUADRANT 3: DELEGATE */}
          <div className="glass-card rounded-2xl p-4 border border-amber-200/80 dark:border-amber-900/50 flex flex-col space-y-4 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider border border-amber-200/50 dark:border-amber-900/40">
              <span className="flex items-center gap-1.5">
                <span>🤝</span>
                <span>Delegate</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-[11px] font-bold">
                {getTasksByPriority('delegate').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
              {getTasksByPriority('delegate').map((task) => (
                <div key={task._id} className="space-y-1.5">
                  <div className="p-4 rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-800">
                    
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60">
                        {task.subject || 'Academic'}
                      </span>

                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug mb-2">
                      {task.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px]">Peer / Group</span>
                      <button
                        onClick={() => handleComplete(task._id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition shadow-sm"
                      >
                        <FiCheck size={11} /> Done
                      </button>
                    </div>

                  </div>
                </div>
              ))}

              {getTasksByPriority('delegate').length === 0 && (
                <div className="text-center py-12 px-4 border-2 border-dashed border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-slate-400 text-xs flex flex-col items-center justify-center">
                  <span className="text-2xl mb-2">🤝</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">No Delegated Tasks</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Peer work and group submissions.</span>
                </div>
              )}
            </div>
          </div>

          {/* QUADRANT 4: ELIMINATE */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col space-y-4 shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5">
                <span>🗑️</span>
                <span>Eliminate</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[11px] font-bold">
                {getTasksByPriority('delete').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
              {getTasksByPriority('delete').map((task) => (
                <div key={task._id} className="space-y-1.5">
                  <div className="p-4 rounded-2xl border transition-all duration-300 bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Low Value
                      </span>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                    <h4 className="font-medium text-slate-600 dark:text-slate-400 text-sm line-through">
                      {task.title}
                    </h4>
                  </div>
                </div>
              ))}

              {getTasksByPriority('delete').length === 0 && (
                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs flex flex-col items-center justify-center">
                  <span className="text-2xl mb-2">✨</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Distraction Free</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Zero low-yield time wasters.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 6. VIEW 2: KANBAN SPRINT BOARD                                     */}
      {/* ------------------------------------------------------------------ */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          
          {/* STAGE 1: BACKLOG */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Backlog</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                {filteredTasks.filter((t) => !t.isCompleted && t.priority === 'delete').length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks.filter((t) => !t.isCompleted && t.priority === 'delete').map((t) => (
                <div key={t._id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                  {t.title}
                  <button onClick={() => handleChangePriority(t._id, 'schedule')} className="mt-2 text-indigo-500 font-bold block">
                    Move to Schedule →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* STAGE 2: IN PROGRESS */}
          <div className="glass-card rounded-2xl p-4 border border-blue-200 dark:border-blue-900/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-500">In Progress</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs font-bold">
                {filteredTasks.filter((t) => !t.isCompleted && t.priority === 'schedule').length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks.filter((t) => !t.isCompleted && t.priority === 'schedule').map((t) => (
                <div key={t._id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 text-xs font-medium">
                  {t.title}
                  <button onClick={() => handleChangePriority(t._id, 'do_first')} className="mt-2 text-red-500 font-bold block">
                    Escalate to Focus Sprint →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* STAGE 3: FOCUS SPRINT */}
          <div className="glass-card rounded-2xl p-4 border border-red-200 dark:border-red-900/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-red-500">🔥 Sprinting Now</span>
              <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 text-xs font-bold">
                {filteredTasks.filter((t) => !t.isCompleted && t.priority === 'do_first').length}
              </span>
            </div>
            <div className="space-y-2">
              {filteredTasks.filter((t) => !t.isCompleted && t.priority === 'do_first').map((t) => (
                <div key={t._id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800/80 text-xs font-bold shadow-md">
                  {t.title}
                  <div className="mt-3 flex items-center justify-between">
                    <button
                      onClick={() => navigate('/focus', { state: { task: t } })}
                      className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 text-[11px] font-bold"
                    >
                      ▶ Run Sprint
                    </button>
                    <button
                      onClick={() => handleComplete(t._id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                    >
                      ✓ Finish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STAGE 4: DONE */}
          <div className="glass-card rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-600">Done Today</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-xs font-bold">
                {filteredTasks.filter((t) => t.isCompleted).length}
              </span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredTasks.filter((t) => t.isCompleted).map((t) => (
                <div key={t._id} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs font-medium line-through text-slate-500">
                  {t.title}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 7. VIEW 3: DAILY RITUALS & HABITS TRACKER                          */}
      {/* ------------------------------------------------------------------ */}
      {activeView === 'habits' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiZap className="text-amber-500" />
                <span>Daily Academic Rituals & Streaks</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Check off core micro-habits every day to compound academic success.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold">
              {completedHabitsCount} of {habits.length} Complete Today
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group select-none ${
                  habit.completed
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 shadow-md shadow-emerald-500/10'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 ${
                    habit.completed ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {habit.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm leading-tight ${
                      habit.completed ? 'text-emerald-900 dark:text-emerald-200 line-through' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {habit.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                      {habit.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    habit.completed 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {habit.completed && <FiCheck size={14} />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-500 flex items-center gap-0.5">
                    🔥 {habit.streak}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 8. VIEW 4: WEEKLY STUDY TIMELINE SCHEDULE                          */}
      {/* ------------------------------------------------------------------ */}
      {activeView === 'schedule' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FiCalendar className="text-indigo-500" />
                <span>Weekly Revision & Lecture Schedule</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of deadlines and milestones mapped across the week.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {daysOfWeek.map((day, idx) => {
              const dayTasks = filteredTasks.filter((t, i) => (i % 7) === idx);
              return (
                <div key={day} className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="text-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">{day}</span>
                    <span className="text-[10px] text-slate-400">{dayTasks.length} items</span>
                  </div>

                  <div className="space-y-1.5 min-h-[140px]">
                    {dayTasks.map((t) => (
                      <div key={t._id} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold leading-tight shadow-xs">
                        <span className="text-[9px] uppercase tracking-wider text-indigo-500 font-bold block mb-0.5">
                          {t.subject || 'Study'}
                        </span>
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length === 0 && (
                      <div className="h-full flex items-center justify-center text-[10px] text-slate-400 italic py-6">
                        Free Block
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 9. FAST ACADEMIC STUDY TEMPLATES (ONE-CLICK ADD)                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <FiBookmark size={13} className="text-indigo-500" />
            <span>Fast Academic Sprint Templates</span>
          </span>
          <span className="text-[11px] text-slate-400">Click to instantly populate task</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              title: 'MoSPI IIP Laspeyres Index Proof & Computation',
              subject: 'Official Statistics',
              priority: 'do_first',
              badge: '🔥 Urgent'
            },
            {
              title: 'Build Colab RAG Vector Store with Embeddings',
              subject: 'Python & AI',
              priority: 'schedule',
              badge: '🗓️ Schedule'
            },
            {
              title: 'Cadre Rules Review & iGOT Karmayogi Assessment',
              subject: 'Cadre Rules',
              priority: 'do_first',
              badge: '🔥 Urgent'
            },
            {
              title: 'Primary Sampling Unit (PSU) Stratification Practice',
              subject: 'Mathematics',
              priority: 'schedule',
              badge: '🗓️ Schedule'
            }
          ].map((tmpl) => (
            <button
              key={tmpl.title}
              onClick={() => handleApplyTemplate(tmpl.title, tmpl.subject, tmpl.priority)}
              className="text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white/60 dark:bg-slate-900/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition group"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-indigo-500 mb-1">
                <span>{tmpl.subject}</span>
                <span className="text-slate-400 group-hover:text-indigo-400">{tmpl.badge}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                {tmpl.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 10. MODAL: CREATE TASK                                             */}
      {/* ------------------------------------------------------------------ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-[#0c1122] text-slate-800 dark:text-slate-100">
            
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                  <FiPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Create New Study Task
                  </h3>
                  <p className="text-xs text-slate-400">
                    Assign priority quadrant & subject domain
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Complete Chapter 3: IIP Laspeyres Index Proof"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  autoFocus
                />
              </div>

              {/* Subject Tag */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Subject Domain
                </label>
                <select
                  value={newTask.subject}
                  onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="Official Statistics">📊 Official Statistics (MoSPI / Cadre)</option>
                  <option value="Python & AI">🐍 Python & Machine Learning</option>
                  <option value="Cadre Rules">🏛️ Cadre Rules & iGOT Karmayogi</option>
                  <option value="Mathematics">📐 Advanced Mathematics & Sampling</option>
                  <option value="General">📘 General Coursework</option>
                </select>
              </div>

              {/* Priority Selector Quadrant Tiles */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Eisenhower Priority Quadrant
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  
                  <button
                    type="button"
                    onClick={() => setNewTask({ ...newTask, priority: 'do_first' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newTask.priority === 'do_first'
                        ? 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-700 dark:text-red-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>🔥</span> Do First
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Urgent & Important</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTask({ ...newTask, priority: 'schedule' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newTask.priority === 'schedule'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>🗓️</span> Schedule
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Important, Less Urgent</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTask({ ...newTask, priority: 'delegate' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newTask.priority === 'delegate'
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>🤝</span> Delegate
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Urgent, Low Impact</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTask({ ...newTask, priority: 'delete' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newTask.priority === 'delete'
                        ? 'bg-slate-200 dark:bg-slate-800 border-slate-500 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>🗑️</span> Eliminate
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Neither Urgent nor Key</div>
                  </button>

                </div>
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Target Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2:00 PM"
                    value={newTask.time}
                    onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Notes & References
                </label>
                <textarea
                  rows="2"
                  placeholder="Key textbook pages, theorem numbers, or links..."
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTask.title.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <FiPlus size={15} />
                  <span>{isSubmitting ? 'Saving...' : 'Add to Matrix'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}