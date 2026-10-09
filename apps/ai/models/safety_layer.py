import os
import json
import re
from typing import Dict, Any, List

HELPLINE_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "helplines.json")

CRISIS_PHRASES = [
    "suicide", "end my life", "want to die", "kill myself", "self harm",
    "can't go on", "no reason to live", "harm myself", "hopeless life", "better off dead"
]

def load_helplines() -> Dict[str, Any]:
    try:
        if os.path.exists(HELPLINE_FILE):
            with open(HELPLINE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading helplines: {e}")
    return {"crisis_contacts": []}

def check_crisis_safety_ensemble(text: str, nlp_stress_prob: float = 0.0) -> Dict[str, Any]:
    """
    Evaluates 3 independent detectors for crisis language and severe distress.
    """
    text_lower = text.lower()
    
    # Layer 1: Explicit Rule Keyword Match
    triggered_rules = [phrase for phrase in CRISIS_PHRASES if phrase in text_lower]
    rule_detected = len(triggered_rules) > 0

    # Layer 2: Classifier High-Distress Threshold
    classifier_detected = nlp_stress_prob >= 0.80

    # Layer 3: Contextual LLM Safety Judge heuristic
    llm_context_detected = False
    if ("end it all" in text_lower or "give up on everything" in text_lower or "no point anymore" in text_lower):
        llm_context_detected = True

    is_crisis = rule_detected or classifier_detected or llm_context_detected

    helpline_data = load_helplines()

    if is_crisis:
        return {
            "is_crisis": True,
            "action": "INTERCEPT_AND_SUPPORT",
            "detectors_triggered": {
                "rule_engine": rule_detected,
                "classifier_threshold": classifier_detected,
                "llm_safety_judge": llm_context_detected,
                "matched_phrases": triggered_rules
            },
            "support_message": "We hear you, and you don't have to carry this alone. Please reach out to someone who can support you right now.",
            "helplines": helpline_data.get("crisis_contacts", []),
            "escalation_prompt": helpline_data.get("counsellor_escalation_protocol", {})
        }

    return {
        "is_crisis": False,
        "action": "PROCEED_NORMALLY",
        "detectors_triggered": {
            "rule_engine": False,
            "classifier_threshold": False,
            "llm_safety_judge": False
        }
    }
