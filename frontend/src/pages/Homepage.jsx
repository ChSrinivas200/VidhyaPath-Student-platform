import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ArticleCard from '../components/ArticleCard';
import CreateArticleModal from '../components/CreateArticleModal';
import { Loader2, Plus, MessageSquare, Search, Sparkles, Filter } from 'lucide-react';

const Homepage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    'Interview Experiences',
    'DSA & LeetCode',
    'System Design',
    'Academic Notes',
    'Career Advice',
    'General Discussion'
  ];

  // Function to fetch articles from backend
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/articles');
      setArticles(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load discussion feed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Filter articles by search term and category
  const filteredArticles = articles.filter(post => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !s ||
      post.title.toLowerCase().includes(s) ||
      post.content.toLowerCase().includes(s) ||
      (post.author && post.author.toLowerCase().includes(s)) ||
      (Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(s)));

    const matchesCategory =
      activeCategory === 'All' ||
      (post.category && post.category.toLowerCase() === activeCategory.toLowerCase()) ||
      (!post.category && post.title.toLowerCase().includes(activeCategory.toLowerCase().split(' ')[0]));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16 font-sans">
      
      {/* 1. PAGE HERO HEADER */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <MessageSquare size={14} /> Knowledge Exchange
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Community Feed
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Discover verified interview debriefs, algorithm explanations, campus projects, and peer study insights.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all text-xs"
            >
              <Plus size={18} />
              <span>Create Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER BAR */}
      <div className="space-y-3">
        
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search discussion topics, tags (#SystemDesign, #DP), or authors..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-102'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* 3. FEED LISTING */}
      {loading && (
        <div className="flex flex-col justify-center items-center h-64 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-3 text-indigo-500" />
          <span className="font-semibold text-xs">Loading community discussions...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-center text-sm font-medium">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((post) => (
              <ArticleCard key={post._id} post={post} />
            ))
          ) : (
            <div className="text-center py-20 glass-card rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-500 mb-4">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                No discussions found in {activeCategory}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6 max-w-sm mx-auto">
                {searchTerm
                  ? `No posts matched "${searchTerm}". Try a different search query.`
                  : 'Be the first scholar to publish a question, study guide, or interview walkthrough!'}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-indigo-700 transition"
              >
                + Publish New Discussion
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal for Creating New Articles */}
      <CreateArticleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onArticleCreated={fetchArticles}
      />

    </div>
  );
};

export default Homepage;