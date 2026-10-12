import React, { useState } from 'react';
import { 
  Brain, Send, BookOpen, Sparkles, CheckCircle2, 
  Tag, Terminal, Volume2, VolumeX, Copy, Check, ExternalLink, Zap
} from 'lucide-react';
import api from '../services/api';

function FormattedMessage({ text }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!text) return null;

  const handleCopy = (codeStr, idx) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Split by code blocks ```...```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const raw = part.slice(3, -3).trim();
          const lines = raw.split('\n');
          const firstLine = lines[0].trim().toLowerCase();
          const knownLangs = ['javascript', 'python', 'sql', 'json', 'html', 'bash', 'ts', 'js', 'py'];
          const isLang = knownLangs.includes(firstLine);
          const lang = isLang ? firstLine : 'code';
          const code = isLang ? lines.slice(1).join('\n') : raw;

          return (
            <div key={idx} className="my-2.5 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px] shadow-lg">
              <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 text-[10px] text-sky-400 font-bold uppercase tracking-wider flex justify-between items-center">
                <span className="flex items-center space-x-1.5">
                  <Terminal className="h-3 w-3 text-sky-400" />
                  <span>{lang}</span>
                </span>
                <button
                  onClick={() => handleCopy(code, idx)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition text-[10px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 font-sans"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-sky-200 overflow-x-auto whitespace-pre leading-relaxed selection:bg-sky-500/30">
                {code}
              </pre>
            </div>
          );
        } else {
          const paragraphs = part.split('\n\n');
          return (
            <div key={idx} className="space-y-2">
              {paragraphs.map((p, pIdx) => {
                if (p.startsWith('### ')) {
                  return (
                    <h4 key={pIdx} className="text-sm font-bold text-sky-300 mt-2 mb-1 border-b border-slate-800 pb-1">
                      {p.replace('### ', '')}
                    </h4>
                  );
                }
                if (p.startsWith('#### ')) {
                  return (
                    <h5 key={pIdx} className="text-xs font-bold text-indigo-300 mt-2 mb-1">
                      {p.replace('#### ', '')}
                    </h5>
                  );
                }
                if (p.startsWith('💡 ')) {
                  return (
                    <div key={pIdx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs my-2 font-medium">
                      {p}
                    </div>
                  );
                }
                if (p.startsWith('🎯 ') || p.startsWith('🤔 ')) {
                  return (
                    <div key={pIdx} className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs my-2 font-medium">
                      {p}
                    </div>
                  );
                }
                return (
                  <p key={pIdx} className="whitespace-pre-wrap text-slate-200 text-xs leading-relaxed">
                    {p}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

export default function AITutor({ user }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: '### 🚀 Welcome to your Production RAG-Grounded AI Tutor\n\nI am connected to CourseConnect\'s multi-domain knowledge corpus spanning Frontend, Backend, Algorithms, Databases, System Design, AI/ML, and DevOps.\n\nAsk me any concept, architectural dilemma, or viva question. I will vectorize your query, retrieve verified technical chunks, and synthesize grounded responses with executable code and authoritative citations!',
      citations: [
        { 
          source: 'MIT OpenCourseWare & Meta AI Research', 
          topic: 'Computer Science Architecture & RAG Retrieval', 
          relevance_match: '100% Match',
          url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/' 
        }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('explain'); // explain | socratic | quick_revision
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const samplePrompts = [
    "How do React hooks and useState work?",
    "Explain Binary Search algorithm and Big-O complexity",
    "Explain SQL INNER JOIN vs LEFT JOIN with practical queries",
    "How does RAG architecture eliminate LLM hallucinations?",
    "Explain Node.js event loop and asynchronous I/O",
    "What is the CAP Theorem and how does Redis caching scale systems?",
    "Explain Docker containerization vs Virtual Machines"
  ];

  const handleSpeechToggle = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip code blocks and markdown symbols for clean speech
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Code example omitted for audio playback.')
      .replace(/[#*`_]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const queryText = customQuery || input;
    if (!queryText.trim()) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const userMsg = { sender: 'user', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/tutor/chat', {
        query: queryText,
        mode: mode,
        topic: 'Computer Science & Software Engineering'
      });

      const aiMsg = {
        sender: 'ai',
        text: res.data.answer,
        citations: res.data.citations,
        grounded: res.data.grounded,
        top_topic: res.data.top_topic,
        domain: res.data.domain
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Tutor chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Unable to connect to RAG Tutor API. Please ensure the backend microservices are active on localhost.',
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl flex flex-col h-[740px] overflow-hidden">
      
      {/* Tutor Room Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-md">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Production RAG AI Tutor Engine</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                TF-IDF + Cosine Retrieval
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">Multi-Resource Vector Search • Grounded Academic & Industry Citations</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
          <button 
            onClick={() => setMode('explain')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              mode === 'explain' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Deep Dive
          </button>
          <button 
            onClick={() => setMode('socratic')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              mode === 'socratic' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Socratic Mentor
          </button>
          <button 
            onClick={() => setMode('quick_revision')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              mode === 'quick_revision' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quick Revision
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-700/60 flex items-center space-x-2 overflow-x-auto text-[11px] scrollbar-thin">
        <span className="text-slate-400 font-bold flex items-center space-x-1 shrink-0">
          <Tag className="h-3 w-3 text-sky-400" />
          <span>Popular Technical Topics:</span>
        </span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={(e) => handleSend(e, prompt)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-sky-300 px-2.5 py-1 rounded-full border border-slate-700 shrink-0 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl rounded-2xl p-4 space-y-3 text-xs leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-sky-600 text-white rounded-tr-none shadow-md' 
                : 'bg-slate-900 border border-slate-700 text-slate-200 rounded-tl-none shadow-md'
            }`}>
              
              {/* Header with audio TTS button for AI messages */}
              {msg.sender === 'ai' && (
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>RAG Verified Grounding</span>
                  </span>
                  <button
                    onClick={() => handleSpeechToggle(msg.text)}
                    className="text-slate-400 hover:text-sky-400 text-[10px] flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 transition"
                    title={isSpeaking ? "Stop Audio" : "Listen to Explanation"}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="h-3 w-3 text-rose-400 animate-pulse" />
                        <span className="text-rose-400">Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3 text-sky-400" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {msg.sender === 'user' ? (
                <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
              ) : (
                <FormattedMessage text={msg.text} />
              )}
              
              {/* Grounded Citations Display */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Retrieved Authoritative Resources:</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {msg.citations.map((c, i) => (
                      <div key={i} className="text-[10px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <BookOpen className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-slate-200 block truncate">{c.source}</span>
                            <span className="text-slate-400 text-[9px] block truncate">{c.topic}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {c.relevance_match && (
                            <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[9px]">
                              {c.relevance_match}
                            </span>
                          )}
                          {c.url && (
                            <a 
                              href={c.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-sky-400 p-1 rounded hover:bg-slate-800 transition"
                              title="Open verified source in new tab"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-xs text-slate-300 animate-pulse flex items-center space-x-2.5 shadow-md">
              <Sparkles className="h-4 w-4 text-sky-400 animate-spin" />
              <span>Querying vector matrix, retrieving domain resources & generating grounded explanation...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => handleSend(e)} className="p-4 bg-slate-900 border-t border-slate-700 flex items-center space-x-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any technical concept or viva question (e.g. 'Explain Binary Search', 'How does Redis scale systems?')..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-inner"
        />
        <button 
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-sky-500 hover:bg-sky-400 text-white p-2.5 rounded-xl transition disabled:opacity-50 shadow-md font-bold"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
