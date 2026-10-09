import React, { useState } from 'react';
import { Brain, Send, BookOpen, Sparkles, CheckCircle2, MessageSquare, Tag, Terminal } from 'lucide-react';
import api from '../services/api';

function FormattedMessage({ text }) {
  if (!text) return null;

  // Split by code blocks ```...```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
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
                <span className="text-slate-500 font-sans text-[10px] normal-case">Executable / Reference Code</span>
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
                if (p.startsWith('💡 ')) {
                  return (
                    <div key={pIdx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs my-2 font-medium">
                      {p}
                    </div>
                  );
                }
                if (p.startsWith('🤔 ')) {
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
      text: 'Hello! I am your Production RAG-Grounded AI Tutor. Ask me any technical question on React, Python, Data Structures, SQL, Node.js, Machine Learning, Hugging Face Agents, or System Design. I perform real vector search over our grounded knowledge corpus and cite exact sources with relevance scores.',
      citations: [
        { source: 'Generative AI & RAG Engineering Manual', topic: 'RAG Architecture & Vector Search', relevance_match: '100% Match' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('explain'); // explain | socratic
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "How do React hooks and useState work?",
    "Tell me about Hugging Face transformers and AI agents",
    "Explain SQL INNER JOIN vs LEFT JOIN with examples",
    "How does RAG architecture eliminate LLM hallucinations?",
    "Explain Node.js event loop and asynchronous I/O"
  ];

  const handleSend = async (e, customQuery = null) => {
    if (e) e.preventDefault();
    const queryText = customQuery || input;
    if (!queryText.trim()) return;

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
        grounded: res.data.grounded
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
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl flex flex-col h-[680px] overflow-hidden">
      
      {/* Tutor Room Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Real RAG AI Tutor Engine</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                TF-IDF Vector Search
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">Multi-Domain Vector Retrieval & Grounded Citations</span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button 
            onClick={() => setMode('explain')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              mode === 'explain' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Explain Mode
          </button>
          <button 
            onClick={() => setMode('socratic')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              mode === 'socratic' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Socratic Mode
          </button>
        </div>
      </div>

      {/* Sample Quick Prompt Chips */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-700/60 flex items-center space-x-2 overflow-x-auto text-[11px]">
        <span className="text-slate-400 font-bold flex items-center space-x-1 shrink-0">
          <Tag className="h-3 w-3 text-sky-400" />
          <span>Quick Prompts:</span>
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
            <div className={`max-w-2xl rounded-2xl p-4 space-y-3 text-xs leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-sky-600 text-white rounded-tr-none shadow-md' 
                : 'bg-slate-900 border border-slate-700 text-slate-200 rounded-tl-none shadow-md'
            }`}>
              {msg.sender === 'user' ? (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <FormattedMessage text={msg.text} />
              )}
              
              {/* Grounded Citations Display */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block flex items-center space-x-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Retrieved Knowledge Citations:</span>
                  </span>
                  <div className="space-y-1">
                    {msg.citations.map((c, i) => (
                      <div key={i} className="text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="h-3 w-3 text-sky-400 shrink-0" />
                          <span className="font-bold text-slate-200">{c.source}</span>
                          <span className="text-slate-400">({c.topic})</span>
                        </div>
                        {c.relevance_match && (
                          <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {c.relevance_match}
                          </span>
                        )}
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
            <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl text-xs text-slate-400 animate-pulse flex items-center space-x-2 shadow-md">
              <Sparkles className="h-4 w-4 text-sky-400 animate-spin" />
              <span>Vectorizing query, retrieving knowledge chunks & generating response...</span>
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
          placeholder="Ask any technical question (e.g. 'How do React hooks work?', 'Explain Hugging Face AI agents', 'SQL Joins')..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-400 text-white p-2.5 rounded-xl transition disabled:opacity-50 shadow-md"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
