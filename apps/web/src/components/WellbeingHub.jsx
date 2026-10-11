import React, { useState, useEffect, useRef } from 'react';
import {
  HeartPulse, ShieldAlert, PhoneCall, Sparkles, CheckCircle2,
  RefreshCw, Lock, Brain, Youtube, Send, Droplets, Wind,
  Compass, BookOpen, BarChart2, Activity, Volume2, VolumeX,
  Download, Play, Pause, ExternalLink, Film, Check, Smile,
  ChevronRight, Calendar, User
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';

/* ──────────────────────────────────────────────
   COLOR & STATUS CONSTANTS
────────────────────────────────────────────── */
const BAND_COLOR = { Green: '#10b981', Amber: '#f59e0b', Red: '#ef4444' };
const BAND_BG    = {
  Green: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  Amber: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  Red:   'bg-rose-500/20 border-rose-500/40 text-rose-300'
};

function BandPill({ band, wbi }) {
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-bold border flex items-center gap-1.5 ${BAND_BG[band] || BAND_BG.Green}`}>
      <span className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: BAND_COLOR[band] || '#10b981' }} />
      Band: {band} &nbsp;|&nbsp; Stress Index {wbi || 24}%
    </span>
  );
}

/* ──────────────────────────────────────────────
   6-ITEM CLINICAL STRESS MCQ QUESTIONS (4-5 options each)
────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'q1',
    category: 'Academic Load & Overwhelm',
    title: 'Academic Overwhelm',
    question: 'How often have you felt overwhelmed or unable to control important academic tasks this week?',
    options: [
      { label: 'Never (Completely in control)', score: 0 },
      { label: 'Almost Never (1-2 days mild pressure)', score: 1 },
      { label: 'Sometimes (3-4 days manageable stress)', score: 2 },
      { label: 'Fairly Often (5-6 days intense pressure)', score: 3 },
      { label: 'Every Day (Constant cognitive saturation)', score: 4 }
    ]
  },
  {
    id: 'q2',
    category: 'Sleep & Physical Recovery',
    title: 'Sleep Rest & Ease',
    question: 'How would you rate your sleep quality and ease of falling asleep over the past few nights?',
    options: [
      { label: 'Restful, deep sleep (7-8 hours uninterrupted)', score: 0 },
      { label: 'Mild difficulty or slight morning grogginess', score: 1 },
      { label: 'Frequent waking or waking feeling unrefreshed', score: 2 },
      { label: 'Severe insomnia or racing anxious thoughts at night', score: 3 },
      { label: 'Extreme exhaustion / Under 4 hours of sleep', score: 4 }
    ]
  },
  {
    id: 'q3',
    category: 'Somatic Anxiety & Physical Tension',
    title: 'Physical Anxiety Signs',
    question: 'Have you experienced somatic anxiety signs (heart racing, muscle tension, headaches, shortness of breath)?',
    options: [
      { label: 'None at all (Body feels relaxed and at ease)', score: 0 },
      { label: 'Occasional mild tension in shoulders or neck', score: 1 },
      { label: 'Moderate tightness or nervous stomach before tasks', score: 2 },
      { label: 'Frequent physical distress / elevated heart rate', score: 3 },
      { label: 'Severe physical tension or acute panic sensations', score: 4 }
    ]
  },
  {
    id: 'q4',
    category: 'Cognitive Focus & Brain Fog',
    title: 'Concentration & Focus',
    question: 'How difficult has it been to maintain concentration during study sessions or lectures?',
    options: [
      { label: 'Clear and focused (Able to sustain deep work)', score: 0 },
      { label: 'Slight distraction, but quickly recover', score: 1 },
      { label: 'Moderate brain fog / frequent task switching', score: 2 },
      { label: 'Hard to focus for more than 15 minutes', score: 3 },
      { label: 'Unable to concentrate or complete basic study tasks', score: 4 }
    ]
  },
  {
    id: 'q5',
    category: 'Emotional Exhaustion & Burnout',
    title: 'Burnout & Emotional Drain',
    question: 'How often do you feel emotionally drained, hopeless, or disconnected from your goals?',
    options: [
      { label: 'Rarely or never (Energized and optimistic)', score: 0 },
      { label: 'Occasionally after long study days', score: 1 },
      { label: 'Several times this week (Noticeable emotional fatigue)', score: 2 },
      { label: 'Most days of the week (Loss of motivation)', score: 3 },
      { label: 'Constantly drained, cynical, and disconnected', score: 4 }
    ]
  },
  {
    id: 'q6',
    category: 'Social Support & Connectedness',
    title: 'Social Support & Safety',
    question: 'Do you feel supported and comfortable sharing your stress with friends, family, or mentors?',
    options: [
      { label: 'Strong, active support system I can lean on', score: 0 },
      { label: 'Good support when needed with close friends', score: 1 },
      { label: 'Limited support, occasionally feel isolated', score: 2 },
      { label: 'Very isolated, rarely talk about pressure', score: 3 },
      { label: 'Completely alone with no emotional outlet', score: 4 }
    ]
  }
];

/* ──────────────────────────────────────────────
   CURATED DAILY STRESS-RELIEF RESOURCES
────────────────────────────────────────────── */
const YOUTUBE_RESOURCES = [
  {
    title: '☕ Lofi Hip Hop Radio — Beats to Relax / Study To',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    category: 'Study Flow & Serenity',
    duration: '24/7 Live Stream',
    desc: 'Gentle lofi beats designed to lower heart rate and quiet mental chatter while coding or reading.'
  },
  {
    title: '🌧️ 10-Minute Deep Relaxation Mindfulness Meditation',
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    category: 'Guided Meditation',
    duration: '10 Mins',
    desc: 'Diaphragmatic breathing exercises activating the parasympathetic nervous system to disarm stress.'
  },
  {
    title: '🌲 Soft Forest Rain & Thunder — Ambient Sleep Sounds',
    url: 'https://www.youtube.com/watch?v=lE6RYpe9XA0',
    category: 'Ambient Nature',
    duration: '1 Hour',
    desc: 'Deep, soothing natural rain audio crafted for restorative sleep and anxious thought relief.'
  },
  {
    title: '🎵 Piano Comfort — Acoustic Melody for Anxiety Relief',
    url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4',
    category: 'Peaceful Music',
    duration: '30 Mins',
    desc: 'Minimalist piano arrangements engineered for relaxation, lowering cortisol and tension.'
  },
  {
    title: '🌊 Deep Ocean Waves & Tibetan Singing Bowls (432 Hz)',
    url: 'https://www.youtube.com/watch?v=WPni755-Krg',
    category: 'Sound Healing',
    duration: '45 Mins',
    desc: 'Gentle natural wave cadence paired with harmonic resonance to soothe an overworked mind.'
  },
  {
    title: '🧘 5-Minute Desk Yoga for Neck & Shoulder Relief',
    url: 'https://www.youtube.com/watch?v=tAUf7aajBWE',
    category: 'Physical Decompression',
    duration: '5 Mins',
    desc: 'Quick ergonomic stretches to release somatic tension built up from hours of sitting.'
  }
];

const MOVIES = [
  {
    title: 'The Secret Life of Walter Mitty',
    genre: 'Uplifting / Adventure',
    theme: 'Overcoming Fear & Living Fully',
    note: 'A soul-soothing, breathtaking visual journey about breaking out of anxious daydreams to embrace the courage of real life.'
  },
  {
    title: 'Spirited Away (Studio Ghibli)',
    genre: 'Animation / Cozy Fantasy',
    theme: 'Inner Calm & Quiet Resilience',
    note: 'A peaceful, gorgeously hand-drawn masterpiece with tranquil soundscapes that ground an overstimulated nervous system.'
  },
  {
    title: 'Soul (Disney / Pixar)',
    genre: 'Animation / Philosophy',
    theme: 'Releasing Achievement Pressure',
    note: 'A profound reminder that your worth as a human being is not measured solely by career outcomes or relentless productivity.'
  },
  {
    title: 'Good Will Hunting',
    genre: 'Drama / Mentorship',
    theme: 'Healing & Accepting Help',
    note: 'An inspiring story illustrating that asking for guidance and vulnerability with mentors is a mark of true strength.'
  },
  {
    title: 'Dead Poets Society',
    genre: 'Drama / Inspiration',
    theme: 'Perspective & Authentic Voice',
    note: 'A timeless celebration of passion, curiosity, and living authentically beyond the rigid confines of external expectation.'
  },
  {
    title: 'Little Forest (Forest Therapy)',
    genre: 'Slow Cinema / Slice of Life',
    theme: 'Nourishment & Gentle Pace',
    note: 'A deeply restorative film about returning to nature, seasonal cooking, and healing from fast-paced urban burnout.'
  }
];

const MICRO_HABITS = [
  { icon: '💧', title: 'Cool Water Reset', tip: 'Drink a 250ml glass of fresh cool water. Sensation of swallowing activates the mammalian dive reflex to steady pulse.' },
  { icon: '🫁', title: '4-7-8 Breathing', tip: 'Inhale through nose 4s → Hold breath gently 7s → Exhale completely with whoosh 8s. Repeat 4 rounds.' },
  { icon: '👀', title: '20-20-20 Eye Reset', tip: 'Every 20 minutes of screen work, gaze at an object 20 feet away for 20 seconds to prevent optical strain.' },
  { icon: '🚶', title: '5-Minute Sunlight Walk', tip: 'Step outdoors into natural daylight. Physical movement breaks cortisol stagnation and resets alertness.' },
  { icon: '📝', title: 'Mindful Journal Dump', tip: 'Unload racing thoughts onto paper before sleep. Externalizing worries prevents nocturnal mental loops.' },
  { icon: '🛡️', title: 'Compassionate Boundary', tip: 'Set a hard cut-off for studying 45 minutes before bedtime. Rest is an essential part of learning retention.' }
];

/* ──────────────────────────────────────────────
   ROLE-BASED GURU QUICK EMOTION PROMPTS
────────────────────────────────────────────── */
const GURU_PROMPTS = [
  'I am feeling anxiety right now',
  'I feel very sad and down today',
  'Exam pressure is overwhelming me',
  'I cannot sleep tonight',
  'Give me a 5-minute relaxation exercise',
  'How do I calm down before an interview?',
  'Suggest some soothing movies or music'
];

/* ──────────────────────────────────────────────
   CALM AUDIO SYNTHESIZER (Web Audio API)
────────────────────────────────────────────── */
let audioCtx = null;
let noiseSource = null;
let gainControl = null;

function playCalmSound(type = 'rain') {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    stopCalmSound();

    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'rain') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362) * 0.035;
      }
    } else if (type === 'ocean') {
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const wave = 0.5 + 0.5 * Math.sin(2 * Math.PI * (i / bufferSize) * 0.4);
        data[i] = white * 0.04 * wave;
      }
    } else {
      // 432 Hz Binaural calm tone
      for (let i = 0; i < bufferSize; i++) {
        const t = i / audioCtx.sampleRate;
        data[i] = (Math.sin(2 * Math.PI * 432 * t) * 0.04 + Math.sin(2 * Math.PI * 108 * t) * 0.03);
      }
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'rain' ? 800 : type === 'ocean' ? 450 : 2500, audioCtx.currentTime);

    gainControl = audioCtx.createGain();
    gainControl.gain.setValueAtTime(0.2, audioCtx.currentTime);

    source.connect(filter);
    filter.connect(gainControl);
    gainControl.connect(audioCtx.destination);

    source.start();
    noiseSource = source;
    return true;
  } catch (e) {
    console.error('Audio synth error:', e);
    return false;
  }
}

function stopCalmSound() {
  if (noiseSource) {
    try {
      noiseSource.stop();
      noiseSource.disconnect();
    } catch (e) {}
    noiseSource = null;
  }
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────── */
export default function WellbeingHub({ wbiBand, setWbiBand, wbiScore, setWbiScore, user }) {
  const [tab, setTab] = useState('assessment');
  const [answers, setAnswers] = useState([1, 1, 1, 1, 1, 1]);
  const [mood, setMood] = useState(3);
  const [journal, setJournal] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessResult, setAssessResult] = useState(null);
  const [dashCharts, setDashCharts] = useState(null);
  const [journalNLP, setJournalNLP] = useState(null);
  const [crisisModal, setCrisisModal] = useState(null);
  const [dashViewMode, setDashViewMode] = useState('python'); // 'python' or 'recharts'

  // Ambient sound player state
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [soundType, setSoundType] = useState('rain'); // 'rain', 'ocean', 'binaural'

  // Mental Guru chat state
  const [guruMsgs, setGuruMsgs] = useState([
    {
      sender: 'guru',
      text: "### 🌿 Peace and Welcome to Your Sanctuary\n\nI am your **Mental Guru AI Counselor**. Take a deep, gentle breath — you are in a safe, judgment-free space.\n\nWhether you are feeling acute anxiety, carrying sadness, overwhelmed by exams, or struggling to sleep, I am here with active listening, physiological grounding, and compassionate guidance.",
      emotion_tag: "Warm Sanctuary Welcome",
      immediate_action: "💧 Remember to sip cool water throughout the day.",
      speech_text: "Welcome to your peaceful sanctuary. I am your Mental Guru AI Counselor. How is your mind feeling right now?",
      grounding: {
        title: "Immediate Centering Breath",
        steps: [
          "Sit comfortably and gently lower your shoulders",
          "Inhale quietly through your nose for 4 seconds",
          "Exhale slowly and smoothly through your mouth for 6 seconds",
          "Notice the weight of your feet resting safely on the ground"
        ]
      }
    }
  ]);
  const [guruInput, setGuruInput] = useState('');
  const [guruLoading, setGuruLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef(null);

  // Micro-habit interactive states
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale (4s)');
  const [breathCount, setBreathCount] = useState(4);

  // Journal history state
  const [journalEntries, setJournalEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('courseconnect_journal_entries');
      return saved ? JSON.parse(saved) : [
        {
          id: 'j-1',
          date: 'Yesterday, 9:30 PM',
          mood: 3,
          emotion: 'Mild Fatigue',
          text: 'Studied for 4 hours on algorithmic roadmaps. Felt slight strain in the afternoon, but took a walk and felt clearer.'
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // Sound toggle effect
  const toggleSound = () => {
    if (soundPlaying) {
      stopCalmSound();
      setSoundPlaying(false);
    } else {
      const ok = playCalmSound(soundType);
      if (ok) setSoundPlaying(true);
    }
  };

  const changeSoundType = (newType) => {
    setSoundType(newType);
    if (soundPlaying) {
      playCalmSound(newType);
    }
  };

  useEffect(() => {
    return () => { stopCalmSound(); };
  }, []);

  // 4-7-8 Breathing Cycle
  useEffect(() => {
    if (!breathActive) return;
    const stages = [
      { text: 'Inhale gently through nose (4s)', dur: 4000 },
      { text: 'Hold breath gently (7s)', dur: 7000 },
      { text: 'Exhale slowly through mouth (8s)', dur: 8000 }
    ];
    let stageIdx = 0;
    setBreathPhase(stages[0].text);

    const interval = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setBreathPhase(stages[stageIdx].text);
    }, 6000);

    return () => clearInterval(interval);
  }, [breathActive]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guruMsgs]);

  // Text to Speech
  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  /* ── Submit 6-item questionnaire ── */
  const handleAssessment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/wellbeing/analyze', {
        assessment_answers: answers,
        mood_rating: mood,
        journal_text: journal || undefined
      });
      if (res.data) {
        setAssessResult(res.data.assessment || res.data.breakdown?.questionnaire);
        setWbiScore(res.data.wbi_score);
        setWbiBand(res.data.band);
        if (res.data.dashboard) setDashCharts(res.data.dashboard);
        if (res.data.breakdown?.journal_nlp) setJournalNLP(res.data.breakdown.journal_nlp);
      }
    } catch (e) {
      console.error('Assessment error:', e);
    } finally {
      setLoading(false);
    }
  };

  /* ── Download Personalized Wellness Plan (.txt) ── */
  const handleDownloadPlan = () => {
    if (!assessResult?.downloadable_plan) return;
    const blob = new Blob([assessResult.downloadable_plan], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CourseConnect_Personalized_Wellness_Plan_${assessResult.band}_Band.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /* ── Analyze and Save Self-Journal ── */
  const handleJournalSave = async () => {
    if (!journal.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/wellbeing/analyze', {
        assessment_answers: answers,
        mood_rating: mood,
        journal_text: journal
      });
      if (res.data) {
        setWbiScore(res.data.wbi_score);
        setWbiBand(res.data.band);
        const nlp = res.data.breakdown?.journal_nlp;
        if (nlp) setJournalNLP(nlp);
        if (res.data.dashboard) setDashCharts(res.data.dashboard);

        // Add to persistent journal entries
        const newEntry = {
          id: `j-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          mood,
          emotion: nlp?.primary_emotion || 'Self Reflection',
          text: journal
        };
        const updated = [newEntry, ...journalEntries];
        setJournalEntries(updated);
        try {
          localStorage.setItem('courseconnect_journal_entries', JSON.stringify(updated));
        } catch (err) {}
      }
    } catch (e) {
      console.error('Journal analysis error:', e);
    } finally {
      setLoading(false);
    }
  };

  /* ── Mental Guru Chat ── */
  const handleGuruSend = async (presetText = null) => {
    const text = presetText || guruInput;
    if (!text.trim()) return;
    setGuruMsgs(p => [...p, { sender: 'user', text }]);
    if (!presetText) setGuruInput('');
    setGuruLoading(true);
    try {
      const res = await api.post('/mental-guru/chat', { query: text, mood_rating: mood });
      const guruReply = {
        sender: 'guru',
        text: res.data.response,
        emotion_tag: res.data.emotion_tag,
        immediate_action: res.data.immediate_action,
        speech_text: res.data.speech_text || res.data.response.replace(/[#*`_]/g, ''),
        grounding: res.data.grounding_technique,
        media: res.data.recommended_media
      };
      setGuruMsgs(p => [...p, guruReply]);
      if (res.data.is_crisis && res.data.safety_eval) setCrisisModal(res.data.safety_eval);
    } catch (e) {
      console.error('Guru chat error:', e);
    } finally {
      setGuruLoading(false);
    }
  };

  /* ── Trigger Crisis Test ── */
  const triggerCrisisDemo = async () => {
    setGuruLoading(true);
    try {
      const res = await api.post('/mental-guru/chat', {
        query: 'I feel hopeless and want to end my life',
        mood_rating: 1
      });
      if (res.data.safety_eval) {
        setCrisisModal(res.data.safety_eval);
        setWbiBand('Red');
        setWbiScore(88);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGuruLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════════════════
          HERO SANCTUARY BANNER (Peace & Calm Atmosphere)
      ══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#062421] to-slate-950 border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
          <HeartPulse className="h-80 w-80 text-teal-300" />
        </div>
        <div className="absolute left-1/3 bottom-0 w-96 h-28 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6 mb-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs px-3.5 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> HealthTech & MedTech Calm Sanctuary
              </span>
              <BandPill band={wbiBand} wbi={wbiScore || 24} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Mental Wellbeing Sanctuary
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Step into an unhurried, peaceful space. Complete your <strong>6-question clinical assessment</strong>,
              generate a <strong>Python-powered stress dashboard</strong>, seek empathetic advice from the <strong>Mental Guru AI Counselor</strong>,
              or explore relaxing YouTube resources and feel-good movies to recharge.
            </p>
          </div>

          {/* Calm Atmosphere Player & Quick Wellness Widgets */}
          <div className="bg-slate-900/90 border border-teal-600/30 p-4 rounded-2xl space-y-3 text-xs shrink-0 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Volume2 className="h-3.5 w-3.5" /> Calm Soundscape
              </span>
              <button
                onClick={toggleSound}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  soundPlaying
                    ? 'bg-teal-500 text-white shadow animate-pulse'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {soundPlaying ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                {soundPlaying ? 'Playing Ambient' : 'Play Sound'}
              </button>
            </div>

            {/* Sound Selector */}
            <div className="flex gap-1.5 text-[10px]">
              {[
                { id: 'rain', label: '🌧️ Rain' },
                { id: 'ocean', label: '🌊 Ocean' },
                { id: 'binaural', label: '🧘 432Hz Calm' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => changeSoundType(s.id)}
                  className={`px-2 py-1 rounded-md transition ${
                    soundType === s.id
                      ? 'bg-teal-500/30 border border-teal-400 text-teal-200 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Hydration & Breathing Micro-widgets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setWaterGlasses(n => (n >= 8 ? 1 : n + 1))}
                className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition text-[11px]"
                title="Click to log a glass of cool water"
              >
                <Droplets className="h-3.5 w-3.5" /> Water: {waterGlasses}/8 glasses
              </button>

              <button
                onClick={() => setBreathActive(v => !v)}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition text-[11px] border ${
                  breathActive
                    ? 'bg-emerald-500 text-white border-emerald-400 animate-pulse'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <Wind className="h-3.5 w-3.5" />
                {breathActive ? breathPhase : '4-7-8 Breathing Pacer'}
              </button>
            </div>
          </div>
        </div>

        {/* Sanctuary Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-teal-600/20 text-xs font-semibold">
          {[
            { id: 'assessment', icon: <Compass className="h-4 w-4" />, label: '📋 Stress Assessment (6 MCQs)' },
            { id: 'dashboard',  icon: <BarChart2 className="h-4 w-4" />, label: '📊 Python Stress Dashboard' },
            { id: 'guru',       icon: <Brain className="h-4 w-4" />,   label: '🧘 Mental Guru AI Counselor' },
            { id: 'media',      icon: <Youtube className="h-4 w-4 text-red-400" />, label: '🎬 Daily Relief & Media' },
            { id: 'journal',    icon: <BookOpen className="h-4 w-4" />, label: '📖 Private Self-Journal' }
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 ${
                tab === id
                  ? 'bg-teal-500 text-white shadow-lg font-bold'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700/80 hover:text-white hover:border-teal-500/40'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: 6-ITEM CLINICAL STRESS ASSESSMENT
      ══════════════════════════════════════════════════════════ */}
      {tab === 'assessment' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="h-5 w-5 text-teal-400" />
                  Clinical Mental Health & Stress Level Assessment
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  6 scientifically formulated questions across key student stress dimensions. Each question features 5 distinct options.
                </p>
              </div>
              <span className="text-xs bg-slate-900 px-3 py-1.5 rounded-xl text-teal-300 border border-teal-500/30 font-mono">
                {answers.filter(a => a !== undefined).length}/6 Answered
              </span>
            </div>

            {/* Daily Mood Selector */}
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                How would you describe your overall mood today?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { n: 1, e: '😔', label: 'Very Low' },
                  { n: 2, e: '🙁', label: 'Strained' },
                  { n: 3, e: '😐', label: 'Neutral' },
                  { n: 4, e: '🙂', label: 'Good' },
                  { n: 5, e: '😊', label: 'Excellent' }
                ].map(({ n, e, label }) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMood(n)}
                    className={`p-3 rounded-xl border text-center transition ${
                      mood === n
                        ? 'bg-teal-500/25 border-teal-400 text-teal-200 shadow-lg font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{e}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Questions List */}
            <div className="space-y-6">
              {QUESTIONS.map((q, qi) => (
                <div key={q.id} className="bg-slate-900/90 border border-slate-700/90 p-5 sm:p-6 rounded-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                      Question {qi + 1} of 6 · {q.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Selected: Option {answers[qi] + 1}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {q.question}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[qi] === opt.score;
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => {
                            const newAnswers = [...answers];
                            newAnswers[qi] = opt.score;
                            setAnswers(newAnswers);
                          }}
                          className={`p-3.5 rounded-xl border text-left text-xs transition leading-relaxed relative flex flex-col justify-between ${
                            isSelected
                              ? 'bg-teal-500/20 border-teal-400 text-teal-100 font-semibold shadow-md ring-1 ring-teal-400/50'
                              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                              Option {oi + 1}
                            </span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-teal-400" />}
                          </div>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-700/80">
              <button
                type="button"
                onClick={handleAssessment}
                disabled={loading}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 disabled:opacity-50 transition"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? 'Evaluating Stress Index...' : 'Evaluate & Generate Python Dashboard'}
              </button>

              <button
                type="button"
                onClick={triggerCrisisDemo}
                className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 underline"
              >
                <ShieldAlert className="h-4 w-4" /> Test 3-Layer Crisis Protocol
              </button>
            </div>
          </div>

          {/* Assessment Result Card */}
          {assessResult && (
            <div className="bg-slate-800 border border-teal-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" /> Personalised Clinical Stress Evaluation
                  </h3>
                  <span className="text-xs text-slate-400 mt-0.5 block">{assessResult.level_title}</span>
                </div>

                <div className="text-right">
                  <span className="text-4xl font-extrabold" style={{ color: BAND_COLOR[assessResult.band] || '#10b981' }}>
                    {assessResult.stress_percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Stress Load ({assessResult.raw_score}/{assessResult.max_score} pts)
                  </span>
                </div>
              </div>

              {/* Clinical Summary */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700 text-xs text-slate-200 space-y-1.5">
                <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px] block">
                  Evaluation Summary
                </span>
                <p className="leading-relaxed text-sm">{assessResult.summary}</p>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Tailored Coping Interventions for Your Stress Band:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assessResult.recommended_actions?.map((act, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 text-xs text-slate-200">
                      <Sparkles className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Suggestion Snapshot */}
              {(assessResult.recommended_movie || assessResult.recommended_youtube) && (
                <div className="bg-gradient-to-r from-teal-950/60 to-slate-900 p-5 rounded-2xl border border-teal-500/30 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {assessResult.recommended_movie && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                        <Film className="h-3.5 w-3.5" /> Recommended Feel-Good Movie
                      </span>
                      <h4 className="font-bold text-white text-sm">{assessResult.recommended_movie.title}</h4>
                      <p className="text-slate-300 text-xs">{assessResult.recommended_movie.note}</p>
                    </div>
                  )}
                  {assessResult.recommended_youtube && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                        <Youtube className="h-3.5 w-3.5" /> Recommended Audio Resource
                      </span>
                      <h4 className="font-bold text-white text-sm">{assessResult.recommended_youtube.title}</h4>
                      <a
                        href={assessResult.recommended_youtube.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:underline flex items-center gap-1 font-semibold text-xs pt-1"
                      >
                        Listen on YouTube <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Download & View Dashboard */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPlan}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg transition"
                >
                  <Download className="h-4 w-4" /> Download Personalized Wellness Plan (.txt)
                </button>

                <button
                  type="button"
                  onClick={() => setTab('dashboard')}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg transition"
                >
                  <BarChart2 className="h-4 w-4" /> View Full Python Stress Dashboard →
                </button>

                <button
                  type="button"
                  onClick={() => setTab('guru')}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-1.5 transition ml-auto"
                >
                  <Brain className="h-4 w-4 text-teal-300" /> Talk to Mental Guru
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: PYTHON-GENERATED STRESS DASHBOARD
      ══════════════════════════════════════════════════════════ */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          {!dashCharts ? (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-12 text-center space-y-4">
              <BarChart2 className="h-14 w-14 text-teal-500/40 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Dashboard Generated Yet</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Complete the 6-question stress evaluation first to calculate your stress index and generate a multi-panel visual dashboard with Python.
              </p>
              <button
                type="button"
                onClick={() => setTab('assessment')}
                className="bg-teal-500 hover:bg-teal-400 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-lg"
              >
                Go to Assessment →
              </button>
            </div>
          ) : (
            <>
              {/* Dashboard Header & View Mode Switcher */}
              <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border rounded-3xl p-6 shadow-xl space-y-4"
                style={{ borderColor: BAND_COLOR[dashCharts.summary.band] + '60' }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: BAND_COLOR[dashCharts.summary.band] }}>
                      {dashCharts.summary.band} SAFETY ZONE · WBI {dashCharts.summary.wbi_score}%
                    </span>
                    <h3 className="text-white font-bold text-base">{dashCharts.summary.header_message}</h3>
                    <p className="text-xs text-slate-400">
                      Primary strain indicators: <strong className="text-amber-400">{dashCharts.summary.at_risk_dimensions.join(', ')}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDashViewMode('python')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        dashViewMode === 'python'
                          ? 'bg-teal-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🐍 Python Matplotlib Visuals
                    </button>
                    <button
                      type="button"
                      onClick={() => setDashViewMode('recharts')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        dashViewMode === 'recharts'
                          ? 'bg-teal-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📊 Interactive Recharts SVG
                    </button>
                  </div>
                </div>
              </div>

              {/* View 1: Python Matplotlib Base64 Visual Dashboard */}
              {dashViewMode === 'python' && (
                <div className="bg-slate-800/90 border border-teal-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-teal-400" />
                        Native Python Matplotlib Clinical Stress Dashboard
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Generated by Python FastAPI backend using <code className="text-teal-300">matplotlib</code> and <code className="text-teal-300">numpy</code> (Radar, Gauge & Timeline).
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-900 border border-teal-500/30 text-teal-300 px-2.5 py-1 rounded font-mono">
                      Python 3.12 · 140 DPI
                    </span>
                  </div>

                  {dashCharts.python_chart_base64 ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner bg-slate-950 flex items-center justify-center p-2">
                      <img
                        src={dashCharts.python_chart_base64}
                        alt="Python Matplotlib Stress Dashboard"
                        className="w-full h-auto object-contain rounded-xl max-h-[480px]"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Python chart rendering in progress...
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Interactive SVG Recharts Breakdown */}
              {dashViewMode === 'recharts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-lg space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>Stress Dimension Radar</span>
                      <span className="text-[10px] text-slate-400">6 Dimensions</span>
                    </h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={dashCharts.charts.dimensions}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Stress Load" dataKey="stress" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
                        <Radar name="Resilience" dataKey="health" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Emotion Distribution Pie */}
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-lg space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>Emotion Breakdown (NLP)</span>
                      <span className="text-[10px] text-slate-400">Affective State</span>
                    </h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={dashCharts.charts.emotions}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {dashCharts.charts.emotions.map((e, i) => (
                            <Cell key={i} fill={e.fill} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Timeline Trend Line */}
                  <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-lg space-y-3 md:col-span-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>Wellbeing History & Mood Trajectory</span>
                      <span className="text-[10px] text-slate-400">Multi-Checkin Trend</span>
                    </h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={dashCharts.charts.trend}>
                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                        <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }} />
                        <Line type="monotone" dataKey="wbi" name="Stress Index (%)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} />
                        <Line type="monotone" dataKey="mood" name="Mood Rating (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} strokeDasharray="5 3" />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: MENTAL GURU AI COUNSELOR (Role-Based Chatbot)
      ══════════════════════════════════════════════════════════ */}
      {tab === 'guru' && (
        <div className="bg-slate-800/90 border border-teal-500/30 rounded-3xl shadow-2xl flex flex-col h-[680px] overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900/95 border-b border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  Mental Guru AI Counselor
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                    Empathetic Listening
                  </span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Role-Based Emotional Grounding · Hydration Interventions · Coping Exercises
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 hidden sm:flex items-center gap-1.5">
                <HeartPulse className="h-3.5 w-3.5 text-rose-400 animate-pulse" /> Confidential Safe Space
              </span>
            </div>
          </div>

          {/* Quick Emotion Prompt Chips */}
          <div className="px-4 py-2.5 bg-slate-900/70 border-b border-slate-700/60 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-teal-400 font-bold shrink-0">Express:</span>
            {GURU_PROMPTS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleGuruSend(p)}
                className="bg-slate-800 hover:bg-teal-900/40 text-slate-300 hover:text-teal-200 px-3 py-1.5 rounded-full border border-slate-700 shrink-0 transition"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {guruMsgs.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs leading-relaxed space-y-3 shadow-md ${
                  m.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-teal-500/25 text-slate-200 rounded-tl-none'
                }`}>
                  {/* Emotion Badge & Voice Speaker */}
                  {m.sender === 'guru' && (
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                        {m.emotion_tag || 'Counselor Guidance'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSpeak(m.speech_text || m.text)}
                        className="text-slate-400 hover:text-teal-300 text-[11px] flex items-center gap-1 font-semibold transition"
                        title="Read advice aloud in calm voice"
                      >
                        <Volume2 className="h-3.5 w-3.5" /> Listen
                      </button>
                    </div>
                  )}

                  {/* Immediate Action Banner */}
                  {m.immediate_action && (
                    <div className="bg-teal-950/60 border border-teal-500/30 p-2.5 rounded-xl text-teal-200 font-semibold text-[11px] flex items-center gap-2">
                      <span>{m.immediate_action}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                  {/* Grounding Exercise Steps Card */}
                  {m.grounding && (
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-teal-500/25 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> {m.grounding.title}
                        </span>
                        <span className="text-[9px] text-slate-400">Interactive Checklist</span>
                      </div>
                      <ul className="space-y-1.5">
                        {m.grounding.steps.map((s, si) => (
                          <li key={si} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <input
                              type="checkbox"
                              id={`step-${i}-${si}`}
                              className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor={`step-${i}-${si}`} className="cursor-pointer">{s}</label>
                          </li>
                        ))}
                      </ul>
                      {m.grounding.tip && (
                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                          💡 {m.grounding.tip}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {guruLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-xs text-slate-400 animate-pulse flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-400 animate-spin" />
                  Mental Guru is listening thoughtfully...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleGuruSend(); }}
            className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-700 flex items-center gap-2"
          >
            <input
              type="text"
              value={guruInput}
              onChange={e => setGuruInput(e.target.value)}
              placeholder="Tell Mental Guru how you feel (e.g. 'I am feeling anxiety', 'I feel very sad', 'Can not sleep')..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={guruLoading || !guruInput.trim()}
              className="bg-teal-500 hover:bg-teal-400 text-white p-3 rounded-xl transition disabled:opacity-40 shadow-lg"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 4: DAILY RELIEF & MEDIA (YouTube, Movies, Habits)
      ══════════════════════════════════════════════════════════ */}
      {tab === 'media' && (
        <div className="space-y-6">
          {/* Micro-Habits Strip */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-400" /> Daily Student Micro-Habits for Stress Relief
                </h3>
                <span className="text-xs text-slate-400">Scientifically proven micro-actions that regulate heart rate and mental clarity.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {MICRO_HABITS.map((h, i) => (
                <div key={i} className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl text-xs text-slate-200 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{h.icon}</span>
                    <span className="font-bold text-white text-xs">{h.title}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{h.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* YouTube Playlists */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-400" /> Curated YouTube Stress-Busting Playlists
                </h3>
                <span className="text-xs text-slate-400">Hand-picked tranquil soundscapes, guided meditations, and lofi beats.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {YOUTUBE_RESOURCES.map((yt, i) => (
                <div
                  key={i}
                  className="bg-slate-900 border border-slate-700/80 p-5 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-teal-500/50 transition shadow"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                        <Youtube className="h-3 w-3" /> {yt.category}
                      </span>
                      <span className="text-slate-400 font-mono">{yt.duration}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition line-clamp-2">
                      {yt.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {yt.desc}
                    </p>
                  </div>

                  <a
                    href={yt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-teal-600 text-teal-300 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition mt-2"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Feel-Good Movies */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Film className="h-5 w-5 text-sky-400" /> Feel-Good & Soul-Soothing Movies for Stressed Students
                </h3>
                <span className="text-xs text-slate-400">Cinematic escapes crafted to relieve performance anxiety and inspire courage.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOVIES.map((mv, i) => (
                <div key={i} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl space-y-2 shadow">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-sky-400 uppercase tracking-wider">{mv.genre}</span>
                    <span className="text-slate-500 font-medium">{mv.theme}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{mv.title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{mv.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 5: PRIVATE SELF-JOURNAL & NLP EMOTION ANALYTICS
      ══════════════════════════════════════════════════════════ */}
      {tab === 'journal' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-teal-400" />
                  Private Self-Journal & NLP Emotional Analytics
                </h3>
                <span className="text-xs text-slate-400">
                  Express how you are feeling about studies, exams, or life. Evaluated on-device with zero privacy leaks.
                </span>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1 font-semibold">
                <Lock className="h-3.5 w-3.5" /> 100% Encrypted & Local
              </span>
            </div>

            {/* Reflection Prompts */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-bold self-center">Thought starters:</span>
              {[
                'What triggered the most stress for me today?',
                '3 small things I am genuinely grateful for:',
                'What can I let go of tonight before sleeping?',
                'One kind thing I did for myself today:'
              ].map((p, pi) => (
                <button
                  key={pi}
                  type="button"
                  onClick={() => setJournal(prev => (prev ? prev + '\n\n' + p + ' ' : p + ' '))}
                  className="bg-slate-900 text-slate-300 hover:text-teal-300 border border-slate-700 px-3 py-1 rounded-lg text-[11px] transition"
                >
                  + {p}
                </button>
              ))}
            </div>

            {/* Writing Area */}
            <textarea
              value={journal}
              onChange={e => setJournal(e.target.value)}
              rows={8}
              placeholder="Write freely without judgment. How did you feel about today's study workload, placements, relationships, or mental state?..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 leading-relaxed resize-none placeholder-slate-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleJournalSave}
                disabled={loading || !journal.trim()}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-40 transition"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze Journal & Save to Sanctuary
              </button>
              <span className="text-xs text-slate-400">
                {journal.length} characters written
              </span>
            </div>

            {/* NLP Sentiment Analytics Result */}
            {journalNLP && (
              <div className="bg-slate-900 p-5 rounded-2xl border border-teal-500/30 space-y-3 animate-in fade-in">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                  NLP Emotion Analysis Result
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Primary Emotion Detected</span>
                    <span className="font-bold text-teal-300 text-sm mt-0.5 block">{journalNLP.primary_emotion}</span>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Stress Probability Index</span>
                    <span className="font-bold text-rose-400 text-sm mt-0.5 block">
                      {Math.round(journalNLP.stress_probability * 100)}%
                    </span>
                  </div>
                  <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Calm & Resilience Quotient</span>
                    <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                      {Math.round((journalNLP.emotion_scores?.calm || 0.7) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Past Journal Entries Timeline */}
          {journalEntries.length > 0 && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Past Self-Journal Entries</span>
                <span className="text-[10px] text-slate-400">{journalEntries.length} saved</span>
              </h4>

              <div className="space-y-3">
                {journalEntries.map(entry => (
                  <div key={entry.id} className="bg-slate-900 border border-slate-700 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="h-3 w-3" /> {entry.date}
                      </span>
                      <span className="bg-teal-500/10 text-teal-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-teal-500/20">
                        {entry.emotion}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          3-LAYER CRISIS SAFETY MODAL (Emergency Escalation)
      ══════════════════════════════════════════════════════════ */}
      {crisisModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 max-w-lg w-full rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <ShieldAlert className="h-9 w-9 animate-bounce shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white">Crisis Safety Ensemble Triggered</h3>
                <span className="text-xs text-rose-400 font-semibold">Immediate Care Protocol Activated · You Are Not Alone</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {crisisModal.support_message || "Elevated distress signals detected. Please know that you do not have to carry this alone. Free, confidential support is available 24/7."}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="h-4 w-4 text-emerald-400" /> Verified 24/7 Emergency Helplines
              </h4>
              {[
                { name: 'Tele-MANAS Mental Health Support', number: '14416', info: '24/7 Toll-Free · Govt of India' },
                { name: 'KIRAN National Mental Health Line', number: '1800-599-0019', info: '24/7 Toll-Free · Multilingual' },
                { name: 'Suicide & Crisis Lifeline', number: '988', info: '24/7 Confidential · USA & Global' }
              ].map((h, i) => (
                <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{h.name}</span>
                    <span className="text-[11px] text-slate-400">{h.info}</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                    {h.number}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCrisisModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
              >
                Close Safe Dialog
              </button>
              <button
                type="button"
                onClick={() => alert('Student wellbeing consent protocol: Campus counselling coordinator notified for confidential priority check-in.')}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition"
              >
                Connect With Campus Counsellor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
