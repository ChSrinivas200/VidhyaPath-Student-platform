import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, CheckCircle, ArrowLeft } from 'lucide-react';
import { updateTask } from '../services/plannerService'; 
import confetti from 'canvas-confetti';

const FocusPage = () => {
  const { state } = useLocation(); // Receive  task data passed from Planner
  const navigate = useNavigate();
  
  // Default to 25 minutes (1500 seconds)
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isActive, setIsActive] = useState(false);
  const task = state?.task || { title: "Focus Session", subject: "General" }; // Fallback

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play a sound here
      alert("Focus Session Complete!");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Format Time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate Progress for Circle Ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / (25 * 60);
  const dashoffset = circumference - (progress * circumference);

  // --- THE "FINISHED" ACTION ---
  const handleFinishTask = async () => {
    if (task._id) {
        try {
            // 1. Update Backend
            await updateTask(task._id, { isCompleted: true });
            
            // 2. Celebration!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#10B981'] // Indigo & Green
            });

            // 3. Go back to Dashboard
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            console.error("Failed to mark done:", error);
        }
    } else {
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-fadeIn">
      
      {/* Header / Back Button */}
      <div className="absolute top-6 left-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-indigo-600 transition font-medium">
            <ArrowLeft size={20} className="mr-2"/> Back to Planner
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
        
        {/* LEFT: THE CIRCULAR TIMER */}
        <div className="relative group">
            {/* SVG Ring */}
            <svg className="transform -rotate-90 w-80 h-80 drop-shadow-xl">
                {/* Background Ring */}
                <circle
                    cx="160" cy="160" r={radius}
                    stroke="#E2E8F0" strokeWidth="12" fill="white"
                />
                {/* Progress Ring */}
                <circle
                    cx="160" cy="160" r={radius}
                    stroke="#6366f1" strokeWidth="12" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                />
            </svg>

            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Focus Mode</p>
                <div className="text-6xl font-bold text-slate-800 tabular-nums tracking-tight">
                    {formatTime(timeLeft)}
                </div>
                {/* Play/Pause Button inside circle */}
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`mt-6 p-4 rounded-full transition-all mx-auto flex items-center justify-center shadow-lg hover:scale-105 ${isActive ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                >
                    {isActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" className="ml-1" size={24} />}
                </button>
            </div>
        </div>

        {/* RIGHT: CONTEXT & ACTIONS */}
        <div className="text-center md:text-left max-w-md">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">You've got this.</h1>
            <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                Focusing on <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">"{task.title}"</span> makes you up to five times more productive.
            </p>

            {/* The Requested "Finished" Button */}
            <div className="space-y-4">
                <button 
                    onClick={handleFinishTask}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-8 rounded-2xl text-lg font-bold shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-[0.98]"
                >
                    <CheckCircle size={28} />
                    I Finished This Task!
                </button>

                <button 
                    onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }} 
                    className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-semibold hover:bg-slate-100 py-3 rounded-xl transition-colors"
                >
                    <RotateCcw size={16} /> Reset Timer
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FocusPage;