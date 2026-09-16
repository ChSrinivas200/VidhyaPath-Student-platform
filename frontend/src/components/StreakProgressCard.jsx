import React, { useState, useEffect } from 'react';
import { FiClock, FiZap, FiAward, FiShield, FiCheckCircle } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { recordVisitWindow } from '../services/plannerService';

const StreakProgressCard = ({ statsData, onStatsUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState('');

  const gamification = statsData?.gamification || { xp: 0, streak: { current: 0, longest: 0, freezes: 1 } };
  const streak = gamification.streak || { current: 0, longest: 0, freezes: 1 };
  const xp = gamification.xp || 0;
  const levelInfo = statsData?.levelInfo || { tier: 'Novice Explorer', level: 1, min: 0, next: 100, badge: '🌱' };
  const canLogWindow = statsData?.canLogWindow ?? true;
  const nextWindowInMs = statsData?.nextWindowInMs || 0;
  const aiInsight = statsData?.aiInsight || "⚡ Log your 2-hour study visits dynamically to build streak momentum and boost memory retention!";

  // Format countdown string for next 2-hour visit window
  useEffect(() => {
    let timer;
    if (!canLogWindow && nextWindowInMs > 0) {
      let remainingSeconds = Math.floor(nextWindowInMs / 1000);

      const updateTimer = () => {
        if (remainingSeconds <= 0) {
          setCountdown('Ready now!');
          if (onStatsUpdate) onStatsUpdate();
          return;
        }
        const hours = Math.floor(remainingSeconds / 3600);
        const mins = Math.floor((remainingSeconds % 3600) / 60);
        const secs = remainingSeconds % 60;
        
        const hStr = hours > 0 ? `${hours}h ` : '';
        setCountdown(`${hStr}${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
        remainingSeconds--;
      };

      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setCountdown('');
    }

    return () => clearInterval(timer);
  }, [canLogWindow, nextWindowInMs]);

  // Handle 2-Hour Visit Log Click
  const handleLogVisit = async () => {
    try {
      setLoading(true);
      const updatedData = await recordVisitWindow();
      
      if (updatedData.windowLogged || updatedData.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#6366f1']
        });
      }

      if (onStatsUpdate) {
        onStatsUpdate(updatedData);
      }
    } catch (err) {
      console.error('Failed to log 2h visit window', err);
    } finally {
      setLoading(false);
    }
  };

  // Progress percentage calculation
  const currentXpInLevel = xp - levelInfo.min;
  const xpRequiredForNext = levelInfo.next - levelInfo.min;
  const levelProgress = Math.min(100, Math.max(5, Math.round((currentXpInLevel / xpRequiredForNext) * 100)));

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all shadow-xl shadow-indigo-500/5">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 -mt-20 w-96 h-96 rounded-full bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* LEFT COLUMN: Animated Flame & Streak Badge (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-slate-200/70 dark:border-slate-800 pb-6 lg:pb-0 lg:pr-6">
          
          {/* Flame Icon Container with pulse animation */}
          <div className="relative group mb-3">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 blur-md opacity-75 group-hover:opacity-100 animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300">
              <FaFire size={42} className="animate-bounce text-amber-100" />
            </div>
            {streak.current > 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                ACTIVE
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              {streak.current}
            </span>
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
              Day Study Streak
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <FiAward className="text-amber-500" /> Longest Record: <strong className="text-slate-700 dark:text-slate-200">{streak.longest || streak.current} days</strong>
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
              {levelInfo.badge} {levelInfo.tier} (Lvl {levelInfo.level})
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[11px] font-bold flex items-center gap-1">
              <FiShield size={12} /> {streak.freezes || 0} Freeze
            </span>
          </div>

        </div>

        {/* MIDDLE COLUMN: Dynamic 2-Hour Visit Window & AI Insight (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* AI Coach Insight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-pink-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <FiZap className="animate-pulse text-amber-500" /> Dynamic AI Learner Insights
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              "{aiInsight}"
            </p>
          </div>

          {/* 2-Hour Visit Window Action Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                <FiClock className="text-indigo-500" />
                <span>2-Hour Visit Window Engine</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {canLogWindow 
                  ? "Visit active! Log your 2h study session now to keep streak growing." 
                  : `Session active. Next visit window refresh in ${countdown || 'calculating...'}`}
              </p>
            </div>

            <button
              onClick={handleLogVisit}
              disabled={loading || !canLogWindow}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                canLogWindow
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span>Logging...</span>
              ) : canLogWindow ? (
                <>
                  <FiCheckCircle size={14} />
                  <span>Log 2-Hour Visit (+25 XP)</span>
                </>
              ) : (
                <>
                  <FiClock size={14} />
                  <span>Window Engaged</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: XP Progress Ring & Next Tier Goal (3 cols) */}
        <div className="lg:col-span-3 space-y-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              XP Progress
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
              {xp} Total XP
            </span>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span>Level {levelInfo.level}</span>
              <span>Next: {levelInfo.next} XP</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60">
            <span>Visits Logged Today:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{statsData?.todayActivity || 0} sessions</strong>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StreakProgressCard;
