import bcrypt from 'bcryptjs';

// In-Memory storage fallback for instant demo readiness
export const inMemoryStore = {
  users: [
    {
      id: 'u-1',
      name: 'Alex Student',
      email: 'student@college.edu',
      passwordHash: bcrypt.hashSync('student123', 8),
      role: 'student',
      targetRole: 'Software Engineer',
      level: 'intermediate',
      weeklyHours: 10,
      streak: 1,
      freezeCredits: 2,
      restDayActive: false,
      resumeScore: 0,
      consent: { wellbeing: true, behaviour: true, counsellorShare: true }
    },
    {
      id: 'u-2',
      name: 'Dr. Sarah Counsellor',
      email: 'counsellor@college.edu',
      passwordHash: bcrypt.hashSync('counsellor123', 8),
      role: 'counsellor',
      streak: 1,
      freezeCredits: 2,
      restDayActive: false,
      resumeScore: 0,
      consent: { wellbeing: true, behaviour: true, counsellorShare: true }
    }
  ],
  roadmaps: [],
  checkins: [],
  interviewHistory: [],
  quizAttempts: []
};
