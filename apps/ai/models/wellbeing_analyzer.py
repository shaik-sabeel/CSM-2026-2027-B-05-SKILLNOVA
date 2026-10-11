import re
from typing import List, Dict, Any, Optional

STRESS_KEYWORDS = ["anxious", "overwhelmed", "depressed", "burnout", "exhausted", "panic", "hopeless", "can't focus", "cannot sleep", "stressed", "sad", "lonely"]
POSITIVE_KEYWORDS = ["calm", "confident", "happy", "motivated", "energetic", "relaxed", "focused", "good day", "productive", "peaceful"]

# --- Structured 6-Item Stress Assessment Questionnaire ---
STRESS_ASSESSMENT_QUESTIONS = [
    {
        "id": "q1",
        "question": "How often have you felt overwhelmed or unable to control important academic tasks this week?",
        "category": "Perceived Stress & Academic Load",
        "options": [
            {"label": "Never (Not at all)", "score": 0},
            {"label": "Almost Never (1-2 days)", "score": 1},
            {"label": "Sometimes (3-4 days)", "score": 2},
            {"label": "Fairly Often (5-6 days)", "score": 3},
            {"label": "Very Often (Every day)", "score": 4}
        ]
    },
    {
        "id": "q2",
        "question": "How would you rate your sleep quality and ease of falling asleep over the past few nights?",
        "category": "Sleep & Physical Recovery",
        "options": [
            {"label": "Restful, deep sleep (7-8 hours)", "score": 0},
            {"label": "Mild difficulty or slight restlessness", "score": 1},
            {"label": "Frequent waking or waking tired", "score": 2},
            {"label": "Severe insomnia or waking anxious", "score": 3},
            {"label": "Extreme exhaustion / Under 4 hours", "score": 4}
        ]
    },
    {
        "id": "q3",
        "question": "Have you experienced physical signs of anxiety (heart racing, muscle tension, headaches, shortness of breath)?",
        "category": "Somatic Anxiety",
        "options": [
            {"label": "None at all", "score": 0},
            {"label": "Occasional mild tension", "score": 1},
            {"label": "Moderate muscle tightness / anxiety", "score": 2},
            {"label": "Frequent physical distress / racing heart", "score": 3},
            {"label": "Severe physical panic or tension daily", "score": 4}
        ]
    },
    {
        "id": "q4",
        "question": "How difficult has it been to maintain concentration during study sessions or lectures?",
        "category": "Cognitive Focus & Brain Fog",
        "options": [
            {"label": "Focused and clear-headed", "score": 0},
            {"label": "Slight distraction, but manageable", "score": 1},
            {"label": "Moderate brain fog / frequent distraction", "score": 2},
            {"label": "Hard to focus for more than 15 mins", "score": 3},
            {"label": "Unable to concentrate or complete study tasks", "score": 4}
        ]
    },
    {
        "id": "q5",
        "question": "How often do you feel emotionally drained, hopeless, or disconnected from your goals?",
        "category": "Emotional Exhaustion & Burnout",
        "options": [
            {"label": "Rarely or never", "score": 0},
            {"label": "Occasionally after long study days", "score": 1},
            {"label": "Several times this week", "score": 2},
            {"label": "Most days of the week", "score": 3},
            {"label": "Constantly drained and hopeless", "score": 4}
        ]
    },
    {
        "id": "q6",
        "question": "Do you have supportive connections or feel comfortable sharing your stress with friends or family?",
        "category": "Social Support & Connectedness",
        "options": [
            {"label": "Strong, active support system", "score": 0},
            {"label": "Good support when needed", "score": 1},
            {"label": "Limited support, feel slightly isolated", "score": 2},
            {"label": "Very isolated, rarely talk about stress", "score": 3},
            {"label": "Completely isolated and alone", "score": 4}
        ]
    }
]

def score_assessment_questionnaire(answers: List[int]) -> Dict[str, Any]:
    """
    Scores the 6-item assessment questionnaire (Max 24 points).
    Returns normalized Stress Level Index %, Severity Band, recommendations,
    and a downloadable wellness action plan text.
    """
    total_score = sum(answers[:6]) if answers else 6
    max_score = 24
    stress_pct = round((total_score / max_score) * 100, 1)

    if stress_pct <= 25.0:
        band = "Green"
        level_title = "Optimal / Low Stress"
        summary = "Your stress indicators are in a healthy, manageable range! You maintain great psychological balance."
        rec_actions = [
            "Maintain your current study-rest balance and stay hydrated with 8 glasses of water.",
            "Keep up regular physical activity and a consistent 7-8 hour sleep schedule.",
            "Continue logging daily reflections in your private self-journal to stay mindful.",
            "Take scheduled 5-minute movement breaks between deep work sessions."
        ]
        recommended_movie = {
            "title": "The Secret Life of Walter Mitty",
            "genre": "Uplifting / Adventure",
            "note": "A visually inspiring film celebrating curiosity, courage, and real-world connection."
        }
        recommended_youtube = {
            "title": "☕ Lofi Hip Hop Radio - Beats to Relax/Study to",
            "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            "category": "Focus & Flow"
        }
    elif stress_pct <= 55.0:
        band = "Amber"
        level_title = "Moderate Academic Strain"
        summary = "Moderate academic stress and cognitive fatigue detected. Early intervention will prevent cumulative burnout."
        rec_actions = [
            "Reduce daily continuous study sessions by 30% and schedule mandatory 15-minute screen-free breaks.",
            "Practice the 4-7-8 breathing exercise before starting study blocks (Inhale 4s, Hold 7s, Exhale 8s).",
            "Drink cool water immediately when noticing physical tension or racing thoughts.",
            "Listen to soothing ambient rain audio or acoustic piano during evening study cooldown.",
            "Aim for at least 7.5 hours of consistent sleep tonight."
        ]
        recommended_movie = {
            "title": "Spirited Away (Studio Ghibli)",
            "genre": "Animation / Cozy",
            "note": "A tranquil, visually enchanting masterpiece with peaceful soundscapes to ground an overworked mind."
        }
        recommended_youtube = {
            "title": "🌧️ 10-Minute Deep Relaxation Mindfulness Meditation",
            "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
            "category": "Guided Meditation"
        }
    elif stress_pct <= 80.0:
        band = "Red"
        level_title = "High Stress & Emotional Exhaustion"
        summary = "High stress levels detected. Your nervous system requires immediate rest, somatic grounding, and self-care."
        rec_actions = [
            "Pause intensive technical prep for today; engage only in gentle review or restorative rest.",
            "Engage in 5-4-3-2-1 sensory grounding and drink fresh cool water immediately.",
            "Practice Progressive Muscle Relaxation to release shoulder, neck, and jaw tension.",
            "Watch a warm, comforting movie to let your mind disengage from performance pressure.",
            "Consider speaking with a campus counselor or trusted mentor."
        ]
        recommended_movie = {
            "title": "Soul (Disney / Pixar)",
            "genre": "Animation / Philosophy",
            "note": "A heartwarming reminder that your intrinsic human worth is not defined by external achievement."
        }
        recommended_youtube = {
            "title": "🌲 Soft Forest Rain & Thunder Ambient Sleep Sounds",
            "url": "https://www.youtube.com/watch?v=lE6RYpe9XA0",
            "category": "Deep Sleep & Relaxation"
        }
    else:
        band = "Red"
        level_title = "Critical Distress / Burnout Risk"
        summary = "Critical stress levels flagged. Please prioritize immediate emotional safety and clinical support."
        rec_actions = [
            "Immediately halt all study work and connect with support.",
            "Drink water, wrap in comfortable warmth, and reach out to someone you trust.",
            "Reach out to Tele-MANAS (14416) or KIRAN helpline (1800-599-0019) for 24/7 confidential care.",
            "Notify campus counselor for emergency academic workload adjustment."
        ]
        recommended_movie = {
            "title": "Good Will Hunting",
            "genre": "Drama / Mentorship",
            "note": "An empathetic story illustrating that seeking guidance and emotional support is true strength."
        }
        recommended_youtube = {
            "title": "🎵 Piano Comfort - Soothing Acoustic Melody for Stress Relief",
            "url": "https://www.youtube.com/watch?v=1ZYbU82GVz4",
            "category": "Peaceful Soundscape"
        }

    # Format Downloadable Wellness Plan
    plan_text = (
        f"===========================================================\n"
        f"  COURSECONNECT HEALTHTECH - PERSONALIZED WELLNESS PLAN\n"
        f"===========================================================\n"
        f"Stress Index Score: {stress_pct}% ({total_score}/{max_score} pts)\n"
        f"Safety Band: {band} [{level_title}]\n\n"
        f"CLINICAL SUMMARY:\n"
        f"{summary}\n\n"
        f"RECOMMENDED DAILY ACTION PLAN:\n"
        + "".join([f"  [•] {act}\n" for act in rec_actions]) +
        f"\nRECOMMENDED RELIEF SUGGESTIONS:\n"
        f"  [Movie] {recommended_movie['title']} ({recommended_movie['genre']})\n"
        f"          Note: {recommended_movie['note']}\n"
        f"  [Audio] {recommended_youtube['title']} ({recommended_youtube['url']})\n\n"
        f"DAILY WELLNESS HABITS:\n"
        f"  1. Hydration: 8 full glasses of fresh cool water.\n"
        f"  2. Breathing: 4-7-8 breathing reset (3 rounds daily).\n"
        f"  3. Movement: 5-minute walking break every 25 minutes of study.\n"
        f"  4. Evening Curfew: Screens off 30 minutes before sleep.\n\n"
        f"EMERGENCY 24/7 CRISIS HELPLINES (Confidential & Free):\n"
        f"  - Tele-MANAS: 14416 (India 24/7)\n"
        f"  - KIRAN Helpline: 1800-599-0019\n"
        f"  - Suicide & Crisis Lifeline: 988\n"
        f"===========================================================\n"
    )

    return {
        "raw_score": total_score,
        "max_score": max_score,
        "stress_percentage": stress_pct,
        "band": band,
        "level_title": level_title,
        "summary": summary,
        "recommended_actions": rec_actions,
        "recommended_movie": recommended_movie,
        "recommended_youtube": recommended_youtube,
        "downloadable_plan": plan_text
    }

def score_phq9(responses: List[int]) -> Dict[str, Any]:
    """PHQ-9 Depression Screening (0-27)."""
    score = sum(responses) if responses else 3
    if score <= 4: severity = "Minimal / Normal"
    elif score <= 9: severity = "Mild Depression"
    elif score <= 14: severity = "Moderate Depression"
    elif score <= 19: severity = "Moderately Severe Depression"
    else: severity = "Severe Depression"
    return {"raw_score": score, "max_score": 27, "severity": severity, "norm_score": score / 27.0}

def score_gad7(responses: List[int]) -> Dict[str, Any]:
    """GAD-7 Anxiety Screening (0-21)."""
    score = sum(responses) if responses else 3
    if score <= 4: severity = "Minimal / Normal"
    elif score <= 9: severity = "Mild Anxiety"
    elif score <= 14: severity = "Moderate Anxiety"
    else: severity = "Severe Anxiety"
    return {"raw_score": score, "max_score": 21, "severity": severity, "norm_score": score / 21.0}

def analyze_journal_text(text: str) -> Dict[str, Any]:
    """NLP Emotion & Stress sentiment classification heuristic."""
    if not text or not text.strip():
        return {
            "text_length": 0,
            "stress_probability": 0.20,
            "primary_emotion": "Neutral / Calm",
            "emotion_scores": {"stress": 0.20, "calm": 0.80, "motivation": 0.70}
        }

    text_lower = text.lower()
    stress_hits = sum(1 for kw in STRESS_KEYWORDS if kw in text_lower)
    pos_hits = sum(1 for kw in POSITIVE_KEYWORDS if kw in text_lower)

    stress_prob = min(0.95, round(0.15 + (stress_hits * 0.25) - (pos_hits * 0.15), 2))
    stress_prob = max(0.05, stress_prob)

    if stress_prob >= 0.65:
        primary_emotion = "Anxiety / High Strain"
    elif stress_prob >= 0.40:
        primary_emotion = "Mild Fatigue"
    else:
        primary_emotion = "Balanced / Optimistic"

    return {
        "text_length": len(text),
        "stress_probability": stress_prob,
        "primary_emotion": primary_emotion,
        "emotion_scores": {
            "stress": stress_prob,
            "calm": round(1.0 - stress_prob, 2),
            "motivation": round(max(0.1, 0.8 - stress_prob * 0.5), 2)
        }
    }

def calculate_wellbeing_index(
    assessment_answers: Optional[List[int]] = None,
    phq9_scores: Optional[List[int]] = None,
    gad7_scores: Optional[List[int]] = None,
    mood_rating: int = 3,
    journal_text: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes Composite Wellbeing Index (WBI, 0-100) and assigns Green, Amber, or Red safety band.
    Integrates 6-question stress assessment, clinical PHQ9/GAD7, mood ratings, and journal NLP.
    """
    quest_res = score_assessment_questionnaire(assessment_answers) if assessment_answers else score_assessment_questionnaire([1, 1, 1, 1, 1, 1])
    phq_res = score_phq9(phq9_scores)
    gad_res = score_gad7(gad7_scores)
    nlp_res = analyze_journal_text(journal_text)
    
    mood_norm = (5 - mood_rating) / 4.0 # 1 -> 1.0 (high distress), 5 -> 0.0 (healthy)

    # WBI Formula calculation (0 = minimum stress, 100 = critical stress)
    wbi = round(
        (0.35 * (quest_res["stress_percentage"] / 100.0) +
         0.25 * gad_res["norm_score"] +
         0.20 * mood_norm +
         0.20 * nlp_res["stress_probability"]) * 100, 1
    )

    if wbi >= 65:
        band = "Red"
        recommendation = "High stress / distress signals detected. Workload paused. Support options & helpline available."
    elif wbi >= 38:
        band = "Amber"
        recommendation = "Moderate strain detected. Adaptive planner has adjusted study load by -30% and added a rest day."
    else:
        band = "Green"
        recommendation = "Wellbeing indicators stable! Keep up your study flow with regular breaks."

    return {
        "wbi_score": wbi,
        "band": band,
        "recommendation": recommendation,
        "assessment": quest_res,
        "breakdown": {
            "questionnaire": quest_res,
            "phq9": phq_res,
            "gad7": gad_res,
            "mood_rating": mood_rating,
            "journal_nlp": nlp_res
        },
        "questions_schema": STRESS_ASSESSMENT_QUESTIONS
    }
