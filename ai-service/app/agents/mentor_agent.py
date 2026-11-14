from typing import Dict, Any, List
from ..schemas.models import MentorChatRequest
from ..services.llm_provider import llm_service

class AIMentorAgent:
    """Agent 8: Converses with learners, explains concepts, and provides contextual guidance."""

    async def reply(self, data: MentorChatRequest) -> Dict[str, Any]:
        user_name = data.user_name
        msg = data.message
        ctx = data.context

        career = ctx.get("targetCareer", "Full Stack Developer")
        readiness = ctx.get("readinessScore", 40)
        skills = ctx.get("skills", [])
        missing = ctx.get("missingSkills", [])

        system_instruction = (
            f"You are MentorMind AI, an elite career intelligence and learning mentor for {user_name}. "
            f"Target career: {career}. Current readiness: {readiness}%. "
            f"Learner skills: {', '.join(skills[:5])}. "
            f"Missing skills: {', '.join(missing[:4])}. "
            "Provide helpful, concise, well-structured markdown answers with code snippets and clear learning advice."
        )

        response = await llm_service.generate_text(msg, system_instruction)

        # Suggested follow-up actions
        suggested = [
            f"What should I learn next for {career}?",
            "Give me a practical coding exercise",
            "How do I prepare for technical interviews?"
        ]

        return {
            "agent": "AI Mentor Agent",
            "response": response,
            "suggested_actions": suggested,
        }
