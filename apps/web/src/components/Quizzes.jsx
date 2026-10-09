import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function Quizzes() {
  const [topicInput, setTopicInput] = useState('Python');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  
  const [quizState, setQuizState] = useState({
    active: false,
    questionIndex: 0,
    score: 0,
    completed: false
  });

  const handleGenerateQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.post('/quizzes/generate', {
        topic: topicInput,
        difficulty: difficulty
      });

      setQuizData(res.data);
      setQuizState({ active: true, questionIndex: 0, score: 0, completed: false });
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (index) => {
    if (!quizData) return;

    const isCorrect = index === quizData.questions[quizState.questionIndex].answer;
    const nextScore = isCorrect ? quizState.score + 1 : quizState.score;

    if (quizState.questionIndex + 1 < quizData.questions.length) {
      setQuizState({ ...quizState, questionIndex: quizState.questionIndex + 1, score: nextScore });
    } else {
      setQuizState({ ...quizState, score: nextScore, completed: true });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Topic Selector */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Dynamic AI Quiz Generator</h2>
        </div>
        <p className="text-xs text-slate-300">
          Select or type any topic. CourseConnect dynamically generates questions, evaluates answers, and updates topic mastery scores.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Quiz Topic</label>
            <input 
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Python, SQL, React, Data Structures"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleGenerateQuiz}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{loading ? 'Generating Quiz...' : 'Generate Dynamic AI Quiz'}</span>
        </button>
      </div>

      {/* Active Quiz Card */}
      {quizData && quizState.active && !quizState.completed && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-700 pb-3">
            <span>Question {quizState.questionIndex + 1} of {quizData.questions.length}</span>
            <span className="text-amber-400 font-bold">Topic: {quizData.topic}</span>
          </div>

          <h3 className="text-base font-bold text-white">
            {quizData.questions[quizState.questionIndex].question}
          </h3>

          <div className="space-y-2.5 pt-2">
            {quizData.questions[quizState.questionIndex].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(i)}
                className="w-full bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 p-3.5 rounded-xl text-left text-xs font-medium text-slate-200 transition flex items-center justify-between group"
              >
                <span>{opt}</span>
                <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Completion Summary */}
      {quizData && quizState.completed && (
        <div className="bg-slate-800 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <span>Quiz Complete!</span>
          </h3>
          <p className="text-sm text-slate-300">
            You scored <strong>{quizState.score} / {quizData.questions.length}</strong> on <em>{quizData.topic}</em>. Topic mastery updated!
          </p>
          <button 
            onClick={() => setQuizData(null)}
            className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Create Another Quiz
          </button>
        </div>
      )}

    </div>
  );
}
