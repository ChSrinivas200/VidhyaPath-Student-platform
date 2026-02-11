import React, { useState } from 'react';
import api from '../services/api'; 
import { Link, useNavigate } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';
import VidyaPathLogo from '../components/VidyaPathLogo'; // ✅  Import your new logo

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Left Side - Branding (Updated Colors & Logo) */}
      <div className="hidden lg:flex flex-col relative w-1/2 bg-slate-900 items-center justify-center text-white p-12 overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white/10 p-5 rounded-2xl mb-8 backdrop-blur-sm border border-white/10 shadow-2xl">
               <VidyaPathLogo size={80} />
            </div>
            
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Welcome Back</h1>
            <p className="text-xl text-indigo-200 max-w-md">
                Unlock insights from your documents with the power of VidyaPath.
            </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          
          <div className="text-center mb-8">
             <h2 className="text-3xl font-bold text-slate-800">Sign In</h2>
             <p className="text-slate-500 mt-2">Enter your credentials to access your account.</p>
          </div>
          
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center font-medium">{error}</div>}
          
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {isLoading ? <div className="spinner h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiLogIn className="text-xl" />}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;