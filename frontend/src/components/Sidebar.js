import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// Icons
import {
  FiGrid,
  FiFileText,
  FiLogOut,
  FiBook,
  FiHome,
  FiCalendar,
  FiShoppingBag,
  FiCpu,
  FiX,
  FiCheckSquare,
  FiAward,
  FiCompass,
  FiHeadphones,
  FiMap,
  FiTrendingUp,
  FiLayers,
  FiMic,
  FiShare2,
  FiStar,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { FaTools } from 'react-icons/fa';

// Logo
import VidyaPathLogo from './VidyaPathLogo';

const SectionHeader = ({ title, count, isOpen, onToggle, pillLabel = "Tools" }) => (
  <div className="pt-4 px-2 pb-1.5 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {title}
      </span>
      {count !== undefined && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
          {count}
        </span>
      )}
    </div>

    <button
      type="button"
      onClick={onToggle}
      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 hover:bg-purple-200 dark:hover:bg-purple-900 transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
    >
      <span>{isOpen ? `Hide ${pillLabel}` : `Show ${pillLabel}`}</span>
      {isOpen ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
    </button>
  </div>
);

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'Learner';
  const userRole = localStorage.getItem('userRole') || 'user';
  const isTutor = userRole === 'tutor';

  // State for collapsible sidebar sections
  const [openSections, setOpenSections] = useState({
    overview: true,
    ai: true,
    productivity: true,
    docs: true,
    tutor: true
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const linkBaseClasses =
    'group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200';

  const defaultClasses =
    'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50/70 dark:hover:bg-slate-800/60';

  const activeClasses =
    'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-20 h-screen w-72 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/20 dark:from-indigo-500/20 dark:to-purple-500/30 border border-indigo-500/20">
              <VidyaPathLogo size={28} />
            </div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight ${isTutor ? 'bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400'} bg-clip-text text-transparent leading-none`}>
                VidyaPath
              </h1>
              <span className={`text-[10px] ${isTutor ? 'text-purple-600 dark:text-purple-400 font-extrabold' : 'text-slate-400 dark:text-slate-500 font-bold'} uppercase tracking-widest`}>
                {isTutor ? 'Educator Studio' : 'Learner Suite'}
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {isTutor ? (
            /* 👨‍🏫 TUTOR-ONLY EXCLUSIVE PORTAL */
            <div className="space-y-3">
              <SectionHeader
                title="Tutor Portal"
                isOpen={openSections.tutor}
                onToggle={() => toggleSection('tutor')}
                pillLabel="Tools"
              />

              {openSections.tutor && (
                <div className="space-y-1.5 animate-fadeIn">
                  <NavLink
                    to="/assessments"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20' : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiAward size={18} className="text-purple-500" />
                      <span className="font-bold">Skill Assessments Studio</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white shadow-xs">
                      Active
                    </span>
                  </NavLink>

                  <NavLink
                    to="/tutor-analytics"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20' : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiTrendingUp size={18} className="text-purple-500" />
                      <span className="font-bold">Learners Progress & Stats</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500 text-white shadow-xs">
                      Analytics
                    </span>
                  </NavLink>
                </div>
              )}

              <div className="mt-6 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                  <FiAward size={14} /> Tutor Authorization
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  You are authorized for the <strong>Tutor Portal</strong>: authoring tests, monitoring all registered learners' statistical progress, and tracking most-used platform modules.
                </p>
              </div>
            </div>
          ) : (
            /* 🎓 LEARNER SUITE NAVIGATION */
            <>
              {/* 🌟 JUDGE SHOWCASE & DEMO TOUR */}
              <NavLink
                to="/showcase"
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `${linkBaseClasses} ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 hover:border-purple-400'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <FiStar size={18} className="text-purple-500 dark:text-purple-300 animate-pulse" />
                  <span className="font-extrabold tracking-tight">Judge Showcase & Tour</span>
                </div>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-purple-600 text-white">
                  Demo
                </span>
              </NavLink>

              {/* 1. OVERVIEW SECTION */}
              <SectionHeader
                title="Overview & Hub"
                count={5}
                isOpen={openSections.overview}
                onToggle={() => toggleSection('overview')}
                pillLabel="Tools"
              />

              {openSections.overview && (
                <div className="space-y-1 animate-fadeIn">
                  <NavLink
                    to="/home"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiHome size={18} />
                      <span>Community Feed</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/dashboard"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiGrid size={18} />
                      <span>Dashboard</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/progress"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiTrendingUp size={18} className="text-emerald-500 dark:text-emerald-400" />
                      <span className="font-bold">Progress & Skill-Gaps</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Analytics
                    </span>
                  </NavLink>

                  <NavLink
                    to="/study-planner"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiCalendar size={18} />
                      <span>Study Planner</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/skill-paths"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiMap size={18} className="text-indigo-500 dark:text-indigo-400" />
                      <span className="font-bold">Skill Paths & Playlists</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs">
                      A-Z
                    </span>
                  </NavLink>
                </div>
              )}

              {/* 2. AI & SMART STUDY SECTION (Matches screenshot prompt!) */}
              <SectionHeader
                title="AI & Smart Study"
                count={8}
                isOpen={openSections.ai}
                onToggle={() => toggleSection('ai')}
                pillLabel="Tools"
              />

              {openSections.ai && (
                <div className="space-y-1 animate-fadeIn">
                  <NavLink
                    to="/rag"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiCpu size={18} className="text-indigo-500 dark:text-indigo-400" />
                      <span className="font-bold">AI RAG Assistant</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      Colab RAG
                    </span>
                  </NavLink>

                  <NavLink
                    to="/flashcards"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiLayers size={18} className="text-amber-500 dark:text-amber-400" />
                      <span className="font-bold">3D AI Flashcards</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      3D Flip
                    </span>
                  </NavLink>

                  <NavLink
                    to="/mock-viva"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiMic size={18} className="text-rose-500 dark:text-rose-400" />
                      <span className="font-bold">Mock Viva Examiner</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      Voice/AI
                    </span>
                  </NavLink>

                  <NavLink
                    to="/concept-map"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiShare2 size={18} className="text-cyan-500 dark:text-cyan-400" />
                      <span className="font-bold">Concept Mind Map</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                      Graph
                    </span>
                  </NavLink>

                  <NavLink
                    to="/assessments"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiAward size={18} className="text-purple-500 dark:text-purple-400" />
                      <span className="font-bold">Skill Assessments</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                      AI Gap
                    </span>
                  </NavLink>

                  <NavLink
                    to="/summarizer"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiFileText size={18} />
                      <span>Document Summarizer</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/quiz-generator"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiCheckSquare size={18} />
                      <span>Quiz Generator</span>
                    </div>
                  </NavLink>

                  <NavLink
                    to="/visualizer"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiCompass size={18} />
                      <span>Concept Visualizer</span>
                    </div>
                  </NavLink>
                </div>
              )}

              {/* 3. PRODUCTIVITY & COMMUNITY SECTION */}
              <SectionHeader
                title="Productivity & Focus"
                count={2}
                isOpen={openSections.productivity}
                onToggle={() => toggleSection('productivity')}
                pillLabel="Tools"
              />

              {openSections.productivity && (
                <div className="space-y-1 animate-fadeIn">
                  <NavLink
                    to="/focus"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiHeadphones size={18} className="text-emerald-500" />
                      <span>Focus Mode</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      Audio
                    </span>
                  </NavLink>

                  <NavLink
                    to="/learner-basket"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiShoppingBag size={18} />
                      <span>Learner Basket</span>
                    </div>
                  </NavLink>
                </div>
              )}

              {/* 4. DOCUMENT TOOLS SECTION */}
              <SectionHeader
                title="Document Suite"
                count={2}
                isOpen={openSections.docs}
                onToggle={() => toggleSection('docs')}
                pillLabel="Tools"
              />

              {openSections.docs && (
                <div className="space-y-1 animate-fadeIn">
                  <NavLink
                    to="/pdf-viewer"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FiBook size={18} className="text-indigo-500 dark:text-indigo-400" />
                      <span>Document Q&A</span>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      RAG
                    </span>
                  </NavLink>

                  <NavLink
                    to="/pdf-tools"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `${linkBaseClasses} ${isActive ? activeClasses : defaultClasses}`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <FaTools size={16} />
                      <span>PDF Suite</span>
                    </div>
                  </NavLink>
                </div>
              )}
            </>
          )}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className={`w-10 h-10 rounded-xl ${isTutor ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20' : 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/20'} flex items-center justify-center font-bold text-white shadow-md`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {userName}
              </div>
              <div className={`text-xs ${isTutor ? 'text-purple-600 dark:text-purple-400' : 'text-indigo-500 dark:text-indigo-400'} font-semibold`}>
                {isTutor ? 'Verified Educator' : 'Learner Edition'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
          >
            <FiLogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;