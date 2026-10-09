# CourseConnect (PathPulse AI): Technical Specification & System Blueprint

**Project Name:** CourseConnect (PathPulse AI)  
**Domain:** EdTech + HealthTech (Student Career Readiness & Mental Wellbeing Platform)  
**Target Outcome:** Major College Project, Academic Paper / Patent Quality, Industry-Grade Implementation  

---

## 1. Executive Summary & Novelty

### 1.1 Problem Statement
Final-year and college students face intense placement pressure and skill misalignment. They lack clear, structured roadmaps for tech/non-tech domains, and quality resources are fragmented. Concurrently, academic burnout and mental distress (anxiety, depression) are widespread. Existing EdTech platforms aggressively push study hours regardless of student burnout, while generic mental health apps have no context on student academic goals.

### 1.2 Proposed Solution & Core Innovation
**CourseConnect** bridges EdTech and HealthTech into a unified closed-loop platform:
1. **Universal Skill Roadmap Engine:** Generates structured, validated learning paths for *any* skill (tech or non-tech) with zero broken link hallucinations.
2. **AI Career Toolkit:** Integrated RAG AI Tutor (with citations), ATS Resume Analyzer & Skill-Gap Detector, Adaptive Quizzes, and AI Mock Interview Room (text + voice with filler word analysis).
3. **Clinical Wellbeing Screening & Safety Layer:** Standardized PHQ-9, GAD-7, PSS-10 questionnaires, daily mood tracking, and NLP emotion/stress classification on journal entries. Includes a 3-layer crisis safety ensemble (rules + HF classifier + LLM judge).
4. **Wellbeing-Aware Adaptive Planner (Core Novelty):** Automatically adjusts weekly study workloads based on student stress levels (Green, Amber, Red bands) and inserts rest days without penalizing career readiness scores.

---

## 2. System Architecture & Tech Stack

```
                                +-----------------------------------+
                                |     React 18 + Tailwind CSS       |
                                |   (Vite, Recharts, Lucide Icons)  |
                                +-----------------+-----------------+
                                                  |
                                                  v
                                +-----------------+-----------------+
                                |  Node.js / Express Core API Gateway|
                                |  (JWT Auth, CRUD, Orchestrator)   |
                                +-----------------+-----------------+
                                                  |
                                                  v
                                +-----------------+-----------------+
                                |     Python FastAPI AI Service     |
                                | (Local HF Models, RAG, Safety)   |
                                +-----------------+-----------------+
                                                  |
                 +--------------------------------+--------------------------------+
                 |                                |                                |
                 v                                v                                v
   +-------------+-------------+   +--------------+--------------+   +-------------+-------------+
   |   Local Hugging Face ML   |   |   RAG Engine / Embeddings    |   |  Resource Resolution Engine |
   | (Transformers/DistilRoBERTa|  | (SentenceTransformers, FAISS)|  | (Seed DB, YouTube, GitHub)  |
   +---------------------------+   +-----------------------------+   +---------------------------+
```

### 2.1 Technology Stack
* **Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide React, Web Speech API.
* **Backend API Gateway:** Node.js, Express, JWT, Mongoose / Local Data Storage Engine.
* **AI & ML Microservice:** Python 3.12, FastAPI, Hugging Face `transformers`, `sentence-transformers`, `torch`, `scikit-learn`, `pydantic`.
* **LLM Engine:** Local Hugging Face models / Local Open-LLM endpoints / Ollama / Groq / HuggingFace Inference with optional Gemini/OpenAI API fallback adapters.

---

## 3. Module Breakdown & JSON Schemas

### 3.1 Universal Roadmap Engine Schema
```json
{
  "skill": "Data Engineering",
  "level": "intermediate",
  "total_weeks": 8,
  "phases": [
    {
      "phase_num": 1,
      "title": "Data Pipeline Fundamentals",
      "weeks": [1, 2],
      "topics": [
        {
          "id": "topic-1",
          "name": "SQL Optimization & ETL Concepts",
          "prerequisites": [],
          "est_hours": 8,
          "resource_queries": [
            "SQL performance tuning tutorial",
            "ETL data pipeline basics"
          ],
          "status": "pending"
        }
      ],
      "project": "Build an automated ETL pipeline with Python & SQLite"
    }
  ]
}
```

### 3.2 Wellbeing Index (WBI) Formula
$$\text{WBI} = 0.25 \times \text{PHQ9\_Score\_Norm} + 0.25 \times \text{GAD7\_Score\_Norm} + 0.20 \times \text{PSS10\_Score\_Norm} + 0.20 \times (5 - \text{Avg\_Mood}) \times 20 + 0.10 \times \text{Stress\_NLP\_Score}$$

* **Bands:**
  * **Green (0 - 35):** Normal workload, stretch goals enabled.
  * **Amber (36 - 65):** Workload reduced by 30%, rest days scheduled, supportive AI tutor tone.
  * **Red (66 - 100):** Workload paused/minimalized, crisis safety check triggered, counsellor contact option displayed.

---

## 4. Safety & Ethics Protocols
1. **Clinical Disclaimer:** Clear non-diagnostic warning on all screening modules.
2. **Three-Layer Safety Ensemble:** 
   - Layer 1: Rule-based regex keyword detector (self-harm/crisis terms).
   - Layer 2: Hugging Face DistilRoBERTa emotion/stress threshold detector.
   - Layer 3: LLM Judge evaluation for distress context.
3. **Data Encryption & Consent:** Granular user opt-ins for counsellor sharing and encrypted journal entries.

---

## 5. Verification & Academic Evaluation Suite
* **Model Benchmarks:** Stress text classification F1-score comparison (Logistic Regression vs DistilBERT/Transformers).
* **Safety Recall:** Crisis detection recall verification on 100+ test phrases.
* **Schema Validity:** Pydantic roadmap validation rate on diverse inputs.
