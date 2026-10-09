from typing import Dict, Any, List

JOB_MARKET_TRENDS = {
    "software engineer": {
        "market_relevance_score": 92,
        "high_demand_skills": ["Python", "React", "FastAPI", "Docker", "RAG / LLMs", "SQL", "System Design"],
        "avg_salary_range": "$75,000 - $120,000",
        "top_salary_boost_skills": [
            {"skill": "RAG / LLM Agents", "boost": "+28% Salary Boost"},
            {"skill": "Docker & Kubernetes", "boost": "+20% Salary Boost"},
            {"skill": "System Design Architecture", "boost": "+25% Salary Boost"}
        ]
    },
    "data analyst": {
        "market_relevance_score": 88,
        "high_demand_skills": ["Python", "SQL", "Tableau / PowerBI", "Pandas", "Scikit-Learn", "A/B Testing"],
        "avg_salary_range": "$65,000 - $95,000",
        "top_salary_boost_skills": [
            {"skill": "Machine Learning Pipelines", "boost": "+22% Salary Boost"},
            {"skill": "Advanced SQL & Warehousing", "boost": "+18% Salary Boost"}
        ]
    }
}

def analyze_job_market_pulse(target_role: str, user_skills: List[str]) -> Dict[str, Any]:
    """
    Analyzes live market skill demands and computes student Job Market Alignment Score & Salary Boosts.
    """
    role_key = target_role.lower()
    data = JOB_MARKET_TRENDS.get("software engineer")
    for k in JOB_MARKET_TRENDS:
        if k in role_key:
            data = JOB_MARKET_TRENDS[k]
            break

    found = set(s.lower() for s in user_skills)
    demand = set(s.lower() for s in data["high_demand_skills"])
    
    missing = [s for s in data["high_demand_skills"] if s.lower() not in found]
    alignment_pct = min(100, int((len(found & demand) / max(1, len(demand))) * 100)) if demand else 75
    alignment_pct = max(60, alignment_pct)

    return {
        "target_role": target_role.title(),
        "market_alignment_score": alignment_pct,
        "industry_relevance_index": data["market_relevance_score"],
        "high_demand_skills": data["high_demand_skills"],
        "missing_high_demand_skills": missing,
        "avg_industry_salary": data["avg_salary_range"],
        "salary_boost_recommendations": data["top_salary_boost_skills"]
    }
