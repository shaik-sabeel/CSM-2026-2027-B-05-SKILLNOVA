import React, { useState, useEffect } from 'react';
import { 
  Award, HeartPulse, BookOpen, Brain, Video, FileText, 
  ArrowRight, Zap, LogIn, UserCheck, RefreshCw, CheckCircle2, Flame 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';

import BurnoutEarlyWarningCard from './BurnoutEarlyWarningCard';
import JobMarketPulseCard from './JobMarketPulseCard';
import MindfulGamificationCard from './MindfulGamificationCard';

export default function Dashboard({ setActiveTab, wbiBand, wbiScore, user, onOpenAuth }) {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    readiness: {
      readiness_score: 0.0,
      placement_tier: "Onboarding (New Student)",
      shap_feature_importance: {
        "Skill Mastery": 0.0,
        "Mock Interview": 0.0,
        "Resume Quality": 0.0,
        "Study Consistency": 0.0,
        "Project Capstone": 0.0
      },
      top_improvement_area: "Start Skill Roadmap"
    },
    burnout: {
      burnout_score: 0.0,
      warning_level: "Optimal Baseline (No Burnout)",
      ewma_mood_trend: null,
      avg_sleep_hours: null,
      days_to_burnout_threshold: 30,
      is_declining_trend: false,
      recommended_interventions: ["Complete daily wellbeing check-ins to activate your EWMA AI monitor."]
    },
    jobPulse: {
      target_role: user?.targetRole || "Software Engineer",
      market_alignment_score: 0,
      industry_relevance_index: 90,
      high_demand_skills: ["Python", "React", "FastAPI", "Docker", "RAG / LLMs", "SQL"],
      missing_high_demand_skills: ["Python", "React", "FastAPI", "Docker", "RAG / LLMs", "SQL"],
      avg_industry_salary: "$75,000 - $120,000",
      salary_boost_recommendations: [
        { skill: "RAG / LLM Agents", boost: "+28% Salary Boost" },
        { skill: "Docker & Kubernetes", boost: "+20% Salary Boost" },
        { skill: "System Design Architecture", boost: "+25% Salary Boost" }
      ]
    },
    gamification: {
      streak: user?.streak || 1,
      restDayCredits: user?.freezeCredits ?? 2,
      restDayActive: !!user?.restDayActive
    },
    roadmapProgress: {
      hasActiveRoadmap: false,
      skill: user?.targetRole || "Software Engineer",
      completedTopics: 0,
      totalTopics: 0,
      progressPct: 0
    },
    assessmentHistory: []
  });

  useEffect(() => {
    fetchDashboardSummary();
  }, [user]);

  const fetchDashboardSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/summary');
      if (res.data) {
        setDashboardData(prev => ({
          ...prev,
          readiness: res.data.readiness || prev.readiness,
          burnout: res.data.burnout || prev.burnout,
          jobPulse: res.data.jobPulse || prev.jobPulse,
          gamification: res.data.gamification || prev.gamification,
          roadmapProgress: res.data.roadmapProgress || prev.roadmapProgress,
          assessmentHistory: (res.data.checkins && res.data.checkins.length > 0)
            ? res.data.checkins.map((c, i) => ({
                date: c.date || `Check ${i + 1}`,
                wbi: c.wbi !== undefined ? c.wbi : 25
              }))
            : []
        }));
      }
    } catch (err) {
      console.error('Error loading dynamic dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const readiness = dashboardData.readiness;
  const progress = dashboardData.roadmapProgress;
  const hasCheckins = dashboardData.assessmentHistory.length > 0;

  return (
    <div className="space-y-6">
      
      {/* Welcome & Profile Summary Header */}
      <div className="bg-gradient-to-r from-slate-800 via-sky-950 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Brain className="h-64 w-64 text-sky-400" />
        </div>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 px-3 py-1 rounded-full text-xs font-semibold">
              <Zap className="h-3.5 w-3.5" />
              <span>EdTech + HealthTech AI Platform</span>
            </span>
            {user ? (
              <span className="inline-flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold capitalize">
                <UserCheck className="h-3.5 w-3.5" />
                <span>{user.role} Account ({user.name})</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                <span>Guest Preview Mode</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user ? user.name : 'Student'}!
            </h1>
            <button 
              onClick={fetchDashboardSummary} 
              className="text-slate-400 hover:text-white text-xs font-medium flex items-center space-x-1 bg-slate-800/80 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            Your career readiness pipeline is dynamically active for <strong className="text-sky-300">{user?.targetRole || 'Software Engineer'}</strong>. CourseConnect balances your technical upskilling with real-time mental health tracking so you land placements without burnout.
          </p>

          {!user && (
            <div className="pt-2">
              <button 
                onClick={onOpenAuth}
                className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-2 shadow-lg"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In or Create Account for One-Click Demo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Roadmap Progress Banner */}
      {progress.hasActiveRoadmap ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider block">Active Skill Roadmap</span>
              <h3 className="text-base font-bold text-white">{progress.skill}</h3>
              <span className="text-xs text-slate-400">{progress.completedTopics} of {progress.totalTopics} topics completed</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="w-36 bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-sky-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress.progressPct}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono font-bold text-white w-10">{progress.progressPct}%</span>
            <button 
              onClick={() => setActiveTab('roadmap')}
              className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-800 to-sky-950/40 border border-dashed border-sky-500/40 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">No Active Roadmap</span>
              <h3 className="text-base font-bold text-white">Start Your Learning Journey for {user?.targetRole || 'Software Engineer'}</h3>
              <span className="text-xs text-slate-400">Generate an AI-curated step-by-step roadmap with verified video & course resources</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('roadmap')}
            className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-lg whitespace-nowrap"
          >
            <Zap className="h-4 w-4" />
            <span>Generate AI Roadmap</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Primary Metrics Row: Placement Readiness & Wellbeing Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Placement Readiness Score Gauge & SHAP Explainability */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-sky-400" />
              <h2 className="text-lg font-bold text-slate-100">Placement Readiness</h2>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {readiness.placement_tier}
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {readiness.readiness_score}
            </span>
            <span className="text-slate-400 text-sm font-semibold">/ 100</span>
          </div>

          <div className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, readiness.readiness_score)}%` }}
            ></div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>SHAP Feature Attribution Breakdown</span>
              <span className="text-sky-400 font-normal">XGBoost ML Model</span>
            </div>
            <div className="space-y-2">
              {Object.entries(readiness.shap_feature_importance).map(([feature, val]) => (
                <div key={feature} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{feature}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-sky-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, val) * 8)}%` }}></div>
                    </div>
                    <span className="text-slate-200 font-mono w-8 text-right">+{val}</span>
                  </div>
                </div>
              ))}
            </div>
            {readiness.readiness_score === 0 && (
              <p className="text-[11px] text-slate-400 italic pt-1">
                New student baseline. Complete roadmap topics, take mock interviews, and upload a resume to calculate dynamic ML readiness attribution.
              </p>
            )}
          </div>
        </div>

        {/* Mental Health Trend Chart & Calm Sanctuary Gateway */}
        <div className="bg-gradient-to-br from-slate-800/90 via-[#072421]/60 to-slate-800/90 border border-teal-500/40 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartPulse className="h-5 w-5 text-teal-400 animate-pulse" />
                <h2 className="text-lg font-bold text-slate-100">Mental Wellbeing Sanctuary</h2>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                !hasCheckins ? 'bg-slate-700/50 text-slate-300 border-slate-600' :
                wbiBand === 'Red' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                wbiBand === 'Amber' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {!hasCheckins ? 'Unassessed Baseline · 0 Check-ins' : `${wbiBand} Safety Band · ${wbiScore || 24}% WBI`}
              </span>
            </div>

            {hasCheckins ? (
              <div className="h-40 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.assessmentHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} 
                    />
                    <Line type="monotone" dataKey="wbi" name="Stress Index" stroke="#14b8a6" strokeWidth={2.5} dot={{ r: 4, fill: '#14b8a6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 w-full my-2 flex flex-col items-center justify-center text-center p-4 bg-slate-900/60 rounded-xl border border-teal-500/20 space-y-2">
                <div className="h-9 w-9 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-white">No Clinical Check-ins Completed Yet</p>
                <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                  Complete the 6-question clinical assessment in the Calm Sanctuary to establish your personalized wellbeing baseline.
                </p>
              </div>
            )}

            <p className="text-xs text-slate-300 mt-2 bg-slate-900/80 p-3 rounded-xl border border-teal-500/20 leading-relaxed">
              {!hasCheckins
                ? "Welcome to CourseConnect! Your mental health indicators are currently unassessed. Click below to take your first 2-minute clinical assessment."
                : wbiBand === 'Amber' 
                ? "Moderate stress detected. Your weekly study load has been automatically reduced by 30% and a rest day scheduled."
                : wbiBand === 'Red'
                ? "High strain detected. Intensive roadmap tasks are paused. Reach out to student counselling support."
                : "Your wellbeing indicators are stable. Take the 6-question clinical assessment to keep track!"}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button 
              onClick={() => setActiveTab('wellbeing')}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>🌿 Open Calm Sanctuary (Assessment, Guru & Relief)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* USP Features Row: Burnout Predictor + Job Market Pulse + Mindful Gamification */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <span>Unique Selling Proposition (USP) AI Engines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BurnoutEarlyWarningCard 
            burnoutData={dashboardData.burnout} 
            checkinsCount={dashboardData.assessmentHistory.length} 
          />
          <JobMarketPulseCard 
            pulseData={dashboardData.jobPulse} 
            targetRole={user?.targetRole || "Software Engineer"} 
          />
          <MindfulGamificationCard 
            gamificationData={dashboardData.gamification}
            wbiBand={wbiBand} 
            onFreezeUsed={(data) => {
              setDashboardData(prev => ({
                ...prev,
                gamification: data
              }));
            }}
          />
        </div>
      </div>

      {/* Quick Launch Tools Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Student Career Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div 
            onClick={() => setActiveTab('roadmap')}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-4 cursor-pointer transition hover:border-sky-500/50 group space-y-2 shadow-md"
          >
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition">
              Step-by-Step Roadmap
            </h4>
            <p className="text-xs text-slate-400">
              Beginner-friendly learning paths with pre-resolved NPTEL, Coursera & YouTube links.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('tutor')}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-4 cursor-pointer transition hover:border-indigo-500/50 group space-y-2 shadow-md"
          >
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
              <Brain className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition">
              Production RAG AI Tutor
            </h4>
            <p className="text-xs text-slate-400">
              Vector search across verified CS, DSA, and System Design knowledge.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('interview')}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-4 cursor-pointer transition hover:border-emerald-500/50 group space-y-2 shadow-md"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Video className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
              30-Min AI Mock Interview
            </h4>
            <p className="text-xs text-slate-400">
              Live webcam/mic simulation tailored to your Resume and target JD.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('focus')}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-4 cursor-pointer transition hover:border-amber-500/50 group space-y-2 shadow-md"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Flame className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
              Focus Dojo (Kaizen)
            </h4>
            <p className="text-xs text-slate-400">
              Japanese Pomodoro with AI head-turn tracking & distraction buzzer alarm.
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('resume')}
            className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-4 cursor-pointer transition hover:border-purple-500/50 group space-y-2 shadow-md"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition">
              ATS Resume Analyzer
            </h4>
            <p className="text-xs text-slate-400">
              Scan resume against JD, extract missing skills & action verbs.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
