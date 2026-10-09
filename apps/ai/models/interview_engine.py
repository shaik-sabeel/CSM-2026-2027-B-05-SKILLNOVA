import re
from typing import List, Dict, Any

FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually", "so yeah", "sort of"]

ROLE_QUESTION_BANK = {
    "software engineer": [
        "How do you handle hash collisions in a hash map, and what are the time complexity trade-offs?",
        "Describe a time you encountered a severe bug in production. How did you diagnose and resolve it?",
        "What is the difference between processes and threads, and how does asynchronous I/O improve backend throughput?"
    ],
    "data analyst": [
        "Explain the difference between WHERE and HAVING clauses in SQL with an example.",
        "How do you handle missing values or outliers in a dataset prior to exploratory data analysis?",
        "Describe how you would explain a complex statistical model result to non-technical stakeholders."
    ],
    "general": [
        "Tell me about a challenging project you built. What was your specific role and key outcome?",
        "How do you prioritize competing deadlines when working on multiple tight deliverables?"
    ]
}

def generate_interview_questions(role: str, round_type: str = "technical") -> List[str]:
    role_key = role.lower()
    for k in ROLE_QUESTION_BANK:
        if k in role_key:
            return ROLE_QUESTION_BANK[k]
    return ROLE_QUESTION_BANK["general"]

def evaluate_interview_response(question: str, answer_text: str, duration_sec: int = 45) -> Dict[str, Any]:
    """
    Evaluates candidate response across correctness, depth, STAR structure, clarity, and speech filler words.
    """
    answer_lower = answer_text.lower()
    words = re.findall(r'\b\w+\b', answer_lower)
    word_count = len(words)
    
    # 1. Filler word detection
    found_fillers = {}
    total_fillers = 0
    for fw in FILLER_WORDS:
        count = len(re.findall(r'\b' + re.escape(fw) + r'\b', answer_lower))
        if count > 0:
            found_fillers[fw] = count
            total_fillers += count

    # 2. Speaking pace (words per minute)
    wpm = int((word_count / max(1, duration_sec)) * 60)

    # 3. STAR criteria heuristic check (Situation, Task, Action, Result)
    star_keywords = {
        "situation": ["when", "project", "client", "problem", "situation", "company"],
        "task": ["needed", "required", "goal", "objective", "task", "assignment"],
        "action": ["built", "implemented", "wrote", "designed", "created", "led", "solved"],
        "result": ["resulted", "achieved", "reduced", "improved", "increased", "outcome", "finally"]
    }

    star_score = sum(1 for category, kws in star_keywords.items() if any(kw in answer_lower for kw in kws))

    # 4. Rubric Scores (1 to 5)
    technical_correctness = 4 if word_count > 25 else 2
    depth = 4 if word_count > 50 else 2
    clarity = 5 if total_fillers <= 2 else 3
    star_rating = min(5, star_score + 1)
    
    overall_score = round((technical_correctness + depth + clarity + star_rating) / 4.0, 1)

    return {
        "question": question,
        "answer_transcript": answer_text,
        "overall_score": overall_score,
        "scores": {
            "technical_correctness": technical_correctness,
            "depth_and_detail": depth,
            "star_structure": star_rating,
            "clarity_and_delivery": clarity
        },
        "speech_analytics": {
            "word_count": word_count,
            "words_per_minute": wpm,
            "total_filler_words": total_fillers,
            "filler_breakdown": found_fillers,
            "pace_verdict": "Optimal Pace" if 110 <= wpm <= 160 else ("Too Fast" if wpm > 160 else "Paced / Calm")
        },
        "feedback_summary": [
            "Good technical detail provided in your explanation." if word_count > 30 else "Try providing more concrete technical depth.",
            f"STAR framework alignment: {star_score}/4 components recognized." if star_score >= 2 else "Structure your answer using Situation -> Task -> Action -> Result.",
            f"Filler word count: {total_fillers} detected. Practice pausing instead of using filler phrases." if total_fillers > 0 else "Excellent delivery with minimal filler words!"
        ],
        "ideal_sample_answer": f"In response to '{question}', a high-scoring answer clearly establishes context, details your specific implementation choices, mentions metrics or outcomes achieved, and highlights key lessons learned."
    }
