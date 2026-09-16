import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  FiCpu,
  FiSend,
  FiX,
  FiTrash2,
  FiUploadCloud,
  FiCopy,
  FiMinimize2,
  FiZap,
  FiFileText,
  FiLayers,
  FiChevronUp,
  FiChevronDown,
  FiMessageSquare
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';


export default function AuraChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showSourcesForMsg, setShowSourcesForMsg] = useState({});

  // Document Context State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [documentContext, setDocumentContext] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Chat Messages
  const [messages, setMessages] = useState([
    {
      id: 'aura-welcome',
      sender: 'ai',
      text: `### ✨ Hello! I am AURA\n\nYour personal **AI Academic & Study Assistant** powered by **OpenRouter (GPT-4o)**.\n\nAsk me anything about:\n- **DSA & Algorithms**\n- **Web Development & Systems**\n- **AI, ML & Math**\n- **Homework, Notes & Syllabus Q&A**`,
      source: 'openrouter_rag',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Handle Document Upload for Grounding
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingDoc(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await api.post('/rag/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedFile(file);
      setDocumentContext(res.data.text || '');
    } catch (err) {
      console.error(err);
      alert('Could not extract text from uploaded document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleClearDocument = () => {
    setUploadedFile(null);
    setDocumentContext('');
  };

  // Submit Query
  const handleSubmitQuery = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim() || loading) return;

    const userQuery = query.trim();
    setQuery('');

    const userMsgId = 'user-' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
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
        text: res.data.answer || 'I could not synthesize an answer. Please try again.',
        source: res.data.source || 'openrouter_rag',
        sources: res.data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('AURA Query Error:', err);
      const errorMsg = {
        id: 'err-' + Date.now(),
        sender: 'ai',
        text: '⚠️ I ran into a connection glitch. Please check your backend server and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'aura-welcome-' + Date.now(),
        sender: 'ai',
        text: `### ✨ Chat Cleared!\n\nI am **AURA**, ready for your next study question.`,
        source: 'openrouter_rag',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
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

  // Helper to render markdown-like lines
  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-2 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-3 mb-1">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-3 list-disc text-slate-700 dark:text-slate-300 my-0.5 text-xs leading-relaxed">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-3 border-indigo-500 pl-2 my-1 text-indigo-700 dark:text-indigo-300 italic bg-indigo-50/50 dark:bg-indigo-950/20 py-0.5 text-xs">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1" />;
      }
      return (
        <p key={idx} className="text-slate-700 dark:text-slate-300 my-0.5 text-xs leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      {/* --------------------------------------------------------------------------- */}
      {/* 1. FLOATING ACTION BUTTON (FAB) - Always visible in bottom right           */}
      {/* --------------------------------------------------------------------------- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:scale-108 active:scale-95 transition-all duration-300 group"
          title="Open AURA AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <HiSparkles className="animate-spin text-amber-300" size={18} style={{ animationDuration: '6s' }} />
          </div>
          <span className="tracking-wide">AURA AI</span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
        </button>
      )}

      {/* --------------------------------------------------------------------------- */}
      {/* 2. AURA FLOATING CHAT WINDOW                                              */}
      {/* --------------------------------------------------------------------------- */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-96 h-[580px] max-h-[85vh] glass-card rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                <HiSparkles size={16} className="text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-none flex items-center gap-1.5">
                  <span>AURA AI</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-900">
                    GPT-4o
                  </span>
                </h3>
                <span className="text-[10px] text-white/80 font-semibold">
                  Personal Study Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title="Clear Chat"
              >
                <FiTrash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title="Minimize AURA"
              >
                <FiMinimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Active Grounded Document Indicator */}
          {uploadedFile && (
            <div className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/70 border-b border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between text-[11px]">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 truncate max-w-[240px]">
                📄 Attached: {uploadedFile.name}
              </span>
              <button
                onClick={handleClearDocument}
                className="text-red-500 font-bold hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0 mt-0.5">
                    ✨
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3 shadow-xs text-xs ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Formatted Content */}
                  <div className="prose dark:prose-invert max-w-none">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Citations Toggle */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => toggleSourceView(msg.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <FiLayers size={12} />
                        <span>{showSourcesForMsg[msg.id] ? 'Hide Passages' : `Citations (${msg.sources.length})`}</span>
                        {showSourcesForMsg[msg.id] ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                      </button>

                      {showSourcesForMsg[msg.id] && (
                        <div className="mt-2 space-y-1.5 animate-fadeIn">
                          {msg.sources.map((src, i) => (
                            <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-[10px] border border-slate-200 dark:border-slate-700">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">{src.title}</span>
                              <p className="text-slate-600 dark:text-slate-300 italic">{src.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copy Button */}
                  {msg.sender === 'ai' && (
                    <div className="mt-1.5 flex justify-end">
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="text-[10px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5"
                      >
                        <FiCopy size={11} />
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  ✨
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  AURA is thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/60 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setQuery('⚡ Summarize core formulas and key definitions')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300"
            >
              ⚡ Summarize
            </button>
            <button
              onClick={() => setQuery('❓ Generate 3 quick practice questions')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300"
            >
              ❓ Quiz
            </button>
            <button
              onClick={() => setQuery('💡 Explain this concept step-by-step')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300"
            >
              💡 Explain
            </button>
          </div>

          {/* Chat Input Area */}
          <form
            onSubmit={handleSubmitQuery}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <label className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition">
              <FiUploadCloud size={16} />
              <input
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploadingDoc}
              />
            </label>

            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask AURA anything..."
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md disabled:opacity-40 hover:scale-105 transition"
            >
              <FiSend size={15} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
