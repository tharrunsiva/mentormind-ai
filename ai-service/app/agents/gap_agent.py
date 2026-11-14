from typing import Dict, Any, List
from ..schemas.models import SkillGapRequest

class SkillGapAgent:
    """Agent 3: Compares current skills with career requirements, calculates gaps and priorities."""

    def evaluate_gap(self, data: SkillGapRequest) -> Dict[str, Any]:
        curr_map = {s.name.lower(): s.score or 0 for s in data.current_skills}
        strong = []
        partial = []
        missing = []
        total_score = 0
        count = max(1, len(data.required_skills))

        for req in data.required_skills:
            name = req.get("name", "")
            req_score = req.get("minProficiencyValue", 70)
            user_score = curr_map.get(name.lower(), 0)

            total_score += min(100, (user_score / req_score) * 100)

            if user_score >= req_score:
                strong.append({"skillName": name, "current": user_score, "required": req_score})
            elif user_score > 0:
                partial.append({"skillName": name, "current": user_score, "required": req_score, "gap": req_score - user_score})
            else:
                missing.append({"skillName": name, "required": req_score, "gap": req_score, "priority": "High"})

        readiness = min(100, round(total_score / count))

        return {
            "agent": "Skill Gap Analysis Agent",
            "overallReadinessPercentage": readiness,
            "strongSkills": strong,
            "partialSkills": partial,
            "missingSkills": missing,
        }
