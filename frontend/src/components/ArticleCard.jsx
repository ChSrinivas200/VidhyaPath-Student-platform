import React from 'react';
import { ThumbsUp, MessageSquare, Clock, User } from 'lucide-react';

const ArticleCard = ({ post }) => {
  // Helper to calculate "time ago"
  const timeAgo = (dateString) => {
    if (!dateString) return '';
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 hover:shadow-md transition-shadow cursor-pointer">
      
      {/* Header: Author and Tim */}
      <div className="flex items-center text-xs text-slate-500 mb-2 space-x-2">
        <div className="flex items-center font-medium text-slate-700">
          <User className="w-3 h-3 mr-1" />
          {post.author || 'Anonymous'}
        </div>
        <span>•</span>
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {timeAgo(post.createdAt)}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
        {post.title}
      </h3>

      {/* Content Preview (Line Clamp 2) */}
      <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
        {post.content}
      </p>

      {/* Footer: Stats */}
      <div className="flex items-center space-x-6 text-slate-500 text-sm">
        <div className="flex items-center hover:text-blue-600 transition-colors">
          <ThumbsUp className="w-4 h-4 mr-1.5" />
          <span>{post.upvotes || 0}</span>
        </div>
        <div className="flex items-center hover:text-blue-600 transition-colors">
          <MessageSquare className="w-4 h-4 mr-1.5" />
          <span>{post.comments || 0} comments</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;