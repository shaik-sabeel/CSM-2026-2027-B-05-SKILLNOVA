import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import RoadmapView from './components/RoadmapView';
import AITutor from './components/AITutor';
import MockInterview from './components/MockInterview';
import FocusModeDojo from './components/FocusModeDojo';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Quizzes from './components/Quizzes';
import WellbeingHub from './components/WellbeingHub';
import CounsellorDashboard from './components/CounsellorDashboard';
import AuthModal from './components/AuthModal';
import AuthGate from './components/AuthGate';
import api from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [wbiBand, setWbiBand] = useState('Unassessed');
  const [wbiScore, setWbiScore] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Check auth state on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const token = localStorage.getItem('courseconnect_token');
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      await syncUserWellbeing();
    } catch (err) {
      console.error('Failed to verify token:', err);
      localStorage.removeItem('courseconnect_token');
      localStorage.removeItem('courseconnect_user');
      setUser(null);
      setWbiBand('Unassessed');
      setWbiScore(null);
    }
  };

  const syncUserWellbeing = async () => {
    try {
      const checkinsRes = await api.get('/checkins');
      if (checkinsRes.data && checkinsRes.data.length > 0) {
        const latest = checkinsRes.data[checkinsRes.data.length - 1];
        setWbiBand(latest.wellbeing_analysis?.band || 'Green');
        setWbiScore(latest.wellbeing_analysis?.wbi_score ?? 25);
      } else {
        setWbiBand('Unassessed');
        setWbiScore(null);
      }
    } catch (e) {
      setWbiBand('Unassessed');
      setWbiScore(null);
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = async (userData, token) => {
    setUser(userData);
    await syncUserWellbeing();
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('courseconnect_token');
    localStorage.removeItem('courseconnect_user');
    setUser(null);
    setWbiBand('Unassessed');
    setWbiScore(null);
    setActiveTab('landing');
  };

  const getFeatureLabel = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Student Career Dashboard';
      case 'roadmap': return 'Skill Roadmap Generator';
      case 'tutor': return 'Production RAG AI Tutor';
      case 'interview': return '30-Minute AI Mock Interview';
      case 'focus': return 'Japanese Pomodoro Focus Dojo';
      case 'resume': return 'AI Resume & ATS Analyzer';
      case 'quizzes': return 'Adaptive Technical Quizzes';
      case 'wellbeing': return 'Mental Wellbeing Sanctuary';
      case 'counsellor': return 'Cohort Counsellor Analytics';
      default: return 'Platform Features';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        wbiBand={wbiBand} 
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Landing Page is public */}
        {activeTab === 'landing' && (
          <LandingPage 
            onGetStarted={() => setActiveTab('dashboard')} 
            onOpenAuth={handleOpenAuth}
            user={user}
          />
        )}

        {/* Auth Gate: If unauthenticated guest tries to access any feature */}
        {!user && activeTab !== 'landing' && (
          <AuthGate 
            onOpenAuth={handleOpenAuth} 
            featureName={getFeatureLabel(activeTab)} 
          />
        )}

        {/* Authenticated Platform Features */}
        {user && (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard 
                setActiveTab={setActiveTab} 
                wbiBand={wbiBand} 
                wbiScore={wbiScore} 
                user={user}
                onOpenAuth={handleOpenAuth}
              />
            )}
            {activeTab === 'roadmap' && <RoadmapView wbiBand={wbiBand} user={user} />}
            {activeTab === 'tutor' && <AITutor user={user} />}
            {activeTab === 'interview' && <MockInterview user={user} />}
            {activeTab === 'focus' && <FocusModeDojo user={user} />}
            {activeTab === 'resume' && <ResumeAnalyzer user={user} />}
            {activeTab === 'quizzes' && <Quizzes user={user} />}
            {activeTab === 'wellbeing' && (
              <WellbeingHub 
                wbiBand={wbiBand} 
                setWbiBand={setWbiBand} 
                wbiScore={wbiScore} 
                setWbiScore={setWbiScore} 
                user={user}
              />
            )}
            {activeTab === 'counsellor' && <CounsellorDashboard user={user} />}
          </>
        )}
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CourseConnect AI Platform - Unified Student Ecosystem (EdTech + HealthTech)</span>
          <span className="text-slate-400 font-medium">Built with React, FastAPI, Hugging Face, Scikit-Learn & Node.js</span>
        </div>
      </footer>
    </div>
  );
}
