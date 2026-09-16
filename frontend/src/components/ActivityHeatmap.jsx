import React, { useState } from 'react';
import { FiCalendar, FiAward, FiZap, FiInfo, FiActivity } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

const ActivityHeatmap = ({ activityLog = {}, streak = { current: 0, longest: 0 }, xp = 0 }) => {
  const [viewRange, setViewRange] = useState(112); // Default to 16 weeks (112 days)
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate date entries for the past N days up to today
  const generateHeatmapDays = (numDays) => {
    const days = [];
    const today = new Date();

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityLog[dateStr] || 0;

      days.push({
        dateStr,
        date: d,
        count,
        dayOfWeek: d.getDay(),
        month: d.toLocaleString('default', { month: 'short' }),
        dayNum: d.getDate()
      });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays(viewRange);
  const totalActivityCount = Object.values(activityLog).reduce((acc, curr) => acc + curr, 0);
  const activeDaysCount = Object.values(activityLog).filter(c => c > 0).length;

  // Group days by week (columns of 7 days: Sun-Sat)
  const weeks = [];
  let currentWeek = [];

  heatmapDays.forEach((day, index) => {
    currentWeek.push(day);
    if (day.dayOfWeek === 6 || index === heatmapDays.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Calculate cell color intensity
  const getCellColor = (count) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800/60 border-slate-200/40 dark:border-slate-700/50 hover:border-slate-400';
    if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900/80 border-emerald-400/50 text-emerald-900 dark:text-emerald-100 hover:scale-110';
    if (count <= 4) return 'bg-emerald-400 dark:bg-emerald-600 border-emerald-300 text-white shadow-sm shadow-emerald-500/20 hover:scale-125';
    return 'bg-emerald-500 dark:bg-emerald-400 border-emerald-200 text-white shadow-md shadow-emerald-400/40 hover:scale-125 animate-pulse';
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden transition-all">
      
      {/* Glow background highlight */}
      <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FiActivity className="animate-spin" /> Continuous Learning Heatmap
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>Study & Visit Activity Matrix</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Every 2-hour visit window, completed task, and quiz contributes to your daily heat grid.
          </p>
        </div>

        {/* View Range selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            onClick={() => setViewRange(56)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewRange === 56 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            8 Weeks
          </button>
          <button
            onClick={() => setViewRange(112)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewRange === 112 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            16 Weeks
          </button>
          <button
            onClick={() => setViewRange(365)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              viewRange === 365 
                ? 'bg-emerald-500 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <FaFire size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Streak</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">{streak.current} Days</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <FiAward size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Longest Streak</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">{streak.longest || streak.current} Days</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <FiZap size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Activity</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">{totalActivityCount} Logged</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <FiCalendar size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Days</div>
            <div className="text-lg font-black text-slate-800 dark:text-slate-100">{activeDaysCount} Days</div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Matrix */}
      <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin">
        <div className="min-w-[650px] flex flex-col gap-1.5">
          
          {/* Heatmap Grid Columns (Weeks) */}
          <div className="flex gap-1.5 items-start">
            
            {/* Day Labels Column */}
            <div className="flex flex-col justify-between h-[126px] text-[10px] font-bold text-slate-400 pr-2 pt-0.5">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Matrix Cells by Week */}
            <div className="flex gap-1.5 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((day) => (
                    <div
                      key={day.dateStr}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 cursor-pointer ${getCellColor(day.count)}`}
                      title={`${day.dateStr}: ${day.count} activities logged`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip & Legend Bar */}
      <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Dynamic Tooltip info */}
        <div className="text-slate-600 dark:text-slate-400 flex items-center gap-2 min-h-[20px]">
          {hoveredDay ? (
            <span className="font-semibold text-slate-800 dark:text-slate-200 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
              📅 <strong className="text-emerald-600 dark:text-emerald-400">{hoveredDay.dateStr}</strong>: {hoveredDay.count} active study sessions & visits logged
            </span>
          ) : (
            <span className="italic flex items-center gap-1">
              <FiInfo className="text-slate-400" /> Hover over any square to view daily activity metrics.
            </span>
          )}
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-xs">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3.5 h-3.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-200 dark:bg-emerald-900 border border-emerald-400/50" />
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
            <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500 dark:bg-emerald-400 shadow-sm shadow-emerald-400/40" />
          </div>
          <span>More</span>
        </div>

      </div>

    </div>
  );
};

export default ActivityHeatmap;
