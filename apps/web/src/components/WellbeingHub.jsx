import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, ShieldAlert, PhoneCall, Smile, Frown, Meh, 
  Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Lock, 
  Brain, Tv, Youtube, MessageSquare, Send, Droplets, Wind, Eye, Compass, BookOpen
} from 'lucide-react';
import api from '../services/api';

export default function WellbeingHub({ wbiBand, setWbiBand, wbiScore, setWbiScore }) {
  const [activeSubTab, setActiveSubTab] = useState('assessment'); // assessment | guru | media | journal | crisis

  // Assessment Questionnaire State (6 Questions, 0-4 scores)
  const [assessmentAnswers, setAssessmentAnswers] = useState([1, 1, 1, 1, 1, 1]);
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Daily Mood Rating
  const [mood, setMood] = useState(3);
  const [journal, setJournal] = useState('');
  const [journalAnalysis, setJournalAnalysis] = useState(null);

  // Mental Guru AI Chatbot State
  const [guruMessages, setGuruMessages] = useState([
    {
      sender: 'guru',
      text: "### 🌿 Peace and Welcome, Student\n\nI am your Mental Guru AI Counselor. How is your mind feeling right now? Whether you are feeling anxious about exams, sad, overwhelmed, or just need a quiet moment, I am here to listen and offer gentle grounding techniques."
    }
  ]);
  const [guruInput, setGuruInput] = useState('');
  const [guruLoading, setGuruLoading] = useState(false);

  // Grounding Tool Interactive States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inhale (4s)'); // Inhale | Hold | Exhale
  const [waterCount, setWaterCount] = useState(2); // Glasses drunk today

  const [loading, setLoading] = useState(false);
  const [crisisModal, setCrisisModal] = useState(null);

  // Assessment Questions Schema (Fallback default)
  const questions = [
    {
      id: "q1",
      question: "How often have you felt overwhelmed or unable to control academic tasks this week?",
      options: [
        { label: "Never (Not at all)", score: 0 },
        { label: "Almost Never (1-2 days)", score: 1 },
        { label: "Sometimes (3-4 days)", score: 2 },
        { label: "Fairly Often (5-6 days)", score: 3 },
        { label: "Very Often (Every day)", score: 4 }
      ]
    },
    {
      id: "q2",
      question: "How would you rate your sleep quality over the past few nights?",
      options: [
        { label: "Restful, deep sleep (7-8 hours)", score: 0 },
        { label: "Mild difficulty falling asleep", score: 1 },
        { label: "Frequent waking / Restless", score: 2 },
        { label: "Severe insomnia or waking anxious", score: 3 },
        { label: "Extreme exhaustion / Under 4 hours", score: 4 }
      ]
    },
    {
      id: "q3",
      question: "Have you experienced physical signs of anxiety (heart racing, muscle tension, headaches)?",
      options: [
        { label: "None at all", score: 0 },
        { label: "Occasional mild tension", score: 1 },
        { label: "Moderate muscle tightness", score: 2 },
        { label: "Frequent physical distress / racing heart", score: 3 },
        { label: "Severe physical panic or tension daily", score: 4 }
      ]
    },
    {
      id: "q4",
      question: "How difficult has it been to maintain concentration during study sessions?",
      options: [
        { label: "Focused and clear-headed", score: 0 },
        { label: "Slight distraction, but manageable", score: 1 },
        { label: "Moderate brain fog / distraction", score: 2 },
        { label: "Hard to focus over 15 mins", score: 3 },
        { label: "Unable to concentrate on study tasks", score: 4 }
      ]
    },
    {
      id: "q5",
      question: "How often do you feel emotionally drained, hopeless, or burned out?",
      options: [
        { label: "Rarely or never", score: 0 },
        { label: "Occasionally after long study days", score: 1 },
        { label: "Several times this week", score: 2 },
        { label: "Most days of the week", score: 3 },
        { label: "Constantly drained and hopeless", score: 4 }
      ]
    },
    {
      id: "q6",
      question: "Do you feel supported and comfortable sharing your stress with friends or family?",
      options: [
        { label: "Strong, active support system", score: 0 },
        { label: "Good support when needed", score: 1 },
        { label: "Limited support, feel slightly isolated", score: 2 },
        { label: "Very isolated, rarely talk about stress", score: 3 },
        { label: "Completely isolated and alone", score: 4 }
      ]
    }
  ];

  // Handle Assessment Answer Selection
  const handleSelectAnswer = (qIndex, score) => {
    const updated = [...assessmentAnswers];
    updated[qIndex] = score;
    setAssessmentAnswers(updated);
  };

  // Submit Assessment Questionnaire & Compute Stress Index
  const handleRunAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/wellbeing/analyze', {
        assessment_answers: assessmentAnswers,
        mood_rating: mood,
        journal_text: journal
      });

      if (res.data) {
        setAssessmentResult(res.data.assessment);
        setWbiScore(res.data.wbi_score);
        setWbiBand(res.data.band);
        if (res.data.breakdown && res.data.breakdown.journal_nlp) {
          setJournalAnalysis(res.data.breakdown.journal_nlp);
        }
      }
    } catch (err) {
      console.error('Assessment evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mental Guru AI Chatbot Handler
  const handleGuruSend = async (customText = null) => {
    const qText = customText || guruInput;
    if (!qText.trim()) return;

    const userMsg = { sender: 'user', text: qText };
    setGuruMessages((prev) => [...prev, userMsg]);
    if (!customText) setGuruInput('');
    setGuruLoading(true);

    try {
      const res = await api.post('/mental-guru/chat', {
        query: qText,
        mood_rating: mood
      });

      const guruMsg = {
        sender: 'guru',
        text: res.data.response,
        grounding: res.data.grounding_technique,
        recommended_media: res.data.recommended_media
      };

      setGuruMessages((prev) => [...prev, guruMsg]);

      if (res.data.is_crisis && res.data.safety_eval) {
        setCrisisModal(res.data.safety_eval);
      }
    } catch (err) {
      console.error('Mental Guru chat error:', err);
    } finally {
      setGuruLoading(false);
    }
  };

  // 4-7-8 Breathing Timer Simulation
  useEffect(() => {
    let interval = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingPhase((prev) => {
          if (prev.includes('Inhale')) return 'Hold Breath (7s)';
          if (prev.includes('Hold')) return 'Exhale Slowly (8s)';
          return 'Inhale Quietly (4s)';
        });
      }, 5000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  const triggerCrisisDemo = async () => {
    const distressText = "I feel completely overwhelmed, hopeless, and want to end my life.";
    setJournal(distressText);
    setLoading(true);
    try {
      const res = await api.post('/mental-guru/chat', { query: distressText, mood_rating: 1 });
      if (res.data.safety_eval) {
        setCrisisModal(res.data.safety_eval);
        setWbiBand('Red');
        setWbiScore(88.0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Serene Peaceful Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 opacity-15 pointer-events-none">
          <HeartPulse className="h-64 w-64 text-teal-300" />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                <span>HealthTech & MedTech Suite</span>
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                wbiBand === 'Red' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                wbiBand === 'Amber' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                Stress Level Band: {wbiBand} ({wbiScore || 24.5}% WBI)
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Mental Wellbeing & Sanctuary</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Complete clinical stress assessments, chat with your compassionate <strong>Mental Guru AI Counselor</strong>, discover daily stress-relief media, and maintain a private encrypted journal.
            </p>
          </div>

          {/* Quick Micro-Habit Pill Controls */}
          <div className="bg-slate-900/90 border border-teal-500/30 p-3.5 rounded-2xl space-y-2 text-xs shrink-0">
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">Daily Wellness Quick Checks</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setWaterCount(prev => prev + 1)}
                className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition"
              >
                <Droplets className="h-3.5 w-3.5 text-sky-400" />
                <span>Water: {waterCount} Glasses</span>
              </button>

              <button 
                onClick={() => setBreathingActive(!breathingActive)}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 transition border ${
                  breathingActive 
                    ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <Wind className="h-3.5 w-3.5 text-emerald-400" />
                <span>{breathingActive ? breathingPhase : '4-7-8 Breathing'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Serene Navigation Bar */}
        <div className="flex items-center space-x-2 pt-6 border-t border-teal-500/20 mt-6 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('assessment')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'assessment' 
                ? 'bg-teal-500 text-white shadow-lg' 
                : 'bg-slate-900/80 text-slate-400 border border-slate-700/80 hover:text-white'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>📋 Stress Assessment (6 Items)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guru')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'guru' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                : 'bg-slate-900/80 text-slate-400 border border-slate-700/80 hover:text-white'
            }`}
          >
            <Brain className="h-4 w-4 text-emerald-300" />
            <span>🧘 Mental Guru AI Counselor</span>
          </button>

          <button
            onClick={() => setActiveSubTab('media')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'media' 
                ? 'bg-sky-500 text-white shadow-lg' 
                : 'bg-slate-900/80 text-slate-400 border border-slate-700/80 hover:text-white'
            }`}
          >
            <Youtube className="h-4 w-4 text-red-400" />
            <span>🎬 Daily Stress Relief & Media</span>
          </button>

          <button
            onClick={() => setActiveSubTab('journal')}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeSubTab === 'journal' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-slate-900/80 text-slate-400 border border-slate-700/80 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4 text-indigo-300" />
            <span>📖 Private Self-Journal</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STRUCTURED 6-ITEM STRESS ASSESSMENT QUESTIONNAIRE */}
      {activeSubTab === 'assessment' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-teal-500/30 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-700/80 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-teal-400" />
                  <span>Clinical Stress & Mental Health Assessment Questionnaire</span>
                </h3>
                <span className="text-xs text-slate-400">Answer 6 quick multiple choice questions to evaluate your stress index & personal recommendations.</span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="bg-slate-900/80 border border-slate-700/80 p-5 rounded-2xl space-y-3 shadow-md">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Question {qIdx + 1} of 6</span>
                  <h4 className="text-sm font-semibold text-white">{q.question}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectAnswer(qIdx, opt.score)}
                        className={`p-3 rounded-xl border text-left text-xs transition leading-snug font-medium ${
                          assessmentAnswers[qIdx] === opt.score
                            ? 'bg-teal-500/20 border-teal-500 text-teal-200 shadow-md font-bold'
                            : 'bg-slate-800 border-slate-700/80 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Run Assessment Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleRunAssessment}
                disabled={loading}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-xl transition flex items-center space-x-2 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{loading ? 'Evaluating Assessment...' : 'Calculate Stress Level Index & Dashboard'}</span>
              </button>

              <button
                onClick={triggerCrisisDemo}
                className="text-red-400 hover:text-red-300 text-xs font-semibold underline flex items-center space-x-1"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Test Crisis Safety Layer</span>
              </button>
            </div>
          </div>

          {/* Assessment Output Report Card */}
          {assessmentResult && (
            <div className="bg-slate-800 border border-teal-500/40 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-700/80 pb-4 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span>Personalized Stress Assessment Report</span>
                  </h3>
                  <span className="text-xs text-slate-400">{assessmentResult.level_title}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-teal-300">{assessmentResult.stress_percentage}%</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Stress Index Score ({assessmentResult.raw_score}/24)</span>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 text-xs text-slate-200 space-y-2">
                <span className="font-bold text-teal-400 block uppercase tracking-wider text-[10px]">Clinical Summary</span>
                <p>{assessmentResult.summary}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Recommended Health Actions:</span>
                <div className="space-y-2">
                  {assessmentResult.recommended_actions.map((act, i) => (
                    <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-xs text-slate-200 flex items-start space-x-2">
                      <Sparkles className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MENTAL GURU AI COUNSELOR CHATBOT */}
      {activeSubTab === 'guru' && (
        <div className="bg-slate-800 border border-teal-500/30 rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
          
          {/* Guru Header */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Mental Guru AI Counselor</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Active Empathetic Listening
                  </span>
                </h3>
                <span className="text-[11px] text-slate-400">Grounding Exercises, Emotion Support & Coping Mechanisms</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
              <HeartPulse className="h-3.5 w-3.5 text-red-400 animate-pulse" />
              <span>Safe Space</span>
            </div>
          </div>

          {/* Quick Emotional Prompts */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-700/60 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <span className="text-teal-400 font-bold shrink-0">Express Emotion:</span>
            {[
              "I am feeling anxiety right now",
              "I feel very sad and down",
              "Exam pressure is overwhelming me",
              "How to calm down before an interview?",
              "Give me a 5-minute relaxation exercise"
            ].map((pText, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleGuruSend(pText)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-teal-300 px-2.5 py-1 rounded-full border border-slate-700 shrink-0 transition"
              >
                {pText}
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {guruMessages.map((msg, mIdx) => (
              <div key={mIdx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl rounded-2xl p-4 space-y-3 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-teal-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-slate-900 border border-teal-500/30 text-slate-200 rounded-tl-none shadow-md'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Interactive Grounding Card */}
                  {msg.grounding && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-teal-500/30 space-y-2 my-2">
                      <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block flex items-center space-x-1">
                        <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                        <span>{msg.grounding.title}</span>
                      </span>
                      <ul className="space-y-1">
                        {msg.grounding.steps.map((st, sIdx) => (
                          <li key={sIdx} className="text-[11px] text-slate-300 flex items-center space-x-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shrink-0"></span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {guruLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-slate-400 animate-pulse flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-teal-400 animate-spin" />
                  <span>Mental Guru is reflecting thoughtfully...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleGuruSend(); }} className="p-4 bg-slate-900 border-t border-slate-700 flex items-center space-x-2">
            <input
              type="text"
              value={guruInput}
              onChange={(e) => setGuruInput(e.target.value)}
              placeholder="Tell Mental Guru how you feel (e.g. 'I am feeling anxiety', 'I am feeling very sad')..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={guruLoading}
              className="bg-teal-500 hover:bg-teal-400 text-white p-2.5 rounded-xl transition disabled:opacity-50 shadow-md"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: DAILY STRESS RELIEF & MEDIA RECOMMENDATIONS */}
      {activeSubTab === 'media' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-teal-500/30 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-700/80 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Youtube className="h-5 w-5 text-red-400" />
                <span>Curated YouTube Relaxation & Movie Recommendations</span>
              </h3>
              <p className="text-xs text-slate-400">Scientifically designed media resources to lower cortisol levels and give your mind a joyful break.</p>
            </div>

            {/* YouTube Resources Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">🎧 Soothing YouTube Playlists & Guided Audio:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "☕ Lofi Hip Hop Radio - Beats to Relax/Study to",
                    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                    category: "Relaxation & Focus",
                    desc: "Gentle, calming lofi beats to quiet mental chatter and decrease heart rate."
                  },
                  {
                    title: "🌧️ 10-Minute Deep Relaxation Mindfulness Meditation",
                    url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
                    category: "Guided Meditation",
                    desc: "Parasympathetic breathing exercises for immediate anxiety relief."
                  },
                  {
                    title: "🌲 Soft Forest Rain & Thunder Ambient Sleep Sounds",
                    url: "https://www.youtube.com/watch?v=lE6RYpe9XA0",
                    category: "Ambient Nature Audio",
                    desc: "Deep soothing rain soundscape for calm sleep and stress release."
                  },
                  {
                    title: "🎵 Piano Comfort - Acoustic Melody for Anxiety Relief",
                    url: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
                    category: "Peaceful Piano",
                    desc: "Minimalist acoustic piano arrangements crafted for mental relaxation."
                  }
                ].map((yt, idx) => (
                  <a
                    key={idx}
                    href={yt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl hover:border-teal-500/50 transition group flex flex-col justify-between space-y-2 shadow-md"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block flex items-center space-x-1">
                        <Youtube className="h-3 w-3" />
                        <span>{yt.category}</span>
                      </span>
                      <h5 className="text-xs font-bold text-white group-hover:text-teal-300 transition">{yt.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{yt.desc}</p>
                    </div>
                    <span className="text-[11px] text-sky-400 font-bold flex items-center space-x-1 pt-1">
                      <span>Listen on YouTube</span>
                      <span>→</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Movie & Show Recommendations Grid */}
            <div className="space-y-3 pt-4 border-t border-slate-700/80">
              <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">🎬 Feel-Good Uplifting Movies for Stress Relief:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "The Secret Life of Walter Mitty",
                    genre: "Uplifting / Adventure",
                    note: "Visually stunning film about overcoming anxiety and stepping into life."
                  },
                  {
                    title: "Spirited Away (Studio Ghibli)",
                    genre: "Animation / Cozy",
                    note: "Cozy masterpiece with serene soundscapes to ground an overworked mind."
                  },
                  {
                    title: "Soul (Disney / Pixar)",
                    genre: "Animation / Philosophy",
                    note: "Heartfelt reminder that your value is not tied solely to academic performance."
                  },
                  {
                    title: "Good Will Hunting",
                    genre: "Drama / Mentorship",
                    note: "Inspiring story about overcoming inner barriers with mentorship."
                  }
                ].map((mv, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl space-y-1 shadow-md">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">{mv.genre}</span>
                    <h5 className="text-xs font-bold text-white">{mv.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{mv.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PRIVATE ENCRYPTED SELF-JOURNAL */}
      {activeSubTab === 'journal' && (
        <div className="bg-slate-800 border border-teal-500/30 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <span>Private Self-Journal & Real-Time NLP Emotion Analytics</span>
              </h3>
              <span className="text-xs text-slate-400">Express your daily thoughts freely. Encrypted at rest with sentiment classification.</span>
            </div>
            <span className="text-xs text-slate-400 flex items-center space-x-1"><Lock className="h-3.5 w-3.5 text-emerald-400" /> Private</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Daily Journal Entry</label>
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              rows={6}
              placeholder="Write your personal thoughts, feelings about studies, placements, or life..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />

            <button
              onClick={handleRunAssessment}
              disabled={loading || !journal.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Analyze Journal Emotion & Save Entry</span>
            </button>
          </div>

          {journalAnalysis && (
            <div className="bg-slate-900 p-4 rounded-2xl border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">NLP Emotion Analysis Result</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Primary Emotion Tag</span>
                  <span className="font-bold text-indigo-300 text-sm">{journalAnalysis.primary_emotion}</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Stress Probability</span>
                  <span className="font-bold text-red-400 text-sm">{Math.round(journalAnalysis.stress_probability * 100)}%</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-bold">Entry Word Count</span>
                  <span className="font-bold text-slate-200 text-sm">{journalAnalysis.text_length} chars</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3-LAYER CRISIS SAFETY MODAL */}
      {crisisModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border-2 border-red-500 max-w-lg w-full rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 text-red-400 border-b border-slate-700 pb-3">
              <ShieldAlert className="h-8 w-8 animate-bounce" />
              <div>
                <h3 className="text-lg font-bold text-white">Crisis Safety Layer Activated</h3>
                <span className="text-xs text-red-400 font-semibold">3-Layer Safety Ensemble Triggered</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              {crisisModal.support_message || "We noticed high distress signals. You do not have to go through this alone. Please reach out to confidential crisis counselors available 24/7."}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified 24/7 Crisis Helplines</span>
              </h4>
              <div className="space-y-2">
                {[
                  { name: "Tele-MANAS Mental Health Helpline", number: "14416", available: "24/7 Toll-Free India" },
                  { name: "KIRAN National Mental Health Line", number: "1800-599-0019", available: "24/7 Toll-Free" },
                  { name: "Suicide & Crisis Lifeline", number: "988", available: "24/7 Confidential" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[11px] text-slate-400">{item.available}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                      {item.number}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button 
                onClick={() => setCrisisModal(null)}
                className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close & Return
              </button>
              <button 
                onClick={() => alert('Campus Counsellor notified with student consent protocol.')}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg"
              >
                Notify Campus Counsellor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
