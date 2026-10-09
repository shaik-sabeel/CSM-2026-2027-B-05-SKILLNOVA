import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, Clock, CheckCircle, ExternalLink, 
  AlertTriangle, RefreshCw, ShieldAlert, CheckSquare, Square, 
  FolderGit2, Award, CheckCircle2, Star, Layers, PieChart 
} from 'lucide-react';
import api from '../services/api';

export default function RoadmapView({ wbiBand, user }) {
  const [skillInput, setSkillInput] = useState(user?.targetRole || 'Python Developer');
  const [level, setLevel] = useState('beginner');
  const [weeks, setWeeks] = useState(8);
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [activeTopicResources, setActiveTopicResources] = useState(null);
  const [activeTopicName, setActiveTopicName] = useState('');
  const [loadingTopicId, setLoadingTopicId] = useState(null);

  useEffect(() => {
    fetchUserRoadmaps();
  }, []);

  const fetchUserRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmaps');
      if (res.data && res.data.length > 0) {
        setRoadmap(res.data[res.data.length - 1]);
      } else {
        handleGenerateRoadmap();
      }
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
      handleGenerateRoadmap();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.post('/roadmaps', {
        skill: skillInput,
        level: level,
        total_weeks: weeks,
        hours_per_week: 10,
        wellbeing_band: wbiBand
      });
      setRoadmap(res.data);
      setActiveTopicResources(null);
    } catch (err) {
      console.error('Roadmap generator error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicStatus = async (phaseNum, topicId) => {
    if (!roadmap) return;
    
    // Calculate new status
    const currentTopic = roadmap.phases
      .flatMap(p => p.topics)
      .find(t => t.id === topicId);
    
    const newStatus = currentTopic?.status === 'completed' ? 'pending' : 'completed';

    try {
      const res = await api.patch(`/roadmaps/${roadmap.id}/topics/${topicId}`, {
        status: newStatus
      });
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error('Failed to sync topic status:', err);
    }
  };

  const handleSelectProject = async (phaseNum, projectId) => {
    if (!roadmap) return;
    try {
      const res = await api.patch(`/roadmaps/${roadmap.id}/phases/${phaseNum}/select-project`, {
        project_id: projectId
      });
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error('Failed to select project:', err);
    }
  };

  const fetchResourcesForTopic = async (topicId, topicName, queries) => {
    setLoadingTopicId(topicId);
    setActiveTopicName(topicName);
    try {
      const res = await api.post('/resources/resolve', { queries });
      setActiveTopicResources(res.data);
    } catch (err) {
      console.error('Resource engine error:', err);
    } finally {
      setLoadingTopicId(null);
    }
  };

  const handleAdaptForStress = async () => {
    if (!roadmap) return;
    setLoading(true);
    try {
      const res = await api.post('http://127.0.0.1:8000/ai/planner/replan', {
        roadmap: roadmap,
        wbi_score: 55.0,
        wbi_band: 'Amber'
      });
      setRoadmap(res.data);
    } catch (err) {
      console.error('Adapt planner error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate course completion metrics
  let totalTopics = 0;
  let completedTopics = 0;
  let totalHours = 0;
  let completedHours = 0;

  if (roadmap && roadmap.phases) {
    roadmap.phases.forEach(phase => {
      phase.topics.forEach(t => {
        totalTopics++;
        totalHours += (t.est_hours || 5);
        if (t.status === 'completed') {
          completedTopics++;
          completedHours += (t.est_hours || 5);
        }
      });
    });
  }

  const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header & Skill Input */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-sky-400" />
          <h2 className="text-xl font-bold text-white">Skill Roadmap Engine & Course Tracker</h2>
        </div>
        <p className="text-xs text-slate-300">
          Generates a beginner step-by-step roadmap for any skill. Tracks <strong>percentage completed</strong>, <strong>finished sections & study hours</strong>, pre-resolved NPTEL/Coursera links, and <strong>recommends target capstone projects</strong> upon section completion!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Target Skill / Role</label>
            <input 
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. Python Developer, Data Analyst, Web Development"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Starting Level</label>
            <select 
              value={level} 
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="beginner">Absolute Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (Weeks)</label>
            <input 
              type="number"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              min={4} max={24}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button 
            onClick={handleGenerateRoadmap}
            disabled={loading}
            className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{loading ? 'Generating Roadmap...' : 'Generate Step-by-Step Roadmap'}</span>
          </button>

          <button 
            onClick={handleAdaptForStress}
            className="bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center space-x-2"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Simulate Wellbeing Re-balancer (-30% Load)</span>
          </button>
        </div>
      </div>

      {/* Course Completion & Progress Metrics Bar */}
      {roadmap && (
        <div className="bg-slate-800/90 border border-sky-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-sky-400" />
              <span>Overall Course Completion Progress</span>
            </h3>
            <span className="text-2xl font-extrabold text-sky-400">{completionPct}% Completed</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/60 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Sections Finished</span>
              <span className="text-base font-bold text-white">{completedTopics} / {totalTopics} Sections Completed</span>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Study Hours</span>
              <span className="text-base font-bold text-white">{completedHours} / {totalHours} Hours Finished</span>
            </div>
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Phase</span>
              <span className="text-base font-bold text-emerald-400">Phase 1 Foundations</span>
            </div>
          </div>
        </div>
      )}

      {/* Wellbeing Adjustment Notice */}
      {roadmap?.wellbeing_adjusted && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 text-xs text-amber-300 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Wellbeing-Aware Planner Active</span>
            <span>{roadmap.adjustment_reason}</span>
          </div>
        </div>
      )}

      {/* Roadmap Graph & Topic Breakdown */}
      {roadmap && (
        <div className="space-y-6">
          {roadmap.phases.map((phase) => (
            <div key={phase.phase_num} className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                    Weeks {phase.weeks.join(' - ')}
                  </span>
                  <h3 className="text-lg font-bold text-white">{phase.title}</h3>
                </div>
                <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full font-semibold">
                  {phase.topics.length} Sections
                </span>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phase.topics.map((topic) => (
                  <div key={topic.id} className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2.5">
                          <button 
                            onClick={() => toggleTopicStatus(phase.phase_num, topic.id)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                          >
                            {topic.status === 'completed' ? (
                              <CheckSquare className="h-5 w-5 text-emerald-400" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </button>
                          <div>
                            <h4 className={`text-sm font-bold transition ${topic.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                              {topic.name}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                              <Clock className="h-3 w-3 text-sky-400" />
                              <span>Est. {topic.est_hours} hrs</span>
                            </div>
                          </div>
                        </div>
                        
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                          topic.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-800 text-sky-400 border-sky-500/20'
                        }`}>
                          {topic.status === 'completed' ? 'Completed ✓' : 'Pending ⏳'}
                        </span>
                      </div>

                      {/* Subtopics List */}
                      {topic.subtopics && topic.subtopics.length > 0 && (
                        <div className="pl-7 pt-1 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Key Concepts:</span>
                          <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                            {topic.subtopics.map((sub, sidx) => (
                              <li key={sidx}>{sub}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Pre-Resolved Quick Badges & Resource Action Button */}
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 font-semibold">YouTube</span>
                        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold">NPTEL</span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">Coursera</span>
                        <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-semibold">Udemy</span>
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-semibold">GitHub</span>
                      </div>

                      <button 
                        onClick={() => fetchResourcesForTopic(topic.id, topic.name, topic.resource_queries || [topic.name])}
                        disabled={loadingTopicId === topic.id}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-sky-400 text-[11px] font-semibold py-2 rounded-lg border border-sky-500/30 transition flex items-center justify-center space-x-1.5"
                      >
                        {loadingTopicId === topic.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5 text-sky-400" />
                        )}
                        <span>{loadingTopicId === topic.id ? 'Fetching Links...' : 'View NPTEL, Coursera, Udemy & YouTube Resources'}</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Dynamic Capstone Project Recommendation Box */}
              {phase.project_options && phase.project_options.length > 0 && (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/40 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
                    <div className="flex items-center space-x-2">
                      <FolderGit2 className="h-5 w-5 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white">
                        Recommended Industry Capstone Projects for {phase.title.split(':')[0]}
                      </h4>
                    </div>
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
                      User Selection Mode
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    After mastering the sections in this phase, select which tailored project option you want to build for your placement portfolio:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phase.project_options.map((proj) => (
                      <div 
                        key={proj.id} 
                        className={`bg-slate-900/90 border p-4 rounded-xl space-y-3 flex flex-col justify-between transition ${
                          phase.project_selected === proj.id 
                            ? 'border-emerald-500 bg-emerald-500/5 shadow-lg' 
                            : 'border-slate-700/80 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{proj.title}</span>
                            <span className="text-[10px] bg-slate-800 text-sky-400 px-2 py-0.5 rounded font-semibold border border-sky-500/20">
                              {proj.difficulty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                          
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.key_features.map((feat, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                ✓ {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                          <a 
                            href={proj.github_template} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[11px] text-sky-400 hover:underline flex items-center space-x-1 font-semibold"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>GitHub Starter Template</span>
                          </a>

                          <button 
                            onClick={() => handleSelectProject(phase.phase_num, proj.id)}
                            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                              phase.project_selected === proj.id 
                                ? 'bg-emerald-500 text-white shadow-md' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {phase.project_selected === proj.id ? 'Selected ✓' : 'Select Project'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Resolved Learning Resources Modal */}
      {activeTopicResources && (
        <div className="bg-slate-800 border-2 border-sky-500/50 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ExternalLink className="h-5 w-5 text-sky-400" />
                <span>Verified Learning Resources for '{activeTopicName}'</span>
              </h3>
              <span className="text-xs text-slate-400">Direct working links for NPTEL, Coursera, Udemy, YouTube & GitHub</span>
            </div>
            <button 
              onClick={() => setActiveTopicResources(null)}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
            >
              Close Panel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeTopicResources.map((res, i) => (
              <a 
                key={i} 
                href={res.url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-slate-900 border border-slate-700 hover:border-sky-500/50 p-4 rounded-xl transition space-y-2 block group hover:shadow-lg"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                    {res.provider}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{res.type}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition line-clamp-2">
                  {res.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>Rating: ⭐ {res.rating} / 5.0</span>
                  <span className={`font-semibold ${res.is_free ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {res.is_free ? 'FREE Access' : 'Paid Course'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
