import React from 'react';
import { Flame, Snowflake, Trophy } from 'lucide-react';

const StreakHeader = ({ gamification }) => {
  // --- SAFETY FIX START ---
  // If gamification is null/undefined, we  default to 0 so the UI always shows.
  // We only show the loading pulse if we are truly waiting (optional logic),
  // but for now, let's prioritize showing the UI.
  
  const streak = gamification?.streak || { current: 0, freezes: 0 };
  const xp = gamification?.xp || 0;
  // --- SAFETY FIX END ---

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Left: Greeting & Status */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Study Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {streak.current > 0 
            ? "🔥 You're on fire! Keep the momentum going." 
            : "🚀 Start your streak today by completing a high-priority task."}
        </p>
      </div>
      
      {/* Right: Stats Badges */}
      <div className="flex gap-3">
        {/* Streak Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 shadow-sm">
          <Flame 
            className={`w-5 h-5 ${streak.current > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} 
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-orange-700">{streak.current} Days</span>
            <span className="text-[10px] text-orange-600 uppercase font-bold">Streak</span>
          </div>
        </div>

        {/* Freeze Badge (Safety Net) */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 shadow-sm">
          <Snowflake className="w-5 h-5 text-blue-500" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-blue-700">{streak.freezes}</span>
            <span className="text-[10px] text-blue-600 uppercase font-bold">Freezes</span>
          </div>
        </div>

        {/* XP Badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-full border border-yellow-100 shadow-sm">
          <Trophy className="w-5 h-5 text-yellow-600" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-yellow-800">{xp} XP</span>
            <span className="text-[10px] text-yellow-700 uppercase font-bold">Score</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakHeader;