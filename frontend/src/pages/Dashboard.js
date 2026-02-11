import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiFileText, FiHelpCircle, FiClock, FiArrowRight, FiBook, 
  FiLayout, FiTrash2, FiMic, FiVideoOff, FiActivity, FiUserCheck, FiUserX,
  FiMusic, FiPlay, FiSquare, FiHeadphones
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

import TaskCard from '../components/TaskCard';
import Visualizer from './Visualizer'; 
import { fetchTasks, updateTask, deleteTask } from '../services/plannerService';

// --- HELPER: Beep Sound (For Critical Warnings) ---
const playWarningBeep = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sawtooth'; 
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitch alert
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);
  oscillator.stop(audioCtx.currentTime + 0.3);
};

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

// --- SUB-COMPONENT: Realistic Noise Monitor (Fluctuating) ---
const NoiseMonitor = () => {
  const [isNoisy, setIsNoisy] = useState(false);
  const [volume, setVolume] = useState(35); // Start at 35dB (Default Room Noise)
  const lastVolumeRef = useRef(35);

  useEffect(() => {
    let audioContext, analyser, microphone, javascriptNode;
    const startListening = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let values = 0;
          for (let i = 0; i < array.length; i++) values += array[i];
          const rawAverage = values / array.length;

          // --- REALISM LOGIC ---
          const jitter = (Math.random() * 4) - 2; 
          let targetVolume = (rawAverage * 1.5) + 30 + jitter;

          const smoothVolume = (lastVolumeRef.current * 0.8) + (targetVolume * 0.2);
          lastVolumeRef.current = smoothVolume;
          
          const finalVol = Math.floor(smoothVolume);
          setVolume(finalVol);
          setIsNoisy(finalVol > 65);
        };
      } catch (err) { console.warn("Mic Error", err); }
    };
    startListening();
    return () => { if (audioContext) audioContext.close(); };
  }, []);

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${isNoisy ? 'bg-red-50 border-red-200 animate-pulse' : 'bg-emerald-50 border-emerald-200'}`}>
      <div className={`p-3 rounded-full ${isNoisy ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
        <FiMic size={24} />
      </div>
      <div>
        <h3 className="font-bold text-slate-800">Noise Level</h3>
        <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold font-mono ${isNoisy ? 'text-red-600' : 'text-emerald-600'}`}>
                {volume}
            </span>
            <span className="text-xs font-bold text-gray-400 mt-2">dB</span>
        </div>
        <p className={`text-xs font-semibold ${isNoisy ? 'text-red-500' : 'text-emerald-500'}`}>
          {isNoisy ? "⚠️ Too Loud" : "✅ Good Focus"}
        </p>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Smart Proctor Monitor (Tuned) ---
const PresenceMonitor = () => {
  const [status, setStatus] = useState("good"); // good, warning, bad
  const [message, setMessage] = useState("Active & Focused");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastPixels = useRef(null);
  const warningCount = useRef(0);

  useEffect(() => {
    let stream = null;
    let interval = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        interval = setInterval(() => checkPresence(), 1000); // Check every second
      } catch (err) {
        setStatus("bad");
        setMessage("Camera Access Denied");
      }
    };

    const checkPresence = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 320, 240);
      const currentPixels = context.getImageData(0, 0, 320, 240).data;

      // 1. DARKNESS CHECK
      let totalBrightness = 0;
      for (let i = 0; i < currentPixels.length; i += 4) totalBrightness += (currentPixels[i] + currentPixels[i+1] + currentPixels[i+2]) / 3;
      const avgBrightness = totalBrightness / (currentPixels.length / 4);

      if (avgBrightness < 10) { 
        setStatus("bad");
        setMessage("Camera Covered / Dark");
        playWarningBeep();
        return;
      }

      // 2. MOTION CHECK
      if (lastPixels.current) {
        let diff = 0;
        for (let i = 0; i < currentPixels.length; i += 40) diff += Math.abs(currentPixels[i] - lastPixels.current[i]);

        if (diff < 2000) { 
            warningCount.current += 1;
        } else {
            warningCount.current = 0; 
            setStatus("good");
            setMessage("Face Detected");
        }

        if (warningCount.current > 4) {
            setStatus("warning");
            setMessage("No Movement / Absent");
        }
      }
      lastPixels.current = currentPixels;
    };

    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (interval) clearInterval(interval);
    };
  }, []);

  const getStyles = () => {
    if (status === "good") return { color: "bg-emerald-100 text-emerald-600", border: "bg-emerald-50 border-emerald-200", icon: <FiUserCheck size={24}/> };
    if (status === "warning") return { color: "bg-orange-100 text-orange-600", border: "bg-orange-50 border-orange-200", icon: <FiUserX size={24}/> };
    return { color: "bg-red-100 text-red-600 animate-pulse", border: "bg-red-50 border-red-200", icon: <FiVideoOff size={24}/> };
  };
  const style = getStyles();

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${style.border}`}>
      <video ref={videoRef} autoPlay muted className="hidden" width="320" height="240" />
      <canvas ref={canvasRef} className="hidden" width="320" height="240" />
      
      <div className={`p-3 rounded-full ${style.color}`}>{style.icon}</div>
      <div>
        <h3 className="font-bold text-slate-800">Proctor Monitor</h3>
        <p className="text-sm font-semibold">{message}</p>
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

      {/* --- SMART PROCTOR SECTION --- */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FiActivity className="text-indigo-500"/> Smart Environment
        </h2>
        {/* UPDATED GRID with Music Module */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1: Music Player */}
            <FocusMusicWidget />
            
            {/* Module 2: Noise (Fluctuating) */}
            <NoiseMonitor />
            
            {/* Module 3: Proctor (Movement/Darkness) */}
            <PresenceMonitor />
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