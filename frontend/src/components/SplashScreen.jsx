import React, { useEffect, useState } from 'react';
import VidyaPathLogo from './VidyaPathLogo'; // ✅ Import  your new logo

const SplashScreen = ({ duration = 2500 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = 10;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50 overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* ✅ NEW LOGO HERE */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
          <div className="relative bg-white/5 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm">
            <VidyaPathLogo size={80} />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 font-sans">
          VidyaPath
        </h1>
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase mb-10">
          Your Journey to Knowledge
        </p>

        {/* Loading Bar */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-700">
          <div 
            className="h-full bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;