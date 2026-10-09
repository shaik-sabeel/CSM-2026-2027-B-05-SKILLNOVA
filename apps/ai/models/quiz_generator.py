import json
from typing import List, Dict, Any

TOPIC_QUIZ_BANK = {
    "python": [
        {
            "question": "What is the key difference between lists and tuples in Python?",
            "options": [
                "Lists are mutable, tuples are immutable",
                "Tuples are mutable, lists are immutable",
                "Lists cannot store strings",
                "Tuples are always slower than lists"
            ],
            "answer": 0,
            "explanation": "In Python, lists are mutable (can be changed after creation), whereas tuples are immutable sequence structures."
        },
        {
            "question": "Which decorator in Python is used to define a class method that does not access instance state?",
            "options": ["@staticmethod", "@classmethod", "@property", "@abstractmethod"],
            "answer": 0,
            "explanation": "@staticmethod defines a method bound to the class that does not implicitly receive the instance (self) or class (cls) parameter."
        }
    ],
    "sql": [
        {
            "question": "Which SQL clause is used to filter aggregated records produced by a GROUP BY clause?",
            "options": ["HAVING", "WHERE", "ORDER BY", "FILTER"],
            "answer": 0,
            "explanation": "HAVING filters groups after aggregate calculations (COUNT, SUM, AVG), while WHERE filters individual rows before grouping."
        }
    ],
    "react": [
        {
            "question": "What is the primary purpose of the useEffect hook in React?",
            "options": [
                "To perform side effects in functional components (e.g. data fetching, subscriptions)",
                "To mutate state directly without triggering re-renders",
                "To render inline CSS styles",
                "To replace Redux store"
            ],
            "answer": 0,
            "explanation": "useEffect lets functional components manage side effects such as subscriptions, DOM mutations, and API data fetching."
        }
    ]
}

def generate_dynamic_quiz(topic: str, difficulty: str = "intermediate") -> Dict[str, Any]:
    """Generates a dynamic topic quiz based on requested topic and difficulty."""
    topic_clean = topic.strip().lower()
    
    questions = []
    for key in TOPIC_QUIZ_BANK:
        if key in topic_clean:
            questions = TOPIC_QUIZ_BANK[key]
            break
            
    if not questions:
        questions = [
            {
                "question": f"In {topic.title()}, what is considered a best practice for system modularity?",
                "options": [
                    "High cohesion and low coupling between modules",
                    "Monolithic single-file architecture",
                    "Global state mutation across all functions",
                    "Ignoring automated test coverage"
                ],
                "answer": 0,
                "explanation": "High cohesion (focused responsibilities) and low coupling (minimal inter-module dependency) are core software design principles."
            },
            {
                "question": f"How do you evaluate performance bottlenecks when working with {topic.title()}?",
                "options": [
                    "Use profiling tools, measure execution latency, and inspect resource utilization",
                    "Increase hardware memory without measuring execution time",
                    "Remove error handling code",
                    "Duplicate code across threads"
                ],
                "answer": 0,
                "explanation": "Profiling and empirical latency measurement are essential steps to locate and resolve execution bottlenecks."
            }
        ]

    return {
        "topic": topic.title(),
        "difficulty": difficulty,
        "total_questions": len(questions),
        "questions": questions
    }
