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
    physiological interventions (e.g. hydration), and curated stress-relief media.
    Inspired by clinical CBT frameworks & Mourya's MindCare architecture.
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
                "emotion_tag": "Crisis Distress Alert",
                "immediate_action": "🚨 Connect immediately with confidential 24/7 crisis support.",
                "response": (
                    f"### 💙 I hear your pain, and your safety is the highest priority.\n\n"
                    f"It sounds like you are carrying an overwhelming emotional burden right now. Please know that you are not alone, "
                    f"and there are caring professionals ready to support you right this second without judgment.\n\n"
                    f"**Immediate Safety Steps:**\n"
                    f"1. Take one slow, gentle breath in... and softly release.\n"
                    f"2. Stay in a safe space or sit near a friend or family member.\n"
                    f"3. Call or text the confidential 24/7 helplines below — they are completely free."
                ),
                "speech_text": "I hear your pain, and your safety is the highest priority. You are not alone, and there is support available right now.",
                "grounding_technique": {
                    "type": "crisis_support",
                    "title": "Immediate 24/7 Crisis Support Lines",
                    "steps": [
                        "Tele-MANAS Mental Health Line: Dial 14416 (24/7 Toll-Free, India)",
                        "KIRAN Mental Health Helpline: 1800-599-0019 (24/7 Free)",
                        "National Suicide & Crisis Lifeline: 988 (USA / Global)"
                    ],
                    "tip": "Speaking to someone is a sign of courage, not weakness."
                },
                "recommended_media": {
                    "youtube": STRESS_RELIEF_MEDIA["youtube_playlists"][:2],
                    "movies": STRESS_RELIEF_MEDIA["movies_and_shows"][:2],
                    "micro_habits": STRESS_RELIEF_MEDIA["micro_habits"]
                },
                "safety_eval": safety_eval
            }

        # 2. Emotional Keyword & Intent Classification
        is_anxious = any(k in query_lower for k in ["anxiety", "anxious", "panic", "fear", "nervous", "heart racing", "trembling", "palpitations", "scared", "worry", "worried"])
        is_sad = any(k in query_lower for k in ["sad", "sadness", "depressed", "depression", "crying", "down", "lonely", "grief", "hopeless", "unhappy", "hurting", "empty"])
        is_overwhelmed = any(k in query_lower for k in ["overwhelmed", "exam stress", "too much work", "burnout", "exhausted", "tired", "pressure", "deadline", "academic load"])
        is_sleep = any(k in query_lower for k in ["sleep", "cannot sleep", "can't sleep", "insomnia", "sleepless", "nightmare", "restless"])
        is_frustrated = any(k in query_lower for k in ["angry", "frustrated", "irritated", "rage", "furious", "annoyed"])
        is_positive = any(k in query_lower for k in ["happy", "good", "great", "better", "excited", "grateful", "thankful", "peaceful", "calm"])

        if is_anxious:
            emotion_tag = "Anxiety & Physical Tension"
            immediate_action = "💧 Drink a full glass of cool water right now to stimulate your vagus nerve and lower heart rate."
            response_md = (
                f"### 🧘 Mental Guru: Grounding & Anxiety Relief\n\n"
                f"I hear you, and it is completely normal to feel anxious. Anxiety is your body's sympathetic nervous system activating an alert. "
                f"You are safe right here, right now. Let's gently reset your physiological rhythm.\n\n"
                f"**Immediate Physiological Steps:**\n"
                f"• **Drink Cool Water:** Sip a glass of cool water slowly. Feel the cooling sensation going down your throat — this triggers your mammalian dive reflex and slows down an elevated pulse.\n"
                f"• **Unclench Your Jaw & Drop Your Shoulders:** Notice if you are holding tension in your neck or stomach.\n"
                f"• **5-4-3-2-1 Sensory Grounding:** Bring your senses back to the physical room around you."
            )
            speech_text = "I hear you, and it is completely valid to feel anxious. Take a sip of cool water right now to calm your body. Let's practice a gentle grounding exercise together."
            grounding = {
                "type": "sensory_grounding",
                "title": "5-4-3-2-1 Sensory Grounding Technique",
                "steps": [
                    "👀 Notice 5 things you can SEE around your room",
                    "🖐️ Touch 4 physical objects (your desk, fabric of your clothes, a pen)",
                    "👂 Listen for 3 distinct SOUNDS in your environment",
                    "👃 Notice 2 scents or SMELLS in the air",
                    "👅 Notice 1 TASTE in your mouth (or take a refreshing sip of water)"
                ],
                "tip": "Grounding pulls your brain away from anxious future-loops back into physical safety."
            }
        elif is_sad:
            emotion_tag = "Sadness & Emotional Fatigue"
            immediate_action = "☕ Have a warm cup of water or tea, wrap in comfortable clothes, and be gentle with yourself."
            response_md = (
                f"### 💙 Mental Guru: Compassionate Warmth & Acceptance\n\n"
                f"I am sending you so much warmth. It takes real honesty to admit when we are feeling sad or down. "
                f"You do not need to force yourself to smile or perform today. Your feelings are valid, and this heavy wave will pass.\n\n"
                f"**Gentle Self-Care Plan for Today:**\n"
                f"• **Wrap Yourself in Warmth:** Put on your softest sweater or curl under a warm blanket.\n"
                f"• **Hydrate & Rest:** Sip warm water or tea. Avoid harsh caffeine or negative social media feeds.\n"
                f"• **Watch a Comforting Movie:** Put on *Spirited Away* or *The Secret Life of Walter Mitty* to let your mind rest in cozy scenery.\n"
                f"• **Express in Your Private Journal:** Release whatever feels heavy into your private self-journal below."
            )
            speech_text = "I am sending you warmth. It takes courage to acknowledge sadness. You do not have to carry everything alone today. Be very gentle with yourself."
            grounding = {
                "type": "self_compassion",
                "title": "Self-Compassion & Heart Rest Pause",
                "steps": [
                    "Place your warm hand softly over your heart or on your chest",
                    "Take 3 slow, soothing breaths",
                    "Silently repeat: 'This is a moment of difficulty. Difficulty is part of being human. May I be kind to myself right now.'",
                    "Allow yourself 15 minutes of guilt-free quiet rest"
                ],
                "tip": "Compassion calms the brain's threat circuitry faster than self-criticism ever could."
            }
        elif is_overwhelmed:
            emotion_tag = "Academic Overwhelm & Cognitive Burnout"
            immediate_action = "⏸️ Step away from your desk for 10 minutes. Hydrate with cool water."
            response_md = (
                f"### 🌿 Mental Guru: Workload & Academic Overwhelm Reset\n\n"
                f"When exams, roadmaps, and deadlines pile up, our working memory gets saturated. Feeling overwhelmed is your brain asking for a cognitive breather.\n\n"
                f"**The 3-Step Micro-Break Protocol:**\n"
                f"1. **Full 10-Minute Screen Pause:** Stand up, drink a large glass of water, and stretch your spine.\n"
                f"2. **Task Atomization:** Pick ONLY ONE micro-task for the next 25 minutes. Hide everything else.\n"
                f"3. **Wellbeing Auto-Adjustment:** Remember, CourseConnect automatically reduces your roadmap workload when stress is elevated."
            )
            speech_text = "When everything demands your attention at once, feeling overwhelmed is a natural signal to pause. Let's take a 10-minute micro break and break your tasks down."
            grounding = {
                "type": "task_breakdown",
                "title": "Task Atomization & Box Breathing",
                "steps": [
                    "Write down the single most urgent task on paper",
                    "Break it into 3 tiny sub-steps that take 10 minutes each",
                    "Do 4 rounds of Box Breathing (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s)",
                    "Complete only Sub-Step 1, then reward yourself with a break"
                ],
                "tip": "Chunking transforms insurmountable mountains into manageable small steps."
            }
        elif is_sleep:
            emotion_tag = "Sleep Restlessness & Insomnia"
            immediate_action = "🌙 Turn down bright screen lights, switch to night mode, and practice 4-7-8 breathing."
            response_md = (
                f"### 🌙 Mental Guru: Sleep Sanctuary & Night Rest\n\n"
                f"Struggling to sleep is deeply frustrating, especially before classes or interviews. The secret is to stop trying to force sleep and focus instead on physical rest.\n\n"
                f"**Sleep Reset Checklist:**\n"
                f"• Put your phone in another room or turn off notification chimes.\n"
                f"• Turn on soft ambient rain or lofi sleep audio.\n"
                f"• Keep your bedroom cool and dark.\n"
                f"• Even if you are resting with eyes closed, your body is recharging."
            )
            speech_text = "Focus on resting your body rather than forcing sleep. Practice 4-7-8 breathing with soothing rain sounds playing in the background."
            grounding = {
                "type": "breathing_478",
                "title": "4-7-8 Deep Sleep Breathing Induction",
                "steps": [
                    "Exhale completely through your mouth with a whoosh sound",
                    "Close your lips and inhale quietly through your nose for 4 counts",
                    "Hold your breath gently for 7 counts",
                    "Exhale completely through your mouth for 8 counts",
                    "Repeat this cycle 4 times in bed"
                ],
                "tip": "The prolonged 8-second exhale stimulates acetylcholine release, slowing heart rate."
            }
        elif is_frustrated:
            emotion_tag = "Frustration & Anger Reset"
            immediate_action = "🧊 Splash cool water on your face or hold an ice cube to reset your nervous system."
            response_md = (
                f"### 🔥 Mental Guru: Anger & Tension Release\n\n"
                f"Frustration is high-intensity energy. Rather than repressing it, let's discharge the physical adrenaline safely.\n\n"
                f"**Adrenaline Discharge Steps:**\n"
                f"• Do 10 quick shoulder rolls or a brisk 5-minute walk.\n"
                f"• Drink a glass of cold ice water.\n"
                f"• Write uncensored thoughts in the private journal to vent, then close the tab."
            )
            speech_text = "Frustration is high-intensity energy. Let's discharge the adrenaline with cold water and slow physiological sighs."
            grounding = {
                "type": "somatic_release",
                "title": "Physiological Sigh & Tension Release",
                "steps": [
                    "Take a deep breath in through your nose",
                    "At the very top, take a second quick sharp inhale",
                    "Exhale very slowly through your mouth until completely empty",
                    "Repeat 3 times to collapse alveoli and reset autonomic tone"
                ],
                "tip": "Double-inhale physiological sighs are the fastest known biological reset for acute tension."
            }
        elif is_positive:
            emotion_tag = "Positive Emotional State"
            immediate_action = "🌟 Celebrate this moment and anchor this good feeling into your memory."
            response_md = (
                f"### 🌟 Mental Guru: Celebrating Your Calm & Balance!\n\n"
                f"That is wonderful to hear! It is just as important to acknowledge good moments as it is to navigate tough ones.\n\n"
                f"**Keep This Momentum:**\n"
                f"• Celebrate the small steps you accomplished this week.\n"
                f"• Maintain your hydration and regular sleep routine.\n"
                f"• Feel free to share positive encouragement with a peer or teammate!"
            )
            speech_text = "That is wonderful to hear! Celebrate this moment and keep up your healthy balance."
            grounding = {
                "type": "gratitude_anchor",
                "title": "Positive Emotion Anchoring",
                "steps": [
                    "Think of 2 specific things that brought you peace or joy today",
                    "Notice the feeling of calm in your body",
                    "Take a deep, grateful breath"
                ],
                "tip": "Savoring positive states builds psychological resilience for future challenges."
            }
        else:
            emotion_tag = "General Wellbeing Support"
            immediate_action = "🌿 Take 3 slow breaths and check in with your mind and body."
            response_md = (
                f"### ✨ Mental Guru: Compassionate Wellness Support\n\n"
                f"Welcome to your safe sanctuary! I am your AI Mental Wellbeing Counselor, trained on student mental health principles.\n\n"
                f"**How can I assist you right now?**\n"
                f"• Express how you feel: *'I am feeling anxiety'*, *'I feel very sad'*, *'Exam pressure is overwhelming'*\n"
                f"• Ask for quick grounding: *'Give me a breathing exercise'*, *'I can't sleep'*\n"
                f"• Explore daily relief: *'Suggest some soothing YouTube playlists or feel-good movies'*"
            )
            speech_text = "Welcome to your safe sanctuary. I am your Mental Guru AI Counselor. How is your mind feeling today?"
            grounding = {
                "type": "general_wellness",
                "title": "Daily Student Mindful Checklist",
                "steps": [
                    "Drink 8 glasses of fresh water throughout the day",
                    "Take a 5-minute break every 25 minutes of study",
                    "Practice 4-7-8 breathing before bed",
                    "Write down your thoughts in the private self-journal"
                ],
                "tip": "Consistent micro-habits protect you against long-term academic burnout."
            }

        return {
            "query": query_clean,
            "is_crisis": False,
            "emotion_tag": emotion_tag,
            "immediate_action": immediate_action,
            "response": response_md,
            "speech_text": speech_text,
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

