from typing import Dict, Any

class ProgressEvaluationAgent:
    """Agent 7: Tracks learning completion, detects repeated difficulties, recommends roadmap adaptations."""

    def evaluate_performance(self, score: float, skill_name: str, career_name: str) -> Dict[str, Any]:
        if score < 50:
            decision = "remediate"
            action = f"Score {score}% on {skill_name} indicates concept hurdles. Added prerequisite refresher module."
            difficulty_adjustment = "reduced"
        elif score >= 75:
            decision = "advance"
            action = f"Mastery achieved in {skill_name} ({score}%). Unlocked advanced capstone milestone."
            difficulty_adjustment = "increased"
        else:
            decision = "consolidate"
            action = f"Solid foundation in {skill_name} ({score}%). Keep practicing targeted exercises."
            difficulty_adjustment = "maintained"

        return {
            "agent": "Progress Evaluation Agent",
            "decision": decision,
            "action": action,
            "difficulty_adjustment": difficulty_adjustment,
            "career": career_name
        }
