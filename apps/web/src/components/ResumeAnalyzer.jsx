import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState(`ALEX STUDENT
student@college.edu | GitHub: github.com/alex | LinkedIn: linkedin.com/in/alex

SUMMARY
Final year Computer Science student seeking Software Engineering roles.

SKILLS
Programming: Python, JavaScript, SQL, React, HTML, CSS, Git.

PROJECTS
CourseConnect Platform: Built a web application using React and Python for student learning roadmaps.
Data Analysis Tool: Analyzed datasets using Python pandas and numpy.`);

  const [targetJd, setTargetJd] = useState(`Target Job Description: Software Engineer
Required: Python, React, Node.js, Express, SQL, Docker, AWS, System Design, REST APIs, Git.`);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/ai/resume/analyze', {
        resume_text: resumeText,
        target_jd: targetJd
      });
      setResult(res.data);
    } catch (err) {
      console.error('Resume analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">ATS Resume & Skill-Gap Analyzer</h2>
        </div>
        <p className="text-xs text-slate-300">
          Scans your resume against target job descriptions, computes ATS parser compliance scores, extracts missing keywords, and rewrites weak project bullet points using action verbs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Resume Text</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Target Job Description (JD)</label>
            <textarea
              value={targetJd}
              onChange={(e) => setTargetJd(e.target.value)}
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{loading ? 'Scanning Resume...' : 'Analyze Resume & Skill Gap'}</span>
        </button>
      </div>

      {/* Analysis Results Panel */}
      {result && (
        <div className="bg-slate-800 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span>ATS & JD Match Evaluation</span>
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">ATS Compatibility</span>
                <span className="text-xl font-extrabold text-purple-400">{result.ats_score}%</span>
              </div>
              <div className="text-right border-l border-slate-700 pl-4">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">JD Keyword Match</span>
                <span className="text-xl font-extrabold text-sky-400">{result.jd_match_percent}%</span>
              </div>
            </div>
          </div>

          {/* Missing Skills Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Identified Missing Skills</h4>
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.map((skill, i) => (
                <span key={i} className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-full font-semibold">
                  + {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Action-Verb Bullet Rewrites */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Action-Verb Bullet Optimization</h4>
            <div className="space-y-3">
              {result.sample_bullet_rewrites.map((rw, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-2 text-xs">
                  <div className="text-slate-400 line-through">
                    <strong>Before:</strong> {rw.original}
                  </div>
                  <div className="text-emerald-400 font-medium">
                    <strong>Suggested ATS Improvement:</strong> {rw.improved}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
