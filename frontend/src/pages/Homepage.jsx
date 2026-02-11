import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import ArticleCard from '../components/ArticleCard';
import CreateArticleModal from '../components/CreateArticleModal';
import { Loader2, Plus, MessageSquare } from 'lucide-react';

const Homepage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to fetch articles from the backend
  const fetchArticles = async () => {
    try {
      // Use api.get (base URL is handled  automatically)
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

  // Fetch on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <MessageSquare size={24} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Discussion Feed</h1>
            </div>
            <p className="text-slate-500 font-medium">Read the latest interview experiences and tech articles from the community.</p>
          </div>
          
          {/* Create Post Button (Updated to Indigo) */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Post
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center h-64 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-indigo-500" />
            <span className="font-medium">Loading community posts...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center mb-6 font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* Feed List */}
        {!loading && !error && (
          <div className="space-y-6">
            {articles.length > 0 ? (
              articles.map((post) => (
                <ArticleCard key={post._id} post={post} />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-6">
                  <Plus className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No posts yet</h3>
                <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto">
                    The feed is quiet. Be the first to share your knowledge or ask a question!
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline text-lg"
                >
                  Start a discussion &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal for Creating New Articles */}
        <CreateArticleModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onArticleCreated={fetchArticles} // Refresh list after successful creation
        />

      </div>
    </div>
  );
};

export default Homepage;