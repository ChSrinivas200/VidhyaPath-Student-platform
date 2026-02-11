import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-100">
      
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      {/* ✅ Added 'animate-fadeIn'  for smooth page transitions */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 animate-fadeIn">
        {children}
      </main>

    </div>
  );
};

export default Layout;