import React from 'react';
import { 
  Lock, UserPlus, LogIn, Shield, Brain, Video, 
  FileText, BookOpen, Flame, HeartPulse, Sparkles, CheckCircle2 
} from 'lucide-react';

export default function AuthGate({ onOpenAuth, featureName = "Platform Features" }) {
  const protectedFeatures = [
    { name: "30-Min AI Mock Interview", icon: Video, desc: "Live webcam & mic technical simulation based on your JD and Resume." },
    { name: "Production RAG AI Tutor", icon: Brain, desc: "Multi-resource vector search across CS, DSA, Systems, and DevOps." },
    { name: "Japanese Pomodoro Focus Dojo", icon: Flame, desc: "Kaizen deep study timer with AI head-turn tracking & distraction buzzer." },
    { name: "Dynamic Career Readiness Tracker", icon: Sparkles, desc: "XGBoost ML readiness scoring & SHAP feature attribution." },
    { name: "AI Resume & ATS Analyzer", icon: FileText, desc: "Keyword optimization and metric-driven bullet rewrite engine." },
    { name: "Mental Wellbeing Sanctuary", icon: HeartPulse, desc: "Clinical burnout predictor, daily mood journal & Mental Guru counselor." }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in fade-in zoom-in duration-300">
      
      {/* Central Gate Banner */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-sky-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-sky-500/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <span className="text-xs bg-sky-500/15 text-sky-400 border border-sky-500/30 px-3.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
            Student Authentication Required
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Unlock Full Access to CourseConnect
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            You are attempting to access <strong>{featureName}</strong>. To ensure personalized learning roadmaps, secure interview history, and real-time burnout telemetry, please register or log in with your student credentials.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuth('register')}
            className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2 text-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Free Student Account</span>
          </button>
          
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 font-bold px-6 py-3.5 rounded-2xl transition flex items-center justify-center space-x-2 text-sm"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In / Demo Student</span>
          </button>
        </div>

        <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Instant Free Access</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Shield className="h-3.5 w-3.5 text-sky-400" />
            <span>Zero Spam & Privacy Protected</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>1-Click Demo Available</span>
          </span>
        </div>

      </div>

      {/* Feature Showcase Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center">
          Features Unlocked Immediately Upon Registration:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {protectedFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4.5 space-y-2 backdrop-blur-sm hover:border-sky-500/40 transition group"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sky-400 group-hover:text-white group-hover:bg-sky-500 transition">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition">{feat.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
