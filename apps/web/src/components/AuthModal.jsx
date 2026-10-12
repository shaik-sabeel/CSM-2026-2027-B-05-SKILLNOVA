import React, { useState } from 'react';
import { LogIn, UserPlus, Lock, Mail, User, ShieldCheck, X } from 'lucide-react';
import api from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('student@college.edu');
  const [password, setPassword] = useState('student123');
  const [role, setRole] = useState('student');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setIsRegister(initialMode === 'register');
    setError('');
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister 
        ? { name, email, password, role, targetRole }
        : { email, password };

      const res = await api.post(endpoint, payload);
      const { token, user } = res.data;

      localStorage.setItem('courseconnect_token', token);
      localStorage.setItem('courseconnect_user', JSON.stringify(user));

      onAuthSuccess(user, token);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (userRole) => {
    if (userRole === 'student') {
      setIsRegister(false);
      setEmail('student@college.edu');
      setPassword('student123');
    } else {
      setIsRegister(false);
      setEmail('counsellor@college.edu');
      setPassword('counsellor123');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 max-w-md w-full rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center space-y-1">
          <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20">
            {isRegister ? <UserPlus className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
          </div>
          <h3 className="text-xl font-bold text-white">
            {isRegister ? 'Create Account' : 'Welcome to CourseConnect'}
          </h3>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Sign up for personalized roadmaps and mental wellbeing screening' : 'Log in to access your dashboard'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Quick Demo Login Credentials Buttons */}
        {!isRegister && (
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-center">
              Quick Demo One-Click Login
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => fillQuickCredentials('student')}
                className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 text-xs font-semibold py-1.5 px-2 rounded-lg transition"
              >
                Demo Student
              </button>
              <button 
                type="button"
                onClick={() => fillQuickCredentials('counsellor')}
                className="bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-indigo-500/30 text-xs font-semibold py-1.5 px-2 rounded-lg transition"
              >
                Demo Counsellor
              </button>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="student">Student</option>
                  <option value="counsellor">Campus Counsellor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Skill/Role</label>
                <input 
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Register Account' : 'Log In')}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-slate-700/80">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs text-sky-400 hover:underline font-medium"
          >
            {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register"}
          </button>
        </div>

      </div>
    </div>
  );
}
