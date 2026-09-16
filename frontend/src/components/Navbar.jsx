import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiMoon, FiSun, FiMenu, FiCpu, FiUser, FiLogOut, FiAward, FiCheckSquare, FiStar } from 'react-icons/fi';
import api from '../services/api';
import ProfileModal from './ProfileModal';

const Navbar = ({ onToggleMobileSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Scholar');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user');
  const [userPhotoUrl, setUserPhotoUrl] = useState(localStorage.getItem('userPhotoUrl') || '');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const isTutor = userRole === 'tutor';

  const [ragStatus, setRagStatus] = useState({
    status: 'checking',
    latencyMs: 0,
    message: 'Connecting to Colab RAG...',
  });
  const [userDropdown, setUserDropdown] = useState(false);

  // Poll RAG Status
  useEffect(() => {
    let isMounted = true;
    const checkRagHealth = async () => {
      try {
        const res = await api.get('/rag/status');
        if (isMounted && res.data) {
          setRagStatus({
            status: res.data.status,
            latencyMs: res.data.latencyMs || 0,
            message: res.data.message || '',
          });
        }
      } catch (err) {
        if (isMounted) {
          setRagStatus({
            status: 'tunnel_offline',
            latencyMs: 0,
            message: 'Colab tunnel offline. Local fallback active.',
          });
        }
      }
    };

    checkRagHealth();
    const interval = setInterval(checkRagHealth, 35000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleProfileUpdated = (updated) => {
    if (updated.name) setUserName(updated.name);
    if (updated.role) setUserRole(updated.role);
  };

  // Human friendly page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (isTutor) return 'Educator Studio — Skill Assessments';
    if (path.includes('showcase') || path.includes('demo')) return '✨ Judge Showcase & Feature Tour';
    if (path.includes('flashcard')) return '3D AI Flashcards & Spaced Repetition';
    if (path.includes('mock-viva')) return 'Mock Viva & AI Oral Examiner';
    if (path.includes('concept-map')) return 'Interactive Concept Mind Map';
    if (path.includes('assessment')) return 'Skill Assessments & AI Diagnostics';
    if (path.includes('rag')) return 'AI Colab RAG Assistant';
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('home')) return 'Community Feed';
    if (path.includes('planner') || path.includes('study-planner')) return 'Study Planner';
    if (path.includes('summarizer')) return 'AI Summarizer';
    if (path.includes('quiz')) return 'AI Quiz Generator';
    if (path.includes('visualizer')) return 'Study Visualizer';
    if (path.includes('mentor')) return 'MentorPath';
    if (path.includes('pdf-tools')) return 'PDF Suite';
    if (path.includes('pdf') || path.includes('doc')) return 'Document Q&A Assistant';
    return 'VidyaPath';
  };

  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Mobile Menu + Current Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            <FiMenu size={22} />
          </button>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>
        </div>

        {/* Right Side: Judge Tour + RAG Status Pill + Role Badge + Theme Toggle + User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* ✨ Judge Showcase & Tour Button */}
          <button
            onClick={() => navigate('/showcase')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 hover:scale-105 transition-all"
            title="Launch Interactive Judge Showcase & Feature Tour"
          >
            <FiStar className="animate-spin-slow" size={13} />
            <span className="hidden sm:inline">Judge Tour</span>
            <span className="sm:hidden">Tour</span>
          </button>
          
          {/* Colab RAG Status Indicator */}
          <button
            onClick={() => navigate(isTutor ? '/assessments' : '/rag')}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 ${
              ragStatus.status === 'online'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 shadow-xs'
            }`}
            title={ragStatus.message || (isTutor ? 'Colab RAG Engine Status' : 'Click to open AI RAG Hub')}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  ragStatus.status === 'online' ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  ragStatus.status === 'online' ? 'bg-emerald-500' : 'bg-indigo-500'
                }`}
              />
            </span>
            <FiCpu className="text-current" />
            <span>
              {ragStatus.status === 'online'
                ? `Colab RAG: Active (${ragStatus.latencyMs}ms)`
                : 'Colab RAG: Fallback Ready'}
            </span>
          </button>

          {/* Role Badge Indicator */}
          <div
            onClick={() => navigate('/assessments')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider cursor-pointer transition-transform hover:scale-105 ${
              isTutor
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
            }`}
            title={isTutor ? 'Verified Tutor Authorization Active' : 'Learner Account'}
          >
            {isTutor ? <FiAward size={13} /> : <FiUser size={13} />}
            <span>{isTutor ? 'Tutor' : 'Scholar'}</span>
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all duration-200 hover:scale-105"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Color Theme"
          >
            {isDarkMode ? (
              <FiSun className="text-amber-400 animate-spin-slow" size={18} />
            ) : (
              <FiMoon className="text-indigo-600" size={18} />
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${isTutor ? 'bg-gradient-to-tr from-purple-600 to-pink-600' : 'bg-gradient-to-tr from-indigo-600 to-purple-600'} text-white font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden`}>
                {userPhotoUrl ? (
                  <img src={userPhotoUrl} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden md:inline font-semibold text-sm text-slate-700 dark:text-slate-200">
                {userName}
              </span>
            </button>

            {/* Dropdown Box */}
            {userDropdown && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn shadow-xl"
                onClick={() => setUserDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Account Type
                    </p>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isTutor ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                      {isTutor ? 'Tutor' : 'Learner'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
                    {userName}
                  </p>
                </div>

                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full px-4 py-2 text-left text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 font-bold"
                >
                  <FiUser size={16} /> Edit Profile & AI Builder
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 font-medium"
                >
                  <FiUser size={16} /> My Dashboard
                </button>

                <button
                  onClick={() => navigate('/assessments')}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 font-medium"
                >
                  <FiCheckSquare size={16} /> Skill Assessments
                </button>

                <button
                  onClick={() => navigate('/rag')}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 font-medium"
                >
                  <FiCpu size={16} /> AI RAG Assistant
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-medium"
                >
                  <FiLogOut size={16} /> Log Out
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* PROFILE & AI BUILDER MODAL */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileUpdated={(updated) => {
          if (updated.name) setUserName(updated.name);
          if (updated.role) setUserRole(updated.role);
          if (updated.customPhotoUrl !== undefined) setUserPhotoUrl(updated.customPhotoUrl);
        }}
      />
    </header>
  );
};

export default Navbar;
