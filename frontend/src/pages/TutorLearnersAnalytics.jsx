import React, { useEffect, useState } from 'react';
import {
  FiUsers,
  FiTrendingUp,
  FiZap,
  FiAward,
  FiCpu,
  FiCheckSquare,
  FiLayers,
  FiMic,
  FiSearch,
  FiBarChart2,
  FiCheckCircle,
  FiActivity,
  FiArrowUpRight,
  FiLayout,
  FiClock
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import { fetchTutorLearnersStats } from '../services/plannerService';

const TutorLearnersAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'active' | 'top'

  useEffect(() => {
    loadTutorStats();
  }, []);

  const loadTutorStats = async () => {
    try {
      setLoading(true);
      const res = await fetchTutorLearnersStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load tutor analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const learners = data?.learners || [];
  const mostUsedTools = data?.mostUsedTools || [];
  const summaryStats = data?.summaryStats || {
    totalLearners: 0,
    activeToday: 0,
    averageStreak: 0,
    averageXp: 0,
    totalTasksCompleted: 0
  };

  // Filter learners
  const filteredLearners = learners.filter((learner) => {
    const matchesSearch =
      learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'active') return learner.isActiveToday;
    if (filterType === 'top') return (learner.xp || 0) >= 250;
    return true;
  });

  const getToolIcon = (iconName) => {
    switch (iconName) {
      case 'FiCpu':
        return <FiCpu size={22} className="text-indigo-600 dark:text-indigo-400" />;
      case 'FiLayout':
        return <FiLayout size={22} className="text-amber-600 dark:text-amber-400" />;
      case 'FiCheckSquare':
        return <FiCheckSquare size={22} className="text-purple-600 dark:text-purple-400" />;
      case 'FiLayers':
        return <FiLayers size={22} className="text-emerald-600 dark:text-emerald-400" />;
      case 'FiMic':
        return <FiMic size={22} className="text-pink-600 dark:text-pink-400" />;
      default:
        return <FiZap size={22} className="text-indigo-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* 1. HERO HEADER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/15 via-indigo-500/15 to-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiBarChart2 /> Educator Studio & Learner Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Registered Learners Progress & Analytics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
              Track student study streaks, level progression, task completion rates, and platform feature usage statistics in real time.
            </p>
          </div>

          <button
            onClick={loadTutorStats}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer"
          >
            <FiActivity className={loading ? 'animate-spin' : ''} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {/* 2. STATISTICAL KPI OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Registered Learners */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Total Learners
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <FiUsers size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {summaryStats.totalLearners}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {summaryStats.activeToday} active today
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Enrolled scholars across CS & Engineering tracks.
          </p>
        </div>

        {/* Card 2: Average Learner Streak */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Average Streak
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <FaFire size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              🔥 {summaryStats.averageStreak}
            </span>
            <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">
              Days Average
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Dynamic 2-hour visit window consistency.
          </p>
        </div>

        {/* Card 3: Average Learner XP */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Average XP Score
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FiAward size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {summaryStats.averageXp}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              XP / Student
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Accumulated via tasks, quizzes, and focus sessions.
          </p>
        </div>

        {/* Card 4: Total Completed Tasks */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Completed Tasks
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FiCheckCircle size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {summaryStats.totalTasksCompleted}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              Items resolved
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            High priority coursework items finished.
          </p>
        </div>

      </div>

      {/* 3. MOST USED MODULES & PLATFORM FEATURE POPULARITY */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FiTrendingUp /> Module Popularity Analytics
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Most Used Learning Tools & Features</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked breakdown of platform feature engagement among all registered students.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            Real-Time Telemetry
          </span>
        </div>

        {/* Feature Usage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {mostUsedTools.map((tool, idx) => (
            <div
              key={tool.id}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    {getToolIcon(tool.icon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {tool.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {tool.category}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  #{idx + 1}
                </span>
              </div>

              {/* Usage Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">Usage Share</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{tool.usagePercent}% ({tool.usageCount} sessions)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, tool.usagePercent * 2.5)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <FiArrowUpRight size={12} /> {tool.trend}
                </span>
                <span className="italic truncate max-w-[170px]" title={tool.topBenefit}>
                  {tool.topBenefit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. REGISTERED LEARNERS DETAILED STATISTICAL TABLE */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        
        {/* Table Filter Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FiUsers className="text-purple-600 dark:text-purple-400" />
              <span>Learners Performance Matrix</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive statistical profile of every registered student.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search student or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({learners.length})
              </button>
              <button
                onClick={() => setFilterType('active')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'active'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Active Today ({learners.filter(l => l.isActiveToday).length})
              </button>
              <button
                onClick={() => setFilterType('top')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'top'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Top Tier (XP≥250)
              </button>
            </div>
          </div>
        </div>

        {/* Statistical Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">Learner Profile</th>
                <th className="py-3.5 px-4">Current Streak</th>
                <th className="py-3.5 px-4">XP & Tier</th>
                <th className="py-3.5 px-4">Tasks Rate</th>
                <th className="py-3.5 px-4">RAG Queries</th>
                <th className="py-3.5 px-4">Assessments</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
              {filteredLearners.map((learner) => (
                <tr
                  key={learner.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Learner Name & Specialization */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                        {learner.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {learner.name}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {learner.email} • {learner.specialization}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Current Streak */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      <FaFire className={learner.streak?.current > 0 ? 'text-orange-500' : 'text-slate-300'} size={16} />
                      <span className="font-black text-slate-800 dark:text-slate-100 text-sm">
                        {learner.streak?.current || 0}d
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        (Rec: {learner.streak?.longest || learner.streak?.current || 0}d)
                      </span>
                    </div>
                  </td>

                  {/* XP & Tier */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold">
                        {learner.levelInfo?.badge || '🌱'} {learner.xp || 0} XP
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {learner.levelInfo?.tier || 'Novice'}
                      </span>
                    </div>
                  </td>

                  {/* Tasks Rate */}
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                        <span>{learner.completedTasks} / {learner.totalTasks}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ({learner.completionRate}%)
                        </span>
                      </div>
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${learner.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* RAG Queries */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {learner.ragQueriesCount} queries
                    </span>
                  </td>

                  {/* Assessments Taken */}
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {learner.assessmentSubmissionsCount} tests
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-right">
                    {learner.isActiveToday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Active Today
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 font-bold text-[10px]">
                        <FiClock size={10} /> Away
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLearners.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 italic">
                    No learners match the current search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default TutorLearnersAnalytics;
