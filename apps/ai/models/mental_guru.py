import re
from typing import List, Dict, Any, Optional
from models.safety_layer import check_crisis_safety_ensemble

# --- Curated Stress Relief Resources Database ---
STRESS_RELIEF_MEDIA = {
    "youtube_playlists": [
        {
            "title": "☕ Lofi Hip Hop Radio - Beats to Relax/Study to",
            "url": "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            "category": "Relaxation & Study",
            "duration": "24/7 Live Stream",
            "description": "Gentle, soothing lofi beats designed to reduce heart rate and quiet mental chatter."
        },
        {
            "title": "🌧️ 10-Minute Deep Relaxation & Mindfulness Meditation",
            "url": "https://www.youtube.com/watch?v=ZToicYcHIOU",
            "category": "Guided Meditation",
            "duration": "10 mins",
            "description": "Guided breathing exercises to activate the parasympathetic nervous system."
        },
        {
            "title": "🌲 Soft Forest Rain & Thunder Ambient Sleep Sounds",
            "url": "https://www.youtube.com/watch?v=lE6RYpe9XA0",
            "category": "Ambient Nature",
            "duration": "1 Hour",
            "description": "Calming natural rain audio for deep sleep and anxiety relief."
        },
        {
            "title": "🎵 Piano Comfort - Soothing Acoustic Melody for Stress Relief",
            "url": "https://www.youtube.com/watch?v=1ZYbU82GVz4",
            "category": "Peaceful Music",
            "duration": "30 mins",
            "description": "Minimalist piano arrangements crafted for stress reduction."
        }
    ],
    "movies_and_shows": [
        {
            "title": "The Secret Life of Walter Mitty",
            "genre": "Uplifting / Adventure",
            "theme": "Overcoming Fear & Finding Purpose",
            "recommendation_note": "A visually stunning, soul-soothing film about breaking out of anxiety and embracing real life."
        },
        {
            "title": "Spirited Away (Studio Ghibli)",
            "genre": "Animation / Cozy",
            "theme": "Resilience & Calm Discovery",
            "recommendation_note": "Immersive, cozy masterpiece with peaceful soundscapes to ground an overworked mind."
        },
        {
            "title": "Soul (Disney / Pixar)",
            "genre": "Animation / Philosophy",
            "theme": "Appreciating Small Joyful Moments",
            "recommendation_note": "Beautiful reminder that your worth is not tied solely to academic achievement."
        },
        {
            "title": "Good Will Hunting",
            "genre": "Drama / Mentorship",
            "theme": "Healing & Emotional Acceptance",
            "recommendation_note": "Inspiring story about overcoming inner barriers and accepting support from mentors."
        }
    ],
    "micro_habits": [
        "💧 Drink a full 250ml glass of fresh cool water to help regulate physical anxiety.",
        "🫁 4-7-8 Breathing: Inhale through nose for 4s, hold for 7s, exhale slowly through mouth for 8s.",
        "👀 20-20-20 Rule: Every 20 minutes of study, look at an object 20 feet away for 20 seconds.",
        "🚶 5-Minute Campus Walk: Step away from screens and stretch your legs in natural sunlight."
    ]
}

class MentalGuruEngine:
    """
    Role-Based Compassionate AI Mental Wellbeing Guru.
    Provides empathetic active listening, clinical grounding techniques,
    and curated stress-relief media recommendations.
    """
    def generate_guru_response(self, query: str, user_mood: int = 3) -> Dict[str, Any]:
        query_clean = query.strip()
        query_lower = query_clean.lower()

        # 1. First run 3-Layer Crisis Safety Ensemble
        safety_eval = check_crisis_safety_ensemble(query_clean)
        
        if safety_eval["is_crisis"]:
            return {
                "query": query_clean,
                "is_crisis": True,
                "response": (
                    f"### 💙 I am here with you, and your safety is the top priority.\n\n"
                    f"It sounds like you are experiencing overwhelming pain right now. Please know that you do not have to carry this alone. "
                    f"I have connected you with verified 24/7 crisis support lines below.\n\n"
                    f"**Immediate Safety Steps:**\n"
                    f"1. Take a slow, deep breath in... and release.\n"
                    f"2. Stay in a safe environment or reach out to a trusted friend or family member.\n"
                    f"3. Connect directly with a trained compassionate counselor right now (toll-free & confidential)."
                ),
                "grounding_technique": {
                    "type": "crisis_support",
                    "title": "Immediate Crisis Intervention",
                    "steps": [
                        "Call Tele-MANAS at 14416 (24/7 Toll-Free)",
                        "Call KIRAN Helpline at 1800-599-0019",
                        "Reach out to campus counselling support"
                    ]
                },
                "recommended_media": STRESS_RELIEF_MEDIA["youtube_playlists"][:2],
                "safety_eval": safety_eval
            }

        # 2. Emotional Keyword & Intent Classification
        is_anxious = any(k in query_lower for k in ["anxiety", "anxious", "panic", "fear", "nervous", "heart racing", "trembling"])
        is_sad = any(k in query_lower for k in ["sad", "depressed", "crying", "down", "lonely", "grief", "hopeless", "unhappy"])
        is_overwhelmed = any(k in query_lower for k in ["overwhelmed", "exam stress", "too much work", "burnout", "exhausted", "tired", "pressure"])
        is_seeking_tips = any(k in query_lower for k in ["tips", "how to relax", "reduce stress", "recommend", "meditation", "movie"])

        if is_anxious:
            response_md = (
                f"### 🧘 Mental Guru: Grounding & Anxiety Relief\n\n"
                f"I hear you, and it is completely valid to feel anxious. Anxiety is your body's nervous system reacting to stress. "
                f"Let's bring your focus gently back into the present moment.\n\n"
                f"**Immediate Grounding Action:**\n"
                f"• **Drink Water:** Grab a cool glass of water. Focus on the sensation of swallowing.\n"
                f"• **5-4-3-2-1 Sensory Reset:** Notice 5 things you see around you, 4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste.\n\n"
                f"💡 *Remember:* You have navigated tough feelings before, and this feeling will pass."
            )
            grounding = {
                "type": "sensory_grounding",
                "title": "5-4-3-2-1 Sensory Grounding Exercise",
                "steps": [
                    "5 Things you can SEE around the room",
                    "4 Things you can PHYSICAL TOUCH (your chair, desk)",
                    "3 Things you can HEAR in the environment",
                    "2 Things you can SMELL",
                    "1 Thing you can TASTE"
                ]
            }
        elif is_sad:
            response_md = (
                f"### 💙 Mental Guru: Compassionate Warmth & Acceptance\n\n"
                f"I am sending you warmth. It takes courage to acknowledge sadness. You don't need to force yourself to be cheerful right now. "
                f"Be gentle with yourself today.\n\n"
                f"**Self-Care Recommendations for Today:**\n"
                f"• Wrap yourself in a warm blanket or wear comfortable clothing.\n"
                f"• Listen to soft acoustic music or watch a soothing, comforting movie.\n"
                f"• Write down your thoughts in your private self-journal without judgment."
            )
            grounding = {
                "type": "self_compassion",
                "title": "Self-Compassion Pause",
                "steps": [
                    "Place your hand gently over your heart",
                    "Take 3 deep, slow breaths",
                    "Repeat: 'I am allowed to rest. I am doing the best I can.'"
                ]
            }
        elif is_overwhelmed:
            response_md = (
                f"### 🌿 Mental Guru: Workload & Burnout Reset\n\n"
                f"When everything demands your attention at once, feeling overwhelmed is a natural signal to pause. "
                f"Let's break down the mountain into tiny, manageable pebbles.\n\n"
                f"**Immediate Micro-Break Protocol:**\n"
                f"1. **Pause for 10 minutes:** Step away from your computer screen.\n"
                f"2. **4-7-8 Breathing:** Inhale 4s, hold 7s, exhale 8s (3 rounds).\n"
                f"3. **Pick ONLY 1 Small Task:** Ignore the rest of the list for the next 30 minutes."
            )
            grounding = {
                "type": "breathing_478",
                "title": "4-7-8 Parasympathetic Breathing Reset",
                "steps": [
                    "Breathe in quietly through nose for 4 seconds",
                    "Hold breath gently for 7 seconds",
                    "Exhale completely through mouth with a whoosh for 8 seconds",
                    "Repeat cycle 4 times"
                ]
            }
        else:
            response_md = (
                f"### ✨ Mental Guru: Wellness Coaching\n\n"
                f"Welcome! I am your AI Mental Health & Wellness Guru. I am here to help you navigate academic stress, "
                f"mindfulness, anxiety relief, and healthy study-rest balance.\n\n"
                f"**How can I support you today?**\n"
                f"• Ask me about quick grounding techniques for exam stress\n"
                f"• Request soothing YouTube music or comforting movie ideas\n"
                f"• Talk to me whenever you feel anxious, sad, or overwhelmed"
            )
            grounding = {
                "type": "general_wellness",
                "title": "Daily Mindful Checklist",
                "steps": [
                    "Stay hydrated with fresh water",
                    "Take regular 5-minute study breaks",
                    "Log your daily thoughts in the private self-journal"
                ]
            }

        return {
            "query": query_clean,
            "is_crisis": False,
            "response": response_md,
            "grounding_technique": grounding,
            "recommended_media": {
                "youtube": STRESS_RELIEF_MEDIA["youtube_playlists"][:2],
                "movies": STRESS_RELIEF_MEDIA["movies_and_shows"][:2],
                "micro_habits": STRESS_RELIEF_MEDIA["micro_habits"]
            },
            "safety_eval": safety_eval
        }

# Singleton Instance
mental_guru_service = MentalGuruEngine()

def get_mental_guru_advice(query: str, user_mood: int = 3) -> Dict[str, Any]:
    return mental_guru_service.generate_guru_response(query, user_mood)
