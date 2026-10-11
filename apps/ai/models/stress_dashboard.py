"""
Stress Dashboard Chart Generator
Produces JSON chart-ready data (compatible with Recharts on the frontend)
for visualising stress history trends, dimension breakdowns, and WBI gauge.
"""

import math
from typing import List, Dict, Any, Optional


# --------------------------------------------------------------------------- #
#  Colour / band helpers                                                       #
# --------------------------------------------------------------------------- #
def _band_color(band: str) -> str:
    return {"Green": "#10b981", "Amber": "#f59e0b", "Red": "#ef4444"}.get(band, "#6366f1")


# --------------------------------------------------------------------------- #
#  1. Radar / dimension breakdown                                              #
# --------------------------------------------------------------------------- #
def _dimension_breakdown(answers: List[int]) -> List[Dict[str, Any]]:
    """Convert the 6 raw MCQ answers into named dimension scores (0-100)."""
    labels = [
        "Academic Load",
        "Sleep Quality",
        "Physical Anxiety",
        "Cognitive Focus",
        "Emotional Drain",
        "Social Support",
    ]
    result = []
    for i, label in enumerate(labels):
        raw = answers[i] if i < len(answers) else 1
        # Invert: higher answer = worse; we want 0 = perfect health, 100 = worst
        pct = round((raw / 4.0) * 100, 1)
        result.append({"dimension": label, "stress": pct, "health": round(100 - pct, 1)})
    return result


# --------------------------------------------------------------------------- #
#  2. Gauge segments for the WBI Dial                                         #
# --------------------------------------------------------------------------- #
def _wbi_gauge(wbi: float, band: str) -> Dict[str, Any]:
    return {
        "wbi_score": wbi,
        "band": band,
        "color": _band_color(band),
        "segments": [
            {"name": "Green Zone", "value": 38, "fill": "#10b981"},
            {"name": "Amber Zone", "value": 27, "fill": "#f59e0b"},
            {"name": "Red Zone",   "value": 35, "fill": "#ef4444"},
        ],
        "needle_pct": min(100, max(0, round(wbi, 1))),
    }


# --------------------------------------------------------------------------- #
#  3. Emotion distribution pie                                                 #
# --------------------------------------------------------------------------- #
def _emotion_pie(journal_nlp: Dict[str, Any]) -> List[Dict[str, Any]]:
    scores = journal_nlp.get("emotion_scores", {})
    return [
        {"name": "Stress",     "value": round(scores.get("stress", 0.2) * 100, 1), "fill": "#ef4444"},
        {"name": "Calm",       "value": round(scores.get("calm", 0.8) * 100, 1),   "fill": "#10b981"},
        {"name": "Motivation", "value": round(scores.get("motivation", 0.6) * 100, 1), "fill": "#6366f1"},
    ]


# --------------------------------------------------------------------------- #
#  4. Checkin history sparkline (last N entries)                              #
# --------------------------------------------------------------------------- #
def build_history_trend(checkin_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Accepts the checkin store entries and returns a chart-ready
    timeline: [{day, wbi, band, mood}, ...]
    """
    out = []
    for i, c in enumerate(checkin_list[-10:]):
        wa = c.get("wellbeing_analysis", {})
        out.append({
            "day": f"Day {i + 1}",
            "wbi": wa.get("wbi_score", 25),
            "mood": c.get("mood_rating", 3) * 20,   # scale 1-5 -> 20-100
            "band": wa.get("band", "Green"),
        })
    return out


# --------------------------------------------------------------------------- #
# --------------------------------------------------------------------------- #
#  5. Python Matplotlib Visualization Generator                                #
# --------------------------------------------------------------------------- #
def generate_python_matplotlib_chart(
    wbi_score: float,
    band: str,
    answers: List[int],
    trend: List[Dict[str, Any]]
) -> Optional[str]:
    """
    Generates a dark-mode multi-panel Matplotlib dashboard (Radar, Gauge, and Trend)
    and serializes it to a base64 PNG data URL.
    """
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import numpy as np
        import io
        import base64

        fig = plt.figure(figsize=(11.5, 4.2), facecolor='#090d16', dpi=140)

        # 1. Radar / Polar Chart (6 Wellbeing Dimensions)
        ax1 = fig.add_subplot(131, polar=True, facecolor='#0f172a')
        labels = ["Academic", "Sleep", "Anxiety", "Focus", "Burnout", "Social"]
        stress_vals = [round((a / 4.0) * 100, 1) for a in answers[:6]]
        if len(stress_vals) < 6:
            stress_vals += [25.0] * (6 - len(stress_vals))
        health_vals = [round(100.0 - s, 1) for s in stress_vals]

        angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False).tolist()
        stress_plot = stress_vals + stress_vals[:1]
        health_plot = health_vals + health_vals[:1]
        angles_plot = angles + angles[:1]

        ax1.plot(angles_plot, stress_plot, color='#f43f5e', linewidth=2, label='Stress Load')
        ax1.fill(angles_plot, stress_plot, color='#f43f5e', alpha=0.25)
        ax1.plot(angles_plot, health_plot, color='#10b981', linewidth=1.5, linestyle='--', label='Resilience')
        ax1.fill(angles_plot, health_plot, color='#10b981', alpha=0.15)
        ax1.set_xticks(angles)
        ax1.set_xticklabels(labels, color='#94a3b8', fontsize=8, fontweight='bold')
        ax1.set_ylim(0, 100)
        ax1.set_yticks([25, 50, 75, 100])
        ax1.set_yticklabels(['25', '50', '75', '100'], color='#475569', fontsize=7)
        ax1.grid(color='#1e293b', linestyle=':')
        ax1.set_title("Stress vs Resilience Radar", color='#f8fafc', fontsize=10, fontweight='bold', pad=15)
        ax1.legend(loc='upper right', bbox_to_anchor=(1.25, 1.15), facecolor='#0f172a', edgecolor='#334155', labelcolor='#e2e8f0', fontsize=7)

        # 2. WBI Stress Meter & Zone Breakdown
        ax2 = fig.add_subplot(132, facecolor='#0f172a')
        band_colors = {'Green': '#10b981', 'Amber': '#f59e0b', 'Red': '#ef4444'}
        current_col = band_colors.get(band, '#14b8a6')

        categories = ['Green Zone (0-35)', 'Amber Zone (36-65)', 'Red Zone (66-100)', f'Current WBI ({wbi_score}%)']
        zone_vals = [35, 65, 100, min(100, max(0, wbi_score))]
        bar_colors = ['#10b98133', '#f59e0b33', '#ef444433', current_col]
        edge_colors = ['#10b981', '#f59e0b', '#ef4444', current_col]

        ax2.barh(categories, zone_vals, color=bar_colors, edgecolor=edge_colors, linewidth=1.5, height=0.55)
        ax2.set_xlim(0, 105)
        ax2.grid(axis='x', color='#1e293b', linestyle='--')
        ax2.tick_params(colors='#94a3b8', labelsize=8)
        ax2.set_xlabel('Index Score (%)', color='#94a3b8', fontsize=8)
        ax2.set_title(f"Wellbeing Index: {wbi_score}% [{band}]", color='#f8fafc', fontsize=10, fontweight='bold', pad=12)
        for spine in ax2.spines.values():
            spine.set_color('#1e293b')
        ax2.text(min(96, wbi_score + 2), 3, f"{wbi_score}%", va='center', color=current_col, fontweight='bold', fontsize=9)

        # 3. Longitudinal Wellbeing Trend
        ax3 = fig.add_subplot(133, facecolor='#0f172a')
        days = [t.get("day", f"D{i+1}") for i, t in enumerate(trend)]
        wbis = [t.get("wbi", 25) for t in trend]
        moods = [t.get("mood", 60) for t in trend]

        ax3.plot(days, wbis, marker='o', color='#f43f5e', linewidth=2, label='Stress Index')
        ax3.plot(days, moods, marker='s', color='#10b981', linewidth=1.8, linestyle='--', label='Mood (%)')
        ax3.axhspan(0, 35, color='#10b981', alpha=0.08, label='Optimal Green')
        ax3.axhspan(36, 65, color='#f59e0b', alpha=0.08, label='Amber Load')
        ax3.axhspan(66, 100, color='#ef4444', alpha=0.08, label='Red Strain')

        ax3.set_ylim(0, 105)
        ax3.grid(color='#1e293b', linestyle=':')
        ax3.tick_params(colors='#94a3b8', labelsize=8)
        ax3.set_title("Multi-Day Stress & Mood Trend", color='#f8fafc', fontsize=10, fontweight='bold', pad=12)
        ax3.legend(loc='lower left', facecolor='#0f172a', edgecolor='#334155', labelcolor='#e2e8f0', fontsize=7)
        for spine in ax3.spines.values():
            spine.set_color('#1e293b')

        plt.suptitle("CourseConnect HealthTech · Python Stress Analytics Engine (Matplotlib/NumPy)", color='#38bdf8', fontsize=11, fontweight='bold', y=0.98)
        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format='png', facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
        plt.close(fig)

        b64_str = base64.b64encode(buf.getvalue()).decode('utf-8')
        return f"data:image/png;base64,{b64_str}"
    except Exception as e:
        print(f"Matplotlib chart generation notice: {e}")
        return None


# --------------------------------------------------------------------------- #
#  6. Public function called from main.py                                      #
# --------------------------------------------------------------------------- #
def generate_stress_dashboard(
    wbi_score: float,
    band: str,
    assessment_answers: Optional[List[int]] = None,
    journal_nlp: Optional[Dict[str, Any]] = None,
    checkin_history: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Returns a fully chart-ready JSON payload for the React Recharts dashboard,
    plus an authentic Matplotlib Python chart exported as base64 PNG.
    """
    answers = assessment_answers or [1, 1, 1, 1, 1, 1]
    nlp     = journal_nlp or {"emotion_scores": {"stress": 0.25, "calm": 0.75, "motivation": 0.6}}
    history = checkin_history or []

    dimensions   = _dimension_breakdown(answers)
    gauge        = _wbi_gauge(wbi_score, band)
    emotions     = _emotion_pie(nlp)
    trend        = build_history_trend(history)
    if not trend:
        trend = [
            {"day": "Day 1", "wbi": 25, "mood": 70, "band": "Green"},
            {"day": "Day 2", "wbi": 35, "mood": 65, "band": "Amber"},
            {"day": "Day 3", "wbi": wbi_score, "mood": 60, "band": band},
        ]

    # Generate Matplotlib chart
    python_chart_base64 = generate_python_matplotlib_chart(wbi_score, band, answers, trend)

    # Identify top 2 at-risk dimensions
    sorted_dims  = sorted(dimensions, key=lambda d: d["stress"], reverse=True)
    at_risk      = [d["dimension"] for d in sorted_dims[:2]]

    # Aggregate score label for header
    if wbi_score <= 30:
        header_msg = "Your mental health indicators look healthy today."
    elif wbi_score <= 55:
        header_msg = "Mild to moderate stress detected. Take a short break and hydrate."
    elif wbi_score <= 75:
        header_msg = "High stress levels observed. Please use the grounding exercises."
    else:
        header_msg = "Critical distress signals detected. Immediate support is recommended."

    return {
        "summary": {
            "wbi_score": wbi_score,
            "band": band,
            "band_color": _band_color(band),
            "header_message": header_msg,
            "at_risk_dimensions": at_risk,
        },
        "python_chart_base64": python_chart_base64,
        "charts": {
            "gauge":      gauge,
            "dimensions": dimensions,
            "emotions":   emotions,
            "trend":      trend,
        },
    }
