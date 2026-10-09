import React from 'react';
import { 
  Brain, BookOpen, HeartPulse, Video, FileText, Award, 
  Sparkles, ShieldCheck, ArrowRight, CheckCircle2, TrendingUp, 
  Github, Flame, Lock, Users, Zap
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onOpenAuth }) {
  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10 px-4">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-sky-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-sky-400 backdrop-blur-md shadow-lg">
            <Zap className="h-4 w-4 animate-pulse text-sky-400" />
            <span>Next-Gen EdTech + HealthTech AI Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Master Career Skills Without <br />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Academic Burnout or Stress
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            CourseConnect combines <strong>Universal Skill Roadmaps</strong>, <strong>RAG AI Tutoring</strong>, and <strong>GitHub Codebase Mock Interviews</strong> with <strong>Clinical Mental Health Screening</strong> & <strong>Burnout Early-Warning Algorithms</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-xl shadow-sky-500/20 transition flex items-center space-x-2 group"
            >
              <span>Explore Student Dashboard</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={onOpenAuth}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm px-6 py-3.5 rounded-2xl transition flex items-center space-x-2"
            >
              <span>One-Click Demo Login</span>
            </button>
          </div>

          {/* Key Value Pill Highlights */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Zero Hallucinated Links (NPTEL, Coursera, YouTube)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>3-Layer Crisis Safety Ensemble</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Wellbeing-Aware Adaptive Roadmap</span>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Selling Propositions (USP Grid) */}
      <section className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Industry-Leading Unique Innovations
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Designed specifically to stand out for final-year college major projects, research papers, and patent applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-3 hover:border-purple-500/50 transition shadow-lg group">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <Github className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">GitHub Repo Interviewer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your public GitHub repository URL. The AI Agent inspects your file tree and README to ask questions specifically about <em>your codebase</em>.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-3 hover:border-amber-500/50 transition shadow-lg group">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Burnout Early Predictor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              EWMA algorithm analyzes mood trends, sleep hours, and streak variance to forecast burnout risk 7 to 14 days before crisis points.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-3 hover:border-emerald-500/50 transition shadow-lg group">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Clinical Screening</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Combines PHQ-9, GAD-7 clinical questionnaires with NLP sentiment on encrypted reflection journals & 3-layer crisis safety ensemble.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-3 hover:border-sky-500/50 transition shadow-lg group">
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Step-by-Step Roadmaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Beginner-to-advanced progression with pre-resolved active learning links for NPTEL, Coursera, Udemy, YouTube, and GitHub.
            </p>
          </div>

        </div>
      </section>

      {/* How CourseConnect Works */}
      <section className="max-w-5xl mx-auto px-4 bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">How CourseConnect Works</h2>
          <p className="text-xs text-slate-400">A closed-loop platform connecting upskilling with mental health sustainability</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-sky-500 text-white font-extrabold flex items-center justify-center mx-auto text-sm">1</div>
            <h4 className="text-sm font-bold text-white">Build Personalized Roadmap</h4>
            <p className="text-xs text-slate-400">Set target role, get beginner step-by-step topics with NPTEL & Coursera links.</p>
          </div>

          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-indigo-500 text-white font-extrabold flex items-center justify-center mx-auto text-sm">2</div>
            <h4 className="text-sm font-bold text-white">Upskill & Practice Interviews</h4>
            <p className="text-xs text-slate-400">Use RAG AI Tutor, voice mock interviews with filler word detection, & ATS resume scanner.</p>
          </div>

          <div className="text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-emerald-500 text-white font-extrabold flex items-center justify-center mx-auto text-sm">3</div>
            <h4 className="text-sm font-bold text-white">Automated Wellbeing Balance</h4>
            <p className="text-xs text-slate-400">System detects stress spikes and automatically scales back workload by 30% to prevent burnout.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="max-w-4xl mx-auto text-center px-4 space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to Explore CourseConnect?</h2>
        <p className="text-xs text-slate-400">Test all features directly on localhost with zero API key dependencies.</p>
        <button
          onClick={onGetStarted}
          className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-lg transition"
        >
          Launch Student Dashboard Now
        </button>
      </section>

    </div>
  );
}
