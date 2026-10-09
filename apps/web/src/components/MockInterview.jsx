import React, { useState } from 'react';
import { Video, Mic, Award, CheckCircle, RefreshCw, Github, Code, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function MockInterview() {
  const [role, setRole] = useState('Software Engineer');
  const [mode, setMode] = useState('standard'); // 'standard' | 'repo'
  const [repoUrl, setRepoUrl] = useState('https://github.com/shaik-sabeel/LearnMateAI-');
  const [repoAnalysis, setRepoAnalysis] = useState(null);
  const [question, setQuestion] = useState('How do you handle hash collisions in a hash map, and what are the time complexity trade-offs?');
  const [answerText, setAnswerText] = useState('');
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyzeRepo = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/repo/analyze', { repo_url: repoUrl });
      setRepoAnalysis(res.data);
      if (res.data.tailored_questions && res.data.tailored_questions.length > 0) {
        setQuestion(res.data.tailored_questions[0]);
      }
    } catch (err) {
      console.error('Repo analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. You can type your response below.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setRecording(true);
    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + ' ';
      }
      setAnswerText(currentTranscript);
    };
    recognition.onend = () => setRecording(false);
    recognition.start();
  };

  const handleEvaluate = async () => {
    if (!answerText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/interview/evaluate', {
        question,
        answer_text: answerText,
        duration_sec: 45
      });
      setReport(res.data);
    } catch (err) {
      console.error('Interview evaluation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Mode Switcher */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">AI Mock Interview Room</h2>
          </div>
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold">
            USP Feature: GitHub Repo Interviewer Active
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Practice role-based technical rounds or paste ANY public GitHub project URL to generate <strong>codebase-aware technical questions specifically about YOUR project code!</strong>
        </p>

        {/* Mode Selector */}
        <div className="flex space-x-2 pt-1">
          <button
            onClick={() => setMode('standard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              mode === 'standard'
                ? 'bg-sky-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            Standard Role Round
          </button>
          <button
            onClick={() => setMode('repo')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              mode === 'repo'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <Github className="h-4 w-4 text-purple-300" />
            <span>GitHub Repository-Aware Round (USP)</span>
          </button>
        </div>

        {/* GitHub Repo Input Mode */}
        {mode === 'repo' && (
          <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-xl space-y-3">
            <label className="block text-xs font-semibold text-purple-300">
              Paste GitHub Repository URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                onClick={handleAnalyzeRepo}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Fetch & Generate Repo Questions</span>
              </button>
            </div>

            {repoAnalysis && (
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">Repository: {repoAnalysis.repo_name} ({repoAnalysis.language})</span>
                <p className="text-[11px] text-slate-400">{repoAnalysis.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Question Box */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-xl space-y-2">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            {mode === 'repo' ? 'Codebase-Aware Technical Question' : 'Technical Question'}
          </span>
          <h3 className="text-base font-bold text-white">{question}</h3>
        </div>

        {/* Response Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Your Response (Speak or Type)</span>
            {recording && <span className="text-red-400 animate-pulse flex items-center space-x-1"><Mic className="h-3.5 w-3.5" /> Recording voice...</span>}
          </div>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            rows={5}
            placeholder="Click 'Record Answer with Mic' or type your response here..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={startSpeechRecognition}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center space-x-2 ${
              recording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>{recording ? 'Recording... Speak now' : 'Record Answer with Mic'}</span>
          </button>

          <button 
            onClick={handleEvaluate}
            disabled={loading || !answerText.trim()}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
            <span>{loading ? 'Evaluating...' : 'Submit & Analyze Response'}</span>
          </button>
        </div>
      </div>

      {/* Interview Feedback Report Card */}
      {report && (
        <div className="bg-slate-800 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Award className="h-5 w-5 text-emerald-400" />
              <span>AI Interview Feedback Report</span>
            </h3>
            <span className="text-xl font-extrabold text-emerald-400">
              {report.overall_score} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Correctness</span>
              <span className="text-lg font-bold text-white">{report.scores.technical_correctness} / 5</span>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">STAR Structure</span>
              <span className="text-lg font-bold text-white">{report.scores.star_structure} / 5</span>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Pace (WPM)</span>
              <span className="text-lg font-bold text-white">{report.speech_analytics.words_per_minute} WPM</span>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block">Fillers Detected</span>
              <span className="text-lg font-bold text-amber-400">{report.speech_analytics.total_filler_words}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detailed Feedback</h4>
            <div className="space-y-2">
              {report.feedback_summary.map((item, i) => (
                <div key={i} className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
