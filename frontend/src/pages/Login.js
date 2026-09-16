import React, { useState } from 'react';
import api from '../services/api'; 
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiLogIn, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiUser, 
  FiAward, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiSun, 
  FiMoon, 
  FiArrowRight, 
  FiShield,
  FiZap
} from 'react-icons/fi';
import VidyaPathLogo from '../components/VidyaPathLogo';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ 
    email: localStorage.getItem('rememberedEmail') || '', 
    password: '' 
  });
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' | 'tutor'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(localStorage.getItem('rememberedEmail')));
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Quick Demo Account Auto-Fill
  const handleQuickDemo = (role) => {
    setSelectedRole(role);
    if (role === 'user') {
      setFormData({ email: 'scholar@example.com', password: 'password123' });
    } else {
      setFormData({ email: 'tutor@university.edu', password: 'password123' });
    }
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      localStorage.setItem('userRole', res.data.user.role || 'user');

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const userRole = res.data.user.role || 'user';
      setSuccessMessage('Authentication successful! Directing to workspace...');
      setTimeout(() => {
        if (userRole === 'tutor') {
          navigate('/assessments');
        } else {
          navigate('/dashboard');
        }
      }, 700);

    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.msg || 
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200 relative overflow-hidden">
      
      {/* --- Floating Theme Switcher in Corner --- */}
      <button
        id="theme-toggle-btn"
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute top-5 right-5 z-50 p-2.5 rounded-full glass-card bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 shadow-md hover:scale-105 transition-all duration-200 focus:outline-hidden cursor-pointer"
      >
        {isDarkMode ? <FiSun size={18} className="text-amber-400" /> : <FiMoon size={18} className="text-indigo-600" />}
      </button>

      {/* --- Left Side: Hero / Brand Panel --- */}
      <div className="hidden lg:flex flex-col relative w-1/2 bg-slate-900 items-center justify-center text-white p-12 overflow-hidden select-none">
        
        {/* Subtle Radial Dot Pattern */}
        <div 
          className="absolute inset-0 opacity-15" 
          style={{ backgroundImage: 'radial-gradient(#6366f1 1.2px, transparent 1.2px)', backgroundSize: '28px 28px' }}
        />

        {/* Ambient Glowing Orbs */}
        <div className="absolute -top-16 -left-16 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Content Container */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          
          {/* Glowing Animated Logo Frame */}
          <div className="bg-white/10 p-5 rounded-3xl mb-7 backdrop-blur-md border border-white/15 shadow-2xl animate-float glow-indigo">
            <VidyaPathLogo size={80} />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-sm">
            <FiZap size={14} className="text-amber-400" />
            <span>Unified AI Learning & Skill Assessment Ecosystem</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight text-white">
            Welcome Back
          </h1>
          
          <p className="text-base lg:text-lg text-indigo-200/90 leading-relaxed mb-8 max-w-md font-normal">
            Resume your personalized study trajectory, access your Colab RAG assistant, and track verified competencies.
          </p>

          {/* Feature Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left w-full">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-indigo-500/40 transition-colors">
              <div className="text-indigo-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <FiUser size={15} /> For Scholars
              </div>
              <p className="text-xs text-slate-300 leading-normal">
                Smart Study Planner, PDF Visualizer, RAG Assistant & automated quizzes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs hover:border-purple-500/40 transition-colors">
              <div className="text-purple-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <FiAward size={15} /> For Educators
              </div>
              <p className="text-xs text-slate-300 leading-normal">
                Assessment authoring, cohort analytics, and AI skill gap engine.
              </p>
            </div>
          </div>

          {/* Trust Footer */}
          <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
            <FiShield className="text-emerald-400" />
            <span>End-to-end encrypted session & AI integrity</span>
          </div>
        </div>
      </div>

      {/* --- Right Side: Modern Glassmorphic Form --- */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        
        {/* Subtle Background Glow for Right Side */}
        <div className="absolute w-72 h-72 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -top-10 right-10" />

        <div className="max-w-md w-full glass-card bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 animate-fadeIn">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex lg:hidden bg-slate-900/10 dark:bg-white/10 p-3 rounded-2xl mb-3">
              <VidyaPathLogo size={42} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Sign In to VidyaPath
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5">
              Enter your credentials or choose a quick demo account
            </p>
          </div>

          {/* Role Filter Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => { setSelectedRole('user'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                selectedRole === 'user'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FiUser size={14} />
              <span>Learner</span>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('tutor'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                selectedRole === 'tutor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FiAward size={14} />
              <span>Tutor / Educator</span>
            </button>
          </div>

          {/* Quick Demo Fill Badges */}
          <div className="mb-5 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FiZap className="text-amber-500" size={13} /> Quick Fill:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('user')}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-semibold text-[11px] transition-colors border border-indigo-200 dark:border-indigo-800"
              >
                🎓 Learner
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('tutor')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-semibold text-[11px] transition-colors border border-purple-200 dark:border-purple-800"
              >
                👨‍🏫 Tutor
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <FiAlertCircle className="shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <FiCheckCircle className="shrink-0" size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <FiMail size={16} />
                </span>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder={selectedRole === 'tutor' ? 'tutor@university.edu' : 'scholar@example.com'}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(!forgotMsg)}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <FiLock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Forgot Password Helper Toast */}
              {forgotMsg && (
                <div className="mt-2 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300 animate-fadeIn">
                  💡 Hint: To reset credentials, contact your academy administrator or register a new account on the registration page.
                </div>
              )}
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Remember my email</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-98 ${
                selectedRole === 'tutor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
              } disabled:opacity-60 disabled:cursor-not-allowed hover-lift mt-2`}
            >
              {isLoading ? (
                <>
                  <div className="spinner h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  <span>{selectedRole === 'tutor' ? 'Sign In as Tutor' : 'Sign In as Learner'}</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Create Account</span>
              <FiArrowRight size={14} />
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;