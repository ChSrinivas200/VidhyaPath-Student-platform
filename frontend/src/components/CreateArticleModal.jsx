import React, { useState } from 'react';
import api from '../services/api'; // ✅ Use central API helper
import { X, Loader2 } from 'lucide-react';

const CreateArticleModal = ({ isOpen, onClose, onArticleCreated }) => {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
        return setError('Title and Content are required.');
    }

    setLoading(true);
    setError('');

    try {
      // Get the real username from loca storage
      const author = localStorage.getItem('userName') || 'Anonymous';
      
      // ✅ Use api.post (base URL is handled automatically)
      await api.post('/articles', {
        title: formData.title,
        content: formData.content,
        author: author
      });

      // Success!
      setFormData({ title: '', content: '' });
      onArticleCreated(); // Refresh the feed
      onClose(); // Close modal
    } catch (err) {
      console.error(err);
      setError('Failed to post article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Create New Discussion</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
            <input 
              type="text" 
              placeholder="e.g., My Interview Experience at Google"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-slate-400"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Content</label>
            <textarea 
              rows="6"
              placeholder="Share your experience, tips, or questions here..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none placeholder-slate-400"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            ></textarea>
          </div>

          <div className="flex justify-end pt-2 gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateArticleModal;