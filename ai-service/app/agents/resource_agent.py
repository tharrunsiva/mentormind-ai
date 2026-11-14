from typing import Dict, Any, List

class ResourceRecommendationAgent:
    """Agent 5: Matches learning resources to skill gaps, difficulty, and learning preferences."""

    def recommend(self, skill_name: str, difficulty: str = "Beginner") -> List[Dict[str, Any]]:
        return [
            {
                "title": f"Complete {skill_name} Guide & Best Practices",
                "platform": "Official Docs",
                "difficulty": difficulty,
                "duration": "2.5 hours",
                "url": "https://developer.mozilla.org/en-US/",
                "description": f"Verified documentation covering architectural conventions and core concepts of {skill_name}."
            },
            {
                "title": f"Hands-on {skill_name} Crash Course with Real Projects",
                "platform": "freeCodeCamp",
                "difficulty": difficulty,
                "duration": "3 hours",
                "url": "https://www.freecodecamp.org/",
                "description": f"Practical step-by-step walkthrough building interactive features using {skill_name}."
            }
        ]

class AssessmentAgent:
    """Agent 6: Generates assessment questions and evaluates knowledge weaknesses."""

    def generate_questions(self, skill_name: str, level: str = "Intermediate") -> List[Dict[str, Any]]:
        return [
            {
                "id": f"{skill_name.lower()}-gen-1",
                "type": "mcq",
                "question": f"In production applications, how should error handling be structured when working with {skill_name}?",
                "options": [
                    "Centralized error handling middleware with sanitized client error messages and structured server logs",
                    "Suppressing all exceptions to prevent process termination",
                    "Printing errors directly to the browser console and continuing",
                    "Sending raw database stack traces directly to untrusted clients"
                ],
                "correctAnswer": "Centralized error handling middleware with sanitized client error messages and structured server logs",
                "explanation": "Production systems should never leak internal stack traces to users, but must log full diagnostics internally.",
                "points": 25
            }
        ]
