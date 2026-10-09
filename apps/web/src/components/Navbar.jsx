import React from 'react';
import { 
  BookOpen, Brain, FileText, Video, Award, HeartPulse, 
  Users, Sparkles, LogIn, LogOut, Home 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  wbiBand = 'Green', 
  user, 
  onOpenAuth, 
  onLogout 
}) {
  const isCounsellor = user?.role === 'counsellor' || user?.role === 'admin';

  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'roadmap', label: 'Skill Roadmaps', icon: BookOpen },
    { id: 'tutor', label: 'RAG AI Tutor', icon: Brain },
    { id: 'interview', label: 'Mock Interview', icon: Video },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText },
    { id: 'quizzes', label: 'Adaptive Quizzes', icon: Award },
    { id: 'wellbeing', label: 'Mental Wellbeing', icon: HeartPulse },
    ...(isCounsellor ? [{ id: 'counsellor', label: 'Counsellor View', icon: Users }] : [])
  ];

  const getBandColor = (band) => {
    switch (band) {
      case 'Red': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Amber': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <header className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-sky-500/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                CourseConnect
              </span>
              <span className="block text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
                EdTech + HealthTech AI
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Auth Controls & Status Pill */}
          <div className="flex items-center space-x-3">
            {/* Wellbeing Band Indicator Pill */}
            <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${getBandColor(wbiBand)}`}>
              <HeartPulse className="h-3.5 w-3.5 animate-pulse" />
              <span>WBI: {wbiBand} Band</span>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 pl-3">
                <div className="text-left">
                  <span className="text-xs font-bold text-white block leading-tight">{user.name}</span>
                  <span className="text-[10px] text-sky-400 capitalize font-medium">{user.role}</span>
                </div>
                <button 
                  onClick={onLogout}
                  title="Log Out"
                  className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="bg-sky-500 hover:bg-sky-400 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-md"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
