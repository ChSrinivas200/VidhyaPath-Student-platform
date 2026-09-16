import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateTask } from '../services/plannerService';
import confetti from 'canvas-confetti';
import { focusAudio } from '../utils/FocusAudioEngine';
import {
  FiHeadphones,
  FiMusic,
  FiVolume2,
  FiVolumeX,
  FiMaximize2,
  FiMinimize2,
  FiCoffee,
  FiZap,
  FiTarget,
  FiSkipForward,
  FiRotateCcw,
  FiCheck,
  FiArrowLeft,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiClock,
  FiX
} from 'react-icons/fi';

// Presets for Focus & Break rhythms
const FOCUS_MODES = {
  pomodoro: {
    id: 'pomodoro',
    name: 'Pomodoro 25/5',
    icon: '🍅',
    focusDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    longBreakCycle: 4,
    description: 'Classic 25m work + 5m short rest. Long break every 4 sessions.',
    themeColor: 'from-indigo-600 to-purple-600',
    ringColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.45)',
  },
  deep_focus: {
    id: 'deep_focus',
    name: 'Deep Focus 50/10',
    icon: '⚡',
    focusDuration: 50 * 60,
    shortBreakDuration: 10 * 60,
    longBreakDuration: 20 * 60,
    longBreakCycle: 2,
    description: 'Intense 50m flow state sprint for complex coding, math & research.',
    themeColor: 'from-blue-600 via-indigo-600 to-cyan-500',
    ringColor: '#0ea5e9',
    glowColor: 'rgba(14, 165, 233, 0.45)',
  },
  sprint: {
    id: 'sprint',
    name: 'Quick Sprint 15/3',
    icon: '🚀',
    focusDuration: 15 * 60,
    shortBreakDuration: 3 * 60,
    longBreakDuration: 10 * 60,
    longBreakCycle: 4,
    description: 'Rapid 15m focus blast for quick review, flashcards, or emails.',
    themeColor: 'from-purple-600 to-pink-600',
    ringColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
  },
  flow: {
    id: 'flow',
    name: 'Ultradian Flow 90/20',
    icon: '🌊',
    focusDuration: 90 * 60,
    shortBreakDuration: 20 * 60,
    longBreakDuration: 30 * 60,
    longBreakCycle: 2,
    description: '90m peak circadian cycle for unbroken immersion & deep mastery.',
    themeColor: 'from-violet-600 to-indigo-800',
    ringColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.45)',
  },
};

// Available Soundscapes
const SOUNDSCAPES = [
  { id: 'alpha', name: 'Alpha Waves (10 Hz)', desc: 'Flow State & Calm Clarity', type: 'binaural', base: 200, offset: 10, icon: '🧠' },
  { id: 'beta', name: 'Beta Waves (20 Hz)', desc: 'High Alertness & Coding', type: 'binaural', base: 220, offset: 20, icon: '⚡' },
  { id: 'theta', name: 'Theta Waves (6 Hz)', desc: 'Deep Creative Visualization', type: 'binaural', base: 180, offset: 6, icon: '🧘' },
  { id: 'rain', name: 'Gentle Rain', desc: 'Soothing Foliage Pink Noise', type: 'rain', icon: '🌧️' },
  { id: 'ocean', name: 'Ocean Waves', desc: 'Swell & Ebb Rhythm', type: 'ocean', icon: '🌊' },
  { id: 'forest', name: 'Forest Stream', desc: 'Natural Acoustic Grounding', type: 'forest', icon: '🌲' },
  { id: 'white', name: 'White Noise', desc: 'Distraction Blocking', type: 'white', icon: '📻' },
];

const FocusPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const task = state?.task || null;

  // Mode & Timer State
  const [selectedModeKey, setSelectedModeKey] = useState('pomodoro');
  const currentMode = FOCUS_MODES[selectedModeKey];

  const [phase, setPhase] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
  const [sessionCount, setSessionCount] = useState(1); // 1 to longBreakCycle
  const [timeLeft, setTimeLeft] = useState(currentMode.focusDuration);
  const [isActive, setIsActive] = useState(false);
  const [taskTitle, setTaskTitle] = useState(task?.title || 'Distributed Systems & Deep Study');
  const [isEditingTask, setIsEditingTask] = useState(false);

  // Audio Player State
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false);
  const [activeSoundId, setActiveSoundId] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Stats State (Persisted)
  const [todaySessions, setTodaySessions] = useState(() => {
    const saved = localStorage.getItem('vidyapath_focus_sessions');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [todayMinutes, setTodayMinutes] = useState(() => {
    const saved = localStorage.getItem('vidyapath_focus_minutes');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Auto-switch duration when mode changes (if timer paused in focus)
  const handleModeChange = (modeKey) => {
    setSelectedModeKey(modeKey);
    const newMode = FOCUS_MODES[modeKey];
    setIsActive(false);
    if (phase === 'focus') {
      setTimeLeft(newMode.focusDuration);
    } else if (phase === 'short_break') {
      setTimeLeft(newMode.shortBreakDuration);
    } else {
      setTimeLeft(newMode.longBreakDuration);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handlePhaseCompletion();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, timeLeft]);

  // Phase Completion Handler
  const handlePhaseCompletion = () => {
    setIsActive(false);
    focusAudio.playChime();

    if (phase === 'focus') {
      // Focus Completed!
      const completedMins = Math.round(currentMode.focusDuration / 60);
      const newTotalSessions = todaySessions + 1;
      const newTotalMinutes = todayMinutes + completedMins;
      setTodaySessions(newTotalSessions);
      setTodayMinutes(newTotalMinutes);
      localStorage.setItem('vidyapath_focus_sessions', newTotalSessions.toString());
      localStorage.setItem('vidyapath_focus_minutes', newTotalMinutes.toString());

      // Celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10B981', '#F59E0B', '#EC4899'],
      });

      // Determine next break: check if completed 4 sessions
      if (sessionCount >= currentMode.longBreakCycle) {
        // Milestone: Long Break!
        setPhase('long_break');
        setTimeLeft(currentMode.longBreakDuration);
        setSessionCount(1); // Reset cycle for next round
      } else {
        // Short Break!
        setPhase('short_break');
        setTimeLeft(currentMode.shortBreakDuration);
        setSessionCount((prev) => prev + 1);
      }
    } else {
      // Break Completed -> Resume Focus
      setPhase('focus');
      setTimeLeft(currentMode.focusDuration);
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#6366f1', '#3b82f6'],
      });
    }
  };

  // Skip Phase Action
  const handleSkipPhase = () => {
    handlePhaseCompletion();
  };

  // Reset Current Phase
  const handleResetPhase = () => {
    setIsActive(false);
    if (phase === 'focus') {
      setTimeLeft(currentMode.focusDuration);
    } else if (phase === 'short_break') {
      setTimeLeft(currentMode.shortBreakDuration);
    } else {
      setTimeLeft(currentMode.longBreakDuration);
    }
  };

  // Time Adjustment (+5 or -5 min)
  const handleAdjustTime = (deltaMinutes) => {
    setTimeLeft((prev) => Math.max(60, prev + deltaMinutes * 60));
  };

  // Audio Playback
  const handleToggleSound = (sound) => {
    if (activeSoundId === sound.id) {
      // Stop
      focusAudio.stop();
      setActiveSoundId(null);
    } else {
      // Start
      setActiveSoundId(sound.id);
      focusAudio.setVolume(isMuted ? 0 : volume);
      if (sound.type === 'binaural') {
        focusAudio.playBinaural(sound.base, sound.offset, sound.name);
      } else if (sound.type === 'rain') {
        focusAudio.playRain();
      } else if (sound.type === 'ocean') {
        focusAudio.playOcean();
      } else if (sound.type === 'forest') {
        focusAudio.playForest();
      } else if (sound.type === 'white') {
        focusAudio.playWhiteNoise();
      }
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    setIsMuted(false);
    focusAudio.setVolume(newVol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      focusAudio.setVolume(volume);
    } else {
      setIsMuted(true);
      focusAudio.setVolume(0);
    }
  };

  // Stop audio on component unmount
  useEffect(() => {
    return () => {
      focusAudio.stop();
    };
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // "Finished Task" action
  const handleFinishTask = async () => {
    if (task && task._id) {
      try {
        await updateTask(task._id, { isCompleted: true });
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#10B981', '#6366f1', '#F59E0B'],
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (error) {
        console.error('Failed to mark task complete:', error);
        navigate('/dashboard');
      }
    } else {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  // Format Time Helper (MM:SS)
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate SVG Progress Ring
  const totalPhaseDuration =
    phase === 'focus'
      ? currentMode.focusDuration
      : phase === 'short_break'
      ? currentMode.shortBreakDuration
      : currentMode.longBreakDuration;

  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, timeLeft / totalPhaseDuration));
  const dashoffset = circumference - progressRatio * circumference;

  // Visual Theme mapping based on current phase
  const getPhaseTheme = () => {
    if (phase === 'focus') {
      return {
        label: 'Deep Focus Session',
        badge: 'FOCUS TIME',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        ringStroke: currentMode.ringColor,
        glowColor: currentMode.glowColor,
        buttonBg: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/30',
        quote: 'Block all distractions and dive into uninterrupted cognitive flow.',
      };
    } else if (phase === 'short_break') {
      return {
        label: 'Short Rest & Recharge',
        badge: '☕ 5-MIN BREATHER',
        badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        ringStroke: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.45)',
        buttonBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/30',
        quote: 'Take a deep breath, hydrate, stretch your shoulders, and rest your eyes.',
      };
    } else {
      return {
        label: 'Restorative Long Break',
        badge: '🎉 4 SESSIONS COMPLETED • LONG BREAK',
        badgeBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        ringStroke: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.45)',
        buttonBg: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/30',
        quote: 'Outstanding discipline! Step away from screens, take a walk, and absorb what you learned.',
      };
    }
  };

  const currentTheme = getPhaseTheme();

  return (
    <div
      ref={containerRef}
      className={`min-h-screen relative overflow-x-hidden flex flex-col justify-between transition-colors duration-500 ${
        phase === 'focus'
          ? 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100'
          : phase === 'short_break'
          ? 'bg-emerald-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100'
          : 'bg-amber-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100'
      }`}
    >
      {/* Background Ambient Radial Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 dark:opacity-20 transition-all duration-700"
        style={{ backgroundColor: currentTheme.ringStroke }}
      />

      {/* =========================================================================
          TOP NAVIGATION & CONTROLS BAR
          ========================================================================= */}
      <header className="relative z-30 px-4 sm:px-8 py-4 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Left: Back & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all"
          >
            <FiArrowLeft size={15} /> Back
          </button>
          <span className="hidden sm:inline-block text-xs font-bold tracking-wider uppercase text-slate-400">
            Zen Focus Studio
          </span>
        </div>

        {/* Center: Mode Selector Pills */}
        <div className="order-3 md:order-2 w-full md:w-auto flex items-center justify-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
          {Object.values(FOCUS_MODES).map((mode) => {
            const isCurrent = mode.id === selectedModeKey;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Audio Mini-Player Icon & Fullscreen Toggle */}
        <div className="order-2 md:order-3 flex items-center gap-2">
          
          {/* 🎵 FOCUS MUSIC MINI BUTTON */}
          <div className="relative">
            <button
              onClick={() => setIsMusicMenuOpen(!isMusicMenuOpen)}
              title="Focus Music & Ambient Soundscapes"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
                activeSoundId
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 shadow-indigo-500/10'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
              }`}
            >
              <FiHeadphones className={activeSoundId ? 'text-indigo-600 animate-pulse' : ''} size={15} />
              <span className="hidden sm:inline">
                {activeSoundId ? 'Focus Audio' : 'Music'}
              </span>

              {/* Animated Equalizer Soundwave Bars when active */}
              {activeSoundId ? (
                <span className="flex items-end gap-0.5 h-3 ml-1">
                  <span className="w-0.5 h-full bg-indigo-500 animate-pulse"></span>
                  <span className="w-0.5 h-2/3 bg-indigo-400 animate-bounce"></span>
                  <span className="w-0.5 h-full bg-indigo-600 animate-pulse"></span>
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
              )}
            </button>

            {/* 🎧 EXPANDABLE MINI MUSIC FLYOUT */}
            {isMusicMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-fadeIn space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <FiMusic className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Focus Soundscapes
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMusicMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                  Synthesized in real-time via Web Audio API. Zero streaming lag.
                </p>

                {/* Track List */}
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {SOUNDSCAPES.map((sound) => {
                    const isSelected = activeSoundId === sound.id;
                    return (
                      <button
                        key={sound.id}
                        onClick={() => handleToggleSound(sound)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm">{sound.icon}</span>
                          <div>
                            <p className="text-xs font-bold leading-none">{sound.name}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sound.desc}</p>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                            Active
                          </span>
                        ) : (
                          <FiPlay size={12} className="text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Volume & Master Controls */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                    <span>Volume</span>
                    <span>{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleMute}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {isMuted || volume === 0 ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {activeSoundId && (
                    <button
                      onClick={() => handleToggleSound({ id: activeSoundId })}
                      className="w-full mt-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      Stop Soundscape
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Zen Mode Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Distraction-Free Fullscreen'}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-xs transition-colors"
          >
            {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN TIMER & INTERACTIVE WORKSPACE
          ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        
        {/* Phase Badge & Session Milestone Tracker */}
        <div className="flex flex-col items-center gap-3 mb-6 animate-fadeIn">
          
          {/* Current Phase Badge */}
          <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border shadow-xs transition-all ${currentTheme.badgeBg}`}>
            {currentTheme.badge}
          </div>

          {/* 🍅 4-Session Milestone Tracker Dots */}
          <div className="flex items-center gap-2 p-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
              <span>Cycle:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                Session {sessionCount} of {currentMode.longBreakCycle}
              </strong>
            </span>

            <div className="flex items-center gap-1.5 pr-2">
              {Array.from({ length: currentMode.longBreakCycle }).map((_, idx) => {
                const isCompleted = idx + 1 < sessionCount;
                const isCurrent = idx + 1 === sessionCount;
                return (
                  <div
                    key={idx}
                    title={`Session #${idx + 1}`}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isCurrent
                        ? 'ring-2 ring-indigo-500 bg-indigo-500/20 text-indigo-600 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  >
                    {isCompleted && <FiCheck size={10} strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =====================================================================
            CIRCULAR COUNTDOWN RING & ACTIVE CONTROLS
            ===================================================================== */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full max-w-4xl">
          
          {/* THE SVG CIRCULAR TIMER */}
          <div className="relative group">
            <svg className="transform -rotate-90 w-72 h-72 sm:w-80 sm:h-80 drop-shadow-2xl">
              {/* Background Ring */}
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-200/80 dark:text-slate-800/80"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke={currentTheme.ringStroke}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
                style={{
                  filter: `drop-shadow(0 0 16px ${currentTheme.glowColor})`,
                }}
              />
            </svg>

            {/* Inner Ring Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                {phase === 'focus' ? 'Focus Countdown' : phase === 'short_break' ? 'Short Rest' : 'Long Recharge'}
              </span>

              {/* Digits Display */}
              <div className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums drop-shadow-sm select-none">
                {formatTime(timeLeft)}
              </div>

              {/* Main Play / Pause Button */}
              <button
                onClick={() => setIsActive(!isActive)}
                className={`mt-5 p-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center ${currentTheme.buttonBg}`}
                title={isActive ? 'Pause Timer' : 'Start Timer'}
              >
                {isActive ? (
                  <FiPause size={24} className="text-white fill-current" />
                ) : (
                  <FiPlay size={24} className="text-white fill-current translate-x-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: CONTEXT, GOALS & ACTIONS */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md w-full space-y-5">
            
            {/* Target Objective Card */}
            <div className="w-full p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <FiTarget size={14} /> ACTIVE OBJECTIVE
                </span>
                {task?.subject && (
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase">
                    {task.subject}
                  </span>
                )}
              </div>

              {isEditingTask ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    onClick={() => setIsEditingTask(false)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingTask(true)}
                  className="cursor-pointer group flex items-start justify-between gap-2"
                  title="Click to edit task title"
                >
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    "{taskTitle}"
                  </h2>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {currentTheme.quote}
              </p>
            </div>

            {/* Timer Adjustment & Control Bar */}
            <div className="w-full grid grid-cols-4 gap-2">
              <button
                onClick={() => handleAdjustTime(-5)}
                className="py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 text-xs font-bold shadow-xs transition-all"
                title="Subtract 5 minutes"
              >
                -5m
              </button>
              <button
                onClick={() => handleAdjustTime(5)}
                className="py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 text-xs font-bold shadow-xs transition-all"
                title="Add 5 minutes"
              >
                +5m
              </button>
              <button
                onClick={handleSkipPhase}
                className="py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:border-indigo-400 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1"
                title="Skip to next phase"
              >
                <FiSkipForward size={14} /> Skip
              </button>
              <button
                onClick={handleResetPhase}
                className="py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1"
                title="Reset timer"
              >
                <FiRotateCcw size={14} /> Reset
              </button>
            </div>

            {/* The "I Finished This Task!" Button */}
            <button
              onClick={handleFinishTask}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3.5 px-6 rounded-2xl text-sm font-extrabold shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:scale-98"
            >
              <FiCheckCircle size={20} />
              <span>I Finished This Task!</span>
            </button>
          </div>
        </div>
      </main>

      {/* =========================================================================
          BOTTOM DOCK: STATS & MOTIVATION
          ========================================================================= */}
      <footer className="relative z-10 px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex flex-wrap items-center justify-around gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <FiZap className="text-amber-500" size={16} />
          <span>Sessions Today:</span>
          <strong className="font-extrabold text-slate-900 dark:text-white">{todaySessions}</strong>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <FiClock className="text-indigo-500" size={16} />
          <span>Total Focused:</span>
          <strong className="font-extrabold text-slate-900 dark:text-white">{todayMinutes} mins</strong>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <FiCoffee className="text-emerald-500" size={16} />
          <span>Break Rhythm:</span>
          <span className="text-slate-500 dark:text-slate-400">
            {currentMode.id === 'deep_focus' ? '50m Focus + 10m Break' : '25m Focus + 5m Break (15m on 4th)'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default FocusPage;