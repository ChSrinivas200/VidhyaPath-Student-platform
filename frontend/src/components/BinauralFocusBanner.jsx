import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHeadphones, 
  FiPlay, 
  FiPause, 
  FiPlus, 
  FiArrowRight, 
  FiVolume2, 
  FiVolumeX, 
  FiX, 
  FiCheck 
} from 'react-icons/fi';
import { createTask } from '../services/plannerService';

// Audio Synthesizer Class using native Web Audio API
class BinauralAudioEngine {
  constructor() {
    this.ctx = null;
    this.currentTrack = null;
    this.gainNode = null;
    this.activeNodes = [];
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stop() {
    if (!this.ctx) {
      this.currentTrack = null;
      return;
    }
    if (this.gainNode) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0.001, now + 0.25);
      setTimeout(() => {
        this.activeNodes.forEach((node) => {
          try {
            node.stop();
            node.disconnect();
          } catch (e) {}
        });
        this.activeNodes = [];
        this.currentTrack = null;
      }, 300);
    } else {
      this.activeNodes.forEach((node) => {
        try {
          node.stop();
          node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
      this.currentTrack = null;
    }
  }

  setVolume(val) {
    this.volume = val;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(val * 0.4, this.ctx.currentTime);
    }
  }

  playBinaural(baseFreq, beatOffset, trackName) {
    this.init();
    this.stop();

    setTimeout(() => {
      this.currentTrack = trackName;
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.4);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      // Left Channel
      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.setValueAtTime(baseFreq, now);

      // Right Channel (offset creates the target brainwave beat)
      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.setValueAtTime(baseFreq + beatOffset, now);

      if (this.ctx.createStereoPanner) {
        const pannerL = this.ctx.createStereoPanner();
        pannerL.pan.setValueAtTime(-0.8, now);
        oscL.connect(pannerL);
        pannerL.connect(masterGain);

        const pannerR = this.ctx.createStereoPanner();
        pannerR.pan.setValueAtTime(0.8, now);
        oscR.connect(pannerR);
        pannerR.connect(masterGain);
      } else {
        oscL.connect(masterGain);
        oscR.connect(masterGain);
      }

      oscL.start(now);
      oscR.start(now);
      this.activeNodes = [oscL, oscR];
    }, 150);
  }

  playRain() {
    this.init();
    this.stop();

    setTimeout(() => {
      this.currentTrack = 'Rain';
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(this.volume * 0.28, now + 0.6);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      // 5-second pink noise buffer
      const bufferSize = this.ctx.sampleRate * 5;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const output = noiseBuffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Rain acoustic filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.Q.setValueAtTime(1.0, now);

      noiseSource.connect(filter);
      filter.connect(masterGain);

      noiseSource.start(now);
      this.activeNodes = [noiseSource];
    }, 150);
  }
}

const audioEngine = new BinauralAudioEngine();

const BinauralFocusBanner = ({ onTaskCreated }) => {
  const navigate = useNavigate();
  const [activeSound, setActiveSound] = useState(null); // '432 Hz' | '110 Hz' | 'Rain' | null
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  // Quick Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('do_first');
  const [taskNotes, setTaskNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  const handleToggleSound = (soundKey) => {
    if (activeSound === soundKey) {
      audioEngine.stop();
      setActiveSound(null);
    } else {
      setActiveSound(soundKey);
      if (soundKey === '432 Hz') {
        // 432 Hz base with 10 Hz Alpha beat
        audioEngine.playBinaural(432, 10, '432 Hz');
      } else if (soundKey === '110 Hz') {
        // 110 Hz base with 4 Hz Theta beat
        audioEngine.playBinaural(110, 4, '110 Hz');
      } else if (soundKey === 'Rain') {
        audioEngine.playRain();
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (!isMuted) {
      audioEngine.setVolume(newVol);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: taskTitle.trim(),
        priority: taskPriority,
        notes: taskNotes.trim()
      });
      setTaskTitle('');
      setTaskNotes('');
      setIsTaskModalOpen(false);
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 select-none">
      
      {/* 1. LEFT CARD: BINAURAL FOCUS AUDIO */}
      <div className="lg:col-span-7 bg-[#0b0f19] border border-[#1a2238] rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/20">
        
        {/* Subtle background glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div>
          {/* Header with Headphones Icon & Title */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#171c35] border border-[#252c48] flex items-center justify-center text-indigo-400 shadow-inner">
                <FiHeadphones size={22} className={activeSound ? 'text-indigo-300 animate-pulse' : 'text-indigo-400'} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base sm:text-lg tracking-tight">
                  Binaural Focus Audio
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Select frequency for focus
                </p>
              </div>
            </div>

            {/* Live indicator or Volume toggle if active */}
            {activeSound && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#13192f] border border-indigo-500/30 text-indigo-300 text-xs font-medium animate-fadeIn">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span className="hidden sm:inline">Playing</span>
                <button 
                  onClick={toggleMute} 
                  title={isMuted ? "Unmute" : "Mute"}
                  className="ml-1 text-slate-400 hover:text-white transition-colors"
                >
                  {isMuted ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hidden md:block"
                />
              </div>
            )}
          </div>

          {/* Three frequency pills */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* Pill 1: 432 Hz */}
            <button
              onClick={() => handleToggleSound('432 Hz')}
              className={`py-3 px-3 sm:px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 group ${
                activeSound === '432 Hz'
                  ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-500 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                  : 'bg-[#11162b]/80 hover:bg-[#18203c] border-[#222944] hover:border-indigo-500/50 text-slate-300 hover:text-white'
              }`}
            >
              {activeSound === '432 Hz' ? (
                <FiPause size={15} className="text-indigo-400 animate-pulse" />
              ) : (
                <FiPlay size={15} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              )}
              <span>432 Hz</span>
            </button>

            {/* Pill 2: 110 Hz */}
            <button
              onClick={() => handleToggleSound('110 Hz')}
              className={`py-3 px-3 sm:px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 group ${
                activeSound === '110 Hz'
                  ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-500 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                  : 'bg-[#11162b]/80 hover:bg-[#18203c] border-[#222944] hover:border-indigo-500/50 text-slate-300 hover:text-white'
              }`}
            >
              {activeSound === '110 Hz' ? (
                <FiPause size={15} className="text-indigo-400 animate-pulse" />
              ) : (
                <FiPlay size={15} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              )}
              <span>110 Hz</span>
            </button>

            {/* Pill 3: Rain */}
            <button
              onClick={() => handleToggleSound('Rain')}
              className={`py-3 px-3 sm:px-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 group ${
                activeSound === 'Rain'
                  ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border-indigo-500 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.35)]'
                  : 'bg-[#11162b]/80 hover:bg-[#18203c] border-[#222944] hover:border-indigo-500/50 text-slate-300 hover:text-white'
              }`}
            >
              {activeSound === 'Rain' ? (
                <FiPause size={15} className="text-indigo-400 animate-pulse" />
              ) : (
                <FiPlay size={15} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              )}
              <span>Rain</span>
            </button>

          </div>
        </div>

      </div>

      {/* 2. RIGHT CARD: DEEP WORK BLOCK */}
      <div className="lg:col-span-5 bg-[#0b0f19] border border-[#1a2238] rounded-2xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/20">
        
        {/* Top-right corner arc & glowing emerald dot */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-950/40 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />
        <div className="absolute top-5 right-5 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
        </div>

        {/* Content */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400/90 block mb-1">
            DEEP WORK
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Start 25m Focus Block
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-sm">
            Block distractions, set high-intensity Pomodoro sprints, and earn streak rewards.
          </p>
        </div>

        {/* Action Row: + Add Task & Launch Focus */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-1">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5 py-2 px-1 focus:outline-none"
          >
            <FiPlus size={16} className="text-slate-400 group-hover:text-white" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => navigate('/focus')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:scale-102 active:scale-98 transition-all"
          >
            <span>Launch Focus</span>
            <FiArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* QUICK ADD TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1527] border border-[#232d4b] rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100">
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <FiPlus className="text-indigo-400" />
                <span>Quick Add Task to Sprint</span>
              </h4>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Complete Physics Chapter 3 Exercises"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[#161e36] border border-[#2a3556] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Eisenhower Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full bg-[#161e36] border border-[#2a3556] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="do_first">🔥 Do First (Urgent & Important)</option>
                  <option value="schedule">📅 Schedule (Important, Not Urgent)</option>
                  <option value="delegate">🤝 Delegate (Urgent, Less Important)</option>
                  <option value="delete">🗑️ Eliminate (Neither)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Optional Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Brief note or link..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full bg-[#161e36] border border-[#2a3556] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !taskTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Adding...' : (
                    <>
                      <FiCheck size={16} />
                      <span>Save Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default BinauralFocusBanner;
