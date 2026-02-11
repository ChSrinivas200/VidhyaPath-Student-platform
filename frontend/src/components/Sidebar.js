import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

// Icons
import {
  FiGrid,
  FiFileText,
  FiLogOut,
  FiHelpCircle,
  FiFastForward,
  FiBook,
  FiHome,
  FiCalendar,
  FiUsers,
  FiShoppingBag,
} from 'react-icons/fi';
import { FaTools } from 'react-icons/fa';

// Logo
import VidyaPathLogo from './VidyaPathLogo';

const Sidebar = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const linkClasses =
    'flex items-center px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors duration-200';

  const activeLinkClasses =
    'bg-indigo-600 text-white shadow-md';

  return (
    <div className="hidden lg:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 h-screen sticky top-0">
      
      {/* Logo Section */}
      <div className="flex items-center px-6 h-24 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
            <VidyaPathLogo size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">VidyaPath</h1>
            <span className="text-[10px] text-indigo-300 uppercase tracking-wider">
              Student Suite
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">

        <NavLink
          to="/home"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiHome className="mr-3" size={20} />
          Home Feed
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiGrid className="mr-3" size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/study-planner"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiCalendar className="mr-3" size={20} />
          Study Planner
        </NavLink>

        {/* AI Tools */}
        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase">
          AI Tools
        </div>

        <NavLink
          to="/summarizer"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiFileText className="mr-3" size={20} />
          Summarizer
        </NavLink>

        <NavLink
          to="/quiz-generator"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiHelpCircle className="mr-3" size={20} />
          Quiz Generator
        </NavLink>

        <NavLink
          to="/visualizer"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiFastForward className="mr-3" size={20} />
          Visualizer
        </NavLink>

        {/* Mentorship */}
        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase">
          Mentorship
        </div>

        <NavLink
          to="/mentor-path"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiUsers className="mr-3" size={20} />
          MentorPath
        </NavLink>

        {/* Documents */}
        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase">
          Documents
        </div>

        <NavLink
          to="/pdf-viewer"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiBook className="mr-3" size={20} />
          PDF Viewer
        </NavLink>

        <NavLink
          to="/pdf-tools"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FaTools className="mr-3" size={20} />
          PDF Tools
        </NavLink>

        {/* StudentBasket */}
        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase">
          StudentMart
        </div>

        <NavLink
          to="/student-basket"
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <FiShoppingBag className="mr-3" size={20} />
          StudentBasket
        </NavLink>

      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold truncate">
              {userName}
            </div>
            <div className="text-xs text-slate-400">
              Student Account
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 rounded-lg transition-all"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;