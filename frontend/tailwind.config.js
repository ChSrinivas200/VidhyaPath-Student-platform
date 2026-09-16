/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ Enables toggle-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ Scans all React files for classes
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slideUp': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slideDown': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'popIn': 'popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'floatSlow': 'floatSlow 4s ease-in-out infinite',
        'glowPulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'gradientShift': 'gradientShift 6s ease infinite',
        'bounceSubtle': 'bounceSubtle 2s infinite',
        'spinSlow': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.5))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.2))' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}