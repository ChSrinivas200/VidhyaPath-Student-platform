import React, { useState } from 'react';
import api from '../services/api';
import { ThumbsUp, MessageSquare, Clock, Share2, Tag, Check } from 'lucide-react';

const CATEGORY_COLORS = {
  'Interview Experiences': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
  'DSA & LeetCode': 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
  'System Design': 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
  'Academic Notes': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
  'Career Advice': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
  'General Discussion': 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
};

const ArticleCard = ({ post }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(post.upvotes || 0);
  const [shared, setShared] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Helper to calculate "time ago"
  const timeAgo = (dateString) => {
    if (!dateString) return 'Recent';
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleUpvote = async (e) => {
    e.stopPropagation();
    const nextUpvoted = !upvoted;
    const delta = nextUpvoted ? 1 : -1;
    setUpvoted(nextUpvoted);
    setUpvotes(prev => Math.max(0, prev + delta));

    try {
      await api.post(`/articles/${post._id}/upvote`, { delta });
    } catch (err) {
      console.warn('Could not sync upvote:', err.message);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/home#${post._id}`);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const categoryStyle = CATEGORY_COLORS[post.category] || CATEGORY_COLORS['General Discussion'];

  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-6 hover-glow-card cursor-pointer group space-y-3.5 transition-all duration-300"
    >
      
      {/* Header: Author, Role, Time, Category Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
            {(post.author || 'L').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                {post.author || 'Learner'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                {post.authorRole || 'Learner'}
              </span>
            </div>
            <div className="flex items-center text-[11px] text-slate-400 mt-0.5">
              <Clock className="w-3 h-3 mr-1" />
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {post.category && (
          <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${categoryStyle}`}>
            {post.category}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {post.title}
      </h3>

      {/* Content Preview / Full */}
      <p className={`text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`}>
        {post.content}
      </p>

      {/* Tags (if available) */}
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Stats & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all btn-bounce-active ${
              upvoted
                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${upvoted ? 'fill-current animate-bounceSubtle' : ''}`} />
            <span>{upvotes} Upvotes</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{post.comments || 0} Comments</span>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 btn-bounce-active"
          title="Share Post Link"
        >
          {shared ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{shared ? 'Copied' : 'Share'}</span>
        </button>
      </div>

    </div>
  );
};

export default ArticleCard;