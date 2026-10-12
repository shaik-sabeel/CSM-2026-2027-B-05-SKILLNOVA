import React from 'react';
import { 
  Brain, BookOpen, HeartPulse, Video, FileText, Award, 
  Sparkles, ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, 
  Flame, Lock, Users, Zap, Shield, UserPlus, LogIn
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onOpenAuth, user }) {
  const handlePrimaryCTA = () => {
    if (user) {
      onGetStarted();
    } else {
      onOpenAuth('register');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10 px-4">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-sky-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-sky-400 backdrop-blur-md shadow-lg">
            <Zap className="h-4 w-4 animate-pulse text-sky-400" />
            <span>Unified Student Ecosystem • EdTech + HealthTech AI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Master Career Skills Without <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Academic Burnout or Stress
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            CourseConnect combines <strong>30-Minute AI Mock Interviews</strong>, <strong>Multi-Resource RAG AI Tutoring</strong>, and a <strong>Japanese Pomodoro Focus Dojo</strong> with <strong>Clinical Mental Health Telemetry</strong> & <strong>Burnout Early-Warning Algorithms</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePrimaryCTA}
              className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-sky-500/20 transition flex items-center space-x-2 group"
            >
              <UserPlus className="h-4 w-4" />
              <span>{user ? 'Open Student Dashboard' : 'Register Free to Unlock Platform'}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </button>

            {!user && (
              <button
                onClick={() => onOpenAuth('login')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm px-6 py-3.5 rounded-2xl transition flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4 text-slate-400" />
                <span>One-Click Demo Student Sign In</span>
              </button>
            )}
          </div>

          {/* Key Value Pill Highlights */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Realistic 30-Min Live Technical Interviews</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Grounded Multi-Resource RAG Tutor</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Japanese Pomodoro with Distraction Buzzer</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Clinical EWMA Burnout Predictor</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Architecture Pillars */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Complete Student Ecosystem</span>
          <h2 className="text-3xl font-extrabold text-white">Engineered For Top Campus Placements & Wellness</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Traditional learning apps cause severe cramming burnout. CourseConnect balances your technical upskilling with mental health telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: 30-Min AI Mock Interview */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-sky-500/50 transition shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Video className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">30-Min AI Mock Interview</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Feed your target Job Description and Resume. The AI cross-analyzes text to conduct a full 30-minute simulation with live camera, mic speech-to-text, and STAR rubric feedback.
              </p>
            </div>
            <button
              onClick={handlePrimaryCTA}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1 pt-2"
            >
              <span>{user ? 'Launch Interview Room' : 'Register to Access'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Pillar 2: RAG AI Tutor */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-indigo-500/50 transition shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Production RAG AI Tutor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vector retrieval across verified documentation (MDN, MIT OCW, Python, React specs). Explains complex architectures, generates executable code, and cites exact references.
              </p>
            </div>
            <button
              onClick={handlePrimaryCTA}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 pt-2"
            >
              <span>{user ? 'Ask RAG Tutor' : 'Register to Access'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Pillar 3: Japanese Pomodoro Focus Dojo */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-amber-500/50 transition shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Japanese Pomodoro Focus Dojo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                25-minute Kaizen deep study cycles in full-screen mode. AI monitors head posture and ambient voice; if you turn away or talk, a loud buzzer alarm sounds immediately.
              </p>
            </div>
            <button
              onClick={handlePrimaryCTA}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 pt-2"
            >
              <span>{user ? 'Enter Focus Dojo' : 'Register to Access'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Trust & Gating Call to Action */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-sky-900/60 via-indigo-900/50 to-purple-900/60 border border-sky-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-3">
            <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/40 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Protected Student Ecosystem
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Create Your Free Account & Land Placements Without Burnout
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Join thousands of students who prepare smarter with AI. Get instant access to all tools, interview simulations, and clinical wellness monitoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handlePrimaryCTA}
              className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-8 py-3.5 rounded-2xl shadow-xl transition flex items-center space-x-2 text-sm"
            >
              <UserPlus className="h-4 w-4" />
              <span>{user ? 'Go to Dashboard' : 'Create Free Account'}</span>
            </button>
            {!user && (
              <button
                onClick={() => onOpenAuth('login')}
                className="bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-bold px-6 py-3.5 rounded-2xl transition text-sm"
              >
                Sign In Existing User
              </button>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
