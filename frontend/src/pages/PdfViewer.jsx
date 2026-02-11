import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBookOpen, FiZoomIn, FiZoomOut, FiMoon, FiSun, FiSidebar, 
  FiUploadCloud, FiFileText, FiHelpCircle, FiClock, FiWatch, 
  FiPlay, FiPause, FiRotateCcw, FiEdit, FiCheck, FiCpu, FiSave, FiDownload 
} from 'react-icons/fi';

// --- Timer/Stopwatch Widget Component (Unchanged) ---
const TimerWidget = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('timer'); // 'timer' or 'stopwatch'

  // --- Timer State ---
  const [initialDuration, setInitialDuration] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(25);

  // --- Stopwatch State ---
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchActive, setIsStopwatchActive] = useState(false);

  // --- Timer  Logic ---
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      alert("Time's up!");
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  // --- Stopwatch Logic ---
  useEffect(() => {
    let interval = null;
    if (isStopwatchActive) {
      interval = setInterval(() => setStopwatchTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchActive]);

  // --- Handlers ---
  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(initialDuration); 
  };

  const resetStopwatch = () => {
    setIsStopwatchActive(false);
    setStopwatchTime(0);
  };

  const saveCustomTime = () => {
    const mins = parseInt(inputMinutes);
    if (mins > 0 && !isNaN(mins)) {
      const newSeconds = mins * 60;
      setInitialDuration(newSeconds);
      setTimeLeft(newSeconds);
      setIsEditing(false);
      setIsTimerActive(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    const displayMins = mins % 60;
    if (hrs > 0) {
       return `${hrs}:${displayMins < 10 ? '0' : ''}${displayMins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${displayMins < 10 ? '0' : ''}${displayMins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="absolute top-6 right-6 z-50 flex flex-col items-end">
      {/* Timer Toggle Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        title="Tools"
      >
        <FiClock size={20} />
      </button>

      {/* Popup Widget */}
      {isOpen && (
        <div className={`mt-3 p-4 rounded-2xl shadow-xl w-64 backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-200 ${darkMode ? 'bg-slate-800/90 border-slate-700 text-white' : 'bg-white/90 border-gray-200 text-slate-800'}`}>
          
          {/* Mode Tabs */}
          <div className={`flex p-1 rounded-lg mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <button 
                onClick={() => setMode('timer')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'timer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}
            >
                <FiClock size={14} /> Timer
            </button>
            <button 
                onClick={() => setMode('stopwatch')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-bold transition-all ${mode === 'stopwatch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-500'}`}
            >
                <FiWatch size={14} /> Stopwatch
            </button>
          </div>

          {/* === TIMER MODE === */}
          {mode === 'timer' && (
            <>
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Focus Timer</h3>
                 {!isEditing && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsEditing(true)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 opacity-60 hover:opacity-100"><FiEdit size={12}/></button>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${isTimerActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                            {isTimerActive ? 'Active' : 'Paused'}
                        </span>
                    </div>
                 )}
               </div>
               
               <div className="mb-6 flex justify-center h-16 items-center">
                {isEditing ? (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    <input 
                        type="number" 
                        min="1" max="180" 
                        value={inputMinutes} 
                        onChange={(e) => setInputMinutes(e.target.value)} 
                        className={`w-20 text-3xl font-mono text-center bg-transparent border-b-2 outline-none ${darkMode ? 'border-indigo-500 text-white' : 'border-indigo-600 text-slate-800'}`} 
                        autoFocus 
                    />
                    <span className="text-sm opacity-60 font-bold mt-2">min</span>
                    <button onClick={saveCustomTime} className="ml-2 p-2 bg-green-500 text-white rounded-full hover:scale-110 transition shadow-md"><FiCheck /></button>
                  </div>
                ) : (
                  <div className="text-5xl font-mono font-bold tracking-tight">{formatTime(timeLeft)}</div>
                )}
              </div>

              {!isEditing && (
                <div className="flex gap-2">
                  <button onClick={() => setIsTimerActive(!isTimerActive)} className={`flex-1 py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isTimerActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                    {isTimerActive ? <><FiPause /> Pause</> : <><FiPlay /> Start</>}
                  </button>
                  <button onClick={resetTimer} className={`p-3 rounded-xl transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}><FiRotateCcw /></button>
                </div>
              )}
            </>
          )}

          {/* === STOPWATCH MODE === */}
          {mode === 'stopwatch' && (
             <>
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Elapsed Time</h3>
                 <span className={`text-[10px] px-2 py-0.5 rounded-full ${isStopwatchActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {isStopwatchActive ? 'Running' : 'Stopped'}
                 </span>
               </div>
               
               <div className="mb-6 flex justify-center h-16 items-center">
                  <div className="text-5xl font-mono font-bold tracking-tight">{formatTime(stopwatchTime)}</div>
               </div>

               <div className="flex gap-2">
                  <button onClick={() => setIsStopwatchActive(!isStopwatchActive)} className={`flex-1 py-2 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isStopwatchActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                    {isStopwatchActive ? <><FiPause /> Pause</> : <><FiPlay /> Start</>}
                  </button>
                  <button onClick={resetStopwatch} className={`p-3 rounded-xl transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}><FiRotateCcw /></button>
               </div>
             </>
          )}

        </div>
      )}
    </div>
  );
};

export default function PdfViewer() {
  const navigate = useNavigate();

  // --- State ---
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [scale, setScale] = useState(1.0);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotes, setShowNotes] = useState(true);
  const [notes, setNotes] = useState('');
  
  // --- Load/Save State ---
  useEffect(() => {
    if (fileName) {
      const savedNotes = localStorage.getItem(`pdf_notes_${fileName}`);
      if (savedNotes) setNotes(savedNotes);
    }
  }, [fileName]);

  useEffect(() => {
    if (fileName) {
      localStorage.setItem(`pdf_notes_${fileName}`, notes);
    }
  }, [notes, fileName]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        const objectUrl = URL.createObjectURL(file);
        setPdfFile(objectUrl);
        setFileName(file.name);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const zoomIn = () => setScale(prev => Math.min(2.0, prev + 0.1));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.1));

  const handleAIAction = (action) => {
    if (action === 'summarize') navigate('/summarizer');
    if (action === 'quiz') navigate('/quiz-generator');
  };

  // --- NEW: Save Notes to .txt Function ---
  const saveNotesToTxt = () => {
    if (!notes.trim()) {
      alert("Your notes are empty! Type something before saving.");
      return;
    }
    
    const element = document.createElement("a");
    const file = new Blob([notes], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    
    // Naming the file based on the PDF name or default
    const downloadName = fileName 
      ? `Notes_for_${fileName.replace('.pdf', '')}.txt` 
      : "My_Study_Notes.txt";
      
    element.download = downloadName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`flex flex-col h-screen animate-fadeIn ${darkMode ? 'bg-slate-900 text-gray-200' : 'bg-gray-50 text-slate-800'} transition-colors duration-300`}>
      {/* --- Top Bar --- */}
      <div className={`flex items-center justify-between px-6 py-3 shadow-md z-20 ${darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white border-b border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg flex items-center gap-2">
            <FiBookOpen className="text-indigo-500" />
            {fileName ? (fileName.length > 25 ? fileName.substring(0, 25) + '...' : fileName) : 'PDF Reader'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg">
            <button onClick={zoomOut} className="p-2 hover:text-indigo-600 transition-colors"><FiZoomOut /></button>
            <span className="py-2 text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="p-2 hover:text-indigo-600 transition-colors"><FiZoomIn /></button>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" title="Toggle Dark Mode">{darkMode ? <FiSun /> : <FiMoon />}</button>
          <button onClick={() => setShowNotes(!showNotes)} className={`p-2 rounded-full transition-colors ${showNotes ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200 dark:hover:bg-slate-700'}`} title="Toggle Notes"><FiSidebar /></button>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative bg-gray-200 dark:bg-gray-900">
          <div className="absolute inset-0 overflow-auto flex justify-center p-4">
            {!pdfFile ? (
              <div className={`flex flex-col items-center justify-center w-full max-w-2xl h-96 border-4 border-dashed rounded-3xl m-auto transition-all ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-gray-300 bg-white'}`}>
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="pdf-upload"/>
                <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center p-10 w-full h-full justify-center group">
                  <div className="bg-indigo-50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <FiUploadCloud size={40} className="text-indigo-500" />
                  </div>
                  <p className="text-xl font-bold mt-2 text-slate-700 dark:text-gray-200">Click to upload a PDF</p>
                  <p className="text-sm text-slate-400 mt-2">Resume exactly where you left off</p>
                </label>
              </div>
            ) : (
              <div className="shadow-2xl w-full h-full transition-transform duration-200 origin-top" style={{ transform: `scale(${scale})`, height: `${100 / scale}%`, width: `${100 / scale}%` }}>
                <iframe src={pdfFile} title="PDF Viewer" className="w-full h-full rounded-lg border-none bg-white"/>
              </div>
            )}
          </div>
          <TimerWidget darkMode={darkMode} />
        </div>
        
        {/* --- Notes Sidebar --- */}
        {showNotes && (
          <div className={`w-80 flex-shrink-0 flex flex-col border-l transition-all duration-300 z-10 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                <div>
                  <h2 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                      <FiFileText className="text-indigo-500" /> Study Notes
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Auto-saved to browser</p>
                </div>
                {/* --- NEW: Save Button --- */}
                <button 
                  onClick={saveNotesToTxt}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold shadow-sm"
                  title="Download as .txt"
                >
                  <FiDownload size={14} /> Save
                </button>
            </div>
            
            <textarea 
                className={`flex-1 w-full p-4 resize-none outline-none text-sm leading-relaxed ${darkMode ? 'bg-slate-800 text-gray-300' : 'bg-white text-slate-700'}`} 
                placeholder="Type your notes here... (Bullet points, key terms, etc.)" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
            />
            
            <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t dark:border-slate-700">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">AI Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleAIAction('summarize')} className="flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold hover:bg-indigo-100 transition shadow-sm">
                        <FiCpu size={14} /> Summarize
                    </button>
                    <button onClick={() => handleAIAction('quiz')} className="flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold hover:bg-emerald-100 transition shadow-sm">
                        <FiHelpCircle size={14} /> Quiz Me
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}