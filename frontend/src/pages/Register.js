import React, { useState } from 'react';
import api from '../services/api'; 
import { Link, useNavigate } from 'react-router-dom';
import VidyaPathLogo from '../components/VidyaPathLogo';
import { FiUser, FiAward, FiLock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const Register = () => {
  const [role, setRole] = useState('user'); // 'user' | 'tutor'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tutorPasscode: '',
    specialization: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, tutorPasscode, specialization } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Pre-check for tutor passkey
    if (role === 'tutor' && (!tutorPasscode || tutorPasscode.trim() !== '123456')) {
      setError('Tutor Authorization Passcode must be: 123456');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        tutorPasscode: role === 'tutor' ? tutorPasscode.trim() : undefined,
        specialization: role === 'tutor' ? (specialization || 'Computer Science & Software Engineering') : undefined,
      };

      const res = await api.post('/auth/register', payload);
      
      // Auto-save session if token provided
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userName', res.data.user.name);
        localStorage.setItem('userRole', res.data.user.role || role);
      }

      setMessage(res.data.message || (role === 'tutor' ? 'Tutor registered and authorized successfully!' : 'Registration successful!'));
      setTimeout(() => {
        if (role === 'tutor') {
          navigate('/assessments');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.msg || 'Registration failed. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col relative w-1/2 bg-slate-900 items-center justify-center text-white p-12 overflow-hidden">
        
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />

        {/* Ambient glow */}
        <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="bg-white/10 p-5 rounded-3xl mb-8 backdrop-blur-md border border-white/10 shadow-2xl animate-float">
            <VidyaPathLogo size={80} />
          </div>
          
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Join VidyaPath</h1>
          <p className="text-lg text-indigo-200 leading-relaxed">
            The intelligent productivity and skill assessment ecosystem designed for ambitious scholars and educators.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-left w-full">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-indigo-400 font-bold text-sm flex items-center gap-1.5 mb-1">
                <FiUser /> Learners
              </div>
              <p className="text-xs text-slate-300">
                AI RAG Assistant, Study Planner, Document Summarizer, and Skill Gap Analysis.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-purple-400 font-bold text-sm flex items-center gap-1.5 mb-1">
                <FiAward /> Tutors
              </div>
              <p className="text-xs text-slate-300">
                Author & publish Skill Assessments, view analytics, and mentor learners.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full glass-card bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
          
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Create an Account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Select your academic role to personalize your journey.
            </p>
          </div>

          {/* Role Toggle Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setRole('user'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                role === 'user'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <FiUser size={16} />
              <span>Learner</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('tutor'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                role === 'tutor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <FiAward size={16} />
              <span>Tutor / Educator</span>
            </button>
          </div>

          {/* Alerts */}
          {message && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <FiCheckCircle size={16} />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <FiAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input 
                type="text" 
                name="name" 
                value={name} 
                onChange={onChange} 
                placeholder={role === 'tutor' ? 'Prof. Alex Rivera' : 'Arvind Kumar'} 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                value={email} 
                onChange={onChange} 
                placeholder={role === 'tutor' ? 'tutor@university.edu' : 'scholar@example.com'} 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input 
                type="password" 
                name="password" 
                value={password} 
                onChange={onChange} 
                placeholder="Minimum 6 characters" 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* TUTOR AUTHORIZATION PASSCODE FIELD (Required when role is tutor) */}
            {role === 'tutor' && (
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                    <FiLock size={14} /> Tutor Authorization Code
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                    Required: 123456
                  </span>
                </div>

                <input 
                  type="password" 
                  name="tutorPasscode" 
                  value={tutorPasscode} 
                  onChange={onChange} 
                  placeholder="Enter tutor passkey: 123456" 
                  required 
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-hidden transition-all font-mono tracking-widest"
                />

                <div>
                  <label className="block text-[11px] font-bold text-purple-700 dark:text-purple-300 mb-1">
                    Academic Specialization
                  </label>
                  <input 
                    type="text" 
                    name="specialization" 
                    value={specialization} 
                    onChange={onChange} 
                    placeholder="e.g. Data Structures & AI Systems" 
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-98 ${
                role === 'tutor'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
              } disabled:opacity-60 disabled:cursor-not-allowed mt-2`}
            >
              {isLoading ? (
                <div className="spinner h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                role === 'tutor' ? 'Authorize & Register as Tutor' : 'Create Learner Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Sign In
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;