import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiGrid, FiLayers, FiMic, FiStar } from 'react-icons/fi';

const MobileBottomNav = () => {
  const navItems = [
    { to: '/home', label: 'Feed', icon: FiHome },
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/flashcards', label: 'Flashcards', icon: FiLayers, badge: '3D' },
    { to: '/mock-viva', label: 'Mock Viva', icon: FiMic },
    { to: '/showcase', label: 'Showcase', icon: FiStar, highlight: true },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={20} className={item.highlight ? 'text-purple-600 dark:text-purple-400' : ''} />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[9px] font-black px-1 rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 font-medium">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 w-4 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
