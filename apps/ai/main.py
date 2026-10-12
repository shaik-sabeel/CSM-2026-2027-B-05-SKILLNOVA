import os
import sys
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from models.roadmap_generator import generate_fallback_roadmap
from models.resource_engine import resolve_resources_for_queries
from models.rag_tutor import generate_tutor_response
from models.resume_analyzer import analyze_resume
from models.interview_engine import (
    generate_tailored_interview_flow, 
    evaluate_interview_response_rag, 
    analyze_resume_and_jd
)
from models.wellbeing_analyzer import calculate_wellbeing_index, STRESS_ASSESSMENT_QUESTIONS, score_assessment_questionnaire
from models.safety_layer import check_crisis_safety_ensemble
from models.adaptive_planner import adapt_roadmap_for_wellbeing
from models.readiness_predictor import predict_placement_readiness
from models.quiz_generator import generate_dynamic_quiz
from models.repo_interviewer import analyze_github_repo
from models.burnout_predictor import predict_burnout_risk
from models.job_pulse import analyze_job_market_pulse
from models.mental_guru import get_mental_guru_advice
from models.stress_dashboard import generate_stress_dashboard

app = FastAPI(
    title="CourseConnect AI Service",
    description="Python FastAPI Microservice for Machine Learning, RAG, Mental Wellbeing, USP Agents, and Safety Ensemble",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class RoadmapReq(BaseModel):
    skill: str
    level: str = "beginner"
    total_weeks: int = 8
    hours_per_week: int = 10
    wellbeing_band: Optional[str] = "Green"

class ResourceReq(BaseModel):
    queries: List[str]

class TutorReq(BaseModel):
    query: str
    mode: str = "explain"
    topic: Optional[str] = None

class ResumeReq(BaseModel):
    resume_text: str
    target_jd: Optional[str] = ""

class InterviewGenReq(BaseModel):
    role: str = "Software Engineer"
    round_type: str = "technical"
    resume_text: Optional[str] = ""
    target_jd: Optional[str] = ""

class InterviewEvalReq(BaseModel):
    question: str
    answer_text: str
    duration_sec: int = 45
    role: Optional[str] = "Software Engineer"
    target_jd: Optional[str] = ""

class WellbeingReq(BaseModel):
    assessment_answers: Optional[List[int]] = None
    phq9_scores: Optional[List[int]] = None
    gad7_scores: Optional[List[int]] = None
    mood_rating: int = 3
    journal_text: Optional[str] = None

class MentalGuruReq(BaseModel):
    query: str
    mood_rating: int = 3

class SafetyReq(BaseModel):
    text: str
    stress_prob: float = 0.0

class ReplanReq(BaseModel):
    roadmap: Dict[str, Any]
    wbi_score: float
    wbi_band: str

class ReadinessReq(BaseModel):
    skill_mastery: float = 0.0
    interview_score: float = 0.0
    resume_score: float = 0.0
    project_score: float = 0.0
    study_consistency: float = 0.0

class QuizGenReq(BaseModel):
    topic: str
    difficulty: str = "intermediate"

class RepoReq(BaseModel):
    repo_url: str

class BurnoutReq(BaseModel):
    mood_history: Optional[List[int]] = None
    sleep_hours: Optional[List[float]] = None
    streak_breaks: int = 0

class JobPulseReq(BaseModel):
    target_role: str = "Software Engineer"
    user_skills: Optional[List[str]] = None

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "online", "service": "CourseConnect AI Engine", "version": "1.0.0"}

@app.post("/ai/roadmap")
def create_roadmap(req: RoadmapReq):
    try:
        raw_roadmap = generate_fallback_roadmap(req.skill, req.level, req.total_weeks, req.hours_per_week)
        if req.wellbeing_band and req.wellbeing_band != "Green":
            return adapt_roadmap_for_wellbeing(raw_roadmap, 50.0, req.wellbeing_band)
        return raw_roadmap
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/resources/resolve")
def resolve_resources(req: ResourceReq):
    return resolve_resources_for_queries(req.queries)

@app.post("/ai/tutor/chat")
def tutor_chat(req: TutorReq):
    return generate_tutor_response(req.query, mode=req.mode, user_topic=req.topic)

@app.post("/ai/resume/analyze")
def run_resume_analysis(req: ResumeReq):
    return analyze_resume(req.resume_text, req.target_jd or "")

@app.post("/ai/interview/questions")
def get_interview_questions(req: InterviewGenReq):
    analysis = analyze_resume_and_jd(req.resume_text or "", req.target_jd or "")
    flow = generate_tailored_interview_flow(req.resume_text or "", req.target_jd or "", req.role)
    return {
        "analysis": analysis,
        "questions": flow
    }

@app.post("/ai/interview/evaluate")
def evaluate_interview(req: InterviewEvalReq):
    return evaluate_interview_response_rag(
        question=req.question, 
        answer_text=req.answer_text, 
        duration_sec=req.duration_sec,
        role=req.role or "Software Engineer",
        target_jd=req.target_jd or ""
    )

@app.post("/ai/quiz/generate")
def create_quiz(req: QuizGenReq):
    return generate_dynamic_quiz(req.topic, req.difficulty)

@app.get("/ai/wellbeing/schema")
def get_wellbeing_schema():
    return {"questions": STRESS_ASSESSMENT_QUESTIONS}

@app.post("/ai/wellbeing/analyze")
def analyze_wellbeing(req: WellbeingReq):
    result = calculate_wellbeing_index(
        assessment_answers=req.assessment_answers,
        phq9_scores=req.phq9_scores,
        gad7_scores=req.gad7_scores,
        mood_rating=req.mood_rating,
        journal_text=req.journal_text
    )
    # Attach chart-ready dashboard data
    result["dashboard"] = generate_stress_dashboard(
        wbi_score=result["wbi_score"],
        band=result["band"],
        assessment_answers=req.assessment_answers or [1, 1, 1, 1, 1, 1],
        journal_nlp=result["breakdown"].get("journal_nlp"),
    )
    return result

@app.post("/ai/mental-guru/chat")
def mental_guru_chat(req: MentalGuruReq):
    return get_mental_guru_advice(req.query, req.mood_rating)

@app.post("/ai/safety/check")
def check_safety(req: SafetyReq):
    return check_crisis_safety_ensemble(req.text, req.stress_prob)

@app.post("/ai/planner/replan")
def replan_roadmap(req: ReplanReq):
    return adapt_roadmap_for_wellbeing(req.roadmap, req.wbi_score, req.wbi_band)

@app.post("/ai/readiness/predict")
def predict_readiness(req: ReadinessReq):
    return predict_placement_readiness(
        skill_mastery=req.skill_mastery,
        interview_score=req.interview_score,
        resume_score=req.resume_score,
        project_score=req.project_score,
        study_consistency=req.study_consistency
    )

# --- USP Feature Endpoints ---

@app.post("/ai/repo/analyze")
def analyze_repo(req: RepoReq):
    return analyze_github_repo(req.repo_url)

@app.post("/ai/burnout/predict")
def predict_burnout(req: BurnoutReq):
    return predict_burnout_risk(
        mood_history=req.mood_history if req.mood_history is not None else [],
        sleep_hours=req.sleep_hours if req.sleep_hours is not None else [],
        streak_breaks=req.streak_breaks
    )

@app.post("/ai/jobpulse/analyze")
def analyze_job_pulse(req: JobPulseReq):
    return analyze_job_market_pulse(
        target_role=req.target_role,
        user_skills=req.user_skills if req.user_skills is not None else []
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
