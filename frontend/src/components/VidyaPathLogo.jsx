import React from 'react';

const VidyaPathLogo = ({ size = 48, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 1. The Sun / Light (Gold) */}
      <circle cx="50" cy="25" r="12" fill="#F59E0B" className="animate-pulse" />
      <path 
        d="M50 5L50 13M50 37L50 45M28 25L36 25M64 25L72 25M34.5 9.5L40 15M60 15L65.5 9.5M34.5 40.5L40 35M60 35L65.5 40.5" 
        stroke="#F59E0B" 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.6"
      />

      {/* 2. The Path (Winding Road -  Gold/Orange Gradient) */}
      <path 
        d="M50 55 C 50 55, 65 45, 50 25" 
        stroke="url(#pathGradient)" 
        strokeWidth="6" 
        strokeLinecap="round"
        fill="none"
      />
      
      {/* 3. The Book (Deep Blue base) */}
      <path 
        d="M20 60 C 20 60, 35 55, 50 65 C 65 55, 80 60, 80 60 V 80 C 80 80, 65 75, 50 85 C 35 75, 20 80, 20 80 Z" 
        fill="#1E3A8A" 
      />
      {/* Book Pages Detail */}
      <path 
        d="M25 65 C 25 65, 35 62, 45 68 M75 65 C 75 65, 65 62, 55 68" 
        stroke="#3B82F6" 
        strokeWidth="2" 
        opacity="0.3"
      />

      {/* Gradients */}
      <defs>
        <linearGradient id="pathGradient" x1="50" y1="55" x2="50" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E3A8A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default VidyaPathLogo;