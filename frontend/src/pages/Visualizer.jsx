import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api'; 
import { 
  FiPlay, 
  FiPause, 
  FiRotateCcw, 
  FiFastForward, 
  FiLoader, 
  FiZap,
  FiShuffle // Added Shuffle Icon
} from 'react-icons/fi';

/**
 * Visualizer Component
 * A self-contained speed reading (RSVP) module.
 */
export default function Visualizer() {
  
  // --- Motivational  Passages (New Content) ---
  const passages = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. Every small step you take today builds the empire of your tomorrow. Stay focused, stay hungry.",
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it.",
    "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking.",
    "Believe you can and you're halfway there. The future belongs to those who believe in the beauty of their dreams. Your potential is limitless if you just keep pushing.",
    "Education is the most powerful weapon which you can use to change the world. Learning never exhausts the mind. It is the only thing the mind never exhausts, never fears, and never regrets.",
    "It does not matter how slowly you go as long as you do not stop. Confucius said this centuries ago, and it remains true today. Consistency beats intensity every single time."
  ];

  const quotes = [
    'Let’s boost your focus today 💫',
    'Consistency beats speed — but why not both? 🚀',
    'Your only limit is your attention span 🔥',
    'Feed your mind. Focus your power. ⚡',
    'You’re not just reading — you’re evolving 🧠',
  ];

  // Initialize with a random passage
  const [inputText, setInputText] = useState(() => {
    const random = Math.floor(Math.random() * passages.length);
    return passages[random];
  });

  const [quote, setQuote] = useState(() => {
    const random = Math.floor(Math.random() * quotes.length);
    return quotes[random];
  });

  // --- State Variables ---
  const [chunks, setChunks] = useState([]);
  const [currentChunk, setCurrentChunk] = useState('Visualizer'); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);

  // --- Helper Functions ---
  
  // New: Shuffle Function
  const shufflePassage = () => {
    const random = Math.floor(Math.random() * passages.length);
    setInputText(passages[random]);
    setChunks([]); // Reset chunks so user has to click "Load" again
    setCurrentChunk('Visualizer');
  };

  const calculateDelay = () => {
    if (wpm === 0) return null;
    return 60000 / wpm;
  };

  const fetchChunks = async () => {
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);
    setCurrentChunk('Loading...');

    try {
      const response = await api.post('/visualizer/chunks', {
        text: inputText,
        chunkSize: 1,
      });

      const data = response.data;

      if (data.chunks && data.chunks.length > 0) {
        setChunks(data.chunks);
        setCurrentIndex(0);
        setCurrentChunk(data.chunks[0]);
      } else {
        setChunks([]);
        setCurrentChunk('No text found.');
      }
    } catch (err) {
      console.error(err);
      setError(
        `Error: ${err.message || 'Failed to process text'}. Is the backend running?`
      );
      setCurrentChunk('Error!');
    } finally {
      setIsLoading(false);
    }
  };

  const startReading = () => {
    if (chunks.length === 0 || isLoading) return;
    setIsPlaying(true);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= chunks.length) {
          clearInterval(intervalRef.current);
          setIsPlaying(false);
          setCurrentChunk('Done!');
          return prevIndex;
        }
        setCurrentChunk(chunks[nextIndex]);
        return nextIndex;
      });
    }, calculateDelay());
  };

  const pauseReading = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetReading = () => {
    pauseReading();
    if (chunks.length > 0) {
      setCurrentIndex(0);
      setCurrentChunk(chunks[0]);
    } else {
      setCurrentChunk('Visualizer');
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    startReading();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [wpm, isPlaying, chunks]);

  // --- Render ---
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 animate-fadeIn">
      
      {/* Header Quote */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full text-sm font-semibold mb-2">
            <FiZap className="fill-current" /> 
            <span>Speed Reader</span>
        </div>
        <p className="text-slate-500 font-medium text-lg">
           "{quote}"
        </p>
      </div>

      {/* Main Display Box (Dark Mode for High Contrast) */}
      <div className="bg-slate-900 rounded-2xl h-64 flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
        
        {/* Subtle Background Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <span className="text-5xl md:text-7xl font-extrabold text-white tracking-wide relative z-10 transition-all transform group-hover:scale-105 duration-200">
          {currentChunk}
        </span>
      </div>

      {/* Input Text Area with Shuffle Button */}
      <div className="relative mb-4">
        <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste text here..."
            disabled={isLoading}
            className="w-full min-h-[100px] p-4 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-700 resize-none"
        />
        <button 
            onClick={shufflePassage}
            title="Load Random Passage"
            className="absolute top-3 right-3 p-2 bg-white border border-gray-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
        >
            <FiShuffle size={18} />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium text-center border border-red-100">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        
        {/* Load Button */}
        <button
          onClick={fetchChunks}
          disabled={isLoading || inputText.trim() === ''}
          className="flex-1 py-3 px-6 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? <FiLoader className="animate-spin" /> : <FiFastForward />}
          {isLoading ? 'Loading...' : 'Load Text'}
        </button>

        {/* Play/Pause Button */}
        {isPlaying ? (
          <button 
            onClick={pauseReading} 
            className="flex-[2] py-3 px-6 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-200"
          >
            <FiPause size={20} className="fill-current" /> Pause
          </button>
        ) : (
          <button
            onClick={startReading}
            disabled={isLoading || chunks.length === 0}
            className={`flex-[2] py-3 px-6 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg
                ${isLoading || chunks.length === 0 
                    ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:-translate-y-1'}`
            }
          >
            <FiPlay size={20} className="fill-current ml-1" /> Start
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={resetReading}
          disabled={isLoading || chunks.length === 0}
          className="flex-1 py-3 px-6 bg-white border border-gray-300 text-slate-600 font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <FiRotateCcw /> Reset
        </button>
      </div>

      {/* Speed Slider */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="wpm-slider" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                Reading Speed
            </label>
            <span className="text-indigo-600 font-extrabold bg-indigo-100 px-3 py-1 rounded-md text-sm">
                {wpm} WPM
            </span>
        </div>
        <input
          type="range"
          id="wpm-slider"
          min="50"
          max="1500"
          step="25"
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
            <span>Slow (50)</span>
            <span>Fast (1500)</span>
        </div>
      </div>
    </div>
  );
}