import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize, 
  Minimize, Video, VideoOff, Mic, MicOff, AlertTriangle, 
  Flame, CheckCircle2, Sparkles, Brain, Award, ShieldAlert,
  Clock, Coffee, Music, Zap
} from 'lucide-react';

export default function FocusModeDojo({ user }) {
  // Pomodoro States: 'work' (25 min) | 'break' (5 min)
  const [sessionType, setSessionType] = useState('work');
  const [workDuration, setWorkDuration] = useState(25); // minutes
  const [breakDuration, setBreakDuration] = useState(5);  // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Monitoring States
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Distraction & Buzzer States
  const [isDistracted, setIsDistracted] = useState(false);
  const [distractionReason, setDistractionReason] = useState('');
  const [distractionCount, setDistractionCount] = useState(0);
  const [distractionHistory, setDistractionHistory] = useState([]);
  const [buzzerEnabled, setBuzzerEnabled] = useState(true);
  
  // Audio & Ambient Sound States
  const [ambientSound, setAmbientSound] = useState('bell'); // 'bell' | 'rain' | 'mute'
  
  // Analytics
  const [completedSessions, setCompletedSessions] = useState(0);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const buzzerOscillatorRef = useRef(null);
  const monitorIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const lastCentroidRef = useRef(null);
  const headTurnCountRef = useRef(0);
  const talkingCountRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllMedia();
      stopBuzzer();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, sessionType]);

  const handleSessionComplete = () => {
    playZenBell();
    if (sessionType === 'work') {
      setCompletedSessions(prev => prev + 1);
      setSessionType('break');
      setTimeLeft(breakDuration * 60);
    } else {
      setSessionType('work');
      setTimeLeft(workDuration * 60);
    }
    setIsActive(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Hardware: Start Camera and Mic
  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 15 },
        audio: true
      });

      mediaStreamRef.current = stream;

      // Video Stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMicActive(true);

      // Web Audio API for Voice / Talking Detection
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start computer vision & sound loop
      startVisionLoop();
    } catch (err) {
      console.warn('Could not start webcam/microphone monitoring:', err);
      alert('Camera or Microphone access was denied. You can still use the Japanese Pomodoro timer manually.');
    }
  };

  const stopAllMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
    setMicActive(false);
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
  };

  // Real-time Computer Vision & Voice Monitoring
  const startVisionLoop = () => {
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);

    monitorIntervalRef.current = setInterval(() => {
      if (!isActive) return;

      checkHeadPoseAndPresence();
      checkTalkingAudio();
    }, 500); // Check every 500ms
  };

  // 1. Head Pose & Face Presence Tracking via Canvas Pixel Centroid
  const checkHeadPoseAndPresence = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, 160, 120);

    const frame = ctx.getImageData(0, 0, 160, 120);
    const data = frame.data;
    
    let totalWeight = 0;
    let sumX = 0;
    let sumY = 0;
    let skinPixelCount = 0;

    // Fast face & skin luminosity centroid detection
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Human skin hue & face luminance heuristic
      if (r > 60 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
        const pixelIdx = i / 4;
        const x = pixelIdx % 160;
        const y = Math.floor(pixelIdx / 160);

        sumX += x;
        sumY += y;
        totalWeight++;
        skinPixelCount++;
      }
    }

    // A. Check Absence (Left Desk / Frame)
    if (skinPixelCount < 40) {
      headTurnCountRef.current += 1;
      if (headTurnCountRef.current >= 4) { // > 2 seconds
        triggerDistraction("User left the camera frame or face not detected!");
      }
      return;
    }

    const currentCentroidX = sumX / totalWeight;
    const currentCentroidY = sumY / totalWeight;

    // B. Check Head Turned Sideways / Looking Down Away
    // Center is around x=80, y=60. If centroid drifts heavily to edges (<35 or >125, or y > 95), user turned head away!
    if (currentCentroidX < 35 || currentCentroidX > 125 || currentCentroidY > 95) {
      headTurnCountRef.current += 1;
      if (headTurnCountRef.current >= 4) {
        triggerDistraction("Head turned away / Looking down away from screen!");
      }
    } else {
      headTurnCountRef.current = Math.max(0, headTurnCountRef.current - 1);
      if (headTurnCountRef.current === 0 && talkingCountRef.current === 0) {
        clearDistraction();
      }
    }

    lastCentroidRef.current = { x: currentCentroidX, y: currentCentroidY };
  };

  // 2. Audio Voice / Talking Detection
  const checkTalkingAudio = () => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average energy in voice frequency range (bins 5 to 60)
    let voiceEnergy = 0;
    const startBin = 5;
    const endBin = Math.min(60, bufferLength);
    for (let i = startBin; i < endBin; i++) {
      voiceEnergy += dataArray[i];
    }
    const avgVoiceEnergy = voiceEnergy / (endBin - startBin);

    // Decibel threshold for speaking/talking (> 45 in frequency energy)
    if (avgVoiceEnergy > 45) {
      talkingCountRef.current += 1;
      if (talkingCountRef.current >= 3) { // > 1.5 seconds of speaking
        triggerDistraction("Talking detected! Maintain silence during deep focus.");
      }
    } else {
      talkingCountRef.current = Math.max(0, talkingCountRef.current - 1);
      if (talkingCountRef.current === 0 && headTurnCountRef.current === 0) {
        clearDistraction();
      }
    }
  };

  // Trigger Distraction Alarm & Loud Buzzer
  const triggerDistraction = (reason) => {
    if (!isDistracted) {
      setIsDistracted(true);
      setDistractionReason(reason);
      setDistractionCount(prev => prev + 1);
      setDistractionHistory(prev => [
        { time: new Date().toLocaleTimeString(), reason },
        ...prev.slice(0, 7)
      ]);
      playBuzzerSound();
    }
  };

  const clearDistraction = () => {
    if (isDistracted) {
      setIsDistracted(false);
      setDistractionReason('');
      stopBuzzer();
    }
  };

  // Loud Synthesized Buzzer Alarm using Web Audio API
  const playBuzzerSound = () => {
    if (!buzzerEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioContextRef.current || new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // Pulsing Sawtooth Alarm Tone at 880Hz / 440Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio alarm playback error:', e);
    }
  };

  const stopBuzzer = () => {
    if (buzzerOscillatorRef.current) {
      try {
        buzzerOscillatorRef.current.stop();
      } catch (e) {}
      buzzerOscillatorRef.current = null;
    }
  };

  // Zen Tibetan Bell Chime for session completion
  const playZenBell = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioContextRef.current || new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528Hz Solfeggio Love/Miracle frequency
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.5);
    } catch (e) {}
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const startSession = () => {
    if (!cameraActive) {
      startMonitoring();
    }
    setIsActive(true);
  };

  const pauseSession = () => {
    setIsActive(false);
    clearDistraction();
  };

  const resetSession = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'work' ? workDuration * 60 : breakDuration * 60);
    clearDistraction();
  };

  const efficiencyScore = Math.max(0, 100 - (distractionCount * 4));

  return (
    <div className={`space-y-6 transition-all duration-300 ${
      isDistracted ? 'ring-8 ring-rose-600 rounded-3xl animate-pulse' : ''
    }`}>
      
      {/* Full-Screen Buzzer Alert Banner if Distracted */}
      {isDistracted && (
        <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white animate-bounce">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-yellow-300 animate-spin" />
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wider">
                ⚠️ DISTRACTION DETECTED — LOUD BUZZER SOUNDING!
              </h3>
              <p className="text-xs text-rose-100 font-semibold">
                Reason: {distractionReason} Look back at the screen & maintain focus!
              </p>
            </div>
          </div>
          <button 
            onClick={clearDistraction}
            className="bg-white text-rose-600 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md hover:bg-rose-100 transition"
          >
            I am Refocused
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg font-bold text-lg">
            集中
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Japanese Pomodoro & Focus Dojo</span>
              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
                Kaizen 改善
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deep study immersion with AI head-turn tracking, voice monitoring, and instant distraction buzzer alarm.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Buzzer Sound Toggle */}
          <button
            onClick={() => setBuzzerEnabled(!buzzerEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
              buzzerEnabled 
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' 
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            {buzzerEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Buzzer Alarm: {buzzerEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 font-semibold flex items-center space-x-1.5 transition"
          >
            <Maximize className="h-3.5 w-3.5" />
            <span>Full Screen</span>
          </button>
        </div>
      </div>

      {/* Main Focus Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols: Zen Timer & Meditation Dojo */}
        <div className="lg:col-span-8 bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-between text-center space-y-6 relative overflow-hidden">
          
          {/* Zen Kanji Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-9xl font-extrabold select-none">
            {sessionType === 'work' ? '集中' : '休憩'}
          </div>

          {/* Session Switcher Pills */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-700 z-10">
            <button
              onClick={() => {
                setSessionType('work');
                setTimeLeft(workDuration * 60);
                setIsActive(false);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                sessionType === 'work' 
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Deep Focus (25m)</span>
            </button>
            <button
              onClick={() => {
                setSessionType('break');
                setTimeLeft(breakDuration * 60);
                setIsActive(false);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                sessionType === 'break' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee className="h-3.5 w-3.5" />
              <span>Zen Break (5m)</span>
            </button>
          </div>

          {/* Large Zen Clock */}
          <div className="relative my-4 z-10">
            <div className={`h-64 w-64 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${
              isDistracted
                ? 'border-rose-500 bg-rose-500/10'
                : (sessionType === 'work' ? 'border-amber-400/80 bg-slate-900/90' : 'border-emerald-400/80 bg-slate-900/90')
            }`}>
              <span className={`text-6xl font-extrabold font-mono tracking-tight ${
                isDistracted ? 'text-rose-400' : 'text-white'
              }`}>
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">
                {sessionType === 'work' ? 'Shūchū 集中 • Deep Focus' : 'Kyūkei 休憩 • Mindful Break'}
              </span>
              <span className="text-[11px] text-amber-400 font-mono mt-1">
                Completed: {completedSessions} 🍵
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center space-x-3 z-10">
            {isActive ? (
              <button
                onClick={pauseSession}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 transition shadow-md"
              >
                <Pause className="h-4 w-4" />
                <span>Pause Session</span>
              </button>
            ) : (
              <button
                onClick={startSession}
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center space-x-2 transition shadow-lg"
              >
                <Play className="h-4 w-4" />
                <span>Begin Kaizen Study</span>
              </button>
            )}

            <button
              onClick={resetSession}
              className="bg-slate-900 hover:bg-slate-700 text-slate-300 p-3.5 rounded-2xl border border-slate-700 transition"
              title="Reset Timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Ambient Bell Tone Player */}
          <div className="text-xs text-slate-400 flex items-center space-x-3 z-10 pt-2">
            <span>Tibetan Singing Bowl Bell:</span>
            <button
              onClick={playZenBell}
              className="text-amber-400 hover:text-amber-300 font-semibold underline text-xs"
            >
              🔔 Ring 528Hz Chime
            </button>
          </div>

        </div>

        {/* Right 4 Cols: AI Distraction Monitor & Camera */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* AI Guardian Camera Box */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>AI Focus Guardian</span>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                cameraActive 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {cameraActive ? '● Guardian Active' : 'Offline'}
              </span>
            </div>

            {/* Camera Preview */}
            <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden h-44 flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Virtual Tracking Reticle */}
                  <div className="absolute inset-0 pointer-events-none border border-emerald-400/30 rounded-2xl m-4 flex items-center justify-center">
                    <div className="h-10 w-10 border border-dashed border-emerald-400/60 rounded-full animate-ping"></div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-slate-500">
                  <VideoOff className="h-7 w-7" />
                  <span className="text-xs">Camera tracking inactive</span>
                </div>
              )}
            </div>

            {/* Hidden canvas for pixel analysis */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Connect Camera & Mic Button */}
            {!cameraActive && (
              <button
                onClick={startMonitoring}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition shadow-md"
              >
                Connect Camera & Voice Guardian
              </button>
            )}

            {/* Focus Efficiency Score */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Focus Efficiency:</span>
                <span className="font-extrabold text-emerald-400 font-mono text-sm">
                  {efficiencyScore}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${efficiencyScore}%` }}
                />
              </div>
            </div>

            {/* Distraction Counter */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Distraction Interruptions:</span>
              <span className={`font-mono font-extrabold text-sm px-2 py-0.5 rounded ${
                distractionCount === 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {distractionCount}
              </span>
            </div>

            {/* Distraction History Log */}
            {distractionHistory.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Incident Log:
                </span>
                <div className="space-y-1 max-h-24 overflow-y-auto text-[11px]">
                  {distractionHistory.map((d, i) => (
                    <div key={i} className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-rose-300 flex items-center justify-between">
                      <span className="truncate">{d.reason}</span>
                      <span className="text-slate-500 font-mono text-[9px] shrink-0 ml-1">{d.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
