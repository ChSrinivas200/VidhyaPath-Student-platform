import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiFileText, FiHelpCircle, FiClock, FiArrowRight, FiBook, 
  FiLayout, FiTrash2, FiActivity, FiMusic, FiPlay, FiSquare, FiHeadphones
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

import TaskCard from '../components/TaskCard';
import Visualizer from './Visualizer'; 
import { fetchTasks, updateTask, deleteTask } from '../services/plannerService';

// --- SUB-COMPONENT: Focus Frequency Player (Frontend Generator) ---
const FocusMusicWidget = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState(null); // '432' or 'focus'
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  const startTone = (mode) => {
    // 1. Stop existing sound if any
    stopTone();

    // 2. Init Audio Context
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;

    // 3. Create Oscillator & Gain (Volume)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (mode === '432') {
      // 432 Hz Healing Frequency (Pure Sine Wave)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime); // 15% Volume
    } else {
      // Focus Frequency (Low Drone - 110 Hz Triangle Wave)
      // 110 Hz is A2, good for grounding/focus without distraction
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime); // 8% Volume
    }

    // 4. Connect and Play
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    oscRef.current = osc;
    gainRef.current = gain;
    setActiveMode(mode);
    setIsPlaying(true);
  };

  const stopTone = () => {
    if (oscRef.current && audioCtxRef.current) {
      try {
        // Smooth fade out to prevent clicking sound
        const ctx = audioCtxRef.current;
        gainRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        oscRef.current.stop(ctx.currentTime + 0.1);
      } catch (e) {
        console.error("Audio stop error", e);
      }
    }
    setIsPlaying(false);
    setActiveMode(null);
  };

  const togglePlay = (mode) => {
    if (isPlaying && activeMode === mode) {
      stopTone();
    } else {
      startTone(mode);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopTone();
  }, []);

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${isPlaying ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-gray-200'}`}>
      <div className={`p-3 rounded-full transition-colors ${isPlaying ? 'bg-indigo-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
        {isPlaying ? <FiHeadphones size={24} /> : <FiMusic size={24} />}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-800">Focus Music</h3>
        <div className="flex gap-2 mt-1">
          {/* 432Hz Button */}
          <button 
            onClick={() => togglePlay('432')}
            className={`text-xs px-3 py-1.5 rounded-md font-bold border transition-all flex items-center gap-1 ${activeMode === '432' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {activeMode === '432' ? <FiSquare size={10} fill="currentColor" /> : <FiPlay size={10} />}
            432 Hz
          </button>

          {/* Focus Button */}
          <button 
            onClick={() => togglePlay('focus')}
            className={`text-xs px-3 py-1.5 rounded-md font-bold border transition-all flex items-center gap-1 ${activeMode === 'focus' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
             {activeMode === 'focus' ? <FiSquare size={10} fill="currentColor" /> : <FiPlay size={10} />}
             Deep Focus
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---
const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    if (!token) navigate('/login');
    else {
      setUserName(name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Student');
      loadTasksData();
    }
  }, [navigate]);

  const loadTasksData = async () => {
    try {
      const tasksData = await fetchTasks();
      setTasks(tasksData);
    } catch (error) { console.error(error); }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, isCompleted: true } : t));
      await updateTask(taskId, { isCompleted: true });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (error) { console.error(error); }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete task?")) {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
    }
  };
  
  const handleResetDashboard = async () => {
    if (window.confirm("Reset All?")) {
       try { await Promise.all(tasks.map(t => deleteTask(t._id))); setTasks([]); } catch (error) { console.error(error); }
    }
  };

  const handleUpdateNotes = async (taskId, newNotes) => await updateTask(taskId, { notes: newNotes });
  const filterTasks = (priority) => tasks.filter(t => t.priority === priority && !t.isCompleted);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen font-sans animate-fadeIn">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName} 👋</h1>
            <p className="text-gray-500 mt-1">Here is your study overview for today.</p>
        </div>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
             <div className="flex gap-4">
                <div className="text-center px-4">
                    <span className="block text-xl font-bold text-indigo-600">{tasks.filter(t => !t.isCompleted).length}</span>
                    <span className="text-xs text-gray-400 uppercase font-bold">Pending</span>
                </div>
                <div className="text-center px-4 border-l">
                    <span className="block text-xl font-bold text-green-600">{tasks.filter(t => t.isCompleted).length}</span>
                    <span className="text-xs text-gray-400 uppercase font-bold">Completed</span>
                </div>
             </div>
             <button onClick={handleResetDashboard} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><FiTrash2 size={20} /></button>
        </div>
      </div>

      {/* --- SMART ENVIRONMENT SECTION --- */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FiActivity className="text-indigo-500"/> Smart Environment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1: Music Player */}
            <FocusMusicWidget />
        </div>
      </div>

      {/* PRIORITY MATRIX */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FiLayout /> Priority Matrix</h2>
          <Link to="/study-planner" className="text-sm font-semibold text-indigo-600 hover:underline">Open Full Planner &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-bold text-red-600 bg-red-50 p-3 rounded-lg text-center border border-red-100 shadow-sm">🔥 Do First</h3>
            {filterTasks('do_first').map(task => (<TaskCard key={task._id} task={task} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onUpdateNotes={handleUpdateNotes} />))}
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-blue-600 bg-blue-50 p-3 rounded-lg text-center border border-blue-100 shadow-sm">📅 Schedule</h3>
            {filterTasks('schedule').map(task => (<TaskCard key={task._id} task={task} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onUpdateNotes={handleUpdateNotes} />))}
          </div>
          <div className="space-y-3">
             <h3 className="font-bold text-orange-600 bg-orange-50 p-3 rounded-lg text-center border border-orange-100 shadow-sm">🤝 Delegate</h3>
             {filterTasks('delegate').map(task => (<TaskCard key={task._id} task={task} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onUpdateNotes={handleUpdateNotes} />))}
          </div>
          <div className="space-y-3">
             <h3 className="font-bold text-gray-600 bg-gray-100 p-3 rounded-lg text-center border border-gray-200 shadow-sm">🗑️ Eliminate</h3>
             {filterTasks('delete').map(task => (<TaskCard key={task._id} task={task} onComplete={handleCompleteTask} onDelete={handleDeleteTask} onUpdateNotes={handleUpdateNotes} />))}
          </div>
        </div>
      </div>

      {/* QUICK TOOLS */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6"> 
          <Link to="/summarizer" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3"><FiFileText size={24} /></div>
            <h3 className="font-bold text-slate-800">Summarizer</h3>
          </Link>
          <Link to="/quiz-generator" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3"><FiHelpCircle size={24} /></div>
             <h3 className="font-bold text-slate-800">Quiz Gen</h3>
          </Link>
          <Link to="/pdf-viewer" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-3"><FiBook size={24} /></div>
             <h3 className="font-bold text-slate-800">PDF Viewer</h3>
          </Link>
          <Link to="/visualizer" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center">
             <div className="p-3 bg-sky-50 text-sky-600 rounded-full mb-3"><FiClock size={24} /></div>
             <h3 className="font-bold text-slate-800">Visualizer</h3>
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Practice</h2>
        <Visualizer />
      </div>
    </div>
  );
};

export default Dashboard;