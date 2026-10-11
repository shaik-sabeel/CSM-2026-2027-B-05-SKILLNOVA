import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Award, ArrowUpRight, DollarSign } from 'lucide-react';
import api from '../services/api';

export default function JobMarketPulseCard({ pulseData, targetRole = "Software Engineer" }) {
  const [pulse, setPulse] = useState({
    target_role: targetRole,
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
  });

  useEffect(() => {
    if (pulseData) {
      setPulse(pulseData);
    } else {
      fetchJobPulse();
    }
  }, [pulseData, targetRole]);

  const fetchJobPulse = async () => {
    try {
      const res = await api.post('/jobpulse/analyze', {
        target_role: targetRole,
        user_skills: []
      });
      if (res.data) setPulse(res.data);
    } catch (err) {
      console.error('Job pulse error:', err);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-sky-400" />
          <h3 className="text-base font-bold text-white">Live Job Market Skill Pulse (USP)</h3>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
          {pulse.avg_industry_salary}
        </span>
      </div>

      <div className="flex items-baseline space-x-3">
        <span className="text-3xl font-extrabold text-white tracking-tight">
          {pulse.market_alignment_score}%
        </span>
        <span className="text-xs text-slate-400 font-medium">Industry Skill Alignment Index</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${pulse.market_alignment_score}%` }}
        ></div>
      </div>

      {/* Top Salary Boost Recommendations */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
          High-Impact Salary Boost Skill Recommendations:
        </span>
        <div className="space-y-2">
          {pulse.salary_boost_recommendations.map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">{item.skill}</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px] flex items-center space-x-1">
                <ArrowUpRight className="h-3 w-3" />
                <span>{item.boost}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
