import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import RoadmapView from './components/RoadmapView';
import AITutor from './components/AITutor';
import MockInterview from './components/MockInterview';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Quizzes from './components/Quizzes';
import WellbeingHub from './components/WellbeingHub';
import CounsellorDashboard from './components/CounsellorDashboard';
import AuthModal from './components/AuthModal';
import api from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [wbiBand, setWbiBand] = useState('Green');
  const [wbiScore, setWbiScore] = useState(24.5);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
    } catch (err) {
      console.error('Failed to verify token:', err);
      localStorage.removeItem('courseconnect_token');
      localStorage.removeItem('courseconnect_user');
      setUser(null);
    }
  };

  const handleAuthSuccess = (userData, token) => {
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('courseconnect_token');
    localStorage.removeItem('courseconnect_user');
    setUser(null);
    setActiveTab('landing');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        wbiBand={wbiBand} 
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'landing' && (
          <LandingPage 
            onGetStarted={() => setActiveTab('dashboard')} 
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            wbiBand={wbiBand} 
            wbiScore={wbiScore} 
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
        {activeTab === 'roadmap' && <RoadmapView wbiBand={wbiBand} user={user} />}
        {activeTab === 'tutor' && <AITutor user={user} />}
        {activeTab === 'interview' && <MockInterview user={user} />}
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
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
      />

      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CourseConnect AI Platform - EdTech + HealthTech Major Project Blueprint</span>
          <span className="text-slate-400 font-medium">Built with React, FastAPI, Hugging Face & Node.js</span>
        </div>
      </footer>
    </div>
  );
}
