import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FiUploadCloud,
  FiFileText,
  FiLoader,
  FiFile,
  FiTrash2,
  FiAlertCircle,
  FiCpu,
  FiArrowRight,
  FiCheck,
  FiCopy,
  FiDownload,
  FiClock,
  FiEdit3,
  FiZap,
  FiCheckCircle
} from 'react-icons/fi';
import BashSummary from '../components/BashSummary';

const QUICK_TOPICS = [
  {
    title: 'Distributed Systems & CAP Theorem',
    text: 'Distributed systems consist of autonomous computing nodes that coordinate actions via network messages. The CAP theorem states that any distributed data store can guarantee at most two out of three qualities: Consistency, Availability, and Partition Tolerance. Under realistic network conditions, partitions cannot be prevented, requiring engineers to prioritize either consistency (CP) or availability (AP). Modern architectures leverage consensus protocols like Raft, vector clocks for causal ordering, and two-phase commits to ensure eventual data convergence.'
  },
  {
    title: 'National Accounts & Industrial Production',
    text: 'In the framework of National Accounts, macroeconomic price indices reflect structural shifts across production sectors. The Index of Industrial Production (IIP) measures short-term volume changes of industrial products with the Laspeyres weighted formulation. Consistent field verification, random sampling stratification, and non-sampling error reduction ensure that national indicators provide reliable empirical guidance for fiscal and monetary policy formulation.'
  },
  {
    title: 'Deep Work & Cognitive Focus',
    text: 'Deep work is the ability to focus without distraction on a cognitively demanding task. It is a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship. To produce at your peak level you need to work for extended periods with full concentration on a single task free from all distraction.'
  }
];

const Summarizer = () => {
  const [inputMode, setInputMode] = useState('file'); // 'file' | 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setSelectedFile(file);
      setSummary('');
      setError('');
    } else {
      setError('Please select a valid PDF lecture or document file.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inputMode === 'file' && !selectedFile) {
      setError('Please select a PDF document first.');
      return;
    }
    if (inputMode === 'text' && (!inputText || inputText.trim().length < 30)) {
      setError('Please provide at least 30 characters of text to summarize.');
      return;
    }

    setIsLoading(true);
    setSummary('');
    setError('');

    try {
      let res;
      if (inputMode === 'file') {
        const formData = new FormData();
        formData.append('pdfFile', selectedFile);
        res = await api.post('/summarize', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/summarize', {
          text: inputText.trim(),
          title: 'Custom Study Notes',
        });
      }

      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.msg ||
        err.response?.data?.error ||
        'An error occurred while summarizing the content.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VidyaPath_Executive_Summary.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Jump to Quiz Generator with this text
  const handleGenerateQuizFromSummary = () => {
    const textToPass = summary || inputText || (selectedFile ? selectedFile.name : '');
    navigate('/quiz-generator', { state: { text: textToPass } });
  };

  const wordCount = summary ? summary.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMin = Math.max(1, Math.round(wordCount / 180));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* 1. Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <FiCpu /> Google Colab RAG Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              AI Document Summarizer
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Distill lecture notes, articles, and research papers into structured bullet summaries with core conceptual highlights and action plans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/rag')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xs"
            >
              <FiCpu size={16} />
              <span>Personal AI Agent</span>
            </button>
            <button
              onClick={() => navigate('/quiz-generator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:scale-105 active:scale-95 transition-all"
            >
              <FiCheckCircle size={16} />
              <span>Quiz Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Upload Box */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Mode Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-auto self-start inline-flex">
          <button
            onClick={() => { setInputMode('file'); setError(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'text'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FiEdit3 size={16} />
            <span>Paste Notes / Topic</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Upload Box */}
          {inputMode === 'file' && (
            <div>
              {!selectedFile ? (
                <div className="relative border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 rounded-2xl p-12 flex flex-col items-center justify-center bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer group">
                  <input 
                    id="pdfFile" 
                    name="pdfFile" 
                    type="file" 
                    accept="application/pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={handleFileChange} 
                  />
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FiUploadCloud size={32} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    Click or Drag PDF Document to Upload
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Maximum size: 25MB • Up to 100 pages</p>
                </div>
              ) : (
                <div className="border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/30 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                      <FiFile size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Colab RAG
                      </p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => setSelectedFile(null)} 
                    className="text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <FiTrash2 size={15} /> Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text Paste Mode */}
          {inputMode === 'text' && (
            <div className="space-y-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={7}
                placeholder="Paste your study notes, research excerpt, or textbook chapter here..."
                className="w-full p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition shadow-inner"
              />

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  ⚡ Curated Study Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TOPICS.map((t) => (
                    <button
                      type="button"
                      key={t.title}
                      onClick={() => setInputText(t.text)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading || (inputMode === 'file' ? !selectedFile : !inputText.trim())}
            className={`w-full flex justify-center items-center gap-3 py-4 px-6 rounded-2xl font-black text-white shadow-lg transition-all text-base ${
              isLoading || (inputMode === 'file' ? !selectedFile : !inputText.trim())
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <FiLoader className="animate-spin" size={20} />
                <span>Synthesizing Colab RAG Executive Summary...</span>
              </div>
            ) : (
              <>
                <FiFileText size={20} />
                <span>Generate Executive Summary</span>
              </>
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900 animate-fadeIn text-sm">
            <FiAlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Output Section */}
        {summary && !isLoading && (
          <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
            
            {/* Metric & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FiClock size={14} className="text-indigo-500" />
                  ~{readTimeMin} min read
                </span>
                <span>•</span>
                <span>{wordCount} words</span>
                <span>•</span>
                <span className="text-indigo-600 dark:text-indigo-400">Grounded Synthesis</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition"
                  title="Copy to Clipboard"
                >
                  {copied ? <FiCheck size={14} className="text-green-500" /> : <FiCopy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition"
                  title="Download Markdown"
                >
                  <FiDownload size={14} />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            {/* Structured Terminal-style Output */}
            <BashSummary summary={summary} />

            {/* Bridge to Practice Quiz & AI Agent */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/60">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                  Ready to test your retention?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Convert this document summary into a 5-question practice quiz instantly.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleGenerateQuizFromSummary}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <FiZap size={14} />
                  <span>Take Practice Quiz</span>
                  <FiArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default Summarizer;