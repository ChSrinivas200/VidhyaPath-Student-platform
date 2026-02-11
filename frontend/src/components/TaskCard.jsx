import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Switched to react-icons/fi for consistency  with Dashboard
import { FiCheckCircle, FiFileText, FiTrash2, FiCalendar, FiClock, FiPlay } from 'react-icons/fi';
import confetti from 'canvas-confetti';

const TaskCard = ({ task, onComplete, onDelete, onUpdateNotes }) => {
  const navigate = useNavigate(); 
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState(task.notes || "");
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);

  // --- HANDLERS ---
  const handleComplete = () => {
    if (isCompleted) return;

    setIsCompleted(true);
    
    // Celebration Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#F59E0B', '#10B981'] // Indigo, Gold, Green
    });

    onComplete(task._id);
  };

  const handleBlurNotes = () => {
    if (noteContent !== task.notes) {
      onUpdateNotes(task._id, noteContent);
    }
  };

  const handleStartFocus = () => {
    // Navigate to the focus timer page with this task's data
    navigate('/focus', { state: { task } });
  };

  // --- RENDER ---
  return (
    <div className={`relative bg-white p-5 rounded-xl border transition-all duration-300 group animate-fadeIn
      ${isCompleted 
        ? 'border-emerald-100 bg-emerald-50/50 opacity-75' 
        : 'border-slate-200 hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-1 hover:border-indigo-200'}`}
    >
      {/* 1. Subject Badge (Top Right) */}
      <span className="absolute top-4 right-4 text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
        {task.subject}
      </span>

      {/* 2. Title */}
      <h3 className={`font-bold text-slate-800 text-lg mb-2 pr-16 leading-tight ${isCompleted ? 'line-through text-slate-400' : ''}`}>
        {task.title}
      </h3>

      {/* 3. Meta Data (Date & Time) */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
        {/* Date */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md font-medium">
            <FiCalendar size={12} />
            {new Date(task.dueDate).toLocaleDateString()}
        </div>

        {/* Time (Only shows if task has a time set) */}
        {task.time && (
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-bold">
                <FiClock size={12} />
                {task.time}
            </div>
        )}
      </div>

      {/* 4. Notes Section (Expandable) */}
      {showNotes && (
        <div className="mb-4 animate-in fade-in zoom-in-95 duration-200">
          <textarea
            className="w-full text-sm p-3 bg-amber-50 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-400 focus:outline-none resize-none text-slate-700 placeholder-amber-300"
            rows="3"
            placeholder="Type quick notes here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            onBlur={handleBlurNotes}
            autoFocus
          />
        </div>
      )}

      {/* 5. Footer Actions */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-100">
        
        {/* Toggle Notes */}
        <button 
          onClick={() => setShowNotes(!showNotes)}
          className={`p-2 rounded-lg transition-colors ${showNotes ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
          title={showNotes ? "Hide Notes" : "Add Notes"}
        >
          <FiFileText size={18} />
        </button>

        {/* Delete */}
        <button 
          onClick={() => onDelete(task._id)}
          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          title="Delete Task"
        >
          <FiTrash2 size={18} />
        </button>

        {/* Focus Button (Hidden if completed) */}
        {!isCompleted && (
           <button 
             onClick={handleStartFocus}
             className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
           >
             <FiPlay size={14} className="fill-current" /> Focus
           </button>
        )}

        {/* Complete Button */}
        <button 
          onClick={handleComplete}
          disabled={isCompleted}
          className={`ml-2 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all transform active:scale-95
            ${isCompleted 
              ? 'ml-auto bg-emerald-100 text-emerald-700 cursor-default' // Moves to right if Focus button is gone
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5'}`}
        >
          <FiCheckCircle size={16} />
          {isCompleted ? 'Done' : 'Finish'}
        </button>
      </div>
    </div>
  );
};

export default TaskCard;