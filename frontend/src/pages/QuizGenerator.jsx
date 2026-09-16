import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  FiUploadCloud,
  FiFileText,
  FiCpu,
  FiAlertCircle,
  FiLoader,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiRotateCcw,
  FiCopy,
  FiCheck,
  FiClock,
  FiHelpCircle,
  FiBookOpen,
  FiZap,
  FiSliders,
  FiLayers,
  FiEdit3
} from 'react-icons/fi';

const QUICK_PRESETS = [
  {
    title: 'Distributed Systems & CAP Theorem',
    category: 'System Design',
    text: 'Distributed systems consist of autonomous computing nodes that coordinate via network messages. The CAP theorem states that any distributed data store can guarantee at most two of Consistency, Availability, and Partition tolerance. The Raft consensus algorithm elects a leader to manage log replication across followers, ensuring safety and fault tolerance. Vector clocks track causal ordering of asynchronous events without synchronized physical clocks, while two-phase commit enforces atomic multi-shard transactions.'
  },
  {
    title: 'Operating System Deadlocks & Memory',
    category: 'Computer Science',
    text: 'Operating systems manage concurrency and process synchronization. A deadlock occurs when four Coffman conditions hold simultaneously: mutual exclusion, hold and wait, no preemption, and circular wait. Dijkstra banker algorithm prevents deadlock by evaluating system safety states before allocating scarce resources. Virtual memory uses paging and Translation Lookaside Buffers (TLB) to translate virtual addresses to physical frames, while page replacement algorithms like LRU minimize page faults.'
  },
  {
    title: 'SQL Normalization & B-Tree Indexing',
    category: 'Database Systems',
    text: 'Relational database design relies on normalization to reduce data redundancy and anomalies. First Normal Form (1NF) eliminates repeating groups, 2NF removes partial functional dependencies on candidate keys, and 3NF ensures no transitive dependencies exist. B-Tree and B+ Tree indexes maintain balanced logarithmic search trees O(log N) on disk blocks, dramatically accelerating range scans and equality lookups while ACID transactions preserve consistency.'
  },
  {
    title: 'Machine Learning: Gradient Descent & Loss',
    category: 'AI & Data Science',
    text: 'Supervised machine learning optimizes parametric models by minimizing empirical loss functions. Stochastic Gradient Descent (SGD) updates weight vectors iteratively using minibatches of training data along the negative gradient. Momentum and Adam optimizers incorporate adaptive learning rates with running averages of past squared gradients. Regularization techniques including L1 Lasso, L2 Ridge, and Dropout prevent overfitting on training partitions.'
  }
];

const QuizGenerator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Mode: 'file' | 'text'
  const [inputMode, setInputMode] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [topicText, setTopicText] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Standard Exam');

  // Quiz State
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // If passed text from Summarizer or RAG
  useEffect(() => {
    if (location.state?.text) {
      setInputMode('text');
      setTopicText(location.state.text);
    }
  }, [location.state]);

  // Quiz timer
  useEffect(() => {
    let interval = null;
    if (timerActive && score === null) {
      interval = setInterval(() => {
        setTimeSpentSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, score]);

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setSelectedFile(file);
      setError('');
      setQuizData(null);
    } else {
      setError('Please upload a valid PDF lecture or textbook file.');
    }
  };

  // Generate Quiz API Call
  const handleGenerate = async () => {
    if (inputMode === 'file' && !selectedFile) {
      setError('Please select a PDF document first.');
      return;
    }
    if (inputMode === 'text' && (!topicText || topicText.trim().length < 40)) {
      setError('Please enter at least 40 characters of study notes or select a preset topic.');
      return;
    }

    setLoading(true);
    setLoadingStep(1);
    setError('');
    setScore(null);
    setSelectedAnswers({});
    setTimeSpentSeconds(0);

    const stepTimer = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1100);

    try {
      let response;
      if (inputMode === 'file') {
        const formData = new FormData();
        formData.append('pdfFile', selectedFile);
        formData.append('count', questionCount);
        formData.append('difficulty', difficulty);

        response = await api.post('/quiz/generate', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/quiz/generate', {
          text: topicText.trim(),
          topic: topicText.trim(),
          count: questionCount,
          difficulty,
        });
      }

      const data = response.data.quiz || response.data;
      if (Array.isArray(data) && data.length > 0) {
        setQuizData(data);
        setTimerActive(true);
      } else {
        throw new Error('Unable to extract multiple-choice questions from the content.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message ||
        'Server error. Please ensure the backend is running.'
      );
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
    }
  };

  // Option selection
  const handleOptionSelect = (qIndex, option) => {
    if (score !== null) return;
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  // Submit & score
  const handleSubmit = () => {
    if (!quizData) return;
    let newScore = 0;
    quizData.forEach((q, idx) => {
      const correct = q.answer || q.correctAnswer;
      if (selectedAnswers[idx] === correct) {
        newScore++;
      }
    });

    setScore(newScore);
    setTimerActive(false);

    // Trigger celebration confetti if score is >= 60%
    const percentage = Math.round((newScore / quizData.length) * 100);
    if (percentage >= 60) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981', '#3b82f6'],
      });
    }

    // Dynamically save quiz submission to local history for Progress & Skill Gap Analytics
    try {
      const quizRecord = {
        id: 'quiz-' + Date.now(),
        timestamp: new Date().toISOString(),
        topic: selectedFile ? selectedFile.name.replace('.pdf', '') : (topicText ? topicText.slice(0, 35) : 'Academic Assessment'),
        score: newScore,
        total: quizData.length,
        percentage,
        timeSpentSeconds
      };
      const existing = JSON.parse(localStorage.getItem('learner_quiz_history_v2') || '[]');
      existing.unshift(quizRecord);
      localStorage.setItem('learner_quiz_history_v2', JSON.stringify(existing.slice(0, 20)));
    } catch (e) {
      console.warn("Error saving quiz history", e);
    }
  };

  // Retake test
  const handleRetake = () => {
    setSelectedAnswers({});
    setScore(null);
    setTimeSpentSeconds(0);
    setTimerActive(true);
  };

  // Reset to new test
  const handleResetAll = () => {
    setQuizData(null);
    setSelectedAnswers({});
    setScore(null);
    setSelectedFile(null);
    setTimerActive(false);
    setTimeSpentSeconds(0);
  };

  // Copy quiz markdown
  const handleCopyQuiz = () => {
    if (!quizData) return;
    const md = quizData
      .map(
        (q, i) =>
          `### Q${i + 1}: ${q.question}\n` +
          q.options.map((opt, oIdx) => `- [ ] ${String.fromCharCode(65 + oIdx)}) ${opt}`).join('\n') +
          `\n\n**Answer Key:** ${q.answer || q.correctAnswer}\n**Explanation:** ${q.explanation || 'Verified from curriculum text.'}`
      )
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = quizData ? quizData.length : 0;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const scorePercent = quizData && score !== null ? Math.round((score / quizData.length) * 100) : 0;

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* 1. HERO HEADER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiCpu /> Google Colab RAG & MCQ Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              AI Quiz Generator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Synthesize grounded practice assessments directly from lecture notes, textbooks, or custom syllabus topics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/rag')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xs"
            >
              <FiZap size={16} />
              <span>Open Personal AI Agent</span>
            </button>
            <button
              onClick={() => navigate('/summarizer')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:scale-105 active:scale-95 transition-all"
            >
              <FiFileText size={16} />
              <span>Summarizer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. GENERATION WORKSPACE (Only shown if quiz is not active or user resets) */}
      {!quizData && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-auto">
              <button
                onClick={() => { setInputMode('file'); setError(''); }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  inputMode === 'file'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FiUploadCloud size={16} />
                <span>Upload PDF Document</span>
              </button>
              <button
                onClick={() => { setInputMode('text'); setError(''); }}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  inputMode === 'text'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <FiEdit3 size={16} />
                <span>Topic & Study Notes Prompt</span>
              </button>
            </div>

            {/* Config Selectors: Count & Difficulty */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <FiLayers size={14} />
                <span>Questions:</span>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <FiSliders size={14} />
                <span>Level:</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Foundational">Foundational</option>
                  <option value="Standard Exam">Standard Exam</option>
                  <option value="Challenging">Challenging</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mode 1: PDF Upload Box */}
          {inputMode === 'file' && (
            <div>
              {!selectedFile ? (
                <div className="relative border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 rounded-2xl p-12 flex flex-col items-center justify-center bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FiUploadCloud size={32} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    Click or Drag PDF Lecture to Upload
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Supports syllabus notes, textbook excerpts, and assignments (up to 20MB)
                  </p>
                </div>
              ) : (
                <div className="border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/30 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <FiFileText size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Colab RAG analysis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <FiTrash2 size={16} />
                    <span>Remove Document</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Topic & Text Input */}
          {inputMode === 'text' && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={topicText}
                  onChange={(e) => setTopicText(e.target.value)}
                  rows={6}
                  placeholder="Paste study notes, lecture excerpts, or enter a specific concept (e.g. Distributed Consensus, Deadlock Avoidance, SQL Joins)..."
                  className="w-full p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
                />
                <div className="absolute bottom-3 right-4 text-[11px] font-bold text-slate-400">
                  {topicText.length} characters
                </div>
              </div>

              {/* Curated Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  ⚡ Curated Syllabus Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      onClick={() => setTopicText(preset.text)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-sm font-medium">
              <FiAlertCircle size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || (inputMode === 'file' ? !selectedFile : !topicText.trim())}
            className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all flex items-center justify-center gap-3 ${
              loading || (inputMode === 'file' ? !selectedFile : !topicText.trim())
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <FiLoader className="animate-spin" size={22} />
                <span>
                  {loadingStep === 1 && 'Extracting Document Context Tokens...'}
                  {loadingStep === 2 && 'Querying Google Colab RAG Model...'}
                  {loadingStep === 3 && 'Formulating Distractors & Scoring Key...'}
                </span>
              </div>
            ) : (
              <>
                <FiCpu size={22} />
                <span>Generate {questionCount} Practice Questions</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 3. ACTIVE QUIZ INTERFACE */}
      {quizData && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Status Bar: Progress, Timer, Reset */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <FiBookOpen size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-base">
                    Practice Assessment
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {difficulty}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {answeredCount} of {totalQuestions} Answered • {progressPercent}% Completed
                </p>
              </div>
            </div>

            {/* Progress Bar & Clock */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <FiClock size={14} className="text-indigo-500" />
                <span>{formatTime(timeSpentSeconds)}</span>
              </div>

              <button
                onClick={handleResetAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <FiRotateCcw size={14} />
                <span>New Quiz</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress Line */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Score Summary Banner (If Submitted) */}
          {score !== null && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-200 dark:border-indigo-900/60 relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center gap-5">
                  <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-black text-2xl shadow-lg ${
                    scorePercent >= 80
                      ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                      : scorePercent >= 60
                      ? 'bg-indigo-600 text-white shadow-indigo-500/30'
                      : 'bg-amber-500 text-white shadow-amber-500/30'
                  }`}>
                    <span>{score}/{totalQuestions}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{scorePercent}%</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                      {scorePercent >= 80
                        ? '🌟 Mastery Achieved!'
                        : scorePercent >= 60
                        ? '👍 Solid Comprehension!'
                        : '📚 Review Recommended'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Time elapsed: <strong>{formatTime(timeSpentSeconds)}</strong> • Verified via VidyaPath Academic Engine
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleRetake}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <FiRotateCcw size={16} />
                    <span>Retake Test</span>
                  </button>

                  <button
                    onClick={handleCopyQuiz}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
                    title="Copy Questions to Clipboard"
                  >
                    {isCopied ? <FiCheck size={16} className="text-green-500" /> : <FiCopy size={16} />}
                    <span>{isCopied ? 'Copied' : 'Export'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Question Cards List */}
          <div className="space-y-6">
            {quizData.map((q, qIndex) => {
              const isAnswered = selectedAnswers[qIndex] !== undefined;
              const selectedOpt = selectedAnswers[qIndex];
              const correctAns = q.answer || q.correctAnswer;
              const isCorrect = selectedOpt === correctAns;
              const showResult = score !== null;

              return (
                <div
                  key={qIndex}
                  className={`glass-card rounded-3xl p-6 sm:p-7 border transition-all ${
                    showResult
                      ? isCorrect
                        ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-red-300 dark:border-red-800/80 bg-red-50/20 dark:bg-red-950/10'
                      : isAnswered
                      ? 'border-indigo-300 dark:border-indigo-800'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-start gap-3.5">
                      <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
                        {qIndex + 1}
                      </span>
                      <h4 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100 leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    {showResult && (
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'
                      }`}>
                        {isCorrect ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                        <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                      </span>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 ml-0 sm:ml-11">
                    {q.options.map((option, oIndex) => {
                      const letter = String.fromCharCode(65 + oIndex);
                      const isSelected = selectedOpt === option;
                      const isOptionCorrect = option === correctAns;

                      let optClasses = 'border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300';

                      if (showResult) {
                        if (isOptionCorrect) {
                          optClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/40';
                        } else if (isSelected && !isOptionCorrect) {
                          optClasses = 'border-red-500 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 ring-2 ring-red-500/40 line-through';
                        } else {
                          optClasses = 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600';
                        }
                      } else if (isSelected) {
                        optClasses = 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold ring-2 ring-indigo-500/40 shadow-sm';
                      }

                      return (
                        <button
                          key={oIndex}
                          disabled={showResult}
                          onClick={() => handleOptionSelect(qIndex, option)}
                          className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between gap-4 ${optClasses}`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected || (showResult && isOptionCorrect)
                                ? 'bg-current text-white font-bold'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>
                              {letter}
                            </span>
                            <span className="leading-relaxed">{option}</span>
                          </div>

                          {showResult && isOptionCorrect && (
                            <FiCheckCircle className="text-emerald-500 flex-shrink-0" size={18} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Toggle (Visible after submission) */}
                  {showResult && q.explanation && (
                    <div className="mt-5 ml-0 sm:ml-11 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                      <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                          <FiHelpCircle size={14} /> Syllabus Grounding & Explanation
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Bottom Submit Button (If not yet submitted) */}
          {score === null && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={answeredCount === 0}
                className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-white text-base shadow-lg transition-all flex items-center justify-center gap-3 ${
                  answeredCount === 0
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 hover:scale-105 active:scale-95'
                }`}
              >
                <FiCheckCircle size={20} />
                <span>Submit & Score Test ({answeredCount}/{totalQuestions})</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default QuizGenerator;