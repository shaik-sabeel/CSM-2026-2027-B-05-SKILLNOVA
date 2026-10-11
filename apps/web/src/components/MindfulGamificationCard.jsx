import React, { useState } from 'react';
import { Flame, ShieldCheck, HeartPulse, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function MindfulGamificationCard({ gamificationData, wbiBand = 'Green', onFreezeUsed }) {
  const [localFreezeActive, setLocalFreezeActive] = useState(false);
  const [localCredits, setLocalCredits] = useState(null);
  const [freezeLoading, setFreezeLoading] = useState(false);

  const streak = gamificationData?.streak ?? 1;
  const restDayCredits = localCredits !== null ? localCredits : (gamificationData?.restDayCredits ?? 2);
  const restDayActive = localFreezeActive || (gamificationData?.restDayActive ?? false);

  const handleUseStreakFreeze = async () => {
    if (restDayCredits <= 0 || restDayActive || freezeLoading) return;
    setFreezeLoading(true);
    try {
      const res = await api.post('/gamification/use-freeze');
      setLocalFreezeActive(true);
      setLocalCredits(res.data.restDayCredits ?? (restDayCredits - 1));
      if (onFreezeUsed) onFreezeUsed(res.data);
    } catch (err) {
      console.error('Streak freeze failed:', err);
      // Fallback optimistic UI
      setLocalFreezeActive(true);
      setLocalCredits(Math.max(0, restDayCredits - 1));
    } finally {
      setFreezeLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
          <h3 className="text-base font-bold text-white">Mindful Gamification & Streak Freeze (USP)</h3>
        </div>
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center space-x-1">
          <Award className="h-3.5 w-3.5" />
          <span>{streak <= 1 ? '🌱 New Learner' : 'Mindful Learner Badge'}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg">
            🔥 {streak}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Study Streak</span>
            <span className="text-xs font-bold text-white">{streak} {streak === 1 ? 'Day' : 'Days'} Active</span>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-lg">
            🧊 {restDayCredits}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Rest-Day Credits</span>
            <span className="text-xs font-bold text-white">{restDayCredits} {restDayCredits === 1 ? 'Freeze' : 'Freezes'} Left</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
        {restDayActive 
          ? "Rest-Day Credit Active! Taking rest today preserves your streak without guilt or study anxiety."
          : "Unlike standard platforms that punish missed days, CourseConnect rewards taking rest when stress rises."}
      </p>

      {!restDayActive ? (
        <button 
          onClick={handleUseStreakFreeze}
          disabled={restDayCredits === 0}
          className="w-full bg-slate-700 hover:bg-slate-600 text-sky-400 border border-sky-500/30 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Claim 'Streak Freeze' Rest Day (Preserves Streak)</span>
        </button>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold p-2.5 rounded-xl flex items-center justify-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Streak Protected for Rest & Recovery</span>
        </div>
      )}
    </div>
  );
}
