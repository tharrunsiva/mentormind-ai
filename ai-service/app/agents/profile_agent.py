from typing import Dict, Any, List
from ..schemas.models import ProfileAnalysisRequest

class ProfileAnalysisAgent:
    """Agent 1: Analyzes learner profiles, extracts strengths, and prepares context."""

    def analyze(self, data: ProfileAnalysisRequest) -> Dict[str, Any]:
        total_skills = len(data.skills)
        verified_skills = [s.name for s in data.skills if (s.score or 0) >= 60]
        developing_skills = [s.name for s in data.skills if (s.score or 0) < 60]

        summary = f"Learner {data.user_name} has {total_skills} declared skills. Strong foundational competence in {', '.join(verified_skills) if verified_skills else 'early fundamentals'}."

        return {
            "agent": "Profile Analysis Agent",
            "status": "success",
            "learner_summary": summary,
            "strengths": verified_skills or ["Eagerness to learn"],
            "focus_areas": developing_skills,
            "readiness_estimate": min(95, max(15, total_skills * 12)),
        }
