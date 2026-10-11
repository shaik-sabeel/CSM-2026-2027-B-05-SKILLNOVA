import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import api from '../services/api';

export default function BurnoutEarlyWarningCard({ burnoutData, checkinsCount = 0 }) {
  const [data, setData] = useState({
    burnout_score: 0.0,
    warning_level: "Optimal Baseline (No Burnout)",
    ewma_mood_trend: null,
    avg_sleep_hours: null,
    days_to_burnout_threshold: 30,
    is_declining_trend: false,
    recommended_interventions: ["Complete daily wellbeing check-ins to activate EWMA AI monitoring."]
  });

  useEffect(() => {
    if (burnoutData) {
      setData(burnoutData);
    }
  }, [burnoutData]);

  const getBadgeColor = (score) => {
    if (checkinsCount === 0) return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
    if (score >= 65) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (score >= 38) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  const isNewUser = checkinsCount === 0;

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Burnout Early-Warning Predictor</h3>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getBadgeColor(data.burnout_score)}`}>
          {isNewUser ? 'Baseline Pacing' : data.warning_level}
        </span>
      </div>

      <div className="flex items-baseline space-x-3">
        <span className="text-3xl font-extrabold text-white tracking-tight">
          {isNewUser ? '0.0%' : `${data.burnout_score}%`}
        </span>
        <span className="text-xs text-slate-400 font-medium">Burnout Risk Index (EWMA AI Algorithm)</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isNewUser ? 'bg-emerald-500' :
            data.burnout_score >= 65 ? 'bg-rose-500' : data.burnout_score >= 38 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${isNewUser ? 5 : data.burnout_score}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">EWMA Mood Trend</span>
          <span className="font-bold text-slate-100">
            {isNewUser ? 'Pending Check-in' : (data.ewma_mood_trend ? `${data.ewma_mood_trend} / 5.0` : '4.5 / 5.0')}
          </span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Sleep Recorded</span>
          <span className="font-bold text-slate-100">
            {isNewUser ? 'Tracked via Check-in' : (data.avg_sleep_hours ? `${data.avg_sleep_hours} hrs/night` : '7.5 hrs/night')}
          </span>
        </div>
      </div>

      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
        <span className="font-bold text-amber-400 flex items-center space-x-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isNewUser ? 'AI Monitoring Status:' : 'Preventive Intervention Recommendation:'}</span>
        </span>
        <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
          {data.recommended_interventions?.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
