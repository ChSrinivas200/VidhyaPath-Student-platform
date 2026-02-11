import React from 'react';
import { FiCheckCircle, FiMessageSquare, FiBriefcase, FiAward, FiClock } from 'react-icons/fi';

const MentorCard = ({ mentor, onConnect }) => {
  // Destructure for cleaner code
  const { 
    name, 
    role, 
    company, 
    isVerified, 
    isAvailable, 
    skills, 
    category 
  } = mentor;

  return (
    <div className="w-full bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
      
      {/* Card Header: Profile & Status */}
      <div className="p-5 flex justify-between items-start">
        <div className="flex gap-4">
          {/* Avatar / Initials */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{name}</h3>
              {isVerified && (
                <FiCheckCircle className="text-indigo-400" size={16} title="Verified Senior/Alumni" />
              )}
            </div>
            
            <div className="flex items-center text-slate-400 text-sm mt-1">
              <FiBriefcase className="mr-1.5" size={14} />
              <span>{role} {company ? `@ ${company}` : ''}</span>
            </div>
          </div>
        </div>

        {/* Availability Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
          isAvailable 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
            : 'bg-slate-700/50 text-slate-400 border-slate-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></div>
          {isAvailable ? 'Available' : 'Busy'}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-700/50 w-full"></div>

      {/* Body: Domain & Skills */}
      <div className="p-5 flex-1">
        {/* Domain Badge */}
        <div className="mb-4">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
              {category} {/* e.g., Placements */}
            </span>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill, index) => (
            <span 
              key={index} 
              className="px-2.5 py-1 text-xs text-slate-300 bg-slate-900 border border-slate-700 rounded-md"
            >
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
             <span className="px-2.5 py-1 text-xs text-slate-500 bg-slate-900 border border-slate-700 rounded-md">
               +{skills.length - 4} more
             </span>
          )}
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex gap-3">
        <button 
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
          onClick={() => onConnect(mentor)}
        >
          <FiMessageSquare size={16} />
          Ask for Guidance
        </button>
        
        <button 
          className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
          title="View Full Profile"
        >
          Profile
        </button>
      </div>
    </div>
  );
};

export default MentorCard;
 