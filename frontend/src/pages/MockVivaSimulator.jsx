import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  FiAward,
  FiSend,
  FiCheckCircle,
  FiRefreshCw,
  FiHelpCircle,
  FiVolume2,
  FiVolumeX,
  FiEdit3,
  FiZap
} from 'react-icons/fi';
import confetti from 'canvas-confetti';

const VIVA_SUBJECTS = [
  'Operating Systems & Kernel',
  'Database Management Systems',
  'Computer Networks & TCP/IP',
  'Software Architecture & System Design',
  'Data Structures & Algorithms'
];

const INITIAL_QUESTIONS = {
  'Operating Systems & Kernel': {
    question: 'Can you explain the difference between Paging and Segmentation in Virtual Memory management, and how the TLB improves address translation?',
    sampleAnswer: 'Paging divides virtual memory into fixed-size pages while Segmentation divides memory into variable-sized logical segments. The TLB (Translation Lookaside Buffer) acts as a high-speed hardware cache for page table lookups, eliminating extra memory accesses during virtual-to-physical address translation.',
    keywords: ['paging', 'segmentation', 'tlb', 'virtual memory', 'page table', 'translation', 'cache', 'latency', 'address', 'fixed', 'variable']
  },
  'Database Management Systems': {
    question: 'Explain the ACID properties of transactions. How does WAL (Write-Ahead Logging) guarantee Durability during crash recovery?',
    sampleAnswer: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Write-Ahead Logging (WAL) ensures Durability by forcing log records of modifications to non-volatile storage (disk/WAL) before actual database pages are written. Upon crash recovery, committed transactions can be replayed (REDO) and uncommitted ones rolled back (UNDO).',
    keywords: ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'wal', 'write-ahead', 'log', 'crash', 'recovery', 'commit', 'redo']
  },
  'Computer Networks & TCP/IP': {
    question: 'Walk me through the lifecycle of an HTTP request from DNS lookup to TCP socket tear down.',
    sampleAnswer: 'First, the client queries DNS to resolve the hostname to an IP address. Next, a TCP 3-way handshake (SYN, SYN-ACK, ACK) establishes a reliable socket connection. HTTP request headers and payload are sent, and the server returns an HTTP response. Finally, the connection closes via a 4-way TCP FIN/ACK teardown or remains open for reuse via Keep-Alive.',
    keywords: ['dns', 'ip', 'tcp', 'handshake', 'syn', 'ack', 'http', 'socket', 'tls', 'fin', 'teardown', 'response']
  },
  'Software Architecture & System Design': {
    question: 'How would you design a rate limiter for a distributed API gateway handling 100,000 requests per second?',
    sampleAnswer: 'I would use a Token Bucket or Sliding Window Counter algorithm backed by a distributed Redis cluster. Each client API key or IP maps to a Redis hash key using atomic Lua scripts (INCR/EXPIRE) to prevent race conditions. If request count exceeds the window limit, the gateway responds with HTTP 429 Too Many Requests.',
    keywords: ['rate limit', 'sliding window', 'token bucket', 'leaky bucket', 'redis', 'gateway', 'distributed', 'latency', 'throughput', '429']
  },
  'Data Structures & Algorithms': {
    question: 'Compare QuickSort and MergeSort. When would you prefer MergeSort despite its O(N) auxiliary space requirement?',
    sampleAnswer: 'QuickSort is an in-place algorithm with average O(N log N) time but O(N^2) worst-case time. MergeSort guarantees O(N log N) worst-case time and is a stable sort, preserving duplicate order. MergeSort is preferred for sorting linked lists (O(1) pointer shifts without random access) and for external sorting on large disk data.',
    keywords: ['quicksort', 'mergesort', 'pivot', 'divide and conquer', 'space', 'stable', 'linked list', 'worst case', 'o(n log n)']
  }
};

const MockVivaSimulator = () => {
  const [selectedSubject, setSelectedSubject] = useState('Operating Systems & Kernel');
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [evaluation, setEvaluation] = useState(null);
  const [vivaScore, setVivaScore] = useState(88);

  const currentQuestionObj = INITIAL_QUESTIONS[selectedSubject];

  // Speak text using Web Speech Synthesis API
  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !audioEnabled) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak question when subject changes or loads
  useEffect(() => {
    setUserAnswer('');
    setEvaluation(null);
    if (audioEnabled) {
      setTimeout(() => {
        speakText(`Question for ${selectedSubject}: ${currentQuestionObj.question}`);
      }, 400);
    }
  }, [selectedSubject]);

  // AI Evaluation Logic calling Backend AI API & RAG Evaluator
  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsEvaluating(true);

    try {
      const res = await api.post('/assessments/viva/evaluate', {
        subject: selectedSubject,
        question: currentQuestionObj.question,
        answer: userAnswer,
        keywords: currentQuestionObj.keywords
      });

      const evalData = res.data;
      setEvaluation(evalData);

      if (evalData.overallScore !== undefined) {
        setVivaScore(Math.round((vivaScore * 0.7) + (evalData.overallScore * 0.3)));
        if (evalData.overallScore >= 75) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }

      // Speak examiner feedback notes out loud
      if (evalData.examinerNote) {
        speakText(evalData.examinerNote);
      }
    } catch (err) {
      console.error('Viva evaluation API error:', err);
      // Local fallback evaluation
      const answerLower = userAnswer.toLowerCase();
      const keywords = currentQuestionObj.keywords;
      const matchedKeywords = keywords.filter((kw) => answerLower.includes(kw));

      // Gibberish check in fallback
      const words = userAnswer.trim().split(/\s+/);
      const isGibberish = words.length < 3 || (matchedKeywords.length === 0 && words.some(w => w.length > 20));

      const overallScore = isGibberish ? 0 : Math.min(95, Math.max(10, Math.round((matchedKeywords.length / Math.min(5, keywords.length)) * 100)));
      
      const newEval = {
        overallScore,
        clarity: isGibberish ? '0%' : '75%',
        technicalAccuracy: isGibberish ? '0%' : `${overallScore}%`,
        depth: isGibberish ? '0%' : '60%',
        terminology: isGibberish ? '0%' : `${Math.round(matchedKeywords.length * 20)}%`,
        strengths: isGibberish ? ['None detected. Response contains unrecognized characters.'] : ['Attempted a technical response.'],
        improvements: ['Include relevant core concepts for the question.'],
        examinerNote: isGibberish ? 'Invalid or non-sensical response detected. Please provide a clear technical answer.' : 'Evaluation complete.'
      };

      setEvaluation(newEval);
      if (newEval.examinerNote) speakText(newEval.examinerNote);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setEvaluation(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* HERO HEADER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-rose-500/15 via-purple-500/15 to-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiVolume2 size={14} className={isSpeaking ? 'animate-pulse text-rose-500' : ''} />
              <span>AI Spoken Examiner & Viva Simulator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Mock Viva Examiner
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Listen to the <strong>AI Examiner speak the question out loud</strong>, type your technical answer below, and submit to receive instant spoken feedback, rubric scoring, and AI analysis.
            </p>
          </div>

          {/* Controls & Viva Readiness Index */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextAudio = !audioEnabled;
                setAudioEnabled(nextAudio);
                if (!nextAudio && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              title={audioEnabled ? "Disable Examiner Voice" : "Enable Examiner Voice"}
              className={`p-3 rounded-2xl border transition-all ${
                audioEnabled
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-400'
              }`}
            >
              {audioEnabled ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
            </button>

            <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Viva Readiness</p>
              <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {vivaScore}<span className="text-xs text-slate-400">/100</span>
              </div>
              <p className="text-[10px] font-extrabold text-emerald-500 mt-0.5">High Competency</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUBJECT SELECTOR */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar items-center">
        {VIVA_SUBJECTS.map((subj) => (
          <button
            key={subj}
            onClick={() => {
              setSelectedSubject(subj);
            }}
            className={`whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              selectedSubject === subj
                ? 'bg-gradient-to-r from-rose-500 to-indigo-600 text-white border-transparent shadow-md shadow-rose-500/20'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-rose-400'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* EXAMINER QUESTION BOX & AUDIO VOICE CONTROLS */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-rose-500/20 relative">
              AI
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white animate-ping" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                Senior Academic Examiner
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {isSpeaking ? '🔊 Examiner is asking question aloud...' : 'Awaiting candidate typed answer...'}
              </p>
            </div>
          </div>

          {/* Read Question Button */}
          <button
            onClick={() => speakText(currentQuestionObj.question)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition shadow-xs"
          >
            <FiVolume2 size={16} />
            <span>{isSpeaking ? 'Speaking Question...' : '🔊 Re-play Spoken Question'}</span>
          </button>
        </div>

        {/* Question Text Box */}
        <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 space-y-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <FiHelpCircle size={14} /> Spoken Viva Question: {selectedSubject}
          </div>

          <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
            "{currentQuestionObj.question}"
          </p>
        </div>

        {/* Candidate Typed Answer Input Area */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <FiEdit3 className="text-indigo-500" />
              <span>Type Your Technical Answer Below</span>
            </span>

            <button
              type="button"
              onClick={() => setUserAnswer(currentQuestionObj.sampleAnswer)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <FiZap size={12} className="text-amber-500" /> Fill Sample High-Score Answer
            </button>
          </div>

          <textarea
            rows={5}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={`Listen to the examiner speak the question above, then type your detailed explanation for ${selectedSubject}...`}
            className="w-full p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400 font-medium">
              💡 Tip: Include relevant technical terms to achieve a higher accuracy & terminology score.
            </span>

            <button
              onClick={handleEvaluateAnswer}
              disabled={isEvaluating || !userAnswer.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 disabled:opacity-50 transition-all hover:scale-105 btn-bounce-active"
            >
              {isEvaluating ? (
                <>
                  <FiRefreshCw className="animate-spin" size={16} /> AI Examiner Evaluating Response...
                </>
              ) : (
                <>
                  <FiSend size={16} /> Submit for AI Viva Evaluation
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* EVALUATION RESULT SCORECARD */}
      {evaluation && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 dark:border-emerald-500/40 space-y-6 animate-slideUp">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
                <FiAward size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                  Viva Performance Evaluation
                </h4>
                <p className="text-xs text-slate-400">Scorecard & Spoken AI Examiner Feedback</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {evaluation.overallScore}%
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                {evaluation.overallScore >= 85 ? 'Grade: Excellent' : evaluation.overallScore >= 70 ? 'Grade: Proficient' : 'Grade: Needs Practice'}
              </p>
            </div>
          </div>

          {/* Rubric Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Clarity</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">{evaluation.clarity}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">{evaluation.technicalAccuracy}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Depth</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">{evaluation.depth}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Terminology</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100">{evaluation.terminology}</p>
            </div>
          </div>

          {/* Examiner Spoken Notes */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <FiCheckCircle /> AI Examiner Feedback
                </h5>
                <button
                  onClick={() => speakText(evaluation.examinerNote)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <FiVolume2 size={13} /> Re-play Examiner Audio
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
                "{evaluation.examinerNote}"
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Strengths Highlighted</h5>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                  {evaluation.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Areas for Key Refinement</h5>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                  {evaluation.improvements.map((imp, idx) => (
                    <li key={idx}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
            >
              Next Viva Question →
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default MockVivaSimulator;
