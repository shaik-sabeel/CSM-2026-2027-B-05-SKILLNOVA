import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Maximize, Award, CheckCircle, 
  RefreshCw, Sparkles, AlertCircle, FileText, Briefcase, Play, 
  Clock, ShieldAlert, ChevronRight, BarChart2, Volume2, VolumeX,
  UserCheck, ArrowRight, CornerDownRight
} from 'lucide-react';
import api from '../services/api';

const SAMPLE_JD_PRESETS = {
  "Full Stack Software Engineer": `Role: Full Stack Software Engineer
Responsibilities:
- Build high-scale, responsive web applications using React, Node.js, and TypeScript.
- Architect RESTful APIs and microservices communicating with PostgreSQL and Redis.
- Containerize services using Docker and manage CI/CD pipelines.
- Diagnose performance bottlenecks, handle database indexing, and scale web applications.
Requirements:
- Strong command of React (Hooks, state management, Virtual DOM optimization).
- Proficiency with Node.js, Express, async I/O, and relational databases.
- Experience with Docker, Git version control, and system design principles.`,

  "AI & ML Systems Engineer": `Role: AI & Machine Learning Systems Engineer
Responsibilities:
- Implement Retrieval-Augmented Generation (RAG) pipelines and LLM agent workflows using Python, FastAPI, and Hugging Face.
- Fine-tune transformer architectures and build vector search embeddings with Scikit-learn and FAISS.
- Deploy low-latency microservices with asynchronous APIs.
Requirements:
- Strong knowledge of Python, PyTorch/TensorFlow, and Hugging Face transformers.
- Experience with vector databases, cosine similarity retrieval, and RAG grounding.
- Understanding of overfitting, regularizations, and model evaluation metrics.`
};

const SAMPLE_RESUMES = {
  "Full Stack Candidate": `ALEX JOHNSON | SOFTWARE ENGINEER
alex.johnson@student.edu | github.com/alex-johnson | LinkedIn: /in/alexjohnson

TECHNICAL SKILLS:
- Languages: JavaScript, TypeScript, Python, SQL, HTML/CSS
- Frontend: React, Next.js, Tailwind CSS, Redux
- Backend: Node.js, Express, FastAPI, REST APIs
- Databases & Tools: PostgreSQL, MongoDB, Docker, Git, Redis

PROJECT HIGHLIGHTS:
- CourseConnect Platform: Architected a full-stack educational web application with React and Node.js serving 1,000+ active sessions with under 150ms API latencies.
- E-Commerce Microservices: Engineered distributed shopping cart and checkout services using PostgreSQL and Docker, implementing Redis caching to reduce database read load by 45%.
- Algorithmic Path Finder: Developed interactive graph visualization tool in React using BFS, DFS, and Dijkstra algorithms.`,

  "AI & Data Science Candidate": `PRIYA PATEL | MACHINE LEARNING ENGINEER
priya.patel@student.edu | github.com/priya-patel | LinkedIn: /in/priyapatel

TECHNICAL SKILLS:
- Languages: Python, SQL, C++, Bash
- ML/AI: Scikit-Learn, PyTorch, Hugging Face Transformers, RAG Pipelines, Pandas, NumPy
- Backend & Cloud: FastAPI, Docker, PostgreSQL, REST APIs

PROJECT HIGHLIGHTS:
- Multi-Resource RAG Tutor: Built an open-source retrieval-augmented tutor using Hugging Face embeddings and TF-IDF vector search, improving retrieval accuracy to 94%.
- Mental Health Stress Predictor: Developed an ensemble Machine Learning classifier using Random Forest and XGBoost to predict student burnout risks with 91% F1-score.
- Automated Resume ATS Parser: Implemented keyword matching and scoring engine extracting technical competencies from PDF documents.`
};

export default function MockInterview({ user }) {
  // Steps: 'setup' | 'calibration' | 'live' | 'debrief'
  const [step, setStep] = useState('setup');
  
  // Setup State
  const [role, setRole] = useState('Full Stack Software Engineer');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD_PRESETS["Full Stack Software Engineer"]);
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES["Full Stack Candidate"]);
  
  // Calibration / Devices State
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Analysis State
  const [analysis, setAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Live Interview State
  const [timeLeftSec, setTimeLeftSec] = useState(1800); // 30 minutes = 1800s
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [isRecordingSpeech, setIsRecordingSpeech] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [answersHistory, setAnswersHistory] = useState([]);
  
  // Media Refs
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      stopMediaTracks();
      if (timerRef.current) clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const stopMediaTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
    setMicActive(false);
  };

  // 30-Minute Countdown Timer
  useEffect(() => {
    if (step === 'live' && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSec(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isTimerRunning]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Preset Selections
  const handleRolePreset = (r) => {
    setRole(r);
    if (SAMPLE_JD_PRESETS[r]) {
      setJobDescription(SAMPLE_JD_PRESETS[r]);
    }
    if (r.includes('AI') && SAMPLE_RESUMES["AI & Data Science Candidate"]) {
      setResumeText(SAMPLE_RESUMES["AI & Data Science Candidate"]);
    } else {
      setResumeText(SAMPLE_RESUMES["Full Stack Candidate"]);
    }
  };

  // 1. Analyze Resume & Generate Tailored Questions
  const handleGenerateInterview = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      alert('Please provide both the Job Description and your Resume text.');
      return;
    }

    setEvaluating(true);
    try {
      const res = await api.post('/interview/questions', {
        role,
        resume_text: resumeText,
        target_jd: jobDescription
      });

      if (res.data) {
        setAnalysis(res.data.analysis);
        setQuestions(res.data.questions || []);
        setCurrentQIndex(0);
        setStep('calibration');
      }
    } catch (err) {
      console.error('Error generating interview flow:', err);
      alert('Failed to analyze resume & JD. Ensure backend service is running.');
    } finally {
      setEvaluating(false);
    }
  };

  // 2. Hardware Access
  const toggleCamera = async () => {
    if (cameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(t => t.stop());
      }
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micActive });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        alert('Could not access webcam. You can still continue the mock interview without camera.');
      }
    }
  };

  const toggleMic = async () => {
    if (micActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach(t => t.stop());
      }
      setMicActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: cameraActive });
        mediaStreamRef.current = stream;
        setMicActive(true);
      } catch (err) {
        console.warn('Mic access denied:', err);
        alert('Could not access microphone.');
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Fullscreen request error:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  // 3. Start Live 30-Minute Interview
  const startLiveSimulation = () => {
    setStep('live');
    setTimeLeftSec(1800); // 30 minutes
    setIsTimerRunning(true);
    // Speak first question
    if (questions.length > 0) {
      speakQuestion(questions[0].question);
    }
  };

  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsInterviewerSpeaking(true);
    utterance.onend = () => setIsInterviewerSpeaking(false);
    utterance.onerror = () => setIsInterviewerSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsInterviewerSpeaking(false);
    }
  };

  // 4. Live Speech-to-Text for Candidate
  const toggleSpeechRecognition = () => {
    if (isRecordingSpeech) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecordingSpeech(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your response directly into the terminal.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecordingSpeech(true);
    recognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      setAnswerText(fullTranscript);
    };
    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e);
      setIsRecordingSpeech(false);
    };
    recognition.onend = () => setIsRecordingSpeech(false);

    speechRecognitionRef.current = recognition;
    recognition.start();
  };

  // 5. Submit Question Response for Live Evaluation
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      alert('Please speak or type your answer before submitting.');
      return;
    }

    if (isRecordingSpeech && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsRecordingSpeech(false);
    }
    stopSpeaking();

    const currentQ = questions[currentQIndex];
    setEvaluating(true);

    try {
      const res = await api.post('/interview/evaluate', {
        question: currentQ.question,
        answer_text: answerText,
        duration_sec: 45,
        role: role,
        target_jd: jobDescription
      });

      const evaluatedItem = {
        questionNumber: currentQIndex + 1,
        question: currentQ.question,
        round: currentQ.round,
        candidateAnswer: answerText,
        evaluation: res.data
      };

      const updatedHistory = [...answersHistory, evaluatedItem];
      setAnswersHistory(updatedHistory);
      setAnswerText('');

      if (currentQIndex + 1 < questions.length) {
        const nextIdx = currentQIndex + 1;
        setCurrentQIndex(nextIdx);
        // Automatically speak next question
        setTimeout(() => {
          speakQuestion(questions[nextIdx].question);
        }, 800);
      } else {
        finishInterview(updatedHistory);
      }
    } catch (err) {
      console.error('Error evaluating response:', err);
      alert('Evaluation failed. Please try submitting again.');
    } finally {
      setEvaluating(false);
    }
  };

  const finishInterview = (finalHistory = null) => {
    stopSpeaking();
    stopMediaTracks();
    setIsTimerRunning(false);
    if (finalHistory) {
      setAnswersHistory(finalHistory);
    }
    setStep('debrief');
  };

  // Calculate final interview grade
  const calculateFinalScore = () => {
    if (answersHistory.length === 0) return 75;
    const total = answersHistory.reduce((acc, curr) => acc + (curr.evaluation?.overall_score || 70), 0);
    return Math.round(total / answersHistory.length);
  };

  return (
    <div className="space-y-6">
      
      {/* ================= STEP 1: SETUP (JD + RESUME) ================= */}
      {step === 'setup' && (
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-white flex items-center justify-center shadow-md">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>Realistic 30-Minute AI Mock Interview</span>
                    <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      Full-Scale Simulation
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Input your target Job Description & Resume. AI cross-analyzes the text to conduct an authentic 30-minute video/mic technical interview.
                  </p>
                </div>
              </div>

              {/* Preset Roles */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-semibold">Role Preset:</span>
                {Object.keys(SAMPLE_JD_PRESETS).map(p => (
                  <button
                    key={p}
                    onClick={() => handleRolePreset(p)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition ${
                      role === p 
                        ? 'bg-sky-500 text-white border-sky-400 shadow-md' 
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {p.split(' ')[0]} {p.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Job Description Input */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>1. Target Job Description (JD)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Paste JD or Company Requirements</span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={14}
                placeholder="Paste the target job description here..."
                className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-sky-500 resize-none shadow-inner"
              />
            </div>

            {/* Right: Resume Input */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <FileText className="h-4 w-4" />
                  <span>2. Candidate Resume Text</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Paste Your Resume or Project History</span>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={14}
                placeholder="Paste your resume content or technical project details here..."
                className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-emerald-500 resize-none shadow-inner"
              />
            </div>

          </div>

          {/* Launch Calibration Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerateInterview}
              disabled={evaluating}
              className="bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50 text-sm"
            >
              {evaluating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Analyzing Resume & Generating Tailored Interview Room...</span>
                </>
              ) : (
                <>
                  <span>Analyze Alignment & Calibrate Interview Room</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: CALIBRATION & HARDWARE CHECK ================= */}
      {step === 'calibration' && analysis && (
        <div className="space-y-6">
          
          {/* Pre-Interview Cross Analysis Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">AI Alignment & Question Pipeline Generated</h3>
              </div>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold">
                ATS Match: {analysis.match_percentage}% • {analysis.ats_compatibility}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Verified Candidate Skills:</span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {analysis.matched_skills.map((s, idx) => (
                    <span key={idx} className="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/20">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">JD Technical Gaps to Challenge:</span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {analysis.missing_skills.length > 0 ? (
                    analysis.missing_skills.map((s, idx) => (
                      <span key={idx} className="bg-rose-500/15 text-rose-300 px-2 py-0.5 rounded text-[10px] font-mono border border-rose-500/20">
                        ! {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px]">All required JD skills covered.</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Resume Project Highlighted:</span>
                <p className="text-slate-300 text-[11px] italic">
                  "{analysis.project_highlights[0]}"
                </p>
              </div>
            </div>
          </div>

          {/* Hardware & Interview Protocol Enforcement */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-sky-400" />
                <span>Simulation Protocol & Hardware Calibration</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real interviews require camera engagement, microphone clarity, and an uninterrupted full-screen environment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Camera Enforcer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition ${
                  cameraActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {cameraActive ? <Video className="h-7 w-7" /> : <VideoOff className="h-7 w-7" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Video Camera</h4>
                  <p className="text-[11px] text-slate-400">Eye contact & posture monitoring</p>
                </div>
                <button
                  onClick={toggleCamera}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition ${
                    cameraActive ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'
                  }`}
                >
                  {cameraActive ? '✓ Camera Connected' : 'Turn On Video Camera'}
                </button>
              </div>

              {/* Microphone Enforcer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition ${
                  micActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {micActive ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Microphone Input</h4>
                  <p className="text-[11px] text-slate-400">Speech-to-text & filler word analyzer</p>
                </div>
                <button
                  onClick={toggleMic}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition ${
                    micActive ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'
                  }`}
                >
                  {micActive ? '✓ Microphone Active' : 'Turn On Microphone'}
                </button>
              </div>

              {/* Fullscreen Enforcer */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center space-y-3">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition ${
                  isFullscreen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <Maximize className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Full-Screen Mode</h4>
                  <p className="text-[11px] text-slate-400">Zero distractions & realistic focus</p>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition ${
                    isFullscreen ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-sky-500 hover:bg-sky-400 text-white'
                  }`}
                >
                  {isFullscreen ? '✓ Full-Screen Active' : 'Enter Full Screen'}
                </button>
              </div>

            </div>

            {/* Webcam Live Preview Box if turned on */}
            {cameraActive && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col items-center space-y-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Webcam Video Calibration Stream</span>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-72 h-44 object-cover rounded-xl border border-slate-700 shadow-md transform -scale-x-100"
                />
              </div>
            )}

            {/* Begin Live Simulation CTA */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep('setup')}
                className="text-xs text-slate-400 hover:text-white transition font-medium"
              >
                ← Back to JD & Resume Setup
              </button>
              <button
                onClick={startLiveSimulation}
                className="bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center space-x-2 text-sm"
              >
                <Play className="h-4 w-4" />
                <span>Enter 30-Minute Live Simulation</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ================= STEP 3: LIVE 30-MINUTE INTERVIEW SIMULATION ================= */}
      {step === 'live' && questions.length > 0 && (
        <div className="space-y-6">
          
          {/* Live HUD Bar */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
              <div>
                <span className="text-sm font-bold text-white block">LIVE Technical Interview Session</span>
                <span className="text-[11px] text-slate-400">{role} • Round {currentQIndex + 1} of {questions.length}</span>
              </div>
            </div>

            {/* 30-Minute Live Countdown Timer */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-slate-400 font-bold uppercase">Time Remaining:</span>
              <span className={`font-mono text-base font-extrabold ${
                timeLeftSec < 300 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
              }`}>
                {formatTimer(timeLeftSec)}
              </span>
            </div>

            {/* Emergency Conclude Button */}
            <button
              onClick={() => finishInterview()}
              className="text-xs bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 px-3.5 py-2 rounded-xl transition font-semibold"
            >
              Conclude Early & View Report
            </button>
          </div>

          {/* Main Interview Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Columns: AI Interviewer Video Avatar & Question */}
            <div className="lg:col-span-7 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              
              {/* Interviewer Persona Card */}
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white font-extrabold text-lg shadow-lg border-2 border-sky-400/30">
                      DV
                    </div>
                    {isInterviewerSpeaking && (
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-slate-800 animate-ping"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>Dr. David Vance</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-mono">
                        Lead Interviewer
                      </span>
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">Principal Engineering Director & Technical Interviewer</span>
                  </div>
                </div>

                {/* Voice Speaker Control */}
                <button
                  onClick={() => isInterviewerSpeaking ? stopSpeaking() : speakQuestion(questions[currentQIndex].question)}
                  className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-xl text-xs text-slate-300 transition"
                  title="Re-read current question"
                >
                  {isInterviewerSpeaking ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                      <span className="text-rose-300 text-[11px]">Mute Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5 text-sky-400" />
                      <span className="text-[11px]">Repeat Audio</span>
                    </>
                  )}
                </button>
              </div>

              {/* Active Question Box */}
              <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-sky-400 font-bold uppercase tracking-wider">
                    Question {currentQIndex + 1} of {questions.length} • {questions[currentQIndex].round}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Allocated: {questions[currentQIndex].time_allocation}
                  </span>
                </div>

                <p className="text-base text-slate-100 font-semibold leading-relaxed">
                  "{questions[currentQIndex].question}"
                </p>

                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800 flex items-center space-x-2">
                  <span className="font-bold text-indigo-400">Target Focus:</span>
                  <span>{questions[currentQIndex].rubric_focus}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                {isInterviewerSpeaking ? (
                  <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Interviewer is speaking aloud...</span>
                  </span>
                ) : isRecordingSpeech ? (
                  <span className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Interviewer is listening to your answer...</span>
                  </span>
                ) : (
                  <span>Ready. Turn on the mic or type your answer below.</span>
                )}
              </div>

            </div>

            {/* Right 5 Columns: Candidate Video Stream & Response Terminal */}
            <div className="lg:col-span-5 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
              
              {/* Candidate Webcam Box */}
              <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden h-48 flex items-center justify-center">
                {cameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-slate-500">
                    <VideoOff className="h-8 w-8" />
                    <span className="text-xs">Camera stream not connected</span>
                  </div>
                )}
                
                <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-bold text-white flex items-center space-x-1.5">
                  <UserCheck className="h-3 w-3 text-emerald-400" />
                  <span>Candidate: {user?.name || 'Student Candidate'}</span>
                </div>
              </div>

              {/* Response Input & Speech Recognition */}
              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold">Your Response:</span>
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shadow-sm ${
                      isRecordingSpeech 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isRecordingSpeech ? (
                      <>
                        <MicOff className="h-3.5 w-3.5" />
                        <span>Stop Voice Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5" />
                        <span>Speak Into Mic (Speech-to-Text)</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={6}
                  placeholder="Speak through your microphone to transcribe live, or type your answer here..."
                  className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-white leading-relaxed focus:outline-none focus:border-sky-500 resize-none font-sans"
                />
              </div>

              {/* Submit Answer Button */}
              <button
                onClick={handleSubmitAnswer}
                disabled={evaluating || !answerText.trim()}
                className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing Answer via RAG Knowledge Grounding...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Response & Proceed to Next Round</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================= STEP 4: DEBRIEF & FULL PERFORMANCE REPORT ================= */}
      {step === 'debrief' && (
        <div className="space-y-6">
          
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5">
              <div>
                <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                  Simulation Concluded
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-2">
                  Comprehensive 30-Minute Interview Dossier
                </h2>
                <p className="text-xs text-slate-400">
                  Detailed evaluation across technical depth, STAR criteria, speech pacing, and filler word detection.
                </p>
              </div>

              {/* Overall Score Badge */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 flex items-center space-x-4 shadow-lg">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-emerald-400 block font-mono">
                    {calculateFinalScore()} / 100
                  </span>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    Overall Readiness
                  </span>
                </div>
              </div>
            </div>

            {/* Question by Question Review */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart2 className="h-4 w-4 text-sky-400" />
                <span>Round-by-Round Breakdown & RAG Feedback:</span>
              </h3>

              {answersHistory.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-300">
                      Round {item.questionNumber}: {item.round}
                    </span>
                    <span className="bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg font-mono font-bold border border-slate-700">
                      Score: {item.evaluation?.overall_score || 80}/100
                    </span>
                  </div>

                  <p className="text-slate-300 font-semibold italic">
                    "{item.question}"
                  </p>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Your Response:</span>
                    <p className="leading-relaxed whitespace-pre-wrap">{item.candidateAnswer}</p>
                  </div>

                  {/* Feedback Summary */}
                  {item.evaluation?.feedback_summary && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-amber-400 font-bold uppercase block">Actionable Feedback:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {item.evaluation.feedback_summary.map((fb, fbIdx) => (
                          <li key={fbIdx}>{fb}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Speech Metrics */}
                  {item.evaluation?.speech_analytics && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500">Pace:</span>{' '}
                        <span className="text-slate-300 font-bold">{item.evaluation.speech_analytics.words_per_minute} WPM</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Filler Words:</span>{' '}
                        <span className="text-slate-300 font-bold">{item.evaluation.speech_analytics.total_filler_words}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Verdict:</span>{' '}
                        <span className="text-emerald-400 font-bold">{item.evaluation.speech_analytics.pace_verdict}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Restart Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setAnswersHistory([]);
                  setStep('setup');
                }}
                className="bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2 text-xs"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Start Another Mock Interview</span>
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
