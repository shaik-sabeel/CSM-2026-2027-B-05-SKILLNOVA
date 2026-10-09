from typing import Dict, Any, List

def adapt_roadmap_for_wellbeing(roadmap: Dict[str, Any], wbi_score: float, wbi_band: str) -> Dict[str, Any]:
    """
    Recalculates study load, schedule, and rest allocations dynamically based on Wellbeing Band.
    """
    phases = roadmap.get("phases", [])
    adjusted_phases = []
    
    if wbi_band == "Red":
        adjustment_reason = "Wellbeing Band is RED (High Distress). Intensive tasks paused. Focus shifted to rest & recovery."
        for phase in phases:
            new_topics = []
            for topic in phase.get("topics", []):
                t = dict(topic)
                t["est_hours"] = max(2, t["est_hours"] // 2)
                t["status"] = "paused_for_wellbeing"
                new_topics.append(t)
            
            p = dict(phase)
            p["topics"] = new_topics
            p["project"] = f"[PAUSED] {p['project']} (Take a break first)"
            adjusted_phases.append(p)
            
    elif wbi_band == "Amber":
        adjustment_reason = "Wellbeing Band is AMBER (Moderate Strain). Weekly study workload reduced by 30% and 1 rest day added."
        for phase in phases:
            new_topics = []
            for topic in phase.get("topics", []):
                t = dict(topic)
                t["est_hours"] = max(3, int(t["est_hours"] * 0.7))
                new_topics.append(t)
            
            p = dict(phase)
            p["topics"] = new_topics
            p["rest_day_scheduled"] = "Wednesday & Sunday"
            adjusted_phases.append(p)
            
    else: # Green
        adjustment_reason = "Wellbeing Band is GREEN (Stable). Regular roadmap pace maintained."
        adjusted_phases = phases

    roadmap_copy = dict(roadmap)
    roadmap_copy["phases"] = adjusted_phases
    roadmap_copy["wellbeing_adjusted"] = (wbi_band != "Green")
    roadmap_copy["adjustment_reason"] = adjustment_reason
    roadmap_copy["wbi_band"] = wbi_band
    roadmap_copy["wbi_score"] = wbi_score

    return roadmap_copy
