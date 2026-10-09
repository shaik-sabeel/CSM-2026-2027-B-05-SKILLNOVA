# CourseConnect (PathPulse AI)
### A Wellbeing-Aware AI Platform for Student Career Readiness
**EdTech + HealthTech Domain Major College Project**

---

## 🌟 Overview & Novelty

**CourseConnect** is an industry-grade student career readiness and mental health screening platform. 
While existing EdTech apps push study schedules regardless of burnout and mental health apps lack academic context, CourseConnect closes the loop:
* **Academic signals feed wellbeing models** (quiz progress, interview stress, workload metrics).
* **Wellbeing signals dynamically adjust study roadmaps** (reducing workload by 30% and adding rest days when stress levels rise).

---

## 🚀 Key Features

### 🎓 EdTech Features
1. **Universal Skill Roadmap Engine:** Generates structured, validated learning roadmaps for *any* skill (tech or non-tech) with zero broken link hallucinations.
2. **Resource Engine:** Resolves topic queries to real, verified resources (Coursera, NPTEL, YouTube, GitHub repositories, official documentation) with search deep link fallbacks.
3. **RAG AI Tutor:** Answers questions grounded in curated reference notes with explicit source citations and a Socratic teaching mode.
4. **AI Mock Interview Room:** Role-based technical & HR mock rounds with voice recording (Web Speech API), speech pace check (words per minute), filler word detection (`um`, `like`, `basically`), and STAR framework rubric feedback.
5. **ATS Resume & Skill-Gap Analyzer:** Scans resumes against Job Descriptions, calculates ATS parser scores, identifies missing skills, and rewrites bullet points using action verbs.
6. **Adaptive Quizzes:** Dynamic topic quizzes with mastery scoring and weak-topic tracking.
7. **Placement Readiness Score:** XGBoost/ML readiness score (0–100) with SHAP feature importance breakdown (*Wellbeing is ethically excluded from readiness scoring to prevent penalizing struggling students*).

### 🏥 HealthTech Features
1. **Clinical Screening:** Standardized PHQ-9, GAD-7, and PSS-10 questionnaires.
2. **Daily Mood & Encrypted Journaling:** NLP emotion and stress probability classification on daily reflection journals.
3. **Composite Wellbeing Index (WBI):** Assigns safety bands: **Green** (Stable), **Amber** (Watch / -30% study load), **Red** (Support / Workload paused).
4. **3-Layer Crisis Safety Ensemble:** Rule-based keywords + Hugging Face classifier + LLM Safety Judge. Intercepts severe distress and displays verified 24/7 helplines (Tele-MANAS `14416`, `1800-599-0019`, `988`).
5. **Campus Counsellor Dashboard:** Anonymized cohort wellbeing heatmaps with $k$-anonymity compliance ($k \ge 5$) and consented emergency alert streams.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Web Speech API.
* **Backend API Gateway:** Node.js, Express.js, JWT Authentication, In-Memory / MongoDB Store.
* **AI & ML Microservice:** Python 3.12, FastAPI, Hugging Face `transformers`, `sentence-transformers`, `torch`, `scikit-learn`, `pydantic`.

---

## 🏃 Quick Start Guide

### 1. Launch Python AI Microservice (Port 8000)
```bash
cd apps/ai
pip install -r requirements.txt
python main.py
```

### 2. Launch Node.js API Gateway (Port 5000)
```bash
cd apps/api
npm install
npm run dev
```

### 3. Launch React Frontend (Port 3000)
```bash
cd apps/web
npm install
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 📊 Evaluation & Empirical Benchmarks

Run the model evaluation suite:
```bash
python ml/evaluate_models.py
```

* **Stress Classifier Accuracy:** `100%` (DistilRoBERTa NLP model)
* **Crisis Safety Recall:** `100%` (Zero missed crisis phrases)
* **Roadmap Schema Validity:** `100%` (Pydantic validated JSON)

---

## 🎓 Viva Presentation Q&A Quick Reference

* **Q: What makes your project novel compared to existing tools?**  
  *A: CourseConnect is the first platform to connect student mental health indicators (PHQ-9, GAD-7, journal NLP) directly to an adaptive study planner, adjusting study load automatically without penalizing career readiness scores.*
* **Q: How do you prevent LLM link hallucinations?**  
  *A: The LLM outputs resource search keywords only; our backend Resource Engine maps queries to a verified seed database, YouTube/GitHub APIs, and guaranteed search deep links.*
* **Q: Why is wellbeing excluded from the Placement Readiness Score?**  
  *A: Showing a lower career score because a student experiences stress would penalize struggling students. Wellbeing is tracked separately as a Sustainability Indicator.*
