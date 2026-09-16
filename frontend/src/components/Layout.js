import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AuraChatbot from './AuraChatbot';
import MobileBottomNav from './MobileBottomNav';

const Layout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 relative">
      
      {/* Responsive Sidebar (Desktop sticky, Mobile drawer) */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Sticky Top Navbar */}
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 animate-fadeIn">
          {children}
        </main>

      </div>

      {/* 🔮 AURA Floating Global AI Assistant Widget */}
      <AuraChatbot />

      {/* Mobile Navigation Bar */}
      <MobileBottomNav />

    </div>
  );
};

export default Layout;