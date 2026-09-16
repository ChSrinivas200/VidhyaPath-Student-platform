import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiHelpCircle,
  FiClock,
  FiBookOpen,
  FiLayout,
  FiTrash2,
  FiCpu,
  FiCheckCircle,
  FiZap,
  FiTrendingUp,
  FiArrowRight,
  FiCheckSquare,
  FiMap
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

import TaskCard from '../components/TaskCard';
import Visualizer from './Visualizer';
import BinauralFocusBanner from '../components/BinauralFocusBanner';
import StreakProgressCard from '../components/StreakProgressCard';
import ActivityHeatmap from '../components/ActivityHeatmap';
import {
  fetchTasks,
  updateTask,
  deleteTask,
  fetchUserStats,
  recordVisitWindow,
} from '../services/plannerService';
import api from '../services/api';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [ragStats, setRagStats] = useState({ queriesCount: 0, status: 'Active' });
  const [userStats, setUserStats] = useState(null);
  const navigate = useNavigate();

  // 🔐 Auth check + initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');

    if (!token) {
      navigate('/login');
    } else {
      setUserName(
        name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Learner'
      );
      loadTasksData();
      loadRagStats();
      loadUserGamificationStats();
    }
  }, [navigate]);

  // Load user gamification & streak stats
  const loadUserGamificationStats = async () => {
    try {
      // Auto-trigger visit window calculation dynamically per visit
      const visitRes = await recordVisitWindow();
      if (visitRes && visitRes.gamification) {
        setUserStats(visitRes);
      } else {
        const stats = await fetchUserStats();
        setUserStats(stats);
      }
    } catch (error) {
      console.warn("User stats fetch warning", error);
    }
  };

  // 📥 Load tasks
  const loadTasksData = async () => {
    try {
      const tasksData = await fetchTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error(error);
    }
  };

  const loadRagStats = async () => {
    try {
      const res = await api.get('/rag/history');
      if (Array.isArray(res.data)) {
        setRagStats({ queriesCount: res.data.length, status: 'Active' });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // ✅ Complete task
  const handleCompleteTask = async (taskId) => {
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, isCompleted: true } : t
        )
      );
      await updateTask(taskId, { isCompleted: true });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981'],
      });

      // Reload user stats to reflect task completion XP & activity
      loadUserGamificationStats();
    } catch (error) {
      console.error(error);
    }
  };

  // 🗑️ Delete task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(taskId);
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 🔄 Reset dashboard
  const handleResetDashboard = async () => {
    if (window.confirm('Reset all completed and pending tasks?')) {
      try {
        await Promise.all(tasks.map((t) => deleteTask(t._id)));
        setTasks([]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 📝 Update notes
  const handleUpdateNotes = async (taskId, newNotes) => {
    await updateTask(taskId, { notes: newNotes });
  };

  // 🎯 Filter tasks by priority
  const filterTasks = (priority) =>
    tasks.filter((t) => t.priority === priority && !t.isCompleted);

  const pendingCount = tasks.filter((t) => !t.isCompleted).length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalTasks = pendingCount + completedCount;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const currentStreak = userStats?.gamification?.streak?.current ?? 0;
  const longestStreak = userStats?.gamification?.streak?.longest ?? currentStreak;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* 1. HERO GREETING BANNER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiZap /> Academic Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Welcome back, {userName} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl leading-relaxed">
              "Continuous improvement is better than delayed perfection." Here is your productivity summary today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/rag"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <FiCpu size={18} />
              <span>Ask AI RAG Assistant</span>
            </Link>

            <button
              onClick={handleResetDashboard}
              title="Reset Tasks"
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 1.5 DYNAMIC 2-HOUR VISIT WINDOW & AI STREAK ENGAGEMENT CARD */}
      <StreakProgressCard
        statsData={userStats}
        onStatsUpdate={(newData) => {
          if (newData) setUserStats(newData);
          else loadUserGamificationStats();
        }}
      />

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Pending Tasks */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all hover:scale-102">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Pending Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <FiClock size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {pendingCount}
            </span>
            <span className="text-xs text-slate-400">items to complete</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, pendingCount * 20)}%` }}
            />
          </div>
        </div>

        {/* Stat 2: Completed Tasks */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all hover:scale-102">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Completed
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FiCheckCircle size={18} />
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
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Stat 3: Colab AI RAG */}
        <Link
          to="/rag"
          className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:scale-102 group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
              Colab RAG Model
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:rotate-12 transition-transform">
              <FiCpu size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {ragStats.queriesCount}
            </span>
            <span className="text-xs text-slate-400">queries logged</span>
          </div>
          <p className="text-[11px] text-indigo-500 font-semibold mt-3 flex items-center gap-1">
            <span>Query Knowledge Base</span>
            <FiArrowRight size={12} />
          </p>
        </Link>

        {/* Stat 4: Study Streak (Dynamic) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 transition-all hover:scale-102">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Study Momentum
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <FiTrendingUp size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              🔥 {currentStreak}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
              Day Active Streak
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Record: {longestStreak} Days • Keep studying to maintain.
          </p>
        </div>

      </div>

      {/* 2.5 BINAURAL AUDIO & DEEP WORK SPRINT */}
      <BinauralFocusBanner onTaskCreated={loadTasksData} />

      {/* 3. QUICK TOOLS SUITE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiZap className="text-indigo-600 dark:text-indigo-400" />
            <span>Smart Study Suite</span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            Powered by AI & Web Tools
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Tool 1: AURA AI Assistant */}
          <div
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
              <FiCpu size={24} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                AURA AI Assistant
              </h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white">
                GPT-4o
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Your floating AI study chatbot for coursework Q&A.
            </p>
          </div>

          {/* Tool 2: Summarizer */}
          <Link
            to="/summarizer"
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-800 group-hover:scale-110 transition-transform">
              <FiFileText size={24} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              AI Summarizer
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Condense lectures and research papers in seconds.
            </p>
          </Link>

          {/* Tool 3: Quiz Generator */}
          <Link
            to="/quiz-generator"
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 border border-purple-200 dark:border-purple-800 group-hover:scale-110 transition-transform">
              <FiHelpCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Quiz Generator
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Transform PDFs into multiple-choice practice tests.
            </p>
          </Link>

          {/* Tool 4: Skill Assessments & AI Diagnostics */}
          <Link
            to="/assessments"
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg hover:shadow-purple-500/10 transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
              <FiCheckSquare size={24} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Skill Tests
              </h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-purple-500 text-white">
                AI GAP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Tutor evaluations with AI diagnostics and gap analysis.
            </p>
          </Link>

          {/* Tool 5: Skill Paths & Curated Playlists */}
          <Link
            to="/skill-paths"
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
              <FiMap size={24} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Skill Paths
              </h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                A-Z
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Striver's A-Z DSA, Web Dev, AI/ML & DevOps playlists.
            </p>
          </Link>

          {/* Tool 5: Document Q&A Assistant */}
          <Link
            to="/pdf-viewer"
            className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
              <FiBookOpen size={24} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Document Q&A
              </h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-indigo-500 text-white">
                RAG AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              Upload training manuals, auto-index RAG, & query clauses with page citations.
            </p>
          </Link>

        </div>
      </div>

      {/* 4. EISENHOWER PRIORITY MATRIX */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiLayout className="text-indigo-600 dark:text-indigo-400" />
            <span>Eisenhower Priority Matrix</span>
          </h2>
          <Link
            to="/study-planner"
            className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Open Interactive Planner</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Column 1: Do First */}
          <div className="glass-card rounded-2xl p-4 border border-red-200/60 dark:border-red-900/40 space-y-3">
            <div className="flex items-center justify-between px-2 py-1 bg-red-50 dark:bg-red-950/50 rounded-xl text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider">
              <span>🔥 Do First</span>
              <span className="px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900 text-[11px]">
                {filterTasks('do_first').length}
              </span>
            </div>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filterTasks('do_first').map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onUpdateNotes={handleUpdateNotes}
                />
              ))}
              {filterTasks('do_first').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  No urgent tasks. You're on track!
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Schedule */}
          <div className="glass-card rounded-2xl p-4 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
            <div className="flex items-center justify-between px-2 py-1 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
              <span>📅 Schedule</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-[11px]">
                {filterTasks('schedule').length}
              </span>
            </div>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filterTasks('schedule').map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onUpdateNotes={handleUpdateNotes}
                />
              ))}
              {filterTasks('schedule').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  Nothing scheduled currently.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Delegate */}
          <div className="glass-card rounded-2xl p-4 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between px-2 py-1 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <span>🤝 Delegate</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-[11px]">
                {filterTasks('delegate').length}
              </span>
            </div>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filterTasks('delegate').map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onUpdateNotes={handleUpdateNotes}
                />
              ))}
              {filterTasks('delegate').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  No delegation items.
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Eliminate */}
          <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-2 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
              <span>🗑️ Eliminate</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[11px]">
                {filterTasks('delete').length}
              </span>
            </div>
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filterTasks('delete').map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onUpdateNotes={handleUpdateNotes}
                />
              ))}
              {filterTasks('delete').length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs italic">
                  Zero low-value distractions.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 5. QUICK PRACTICE & VISUALIZER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FiClock className="text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Visualizer & Focus Arena</span>
          </h2>
          <Link
            to="/focus"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Launch Focus Mode →
          </Link>
        </div>
        <Visualizer />
      </div>

      {/* 6. CONTINUOUS LEARNING HEATMAP (BOTTOM OF DASHBOARD) */}
      <ActivityHeatmap
        activityLog={userStats?.activityLog || {}}
        streak={userStats?.gamification?.streak || { current: currentStreak, longest: longestStreak }}
        xp={userStats?.gamification?.xp || 0}
      />

    </div>
  );
};

export default Dashboard;
