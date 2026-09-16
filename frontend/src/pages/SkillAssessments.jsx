import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  FiAward,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiPlus,
  FiCheckSquare,
  FiBookOpen,
  FiBarChart2,
  FiArrowRight,
  FiSearch,
  FiTrash2,
  FiX,
  FiCpu,
  FiUploadCloud,
  FiFileText,
  FiZap
} from 'react-icons/fi';

const SkillAssessments = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'user';
  const isTutor = userRole === 'tutor';

  // State Management
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');

  // Test Runner State
  const [activeTest, setActiveTest] = useState(null); // Assessment loaded for taking
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result & AI Skill Gap State
  const [testResult, setTestResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Tutor Studio State (Create Assessment Modal)
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [creationMode, setCreationMode] = useState('colab_pdf'); // 'colab_pdf' | 'manual'
  const [pdfFile, setPdfFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [isGeneratingWithRag, setIsGeneratingWithRag] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [colabRagStatus, setColabRagStatus] = useState('checking');

  useEffect(() => {
    api.get('/rag/status')
      .then(res => setColabRagStatus(res.data?.status || 'online'))
      .catch(() => setColabRagStatus('tunnel_offline'));
  }, []);

  const [studioData, setStudioData] = useState({
    title: '',
    description: '',
    domain: 'Data Structures & Algorithms',
    difficulty: 'Intermediate',
    timeLimitMinutes: 20,
    passingPercentage: 70,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        skillTag: '',
        explanation: '',
      },
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        skillTag: '',
        explanation: '',
      },
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        skillTag: '',
        explanation: '',
      },
    ],
  });

  const domains = [
    'All',
    'Data Structures & Algorithms',
    'Full Stack Development',
    'Database Engineering',
    'Artificial Intelligence & ML',
  ];

  // 1. Load Assessments
  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assessments');
      setAssessments(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load skill assessments. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Timer Logic for Active Test
  useEffect(() => {
    let timer = null;
    if (activeTest && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest(); // auto-submit on expiry
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTest, secondsRemaining]);

  // Start an assessment
  const handleStartAssessment = async (assessmentId) => {
    setLoading(true);
    try {
      const res = await api.get(`/assessments/${assessmentId}`);
      setActiveTest(res.data);
      setCurrentQIndex(0);
      setUserAnswers({});
      setSecondsRemaining((res.data.timeLimitMinutes || 20) * 60);
      setTestResult(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Could not start assessment: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Select Option
  const handleSelectOption = (option) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQIndex]: option,
    }));
  };

  // Submit Test
  const handleSubmitTest = async () => {
    if (!activeTest || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const timeSpent = (activeTest.timeLimitMinutes * 60) - secondsRemaining;
      const res = await api.post(`/assessments/${activeTest._id}/submit`, {
        userAnswers,
        timeSpentSeconds: Math.max(1, timeSpent),
      });

      setTestResult(res.data);
      setActiveTest(null);
      setShowResultModal(true);

      // Save submission locally for instant dynamic progress analytics update
      try {
        const savedSubmissions = JSON.parse(localStorage.getItem('vidyapath_assessment_submissions') || '[]');
        const newSub = {
          ...res.data,
          assessmentTitle: activeTest.title,
          domain: activeTest.domain,
          completedAt: new Date().toISOString()
        };
        localStorage.setItem('vidyapath_assessment_submissions', JSON.stringify([newSub, ...savedSubmissions]));
        window.dispatchEvent(new Event('vidyapath_progress_updated'));
      } catch (e) {
        console.warn('Error syncing test submission to local storage:', e);
      }

      // Celebration if passed!
      if (res.data.passed) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#10b981'],
        });
      }
    } catch (err) {
      alert('Failed to submit test: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tutor: Delete Assessment
  const handleDeleteAssessment = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this assessment? This action cannot be undone.')) return;

    try {
      await api.delete(`/assessments/${id}`);
      fetchAssessments();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || 'Tutor authorization required.'));
    }
  };

  // Tutor Studio: Add Question
  const handleAddQuestionToStudio = () => {
    setStudioData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: '',
          skillTag: '',
          explanation: '',
        },
      ],
    }));
  };

  // Tutor Studio: Auto-Generate Assessment from PDF via Google Colab RAG
  const handleGenerateFromPdf = async (e) => {
    e.preventDefault();
    setGenerationError('');

    if (!pdfFile) {
      setGenerationError('Please select a course PDF file to upload.');
      return;
    }
    if (!studioData.title.trim()) {
      setGenerationError('Please enter an Assessment Title / Name.');
      return;
    }

    setIsGeneratingWithRag(true);
    setGenerationProgress('Uploading course PDF and extracting text chunks...');

    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('title', studioData.title.trim());
      formData.append('domain', studioData.domain);
      formData.append('difficulty', studioData.difficulty);
      formData.append('timeLimitMinutes', studioData.timeLimitMinutes);
      formData.append('passingPercentage', studioData.passingPercentage);
      formData.append('questionCount', questionCount);
      formData.append('description', studioData.description);

      setGenerationProgress('Querying Google Colab RAG model server to synthesize MCQs, correct answers & skill tags...');

      const res = await api.post('/assessments/generate-from-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setGenerationProgress('Assessment published successfully!');
      alert(`🎉 Success! "${studioData.title}" with ${res.data.questionsCount || questionCount} MCQs has been synthesized via Google Colab RAG and published for all learners!`);

      setShowStudioModal(false);
      setPdfFile(null);
      setStudioData({
        title: '',
        description: '',
        domain: 'Data Structures & Algorithms',
        difficulty: 'Intermediate',
        timeLimitMinutes: 20,
        passingPercentage: 70,
        questions: [
          { question: '', options: ['', '', '', ''], correctAnswer: '', skillTag: '', explanation: '' },
          { question: '', options: ['', '', '', ''], correctAnswer: '', skillTag: '', explanation: '' },
          { question: '', options: ['', '', '', ''], correctAnswer: '', skillTag: '', explanation: '' },
        ],
      });
      fetchAssessments();
    } catch (err) {
      console.error(err);
      setGenerationError(err.response?.data?.message || 'Failed to generate assessment. Please ensure the backend and Colab RAG are active.');
    } finally {
      setIsGeneratingWithRag(false);
      setGenerationProgress('');
    }
  };

  // Tutor Studio: Submit Manual Assessment
  const handlePublishAssessment = async (e) => {
    e.preventDefault();

    // Basic validation
    for (let i = 0; i < studioData.questions.length; i++) {
      const q = studioData.questions[i];
      if (!q.question.trim() || !q.correctAnswer.trim() || !q.skillTag.trim()) {
        alert(`Question #${i + 1} has missing fields (question text, correct answer, or skill tag).`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Question #${i + 1} must have all 4 options filled out.`);
        return;
      }
    }

    try {
      await api.post('/assessments', studioData);
      alert('Skill Assessment published successfully!');
      setShowStudioModal(false);
      fetchAssessments();
    } catch (err) {
      alert('Publishing failed: ' + (err.response?.data?.message || 'Tutor authorization required.'));
    }
  };

  // Format MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter assessments
  const filteredAssessments = assessments.filter(item => {
    const matchesDomain = selectedDomain === 'All' || item.domain === selectedDomain;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  // -------------------------------------------------------------
  // RENDER: ACTIVE TEST RUNNER MODE
  // -------------------------------------------------------------
  if (activeTest) {
    const currentQ = activeTest.questions[currentQIndex];
    const totalQ = activeTest.questions.length;
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-16">
        
        {/* Test Header Bar */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md sticky top-20 z-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                  {activeTest.domain}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Tutor: {activeTest.tutorName}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {activeTest.title}
              </h2>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-mono text-sm font-black border transition-all ${
                  secondsRemaining < 180
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 border-red-300 animate-pulse'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}
              >
                <FiClock size={16} />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to exit the assessment? Your answers will not be scored.')) {
                    setActiveTest(null);
                  }
                }}
                className="text-xs font-semibold text-slate-400 hover:text-red-500"
              >
                Cancel Test
              </button>
            </div>
          </div>

          {/* Progress Navigator */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex gap-2">
              {activeTest.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    currentQIndex === idx
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105 ring-2 ring-indigo-300'
                      : userAnswers[idx] !== undefined
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-2">
              {answeredCount} / {totalQ} Answered
            </span>
          </div>
        </div>

        {/* Active Question Box */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">
              Question {currentQIndex + 1} of {totalQ}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold">
              Skill Tag: {currentQ.skillTag}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Options Grid */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, oIdx) => {
              const isSelected = userAnswers[currentQIndex] === option;
              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectOption(option)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm text-indigo-900 dark:text-indigo-200 scale-101'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <span className="text-sm sm:text-base font-medium leading-relaxed">
                    {option}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => prev - 1)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← Previous
            </button>

            {currentQIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentQIndex(prev => prev + 1)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:scale-105 transition-all"
              >
                Next Question →
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <FiCheckCircle size={18} />
                <span>{isSubmitting ? 'Submitting & Evaluating...' : 'Submit Assessment & Analyze Skill Gaps'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: CATALOG & DASHBOARD VIEW
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16">
      
      {/* 1. HERO HEADER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
              <FiAward /> Tutor-Authored Assessments & AI Diagnostics
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Skill Assessments & Gap Analysis
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-2xl leading-relaxed">
              Test your proficiency under realistic examination parameters. Our AI diagnostics analyze your answers to pinpoint exact conceptual skill gaps and generate personalized study action plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isTutor && (
              <div className="flex items-center gap-2">
                <Link
                  to="/tutor-analytics"
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all"
                >
                  <FiBarChart2 size={16} />
                  <span>Learners Progress & Stats</span>
                </Link>
                <button
                  onClick={() => {
                    setCreationMode('colab_pdf');
                    setShowStudioModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <FiZap className="text-amber-400" size={18} />
                  <span>Auto-Create from PDF (Colab RAG)</span>
                </button>
                <button
                  onClick={() => {
                    setCreationMode('manual');
                    setShowStudioModal(true);
                  }}
                  className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-2xl glass-card border border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-300 font-bold text-xs hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all"
                >
                  <FiPlus size={16} />
                  <span>Manual Builder</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. SEARCH & DOMAIN FILTER PILLS */}
      <div className="space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assessments by title, domain, or skill tag..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedDomain === dom
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md scale-105'
                  : 'glass-card text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ASSESSMENTS GRID */}
      {loading && (
        <div className="flex flex-col justify-center items-center h-64 text-slate-400">
          <div className="spinner w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="font-semibold text-sm">Loading skill assessments...</span>
        </div>
      )}

      {error && (
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.length > 0 ? (
            filteredAssessments.map((test) => (
              <div
                key={test._id}
                className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:scale-102 hover:shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {test.domain}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        test.difficulty === 'Advanced'
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                          : test.difficulty === 'Intermediate'
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                      }`}
                    >
                      {test.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 leading-tight">
                    {test.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {test.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-6">
                    <span className="flex items-center gap-1">
                      <FiCheckSquare className="text-indigo-500" /> {test.questionCount} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="text-purple-500" /> {test.timeLimitMinutes} Mins
                    </span>
                    <span className="flex items-center gap-1">
                      <FiBarChart2 className="text-emerald-500" /> Pass: {test.passingPercentage}%
                    </span>
                  </div>
                </div>

                {/* Footer Tutor & Action */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {test.tutorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden max-w-[130px]">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                        {test.tutorName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">Verified Tutor</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTutor && (
                      <button
                        onClick={(e) => handleDeleteAssessment(test._id, e)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Assessment"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => handleStartAssessment(test._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span>Take Test</span>
                      <FiArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center glass-card rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
              <FiBookOpen className="mx-auto mb-3 text-slate-400" size={36} />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                No skill assessments found
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Try selecting a different domain or clear your search term.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. AI SKILL GAP DIAGNOSTIC REPORT MODAL */}
      {showResultModal && testResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm uppercase tracking-wider">
                <FiCpu /> Diagnostic Evaluation Complete
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Score & Verdict Banner */}
            <div
              className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
                testResult.passed
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-200 dark:border-emerald-800/80'
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-amber-200 dark:border-amber-800/80'
              }`}
            >
              <div className="text-center sm:text-left">
                <span
                  className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    testResult.passed
                      ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                      : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  {testResult.passed ? '✓ PASSED BENCHMARK' : '⚠️ SKILL GAPS DETECTED'}
                </span>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                  {testResult.aiSkillGapReport?.masteryLevel || 'Performance Report'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-sm">
                  {testResult.aiSkillGapReport?.summary}
                </p>
              </div>

              <div className="text-center">
                <div
                  className={`text-5xl font-black tracking-tight ${
                    testResult.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {testResult.percentage}%
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {testResult.score} / {testResult.totalQuestions} Questions Correct
                </p>
              </div>
            </div>

            {/* Competency Mastery Breakdown */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <FiBarChart2 className="text-indigo-500" />
                <span>Skill Mastery Breakdown</span>
              </h4>

              <div className="space-y-2.5">
                {testResult.skillBreakdown?.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-700 dark:text-slate-200">{skill.skillTag}</span>
                      <span
                        className={`${
                          skill.percentage >= 75
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {skill.percentage}% ({skill.correct}/{skill.total})
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          skill.percentage >= 75
                            ? 'bg-emerald-500'
                            : skill.percentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Identified Gaps & Root Cause Analysis */}
            {testResult.aiSkillGapReport?.identifiedGaps?.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-2">
                <h4 className="font-extrabold text-xs text-red-700 dark:text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <FiAlertCircle />
                  <span>Identified Knowledge & Skill Gaps</span>
                </h4>

                <div className="space-y-2">
                  {testResult.aiSkillGapReport.identifiedGaps.map((gap, gIdx) => (
                    <div key={gIdx} className="text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-red-100 dark:border-red-900/40">
                      <div className="flex items-center justify-between font-bold text-red-600 dark:text-red-400 mb-1">
                        <span>{gap.skill}</span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                          {gap.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{gap.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Targeted Action Plan with VidyaPath Tool Bridges */}
            {testResult.aiSkillGapReport?.recommendedActions?.length > 0 && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <h4 className="font-extrabold text-xs text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <FiCpu />
                  <span>AI Targeted Remediation Plan</span>
                </h4>

                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {testResult.aiSkillGapReport.recommendedActions.map((action, aIdx) => (
                    <li key={aIdx} className="leading-relaxed bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Question by Question Review Drawer */}
            <div>
              <button
                onClick={() => setShowReview(!showReview)}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                {showReview ? 'Hide Detailed Answer Key' : 'Review All Questions & Explanations'}
              </button>

              {showReview && (
                <div className="mt-4 space-y-3 animate-fadeIn">
                  {testResult.answers?.map((ans, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                        ans.isCorrect
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Q{idx + 1}: {ans.questionText}</span>
                        <span className={ans.isCorrect ? 'text-emerald-600' : 'text-red-500'}>
                          {ans.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>Your Answer:</strong> {ans.selectedOption}
                      </p>
                      {!ans.isCorrect && (
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          <strong>Correct Answer:</strong> {ans.correctAnswer}
                        </p>
                      )}
                      {ans.explanation && (
                        <p className="text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                          Explanation: {ans.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setShowResultModal(false);
                  navigate('/rag');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <FiCpu size={14} /> Practice Gaps in AI RAG
              </button>

              <button
                onClick={() => setShowResultModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. TUTOR STUDIO MODAL: CREATE ASSESSMENT */}
      {showStudioModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FiAward className="text-purple-600" /> Tutor Assessment Studio
                </h3>
                <p className="text-xs text-slate-400">Author custom skill assessments with tagged diagnostic metrics.</p>
              </div>
              <button
                onClick={() => setShowStudioModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FiX size={22} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => { setCreationMode('colab_pdf'); setGenerationError(''); }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  creationMode === 'colab_pdf'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FiCpu className={creationMode === 'colab_pdf' ? 'animate-pulse' : ''} />
                <span>Auto-Generate from PDF (Colab RAG)</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20 font-black uppercase tracking-wider">AI</span>
              </button>
              <button
                type="button"
                onClick={() => { setCreationMode('manual'); setGenerationError(''); }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  creationMode === 'manual'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FiPlus />
                <span>Manual Question Builder</span>
              </button>
            </div>

            {creationMode === 'colab_pdf' ? (
              <form onSubmit={handleGenerateFromPdf} className="space-y-4">
                {/* Colab RAG Status Notice */}
                <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>
                      <strong>Google Colab RAG Engine:</strong> Upload any course/topic PDF and AI will read, extract key concepts, and generate 4-option diagnostic MCQs with explanations.
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    colabRagStatus === 'online' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {colabRagStatus === 'online' ? '● Colab RAG Online' : '● Grounded AI Active'}
                  </span>
                </div>

                {generationError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <FiAlertCircle className="shrink-0" />
                    <span>{generationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      Assessment Title / Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studioData.title}
                      onChange={e => setStudioData({ ...studioData, title: e.target.value })}
                      placeholder="e.g. Advanced Operating Systems & Threads"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      Domain Category
                    </label>
                    <select
                      value={studioData.domain}
                      onChange={e => setStudioData({ ...studioData, domain: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                      <option value="Full Stack Development">Full Stack Development</option>
                      <option value="Database Engineering">Database Engineering</option>
                      <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                      <option value="System Design & Architecture">System Design & Architecture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Description / Scope
                  </label>
                  <textarea
                    rows={2}
                    value={studioData.description}
                    onChange={e => setStudioData({ ...studioData, description: e.target.value })}
                    placeholder="Brief description of the skills or topics covered in this PDF assessment..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                {/* PDF File Drag & Drop Zone */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Upload Course / Subject PDF *
                  </label>
                  <div
                    onClick={() => document.getElementById('assessment-pdf-input').click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      pdfFile
                        ? 'border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-purple-500 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <input
                      id="assessment-pdf-input"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setPdfFile(e.target.files[0]);
                          setGenerationError('');
                          if (!studioData.title) {
                            const nameWithoutExt = e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                            setStudioData(prev => ({ ...prev, title: nameWithoutExt }));
                          }
                        }
                      }}
                    />
                    {pdfFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FiFileText className="text-emerald-600 dark:text-emerald-400 text-3xl" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {pdfFile.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Colab RAG synthesis
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPdfFile(null);
                          }}
                          className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FiUploadCloud className="mx-auto text-3xl text-purple-600 dark:text-purple-400 animate-bounce" />
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Click or drag and drop your course PDF here
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Supported: PDF documents up to 25MB (lecture notes, syllabi, textbooks, cheat-sheets)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      MCQ Count
                    </label>
                    <select
                      value={questionCount}
                      onChange={e => setQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-purple-600 dark:text-purple-400"
                    >
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions (Recommended)</option>
                      <option value={8}>8 Questions</option>
                      <option value={10}>10 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={studioData.difficulty}
                      onChange={e => setStudioData({ ...studioData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Time (Mins)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={120}
                      value={studioData.timeLimitMinutes}
                      onChange={e => setStudioData({ ...studioData, timeLimitMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Passing %
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={100}
                      value={studioData.passingPercentage}
                      onChange={e => setStudioData({ ...studioData, passingPercentage: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                {isGeneratingWithRag && (
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {generationProgress || 'Synthesizing MCQs using Google Colab RAG...'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-8">
                      Parsing document structure, indexing knowledge chunks, and constructing tagged question prompts with correct answers.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    disabled={isGeneratingWithRag}
                    onClick={() => setShowStudioModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGeneratingWithRag || !pdfFile}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-xs shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                  >
                    <FiZap />
                    <span>{isGeneratingWithRag ? 'Synthesizing Assessment...' : '🚀 Generate MCQs & Publish for Learners'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePublishAssessment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      Assessment Title
                    </label>
                    <input
                      type="text"
                      required
                      value={studioData.title}
                      onChange={e => setStudioData({ ...studioData, title: e.target.value })}
                      placeholder="e.g. Distributed Systems & Concurrency"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      Domain Category
                    </label>
                    <select
                      value={studioData.domain}
                      onChange={e => setStudioData({ ...studioData, domain: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100"
                    >
                      <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                      <option value="Full Stack Development">Full Stack Development</option>
                      <option value="Database Engineering">Database Engineering</option>
                      <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                      <option value="System Design & Architecture">System Design & Architecture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={studioData.description}
                    onChange={e => setStudioData({ ...studioData, description: e.target.value })}
                    placeholder="Outline what skills, concepts, or interview competencies this test evaluates..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={studioData.difficulty}
                      onChange={e => setStudioData({ ...studioData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Time Limit (Mins)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={studioData.timeLimitMinutes}
                      onChange={e => setStudioData({ ...studioData, timeLimitMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                      Passing %
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={studioData.passingPercentage}
                      onChange={e => setStudioData({ ...studioData, passingPercentage: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                {/* Questions Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Questions ({studioData.questions.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddQuestionToStudio}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <FiPlus size={14} /> Add Another Question
                    </button>
                  </div>

                  {studioData.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Question #{qIdx + 1}</span>
                        <input
                          type="text"
                          required
                          placeholder="Skill Tag (e.g. Red-Black Trees)"
                          value={q.skillTag}
                          onChange={e => {
                            const updated = [...studioData.questions];
                            updated[qIdx].skillTag = e.target.value;
                            setStudioData({ ...studioData, questions: updated });
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-indigo-600"
                        />
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Enter question prompt..."
                        value={q.question}
                        onChange={e => {
                          const updated = [...studioData.questions];
                          updated[qIdx].question = e.target.value;
                          setStudioData({ ...studioData, questions: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                      />

                      {/* 4 Options */}
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <input
                            key={optIdx}
                            type="text"
                            required
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={e => {
                              const updated = [...studioData.questions];
                              updated[qIdx].options[optIdx] = e.target.value;
                              setStudioData({ ...studioData, questions: updated });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        ))}
                      </div>

                      {/* Correct Answer Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">
                          Select Exact Correct Answer:
                        </label>
                        <select
                          required
                          value={q.correctAnswer}
                          onChange={e => {
                            const updated = [...studioData.questions];
                            updated[qIdx].correctAnswer = e.target.value;
                            setStudioData({ ...studioData, questions: updated });
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-emerald-600"
                        >
                          <option value="">-- Choose correct option --</option>
                          {q.options.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt ? `Option ${String.fromCharCode(65 + oIdx)}: ${opt}` : `Option ${String.fromCharCode(65 + oIdx)} (empty)`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        type="text"
                        placeholder="Explanation for learners after test..."
                        value={q.explanation}
                        onChange={e => {
                          const updated = [...studioData.questions];
                          updated[qIdx].explanation = e.target.value;
                          setStudioData({ ...studioData, questions: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs italic text-slate-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowStudioModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:scale-105 transition-all"
                  >
                    Publish Assessment
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default SkillAssessments;
