import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, HeartPulse, Clock, Sparkles, Activity } from 'lucide-react';
import api from '../services/api';

export default function BurnoutEarlyWarningCard() {
  const [data, setData] = useState({
    burnout_score: 28.5,
    warning_level: "Optimal Energy & Pacing",
    ewma_mood_trend: 4.2,
    avg_sleep_hours: 7.5,
    days_to_burnout_threshold: 30,
    is_declining_trend: false,
    recommended_interventions: ["Keep up your healthy study-rest balance!"]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBurnoutPrediction();
  }, []);

  const fetchBurnoutPrediction = async () => {
    setLoading(true);
    try {
      const res = await api.post('/burnout/predict', {
        mood_history: [4, 4, 3, 2, 2],
        sleep_hours: [7.5, 7.0, 6.0, 5.0, 4.5],
        streak_breaks: 1
      });
      setData(res.data);
    } catch (err) {
      console.error('Burnout prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (score) => {
    if (score >= 65) return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (score >= 38) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Burnout Early-Warning Predictor</h3>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getBadgeColor(data.burnout_score)}`}>
          {data.warning_level}
        </span>
      </div>

      <div className="flex items-baseline space-x-3">
        <span className="text-3xl font-extrabold text-white tracking-tight">
          {data.burnout_score}%
        </span>
        <span className="text-xs text-slate-400 font-medium">Burnout Risk Index (EWMA Algorithm)</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            data.burnout_score >= 65 ? 'bg-red-500' : data.burnout_score >= 38 ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${data.burnout_score}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">EWMA Mood Trend</span>
          <span className="font-bold text-slate-100">{data.ewma_mood_trend} / 5.0</span>
        </div>
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Sleep</span>
          <span className="font-bold text-slate-100">{data.avg_sleep_hours} hrs/night</span>
        </div>
      </div>

      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
        <span className="font-bold text-amber-400 flex items-center space-x-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Preventive Intervention Recommendation:</span>
        </span>
        <ul className="list-disc list-inside text-[11px] text-slate-300">
          {data.recommended_interventions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
