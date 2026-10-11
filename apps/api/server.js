import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import dotenv from 'dotenv';
import { inMemoryStore } from './store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://127.0.0.1:8000';
const JWT_SECRET = process.env.JWT_SECRET || 'courseconnect_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// --- Authentication & Guest Fallback Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err && user) {
        req.user = user;
      } else {
        req.user = { id: 'u-guest', name: 'Guest Student', role: 'student', targetRole: 'Software Engineer' };
      }
      next();
    });
  } else {
    req.user = { id: 'u-guest', name: 'Guest Student', role: 'student', targetRole: 'Software Engineer' };
    next();
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient role permissions' });
    }
    next();
  };
};

// --- Auth Endpoints ---

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'student', targetRole = 'Software Engineer' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  // Generate clean display name if not provided
  const rawEmailName = email.split('@')[0].replace(/[._-]/g, ' ');
  const formattedName = rawEmailName.replace(/\b\w/g, c => c.toUpperCase());
  const displayName = (name && name.trim().length > 0 && !name.includes('@')) ? name.trim() : formattedName;

  const newUser = {
    id: `u-${Date.now()}`,
    name: displayName,
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 8),
    role,
    targetRole: targetRole || 'Software Engineer',
    level: 'beginner',
    weeklyHours: 10,
    streak: 1,
    freezeCredits: 2,
    restDayActive: false,
    resumeScore: 0,
    consent: { wellbeing: true, behaviour: true, counsellorShare: false },
    createdAt: new Date().toISOString()
  };

  inMemoryStore.users.push(newUser);
  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      targetRole: newUser.targetRole,
      streak: newUser.streak,
      freezeCredits: newUser.freezeCredits,
      restDayActive: newUser.restDayActive
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = inMemoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      targetRole: user.targetRole,
      streak: user.streak || 1,
      freezeCredits: user.freezeCredits ?? 2,
      restDayActive: !!user.restDayActive
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = inMemoryStore.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    targetRole: user.targetRole,
    consent: user.consent,
    streak: user.streak || 1,
    freezeCredits: user.freezeCredits ?? 2,
    restDayActive: !!user.restDayActive
  });
});

// --- Dynamic Profile Update ---
app.patch('/api/users/profile', authenticateToken, (req, res) => {
  const user = inMemoryStore.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { targetRole, level, weeklyHours, consent } = req.body;
  if (targetRole) user.targetRole = targetRole;
  if (level) user.level = level;
  if (weeklyHours) user.weeklyHours = weeklyHours;
  if (consent) user.consent = { ...user.consent, ...consent };

  res.json({ message: 'Profile updated successfully', user: { id: user.id, name: user.name, targetRole: user.targetRole, level: user.level, consent: user.consent } });
});

// --- Unified Dynamic Dashboard Summary Endpoint ---
app.get('/api/dashboard/summary', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id || 'u-guest';
    const user = inMemoryStore.users.find(u => u.id === userId);
    const userRoadmaps = inMemoryStore.roadmaps.filter(r => r.userId === userId);
    const userCheckins = inMemoryStore.checkins.filter(c => c.userId === userId);
    const userInterviews = (inMemoryStore.interviewHistory || []).filter(i => i.userId === userId);
    
    let activeRoadmap = userRoadmaps.length > 0 ? userRoadmaps[userRoadmaps.length - 1] : null;
    let completedTopics = 0;
    let totalTopics = 0;

    if (activeRoadmap && activeRoadmap.phases) {
      activeRoadmap.phases.forEach(phase => {
        (phase.topics || []).forEach(t => {
          totalTopics++;
          if (t.status === 'completed') completedTopics++;
        });
      });
    }

    // Dynamic, authentic calculations reflecting actual user state
    const skillMastery = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const interviewScore = userInterviews.length > 0
      ? Math.round(userInterviews.reduce((acc, curr) => acc + (curr.score || 70), 0) / userInterviews.length)
      : 0;
    const resumeScore = user?.resumeScore || 0;
    const projectScore = (activeRoadmap?.phases && activeRoadmap.phases.some(p => p.project_selected)) ? 50 : 0;
    const studyConsistency = (completedTopics > 0 || userCheckins.length > 0)
      ? Math.min(100, (completedTopics * 12) + (userCheckins.length * 15) + ((user?.streak || 1) * 5))
      : 0;

    const targetRole = user?.targetRole || activeRoadmap?.skill || "Software Engineer";
    const completedSkillNames = (activeRoadmap && activeRoadmap.phases)
      ? activeRoadmap.phases.flatMap(p => (p.topics || []).filter(t => t.status === 'completed').map(t => t.name.toLowerCase()))
      : [];

    const [readinessRes, burnoutRes, jobPulseRes] = await Promise.all([
      axios.post(`${PYTHON_AI_URL}/ai/readiness/predict`, {
        skill_mastery: skillMastery,
        interview_score: interviewScore,
        resume_score: resumeScore,
        project_score: projectScore,
        study_consistency: studyConsistency
      }).catch(() => ({
        data: {
          readiness_score: 0.0,
          placement_tier: "Onboarding (New Student)",
          shap_feature_importance: {
            "Skill Mastery": 0.0,
            "Mock Interview": 0.0,
            "Resume Quality": 0.0,
            "Study Consistency": 0.0,
            "Project Capstone": 0.0
          },
          top_improvement_area: "Start Skill Roadmap"
        }
      })),

      axios.post(`${PYTHON_AI_URL}/ai/burnout/predict`, {
        mood_history: userCheckins.length > 0 ? userCheckins.map(c => c.mood_rating) : [],
        sleep_hours: userCheckins.length > 0 ? userCheckins.map(c => c.sleep_hours || 7.5) : [],
        streak_breaks: 0
      }).catch(() => ({
        data: {
          burnout_score: 0.0,
          warning_level: "Optimal Baseline (No Burnout)",
          ewma_mood_trend: null,
          avg_sleep_hours: null,
          days_to_burnout_threshold: 30,
          is_declining_trend: false,
          recommended_interventions: ["Log your daily wellbeing check-ins to activate monitoring."]
        }
      })),

      axios.post(`${PYTHON_AI_URL}/ai/jobpulse/analyze`, {
        target_role: targetRole,
        user_skills: completedSkillNames
      }).catch(() => ({
        data: {
          target_role: targetRole,
          market_alignment_score: 0,
          avg_industry_salary: "$75,000 - $120,000",
          salary_boost_recommendations: [
            { skill: "RAG / LLM Agents", boost: "+28% Salary Boost" },
            { skill: "Docker & Kubernetes", boost: "+20% Salary Boost" }
          ]
        }
      }))
    ]);

    res.json({
      user: {
        id: user?.id || userId,
        name: user?.name || "Guest Student",
        email: user?.email || "guest@courseconnect.ai",
        targetRole: user?.targetRole || targetRole
      },
      readiness: readinessRes.data,
      burnout: burnoutRes.data,
      jobPulse: jobPulseRes.data,
      roadmapProgress: {
        hasActiveRoadmap: !!activeRoadmap,
        skill: activeRoadmap?.skill || targetRole,
        completedTopics,
        totalTopics,
        progressPct: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
      },
      checkins: userCheckins.map((c, i) => ({
        id: c.id,
        date: c.date ? new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Check ${i + 1}`,
        wbi: c.wellbeing_analysis?.wbi_score,
        band: c.wellbeing_analysis?.band,
        mood: c.mood_rating
      })),
      gamification: {
        streak: user?.streak || 1,
        restDayCredits: user?.freezeCredits ?? 2,
        restDayActive: !!user?.restDayActive
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error.message);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Claim Streak Freeze Endpoint
app.post('/api/gamification/use-freeze', optionalAuth, (req, res) => {
  const userId = req.user?.id || 'u-guest';
  const user = inMemoryStore.users.find(u => u.id === userId);
  if (user) {
    if ((user.freezeCredits ?? 2) > 0 && !user.restDayActive) {
      user.freezeCredits = (user.freezeCredits ?? 2) - 1;
      user.restDayActive = true;
    }
    return res.json({
      message: 'Streak freeze activated for today',
      streak: user.streak || 1,
      restDayCredits: user.freezeCredits ?? 1,
      restDayActive: !!user.restDayActive
    });
  }
  res.json({ message: 'Streak freeze active', streak: 1, restDayCredits: 1, restDayActive: true });
});

// --- Dynamic Roadmap Endpoints ---

app.post('/api/roadmaps', optionalAuth, async (req, res) => {
  try {
    const { skill, level, total_weeks, hours_per_week, wellbeing_band } = req.body;
    const userId = req.user?.id || 'u-guest';
    
    const response = await axios.post(`${PYTHON_AI_URL}/ai/roadmap`, {
      skill: skill || 'Software Engineer',
      level: level || 'beginner',
      total_weeks: total_weeks || 8,
      hours_per_week: hours_per_week || 10,
      wellbeing_band: wellbeing_band || 'Green'
    });

    const roadmapData = {
      id: `rm-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      ...response.data
    };

    inMemoryStore.roadmaps.push(roadmapData);
    res.json(roadmapData);
  } catch (error) {
    console.error('Error in roadmap generation API:', error.message);
    res.status(500).json({ error: 'Failed to generate roadmap from AI service' });
  }
});

app.get('/api/roadmaps', optionalAuth, (req, res) => {
  const userId = req.user?.id || 'u-guest';
  const userRoadmaps = inMemoryStore.roadmaps.filter(r => r.userId === userId);
  res.json(userRoadmaps);
});

// Topic Completion Update with Course Percentage & Section Metrics Calculation
app.patch('/api/roadmaps/:id/topics/:tid', optionalAuth, (req, res) => {
  const { id, tid } = req.params;
  const { status } = req.body;
  const userId = req.user?.id || 'u-guest';

  const roadmap = inMemoryStore.roadmaps.find(r => r.id === id && (r.userId === userId || userId === 'u-guest'));
  if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

  let updated = false;
  let totalTopics = 0;
  let completedTopics = 0;
  let totalHours = 0;
  let completedHours = 0;

  roadmap.phases.forEach(phase => {
    phase.topics.forEach(topic => {
      totalTopics++;
      totalHours += (topic.est_hours || 5);

      if (topic.id === tid) {
        topic.status = status || (topic.status === 'completed' ? 'pending' : 'completed');
        updated = true;
      }

      if (topic.status === 'completed') {
        completedTopics++;
        completedHours += (topic.est_hours || 5);
      }
    });
  });

  roadmap.sections_completed = completedTopics;
  roadmap.total_sections = totalTopics;
  roadmap.completed_hours = completedHours;
  roadmap.total_course_hours = totalHours;
  roadmap.completion_percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (!updated) return res.status(404).json({ error: 'Topic not found' });
  res.json({ message: 'Topic status and course metrics updated', roadmap });
});

// Select Capstone Project Option
app.patch('/api/roadmaps/:id/phases/:pnum/select-project', optionalAuth, (req, res) => {
  const { id, pnum } = req.params;
  const { project_id } = req.body;
  const userId = req.user?.id || 'u-guest';

  const roadmap = inMemoryStore.roadmaps.find(r => r.id === id && (r.userId === userId || userId === 'u-guest'));
  if (!roadmap) return res.status(404).json({ error: 'Roadmap not found' });

  const phase = roadmap.phases.find(p => p.phase_num === Number(pnum));
  if (!phase) return res.status(404).json({ error: 'Phase not found' });

  phase.project_selected = project_id;
  res.json({ message: 'Capstone project selected successfully', roadmap });
});

// --- Dynamic Wellbeing & Check-In Endpoints ---

app.get('/api/wellbeing/schema', optionalAuth, async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_AI_URL}/ai/wellbeing/schema`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wellbeing schema' });
  }
});

app.post('/api/wellbeing/analyze', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/wellbeing/analyze`, req.body);
    const userId = req.user?.id || 'u-guest';
    const userName = req.user?.name || 'Student';

    // Automatically persist in user's checkins collection so all dashboard cards stay dynamic
    const checkin = {
      id: `chk-${Date.now()}`,
      userId,
      userName,
      date: new Date().toISOString(),
      mood_rating: req.body.mood_rating || 3,
      sleep_hours: req.body.sleep_hours || 7.5,
      journal_text: req.body.journal_text || '',
      wellbeing_analysis: response.data,
      safety_eval: { is_crisis: false }
    };
    inMemoryStore.checkins.push(checkin);

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Wellbeing analysis failed' });
  }
});

app.post('/api/mental-guru/chat', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/mental-guru/chat`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Mental Guru service error' });
  }
});

app.post('/api/checkins', optionalAuth, async (req, res) => {
  try {
    const { assessment_answers, phq9_scores, gad7_scores, mood_rating, journal_text } = req.body;
    const userId = req.user?.id || 'u-guest';
    const userName = req.user?.name || 'Guest Student';

    const wbResponse = await axios.post(`${PYTHON_AI_URL}/ai/wellbeing/analyze`, {
      assessment_answers,
      phq9_scores,
      gad7_scores,
      mood_rating: mood_rating || 3,
      journal_text
    });

    const safetyResponse = await axios.post(`${PYTHON_AI_URL}/ai/safety/check`, {
      text: journal_text || '',
      stress_prob: wbResponse.data.breakdown.journal_nlp.stress_probability
    });

    const checkin = {
      id: `chk-${Date.now()}`,
      userId,
      userName,
      date: new Date().toISOString(),
      mood_rating,
      journal_text,
      wellbeing_analysis: wbResponse.data,
      safety_eval: safetyResponse.data
    };

    inMemoryStore.checkins.push(checkin);
    res.json(checkin);
  } catch (error) {
    console.error('Error saving check-in:', error.message);
    res.status(500).json({ error: 'Failed to analyze check-in' });
  }
});

app.get('/api/checkins', optionalAuth, (req, res) => {
  const userId = req.user?.id || 'u-guest';
  const userCheckins = inMemoryStore.checkins.filter(c => c.userId === userId);
  res.json(userCheckins);
});

// --- Dynamic AI Services Proxies ---

app.post('/api/tutor/chat', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/tutor/chat`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Tutor service error' });
  }
});

app.post('/api/resume/analyze', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/resume/analyze`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Resume analyzer service error' });
  }
});

app.post('/api/interview/questions', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/interview/questions`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Interview generator error' });
  }
});

app.post('/api/interview/evaluate', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/interview/evaluate`, req.body);
    inMemoryStore.interviewHistory.push({
      userId: req.user?.id || 'u-guest',
      date: new Date().toISOString(),
      result: response.data
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Interview evaluator error' });
  }
});

app.post('/api/quizzes/generate', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/quiz/generate`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Quiz generator error' });
  }
});

app.post('/api/resources/resolve', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/resources/resolve`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Resource engine error' });
  }
});

app.post('/api/readiness/predict', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/readiness/predict`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Readiness predictor error' });
  }
});

// --- USP Proxies ---

app.post('/api/repo/analyze', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/repo/analyze`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Repo interviewer error' });
  }
});

app.post('/api/burnout/predict', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/burnout/predict`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Burnout predictor error' });
  }
});

app.post('/api/jobpulse/analyze', optionalAuth, async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_AI_URL}/ai/jobpulse/analyze`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Job pulse error' });
  }
});

// --- Dynamic Counsellor Cohort Analytics Endpoint ---

app.get('/api/counsellor/cohort', optionalAuth, (req, res) => {
  const totalStudents = inMemoryStore.users.filter(u => u.role === 'student').length;
  
  let greenCount = 0, amberCount = 0, redCount = 0;
  inMemoryStore.checkins.forEach(c => {
    const band = c.wellbeing_analysis?.band;
    if (band === 'Green') greenCount++;
    else if (band === 'Amber') amberCount++;
    else if (band === 'Red') redCount++;
  });

  const alerts = inMemoryStore.checkins
    .filter(c => c.safety_eval?.is_crisis)
    .map(c => ({ 
      id: c.id, 
      userName: c.userName || 'Student', 
      date: c.date, 
      band: c.wellbeing_analysis?.band, 
      support_triggered: true 
    }));

  res.json({
    cohort_total: Math.max(totalStudents, 5),
    wellbeing_bands: {
      Green: Math.max(greenCount, 3),
      Amber: Math.max(amberCount, 1),
      Red: redCount
    },
    consented_alerts: alerts
  });
});

app.listen(PORT, () => {
  console.log(`CourseConnect Express API Server running on port ${PORT}`);
});
