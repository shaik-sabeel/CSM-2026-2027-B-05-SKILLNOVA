import React from 'react';
import { 
  BookOpen, Brain, FileText, Video, Award, HeartPulse, 
  Users, Sparkles, LogIn, LogOut, Home, Flame, Lock, UserPlus 
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

  // Standard platform items
  const authenticatedNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'roadmap', label: 'Skill Roadmaps', icon: BookOpen },
    { id: 'tutor', label: 'RAG AI Tutor', icon: Brain },
    { id: 'interview', label: '30-Min Interview', icon: Video },
    { id: 'focus', label: 'Focus Dojo', icon: Flame },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText },
    { id: 'quizzes', label: 'Adaptive Quizzes', icon: Award },
    { id: 'wellbeing', label: 'Mental Sanctuary', icon: HeartPulse },
    ...(isCounsellor ? [{ id: 'counsellor', label: 'Counsellor View', icon: Users }] : [])
  ];

  const getBandColor = (band) => {
    switch (band) {
      case 'Red': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Amber': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Unassessed': return 'bg-slate-700/60 text-slate-300 border-slate-600/60';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const handleNavClick = (itemId) => {
    if (!user && itemId !== 'landing') {
      onOpenAuth('register');
      return;
    }
    setActiveTab(itemId);
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
                Student Ecosystem AI
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1 items-center overflow-x-auto py-1 scrollbar-none">
            {/* Home is always accessible */}
            <button
              id="nav-btn-landing"
              onClick={() => setActiveTab('landing')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                activeTab === 'landing'
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </button>

            {/* If logged in: Show all feature tabs */}
            {user ? (
              authenticatedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                      isActive 
                        ? (item.id === 'wellbeing'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                            : (item.id === 'focus'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                                : 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'))
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })
            ) : (
              /* If unauthenticated guest: Show locked features teaser */
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-700/60">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-slate-300">Platform Features Locked:</span>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="text-sky-400 hover:text-sky-300 font-bold underline transition ml-1"
                >
                  Register to Unlock
                </button>
              </div>
            )}
          </nav>

          {/* User Auth Controls & Status Pill */}
          <div className="flex items-center space-x-3">
            
            {/* Show Wellbeing Band Indicator if logged in */}
            {user && (
              <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${getBandColor(wbiBand)}`}>
                <HeartPulse className="h-3.5 w-3.5 animate-pulse" />
                <span>WBI: {wbiBand === 'Unassessed' ? 'Unassessed' : `${wbiBand} Band`}</span>
              </div>
            )}

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
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => onOpenAuth('login')}
                  className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 border border-slate-700"
                >
                  <LogIn className="h-3.5 w-3.5 text-slate-400" />
                  <span>Log In</span>
                </button>
                <button 
                  onClick={() => onOpenAuth('register')}
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs px-3.5 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-md shadow-sky-500/20"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register Free</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
