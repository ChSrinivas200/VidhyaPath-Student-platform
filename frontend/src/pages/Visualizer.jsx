import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiPlay, 
  FiPause, 
  FiRotateCcw, 
  FiZap, 
  FiShuffle, 
  FiEdit3, 
  FiChevronDown, 
  FiChevronUp,
  FiRewind,
  FiFastForward,
  FiCheck,
  FiSliders
} from 'react-icons/fi';

// Curated library of reading passages
const PASSAGE_LIBRARY = [
  {
    category: 'Deep Work & Focus',
    title: 'The Law of Deep Work',
    text: "Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship. To produce at your peak level you need to work for extended periods with full concentration on a single task free from all distraction."
  },
  {
    category: 'Official Statistics',
    title: 'Macroeconomic Accounting & IIP',
    text: "In the framework of National Accounts, macroeconomic price indices reflect structural shifts across production sectors. The Index of Industrial Production (IIP) measures short-term volume changes of industrial products with the Laspeyres weighted formulation. Consistent field verification, random sampling stratification, and non-sampling error reduction ensure that national indicators provide reliable empirical guidance for fiscal and monetary policy formulation."
  },
  {
    category: 'AI & Data Science',
    title: 'Retrieval Augmented Generation',
    text: "Retrieval-Augmented Generation bridges generative parametric intelligence with external grounded memory. By transforming unstructured lecture notes and textbooks into high-dimensional vector embeddings, semantic search retrieves precise paragraph contexts at query time. This eliminates hallucinations, enables accurate clause citations, and empowers learners to master complex technical curricula with speed and verifiable precision."
  },
  {
    category: 'Philosophy of Learning',
    title: 'The Geometry of Consistency',
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts. Every small step you take today builds the empire of your tomorrow. Stay focused, stay curious. Consistency beats intensity every single time. Learning never exhausts the mind; it is the only thing the mind never fears and never regrets."
  }
];

export default function Visualizer() {
  // Selected category index
  const [passageIndex, setPassageIndex] = useState(0);
  const [inputText, setInputText] = useState(PASSAGE_LIBRARY[0].text);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Speed and display
  const [wpm, setWpm] = useState(400);
  const [fontSize, setFontSize] = useState(56); // in px
  const [isPlaying, setIsPlaying] = useState(false);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const intervalRef = useRef(null);
  const displayContainerRef = useRef(null);

  // Parse text into words whenever inputText changes
  useEffect(() => {
    const rawWords = inputText
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    setWords(rawWords.length > 0 ? rawWords : ['Ready']);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [inputText]);

  // Optimal Recognition Point (ORP) calculator
  const getOrpComponents = (word) => {
    if (!word) return { left: '', focal: '', right: '' };
    const len = word.length;
    let orpIndex = 0;
    if (len === 1) orpIndex = 0;
    else if (len <= 5) orpIndex = 1;
    else if (len <= 9) orpIndex = 2;
    else if (len <= 13) orpIndex = 3;
    else orpIndex = 4;

    return {
      left: word.substring(0, orpIndex),
      focal: word.charAt(orpIndex),
      right: word.substring(orpIndex + 1)
    };
  };

  // Speed calculation
  const calculateDelay = useCallback(() => {
    return Math.max(25, Math.round(60000 / wpm));
  }, [wpm]);

  // Step function
  const stepForward = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev + 1 >= words.length) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [words.length]);

  // Interval ticker
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(stepForward, calculateDelay());
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, calculateDelay, stepForward]);

  // Keyboard controls: Space to play/pause, Arrows to seek
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in textarea
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 10));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(words.length - 1, prev + 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [words.length]);

  // Handlers
  const handleTogglePlay = () => {
    if (currentIndex >= words.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleSeek = (delta) => {
    setCurrentIndex((prev) => Math.min(Math.max(0, prev + delta), words.length - 1));
  };

  const handleSelectPassage = (idx) => {
    setPassageIndex(idx);
    setInputText(PASSAGE_LIBRARY[idx].text);
    setIsPlaying(false);
  };

  const handleShuffle = () => {
    const nextIdx = (passageIndex + 1) % PASSAGE_LIBRARY.length;
    handleSelectPassage(nextIdx);
  };

  // Progress metrics
  const currentWord = words[currentIndex] || 'Ready';
  const { left, focal, right } = getOrpComponents(currentWord);
  const progressPercent = words.length > 0 ? Math.round(((currentIndex + 1) / words.length) * 100) : 0;
  const wordsRemaining = Math.max(0, words.length - (currentIndex + 1));
  const secondsLeft = Math.round((wordsRemaining / (wpm / 60)));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn select-none pb-8">
      
      {/* 1. TOP HEADER & CATEGORY BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
            <FiZap size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              RSVP Speed Reader & Visualizer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optimal Recognition Point (ORP) focal streaming • Zero saccade delay
            </p>
          </div>
        </div>

        {/* Quick Passage & Edit Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Next Passage"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition border border-slate-200 dark:border-slate-700"
          >
            <FiShuffle size={14} />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              isEditorOpen
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FiEdit3 size={14} />
            <span>Custom Text</span>
            {isEditorOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </div>

      </div>

      {/* 2. PRESET PASSAGE CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PASSAGE_LIBRARY.map((p, idx) => (
          <button
            key={p.title}
            onClick={() => handleSelectPassage(idx)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              passageIndex === idx
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 scale-102'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300'
            }`}
          >
            {p.category}
          </button>
        ))}
      </div>

      {/* 3. CUSTOM TEXT INPUT COLLAPSIBLE DRAWER */}
      {isEditorOpen && (
        <div className="glass-card rounded-2xl p-5 border border-indigo-200 dark:border-indigo-900/60 animate-fadeIn space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Paste Lecture / Study Text
            </span>
            <span className="text-xs text-slate-400">
              {words.length} words detected
            </span>
          </div>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste any chapter text, syllabus notes, or article here to speed-read..."
            className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              <FiCheck size={14} />
              <span>Apply & Close</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN RSVP COCKPIT (THE FOCAL DISPLAY) */}
      <div 
        ref={displayContainerRef}
        className="relative bg-[#070b16] border border-[#1a233e] rounded-3xl h-72 sm:h-80 flex flex-col justify-between p-6 shadow-2xl overflow-hidden group"
      >
        {/* Subtle holographic background grid */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#6366f1 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Status & Metrics */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-slate-300">
              Word {currentIndex + 1} of {words.length}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 font-semibold">{progressPercent}%</span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span>⏱ ~{secondsLeft}s left</span>
            <div className="flex items-center gap-1 bg-[#10162a] border border-[#202b52] rounded-lg px-2 py-0.5">
              <button 
                onClick={() => setFontSize((f) => Math.max(36, f - 6))}
                className="text-slate-400 hover:text-white px-1 text-xs"
                title="Decrease Font Size"
              >
                A-
              </button>
              <button 
                onClick={() => setFontSize((f) => Math.min(84, f + 6))}
                className="text-slate-400 hover:text-white px-1 text-xs font-bold"
                title="Increase Font Size"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* Center: ORP Word Display with Optical Alignment Guides */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
          
          {/* Top focal crosshair guide tick */}
          <div className="w-0.5 h-3.5 bg-rose-500/80 mb-2 rounded-full shadow-[0_0_8px_#f43f5e]" />

          {/* Focal Word Output */}
          <div 
            className="font-mono font-black tracking-normal flex items-baseline select-none transition-transform"
            style={{ fontSize: `${fontSize}px` }}
          >
            {/* Left segment (aligned to the right of left box) */}
            <span className="text-slate-300 text-right min-w-[140px] sm:min-w-[220px]">
              {left}
            </span>

            {/* Center Focal Letter (Spritz ORP Anchor) */}
            <span className="text-rose-500 font-extrabold px-0.5 relative">
              {focal}
              <span className="absolute -inset-1 bg-rose-500/10 rounded blur-sm pointer-events-none" />
            </span>

            {/* Right segment (aligned to the left of right box) */}
            <span className="text-slate-300 text-left min-w-[140px] sm:min-w-[220px]">
              {right}
            </span>
          </div>

          {/* Bottom focal crosshair guide tick */}
          <div className="w-0.5 h-3.5 bg-rose-500/80 mt-2 rounded-full shadow-[0_0_8px_#f43f5e]" />

        </div>

        {/* Bottom Progress Bar across the display */}
        <div className="relative z-10 w-full">
          <div className="w-full bg-[#13192f] h-1.5 rounded-full overflow-hidden border border-[#20294c]">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500 transition-all duration-150 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* 5. CONTROLS COCKPIT */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-5">
        
        {/* Playback Button Row */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          
          {/* Rewind 10 words */}
          <button
            onClick={() => handleSeek(-10)}
            title="Rewind 10 words (Left Arrow)"
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition active:scale-95 flex items-center gap-1 text-xs font-semibold"
          >
            <FiRewind size={18} />
            <span className="hidden sm:inline">-10</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            title="Reset to beginning"
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition active:scale-95"
          >
            <FiRotateCcw size={18} />
          </button>

          {/* Large Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className={`px-8 sm:px-12 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/30 ring-4 ring-amber-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 hover:scale-102 ring-4 ring-indigo-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <FiPause size={20} className="fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <FiPlay size={20} className="fill-current ml-0.5" />
                <span>{currentIndex >= words.length - 1 ? 'Replay' : 'Start Reading'}</span>
              </>
            )}
          </button>

          {/* Fast Forward 10 words */}
          <button
            onClick={() => handleSeek(10)}
            title="Skip 10 words (Right Arrow)"
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition active:scale-95 flex items-center gap-1 text-xs font-semibold"
          >
            <span className="hidden sm:inline">+10</span>
            <FiFastForward size={18} />
          </button>

        </div>

        {/* Speed Slider & Presets */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FiSliders size={13} className="text-indigo-500" />
              <span>Speed Control</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Current Pace:</span>
              <span className="text-sm font-mono font-extrabold px-3 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                {wpm} WPM
              </span>
            </div>
          </div>

          {/* Speed Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Relaxed', speed: 250 },
              { label: 'Focused', speed: 400 },
              { label: 'Sprint', speed: 600 },
              { label: 'Hyper', speed: 850 }
            ].map((preset) => (
              <button
                key={preset.speed}
                onClick={() => setWpm(preset.speed)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  wpm === preset.speed
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {preset.speed} WPM ({preset.label})
              </button>
            ))}
          </div>

          {/* Smooth slider */}
          <input
            type="range"
            min="100"
            max="1200"
            step="25"
            value={wpm}
            onChange={(e) => setWpm(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Slow (100 WPM)</span>
            <span className="hidden sm:inline">Spacebar: Play/Pause • Arrows: Seek ±10 words</span>
            <span>Fast (1200 WPM)</span>
          </div>

        </div>

      </div>

    </div>
  );
}