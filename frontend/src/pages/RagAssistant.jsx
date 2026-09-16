import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  FiCpu,
  FiSend,
  FiUploadCloud,
  FiFileText,
  FiAlertCircle,
  FiClock,
  FiCopy,
  FiRefreshCw,
  FiSettings,
  FiLayers,
  FiTrash2,
  FiBookOpen,
  FiZap,
  FiChevronDown,
  FiChevronUp,
  FiCheckSquare,
  FiX
} from 'react-icons/fi';

const RagAssistant = () => {
  // Query & Chat State
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `### 👋 Welcome to your AI RAG Study Assistant!\n\nI am powered by **OpenRouter AI (GPT-4o)**, **Colab RAG**, and **MongoDB Atlas**.\n\nYou can:\n- **Ask any question** about your coursework, algorithms, or technical subjects.\n- **Upload a PDF or lecture document** to ground answers directly in your syllabus text with citations.\n- **Use prompt shortcuts** below to generate exam questions, concept summaries, and formulas!`,
      source: 'openrouter_rag',
      sources: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Document Context State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentContext, setDocumentContext] = useState('');
  const [docStats, setDocStats] = useState(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Colab Status & Config State
  const [colabStatus, setColabStatus] = useState({
    status: 'checking',
    latencyMs: 0,
    colabUrl: process.env.REACT_APP_COLAB_RAG_API || 'https://dry-pets-talk.loca.lt',
    message: 'Testing Colab tunnel...',
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newColabUrl, setNewColabUrl] = useState('');
  const [testingPing, setTestingPing] = useState(false);

  // History State
  const [history, setHistory] = useState([]);
  const [showSourcesForMsg, setShowSourcesForMsg] = useState({});

  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Check Colab Status on Mount
  useEffect(() => {
    fetchColabStatus();
    fetchHistory();
  }, []);

  const fetchColabStatus = async () => {
    setTestingPing(true);
    try {
      const res = await api.get('/rag/status');
      if (res.data) {
        setColabStatus({
          status: res.data.status,
          latencyMs: res.data.latencyMs || 0,
          colabUrl: res.data.colabUrl || colabStatus.colabUrl,
          message: res.data.message || '',
        });
        setNewColabUrl(res.data.colabUrl || '');
      }
    } catch (err) {
      setColabStatus(prev => ({
        ...prev,
        status: 'tunnel_offline',
        message: 'Could not connect to Colab tunnel. Local fallback is ready.',
      }));
    } finally {
      setTestingPing(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/rag/history');
      if (Array.isArray(res.data)) {
        setHistory(res.data);
      }
    } catch (err) {
      console.warn('Could not load RAG history:', err);
    }
  };

  // Handle Document Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setError('');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await api.post('/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedFile(file);
      setDocumentContext(res.data.text || '');
      setDocStats({
        fileName: res.data.fileName,
        fileSize: (res.data.fileSize / (1024 * 1024)).toFixed(2) + ' MB',
        words: res.data.totalWords,
        chunks: res.data.chunksCount,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to extract text from document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleClearDocument = () => {
    setUploadedFile(null);
    setDocumentContext('');
    setDocStats(null);
  };

  // Handle Query Submission
  const handleSubmitQuery = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const userQuery = query.trim();
    setQuery('');
    setError('');

    // Add user message to UI immediately
    const userMsgId = 'user-' + Date.now();
    const newMsg = {
      id: userMsgId,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const userName = localStorage.getItem('userName') || 'Learner';
      const res = await api.post('/rag/query', {
        query: userQuery,
        documentContext: documentContext,
        userName,
      });

      const aiMsgId = 'ai-' + Date.now();
      const aiResponse = {
        id: aiMsgId,
        sender: 'ai',
        text: res.data.answer || 'No response received from RAG engine.',
        source: res.data.source || 'colab_rag',
        sources: res.data.sources || [],
        latencyMs: res.data.latencyMs || 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiResponse]);
      fetchHistory(); // refresh MongoDB history list
    } catch (err) {
      console.error('RAG Query Error:', err);
      setError('Query failed. Please check if your backend or Colab model is reachable.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Action: Summarize Active Document / Topic via Colab RAG
  const handleQuickSummarize = async () => {
    if (loading) return;
    const textToSummarize = documentContext || query.trim();
    if (!textToSummarize) {
      setError('Please attach a PDF document or type a topic in the input box to summarize.');
      return;
    }

    const promptText = `📑 Generate an executive study summary of the active material.`;
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/rag/summarize', {
        text: textToSummarize,
        title: docStats?.fileName || 'Curriculum Overview',
      });

      const aiResponse = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: res.data.summary,
        source: res.data.source || 'colab_rag',
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Quick Summarize Error:', err);
      setError('Could not generate summary. Please ensure backend is active.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Action: Generate 5-Question Quiz via Colab RAG
  const handleQuickQuiz = async () => {
    if (loading) return;
    const textForQuiz = documentContext || query.trim();
    if (!textForQuiz) {
      setError('Please attach a PDF document or type a topic in the input box to generate a quiz.');
      return;
    }

    const promptText = `❓ Generate 5 high-yield practice questions from this material.`;
    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/rag/generate-quiz', {
        text: textForQuiz,
        count: 5,
      });

      const quizItems = res.data.quiz || [];
      let quizMarkdown = `### 🎯 High-Yield Practice Quiz (${quizItems.length} Questions)\n\n*Synthesized via Google Colab RAG & VidyaPath AI Engine*\n\n`;

      quizItems.forEach((q, idx) => {
        quizMarkdown += `#### Question #${idx + 1}: ${q.question}\n`;
        (q.options || []).forEach((opt, oIdx) => {
          const letter = String.fromCharCode(65 + oIdx);
          quizMarkdown += `- **[${letter}]** ${opt}\n`;
        });
        quizMarkdown += `\n> **Correct Answer:** **${q.answer || q.correctAnswer}**\n> *Explanation:* ${q.explanation || 'Verified from course text.'}\n\n---\n\n`;
      });

      const aiResponse = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: quizMarkdown,
        source: res.data.source || 'colab_rag',
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Quick Quiz Error:', err);
      setError('Could not generate quiz. Please ensure backend is active.');
    } finally {
      setLoading(false);
    }
  };

  // Save new Colab URL
  const handleSaveColabUrl = async (e) => {
    e.preventDefault();
    if (!newColabUrl.trim()) return;

    try {
      const res = await api.post('/rag/config', { url: newColabUrl.trim() });
      setColabStatus(prev => ({ ...prev, colabUrl: res.data.colabUrl }));
      setShowConfigModal(false);
      fetchColabStatus();
    } catch (err) {
      alert('Failed to update Colab URL. Check the URL format.');
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSourceView = (msgId) => {
    setShowSourcesForMsg(prev => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  // Preset Prompts
  const presetPrompts = [
    '⚡ Summarize the key formulas, definitions, and rules.',
    '❓ Generate 5 high-yield multiple-choice questions for practice.',
    '💡 Explain this concept step-by-step with real-world analogies.',
    '🔍 What are the most common exam pitfalls or edge cases for this topic?',
  ];

  // Helper to render markdown-like lines
  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 dark:text-slate-300 my-0.5 leading-relaxed">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-indigo-500 pl-3 my-2 text-indigo-700 dark:text-indigo-300 italic bg-indigo-50/50 dark:bg-indigo-950/20 py-1 rounded-r-lg text-sm">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-slate-700 dark:text-slate-300 my-1 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* 1. TOP HEADER & COLAB STATUS CARD */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Background ambient gradient glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiZap /> Retrieval-Augmented Generation (RAG)
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              AI Study Knowledge Assistant
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-2xl">
              Query syllabus materials, research papers, and technical questions powered by your Colab RAG endpoint with MongoDB persistence.
            </p>
          </div>

          {/* Colab Status Pill & Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    colabStatus.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    colabStatus.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                  {colabStatus.openRouterActive ? 'OpenRouter Active' : (colabStatus.status === 'online' ? 'Colab Online' : 'Hybrid Engine')}
                </p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                  {colabStatus.openRouterActive ? (colabStatus.openRouterModel || 'openai/gpt-4o') : colabStatus.colabUrl.replace('https://', '')}
                </p>
              </div>
            </div>

            <button
              onClick={fetchColabStatus}
              disabled={testingPing}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Refresh Connection Status"
            >
              <FiRefreshCw className={testingPing ? 'animate-spin' : ''} size={18} />
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:scale-105 transition-all"
            >
              <FiSettings size={16} />
              <span>Colab URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DOCUMENT CONTEXT GROUNDING BAR */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FiBookOpen size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Document Context Grounding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {uploadedFile
                  ? `Active document: ${docStats?.fileName} (${docStats?.chunks} chunks indexed)`
                  : 'No document attached. General syllabus knowledge mode active.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {uploadedFile ? (
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  ✓ {docStats?.words} words loaded
                </span>
                <button
                  onClick={handleQuickSummarize}
                  disabled={loading}
                  title="Synthesize Executive Summary via Colab RAG"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 transition-colors"
                >
                  <FiFileText size={14} /> 📑 Summarize
                </button>
                <button
                  onClick={handleQuickQuiz}
                  disabled={loading}
                  title="Generate Practice Quiz via Colab RAG"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                  <FiCheckSquare size={14} /> ❓ Practice Quiz
                </button>
                <button
                  onClick={handleClearDocument}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-colors"
                >
                  <FiTrash2 size={14} /> Clear
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors text-xs font-bold">
                <FiUploadCloud size={16} />
                <span>{isUploadingDoc ? 'Extracting Text...' : 'Attach PDF / Study Notes'}</span>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploadingDoc}
                />
              </label>
            )}
          </div>

        </div>
      </div>

      {/* 3. MAIN INTERACTION GRID: CHAT FEED + HISTORY SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Columns: Active Chat View */}
        <div className="lg:col-span-3 flex flex-col h-[650px] glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* AI Avatar */}
                {msg.sender === 'ai' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0 mt-1">
                    <FiCpu size={18} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-tr-none'
                      : 'bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Top message header */}
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80 text-xs">
                    <span className="font-bold opacity-80">
                      {msg.sender === 'user' ? 'You' : 'VidyaPath RAG'}
                    </span>
                    <div className="flex items-center gap-2 opacity-70">
                      {msg.source && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                          {msg.source === 'openrouter_rag' ? 'OpenRouter (GPT-4o)' : (msg.source === 'colab_rag' ? 'Colab GPU' : 'Local Engine')}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* Formatted Content */}
                  <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Grounded Sources Drawer Toggle (If any chunks present) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => toggleSourceView(msg.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <FiLayers size={14} />
                        <span>
                          {showSourcesForMsg[msg.id] ? 'Hide Citations' : `View Grounded Citations (${msg.sources.length} chunks)`}
                        </span>
                        {showSourcesForMsg[msg.id] ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      </button>

                      {showSourcesForMsg[msg.id] && (
                        <div className="mt-3 space-y-2 animate-fadeIn">
                          {msg.sources.map((src, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                            >
                              <div className="flex items-center justify-between font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                                <span>{src.title || `Source Passage #${i + 1}`}</span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-[10px]">
                                  Relevance: {Math.round((src.score || 0.85) * 100)}%
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 italic">
                                "{src.content}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copy Button */}
                  {msg.sender === 'ai' && (
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <FiCopy size={13} />
                        <span>{copiedId === msg.id ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3.5 items-center text-slate-500 dark:text-slate-400 text-sm animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <FiCpu className="animate-spin" size={18} />
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 rounded-tl-none">
                  Retrieving embeddings & synthesizing answer...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto flex gap-2 no-scrollbar">
            {presetPrompts.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (preset.includes('Summarize')) {
                    handleQuickSummarize();
                  } else if (preset.includes('questions')) {
                    handleQuickQuiz();
                  } else {
                    setQuery(preset.replace(/^[^\s]+\s*/, ''));
                  }
                }}
                className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all hover:scale-102 flex-shrink-0"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmitQuery}
            className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex gap-2 items-center"
          >
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={
                uploadedFile
                  ? `Ask a question about ${uploadedFile.name}...`
                  : 'Ask about any concept, problem, or syllabus topic...'
              }
              className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />

            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
            >
              <FiSend size={16} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

        </div>

        {/* Right 1 Column: MongoDB Q&A History Sidebar */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col h-[650px] shadow-sm">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FiClock className="text-indigo-600 dark:text-indigo-400" size={18} />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Saved Questions
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              Atlas DB
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
            {history.length > 0 ? (
              history.map(item => (
                <div
                  key={item._id}
                  onClick={() => setQuery(item.query)}
                  className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 cursor-pointer transition-all hover:scale-102 group"
                >
                  <p className="font-semibold text-xs text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {item.query}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <span className="capitalize">{item.source?.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                <FiFileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>No queries saved yet.</p>
                <p className="mt-1">Ask questions to see your history logged in MongoDB Atlas.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 4. MODAL: CONFIGURE COLAB RAG URL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FiSettings className="text-indigo-600" /> Colab RAG Tunnel Settings
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FiX size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              If your Google Colab notebook restarts or generates a new Localtunnel or Ngrok URL, paste it here. It updates immediately without restarting the backend!
            </p>

            <form onSubmit={handleSaveColabUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1.5">
                  Colab RAG URL
                </label>
                <input
                  type="url"
                  required
                  value={newColabUrl}
                  onChange={e => setNewColabUrl(e.target.value)}
                  placeholder="https://dry-pets-talk.loca.lt"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  Save & Test
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default RagAssistant;
