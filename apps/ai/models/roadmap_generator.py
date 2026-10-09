import json
import logging
from typing import List, Dict, Any, Optional
from models.resource_engine import resolve_resources_for_queries

logger = logging.getLogger(__name__)

def generate_fallback_roadmap(skill: str, level: str, total_weeks: int, hours_per_week: int) -> Dict[str, Any]:
    """
    Generates a structured, beginner-friendly step-by-step roadmap for ANY skill.
    Includes overall course progress metrics, section-by-section hours, pre-resolved resources,
    and multiple capstone project options dynamically suggested upon section/course completion.
    """
    skill_clean = skill.strip().title()
    weeks = max(4, total_weeks)

    phases = [
        {
            "phase_num": 1,
            "title": f"Phase 1: Absolute Beginner Foundations of {skill_clean}",
            "weeks": [1, max(1, weeks // 4)],
            "topics": [
                {
                    "id": "t1",
                    "name": f"Introduction & Tooling Setup for {skill_clean}",
                    "prerequisites": [],
                    "est_hours": min(hours_per_week, 6),
                    "difficulty": 1,
                    "subtopics": [f"What is {skill_clean} and why learn it?", "Installing IDE / compiler / tools", "Writing your first 'Hello World'"],
                    "practice": [f"Configure your local development environment for {skill_clean}"],
                    "resource_queries": [f"{skill_clean} beginner full course", f"learn {skill_clean} from scratch"],
                    "status": "pending",
                    "pre_resolved_resources": resolve_resources_for_queries([f"{skill_clean} beginner full course"])
                },
                {
                    "id": "t2",
                    "name": f"Core Syntax, Variables & Basic Data Types",
                    "prerequisites": ["t1"],
                    "est_hours": min(hours_per_week, 8),
                    "difficulty": 1,
                    "subtopics": ["Variables & constants", "Operators & simple math", "Input and output statements"],
                    "practice": [f"Build a simple interactive calculator using {skill_clean}"],
                    "resource_queries": [f"{skill_clean} syntax for beginners", f"{skill_clean} data types tutorial"],
                    "status": "pending",
                    "pre_resolved_resources": resolve_resources_for_queries([f"{skill_clean} syntax for beginners"])
                }
            ],
            "milestone_quiz": True,
            "project_options": [
                {
                    "id": "p1-a",
                    "title": f"Option A: Interactive CLI Calculator & Unit Converter in {skill_clean}",
                    "difficulty": "Beginner",
                    "est_hours": 6,
                    "description": f"Build a command-line application in {skill_clean} that handles arithmetic, currency, and unit conversions.",
                    "github_template": f"https://github.com/search?q={skill_clean}+calculator+starter",
                    "key_features": ["Input validation", "Formatted menu interface", "Arithmetic functions"]
                },
                {
                    "id": "p1-b",
                    "title": f"Option B: Basic Personal Finance & Expense Logger",
                    "difficulty": "Beginner",
                    "est_hours": 8,
                    "description": f"Develop a lightweight program in {skill_clean} to log daily student expenses and print monthly budget summaries.",
                    "github_template": f"https://github.com/search?q={skill_clean}+expense+tracker+starter",
                    "key_features": ["Data parsing", "Category summaries", "File persistence"]
                }
            ],
            "project_selected": None
        },
        {
            "phase_num": 2,
            "title": f"Phase 2: Core Fundamentals & Control Flow",
            "weeks": [max(2, weeks // 4 + 1), max(2, weeks // 2)],
            "topics": [
                {
                    "id": "t3",
                    "name": f"Conditionals, Loops & Control Structures",
                    "prerequisites": ["t2"],
                    "est_hours": min(hours_per_week, 10),
                    "difficulty": 2,
                    "subtopics": ["If/else decision branching", "For loops and while loops", "Breaking & continuing loops"],
                    "practice": [f"Implement 5 basic logic problems in {skill_clean}"],
                    "resource_queries": [f"{skill_clean} loops and conditions", f"{skill_clean} beginner exercises"],
                    "status": "pending",
                    "pre_resolved_resources": resolve_resources_for_queries([f"{skill_clean} loops and conditions"])
                },
                {
                    "id": "t4",
                    "name": f"Functions, Modules & Code Reusability",
                    "prerequisites": ["t3"],
                    "est_hours": min(hours_per_week, 10),
                    "difficulty": 2,
                    "subtopics": ["Defining functions & arguments", "Return values & scope", "Importing standard libraries"],
                    "practice": [f"Create a modular utility library in {skill_clean}"],
                    "resource_queries": [f"{skill_clean} functions tutorial", f"{skill_clean} modular programming"],
                    "status": "pending",
                    "pre_resolved_resources": resolve_resources_for_queries([f"{skill_clean} functions tutorial"])
                }
            ],
            "milestone_quiz": True,
            "project_options": [
                {
                    "id": "p2-a",
                    "title": f"Option A: Modular Student Quiz & Grade Evaluator in {skill_clean}",
                    "difficulty": "Intermediate",
                    "est_hours": 10,
                    "description": f"Architect a modular testing engine in {skill_clean} that evaluates student responses and prints grade analytics.",
                    "github_template": f"https://github.com/search?q={skill_clean}+quiz+engine",
                    "key_features": ["Modular functions", "Automated scoring", "Percentage reporting"]
                },
                {
                    "id": "p2-b",
                    "title": f"Option B: Text-Based Inventory & Task Management System",
                    "difficulty": "Intermediate",
                    "est_hours": 12,
                    "description": f"Create a task manager application in {skill_clean} featuring add, edit, delete, and completion status filtering.",
                    "github_template": f"https://github.com/search?q={skill_clean}+todo+cli",
                    "key_features": ["CRUD operations", "List filtering", "State management"]
                }
            ],
            "project_selected": None
        },
        {
            "phase_num": 3,
            "title": f"Phase 3: Intermediate Skill Application & Real-World Projects",
            "weeks": [max(3, weeks // 2 + 1), max(3, (3 * weeks) // 4)],
            "topics": [
                {
                    "id": "t5",
                    "name": f"Data Handling & API / File Integration",
                    "prerequisites": ["t4"],
                    "est_hours": min(hours_per_week, 12),
                    "difficulty": 3,
                    "subtopics": ["Reading & writing JSON / CSV files", "Connecting to REST APIs", "Handling user errors"],
                    "practice": [f"Build an API data fetcher using {skill_clean}"],
                    "resource_queries": [f"{skill_clean} api integration", f"{skill_clean} file handling tutorial"],
                    "status": "pending",
                    "pre_resolved_resources": resolve_resources_for_queries([f"{skill_clean} api integration"])
                },
                {
                    "id": "t6",
                    "name": f"Object-Oriented & Modular Architecture",
                    "prerequisites": ["t5"],
                    "est_hours": min(hours_per_week, 12),
                    "difficulty": 3,
                    "subtopics": ["Classes & objects", "Inheritance & encapsulation", "Clean code principles"],
                    "practice": [f"Refactor project using Object-Oriented patterns in {skill_clean}"],
                    "resource_queries": [f"{skill_clean} object oriented programming", f"{skill_clean} design patterns"],
                    "status": "pending",
                    "pre_resolved_resources": resolve_resources_for_queries([f"{skill_clean} object oriented programming"])
                }
            ],
            "milestone_quiz": True,
            "project_options": [
                {
                    "id": "p3-a",
                    "title": f"Option A: Fullstack Web Dashboard & REST API Service in {skill_clean}",
                    "difficulty": "Advanced",
                    "est_hours": 16,
                    "description": f"Engineered an end-to-end web application in {skill_clean} with REST API endpoints and data persistence.",
                    "github_template": f"https://github.com/search?q={skill_clean}+rest+api+starter",
                    "key_features": ["REST endpoints", "Database integration", "Frontend interface"]
                }
            ],
            "project_selected": None
        },
        {
            "phase_num": 4,
            "title": f"Phase 4: Advanced Optimization, Deployment & Placement Prep",
            "weeks": [max(4, (3 * weeks) // 4 + 1), weeks],
            "topics": [
                {
                    "id": "t7",
                    "name": f"Testing, Debugging & Performance Tuning",
                    "prerequisites": ["t6"],
                    "est_hours": min(hours_per_week, 14),
                    "difficulty": 4,
                    "subtopics": ["Writing automated unit tests", "Debugging execution errors", "Optimizing speed & memory"],
                    "practice": [f"Write a complete unit test suite for your {skill_clean} project"],
                    "resource_queries": [f"{skill_clean} unit testing guide", f"{skill_clean} performance tuning"],
                    "status": "pending",
                    "pre_resolved_resources": resolve_resources_for_queries([f"{skill_clean} unit testing guide"])
                }
            ],
            "milestone_quiz": True,
            "project_options": [
                {
                    "id": "p4-a",
                    "title": f"Option A: Production Portfolio Capstone in {skill_clean}",
                    "difficulty": "Production",
                    "est_hours": 20,
                    "description": f"Build and deploy a complete production-grade application in {skill_clean} with CI/CD and cloud hosting.",
                    "github_template": f"https://github.com/search?q={skill_clean}+production+project",
                    "key_features": ["CI/CD integration", "Cloud deployment", "Automated test suite"]
                }
            ],
            "project_selected": None
        }
    ]

    total_course_hours = sum(sum(t["est_hours"] for t in p["topics"]) for p in phases)

    return {
        "skill": skill_clean,
        "level": level,
        "total_weeks": weeks,
        "total_course_hours": total_course_hours,
        "completed_hours": 0,
        "completion_percentage": 0,
        "sections_completed": 0,
        "total_sections": sum(len(p["topics"]) for p in phases),
        "wellbeing_adjusted": False,
        "phases": phases,
        "interview_topics": [
            f"Explain core concepts of {skill_clean} for beginners",
            f"How do you organize modular code in {skill_clean}?",
            f"Describe your end-to-end {skill_clean} capstone project."
        ]
    }
