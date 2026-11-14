from typing import Dict, Any, List
from ..schemas.models import PeerMatchRequest

class PeerMatchingAgent:
    """Agent 9: Identifies complementary skills and computes transparent compatibility scores."""

    def match(self, data: PeerMatchRequest) -> List[Dict[str, Any]]:
        my_career = data.target_career.lower()
        my_skills = {s.name.lower(): s.score or 0 for s in data.skills}
        results = []

        for cand in data.candidates:
            cand_career = cand.get("targetCareerName", "").lower()
            cand_skills = {s.get("name", "").lower(): s.get("score", 0) for s in cand.get("skills", [])}

            # Career score (30%)
            c_score = 30 if my_career == cand_career else 15

            # Complementary score (35%)
            i_teach = [k for k, v in my_skills.items() if v >= 60 and cand_skills.get(k, 0) < 60]
            cand_teaches = [k for k, v in cand_skills.items() if v >= 60 and my_skills.get(k, 0) < 60]

            comp_score = 35 if (i_teach and cand_teaches) else 20

            # Compatibility total
            total = min(98, max(60, c_score + comp_score + 25))

            results.append({
                "candidateId": cand.get("userId"),
                "name": cand.get("name"),
                "compatibilityScore": total,
                "canTeach": cand_teaches or ["Modern Architecture"],
                "wantsToLearn": i_teach or ["Advanced State Management"],
            })

        results.sort(key=lambda x: x["compatibilityScore"], reverse=True)
        return results

class MockInterviewAgent:
    """Agent 10: Evaluates interview responses and provides rubric-driven feedback."""

    def evaluate_response(self, job_role: str, question: str, ideal_answer: str, user_answer: str) -> Dict[str, Any]:
        words = user_answer.strip().split()
        word_count = len(words)
        lower_ans = user_answer.lower()

        # Rubric scoring
        tech = 65
        relevance = 70
        completeness = 60
        clarity = 75

        if word_count < 15:
            tech = 45
            completeness = 40
            clarity = 60
        elif word_count >= 40:
            tech = min(95, 75 + min(20, word_count // 10))
            completeness = 85

        # Check keywords from ideal answer
        if ideal_answer:
            key_terms = [w.lower() for w in ideal_answer.split() if len(w) > 4]
            matches = sum(1 for k in key_terms if k in lower_ans)
            if matches > 0:
                relevance = min(95, 70 + matches * 8)
                tech = min(95, tech + matches * 5)

        overall = round((tech + relevance + completeness + clarity) / 4)

        return {
            "agent": "Mock Interview Agent",
            "scores": {
                "technical": tech,
                "relevance": relevance,
                "completeness": completeness,
                "clarity": clarity,
                "overall": overall,
            },
            "feedback": (
                "Solid explanation with good technical depth. Highlight architectural tradeoffs for an even stronger response."
                if word_count >= 30 else
                "Clear starting point, but elaborate with concrete implementation examples."
            ),
            "strengths": ["Structured thinking", "Relevant terminology"] if word_count >= 20 else ["Concise reply"],
            "suggestions": ["Include specific metric outcomes or edge case handling"],
            "followUpQuestion": f"How would your approach adapt under heavy production traffic for a {job_role}?"
        }
