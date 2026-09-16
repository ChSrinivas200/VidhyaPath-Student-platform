import React, { useState } from 'react';
import api from '../services/api';
import {
  X,
  Loader2,
  Send,
  Tag,
  BookOpen,
  Code,
  Briefcase,
  HelpCircle,
  Sparkles,
  Bold,
  Italic,
  List,
  Quote,
  Eye,
  Edit3
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Interview Experiences', label: 'Interview Experiences', icon: Briefcase, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
  { id: 'DSA & LeetCode', label: 'DSA & LeetCode', icon: Code, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' },
  { id: 'System Design', label: 'System Design', icon: Sparkles, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  { id: 'Academic Notes', label: 'Academic Notes', icon: BookOpen, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  { id: 'Career Advice', label: 'Career Advice', icon: HelpCircle, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  { id: 'General Discussion', label: 'General Discussion', icon: Tag, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
];

const SUGGESTED_TAGS = ['System Design', 'Kafka', 'DSA', 'DP', 'Interviews', 'Google', 'Amazon', 'Semester Exam', 'RAG'];

const CreateArticleModal = ({ isOpen, onClose, onArticleCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Interview Experiences',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '');
    if (trimmed && !formData.tags.includes(trimmed) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleInsertFormat = (formatType) => {
    let before = '';
    let after = '';
    if (formatType === 'bold') { before = '**'; after = '**'; }
    if (formatType === 'italic') { before = '*'; after = '*'; }
    if (formatType === 'code') { before = '```\n'; after = '\n```'; }
    if (formatType === 'list') { before = '\n- '; after = ''; }
    if (formatType === 'quote') { before = '\n> '; after = ''; }

    setFormData(prev => ({
      ...prev,
      content: prev.content + before + (formatType === 'code' ? '// your code here' : '') + after
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return setError('Please enter a descriptive title for your post.');
    }
    if (!formData.content.trim()) {
      return setError('Please write some content or insights to share.');
    }

    setLoading(true);
    setError('');

    try {
      const author = localStorage.getItem('userName') || 'Learner';
      const authorRole = localStorage.getItem('userRole') || 'Learner';

      await api.post('/articles', {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        author,
        authorRole
      });

      // Reset and refresh
      setFormData({
        title: '',
        content: '',
        category: 'Interview Experiences',
        tags: []
      });
      setTagInput('');
      onArticleCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to post discussion. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const currentAuthor = localStorage.getItem('userName') || 'Learner';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden relative animate-scale-in">
        
        {/* Background glow orb */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-800 relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-bold">
              <Edit3 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">
                Publish Discussion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Posting as <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentAuthor}</span> to Community Feed
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 relative z-10">
          
          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* 1. Category Selection Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-102'
                        : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    <IconComponent size={13} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Post Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Discussion Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. How I Solved Google's Distributed Cache Interview Problem"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder-slate-400"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* 3. Content Formatting Bar & Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Discussion Content
              </label>

              {/* Write vs Preview Tabs */}
              <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'write'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Edit3 size={12} />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Eye size={12} />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Quick Formatting Toolbar (in Write mode) */}
            {activeTab === 'write' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('bold')}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    title="Bold"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('italic')}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    title="Italic"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('code')}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    title="Code Block"
                  >
                    <Code size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('list')}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    title="Bullet List"
                  >
                    <List size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat('quote')}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
                    title="Quote"
                  >
                    <Quote size={14} />
                  </button>
                  <div className="ml-auto text-[10px] text-slate-400 font-bold pr-2">
                    Markdown Supported
                  </div>
                </div>

                <textarea
                  rows="7"
                  required
                  placeholder="Share details, problem walkthrough, complexity trade-offs, or questions for peer review..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition placeholder-slate-400 leading-relaxed resize-y"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            ) : (
              <div className="min-h-[180px] p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {formData.content ? formData.content : <span className="text-slate-400 italic">Nothing to preview yet.</span>}
              </div>
            )}
          </div>

          {/* 4. Tags Input & Suggestions */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tags (Up to 5)
            </label>
            
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}

              <input
                type="text"
                placeholder={formData.tags.length < 5 ? "Add a tag and press Enter..." : "Max tags reached"}
                disabled={formData.tags.length >= 5}
                className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 px-2 py-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
              />
            </div>

            {/* Suggested quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Suggestions:</span>
              {SUGGESTED_TAGS.map((stag) => (
                <button
                  key={stag}
                  type="button"
                  onClick={() => handleAddTag(stag)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition"
                >
                  +{stag}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs text-white shadow-lg transition-all ${
                loading || !formData.title.trim() || !formData.content.trim()
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={14} />}
              <span>{loading ? 'Publishing Discussion...' : 'Publish to Feed'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateArticleModal;