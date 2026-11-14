from typing import Dict, Any
from ..agents import (
    ProfileAnalysisAgent,
    CareerIntelligenceAgent,
    SkillGapAgent,
    LearningPathAgent,
    ResourceRecommendationAgent,
    AssessmentAgent,
    ProgressEvaluationAgent,
    AIMentorAgent,
    PeerMatchingAgent,
    MockInterviewAgent,
)
from ..schemas.models import (
    ProfileAnalysisRequest,
    CareerAnalysisRequest,
    SkillGapRequest,
    RoadmapGenerationRequest,
    MentorChatRequest,
)

class MultiAgentOrchestrator:
    """Orchestrates collaborative workflows across all 10 specialized agents."""

    def __init__(self):
        self.profile_agent = ProfileAnalysisAgent()
        self.career_agent = CareerIntelligenceAgent()
        self.gap_agent = SkillGapAgent()
        self.roadmap_agent = LearningPathAgent()
        self.resource_agent = ResourceRecommendationAgent()
        self.assessment_agent = AssessmentAgent()
        self.evaluation_agent = ProgressEvaluationAgent()
        self.mentor_agent = AIMentorAgent()
        self.peer_agent = PeerMatchingAgent()
        self.interview_agent = MockInterviewAgent()

    async def run_full_pipeline(self, initial_state: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the orchestrated pipeline from profile analysis to roadmap and mentor advice."""
        user_name = initial_state.get("user_name", "Learner")
        career_title = initial_state.get("target_career", "Full Stack Developer")
        skills = initial_state.get("skills", [])

        # Step 1: Profile Analysis
        profile_req = ProfileAnalysisRequest(
            user_name=user_name,
            target_career=career_title,
            skills=skills,
        )
        profile_res = self.profile_agent.analyze(profile_req)

        # Step 2: Career Intelligence
        career_req = CareerAnalysisRequest(
            career_title=career_title,
            user_skills=skills,
        )
        career_res = self.career_agent.analyze(career_req)

        # Step 3: Skill Gap Analysis
        gap_req = SkillGapRequest(
            target_career=career_title,
            current_skills=skills,
            required_skills=[
                {"name": "JavaScript", "minProficiencyValue": 80},
                {"name": "React.js", "minProficiencyValue": 80},
                {"name": "Node.js", "minProficiencyValue": 70},
                {"name": "Express.js", "minProficiencyValue": 70},
                {"name": "MongoDB", "minProficiencyValue": 65},
            ]
        )
        gap_res = self.gap_agent.evaluate_gap(gap_req)

        # Step 4: Learning Path Generation
        roadmap_req = RoadmapGenerationRequest(
            user_name=user_name,
            target_career=career_title,
            skills=skills,
        )
        roadmap_res = self.roadmap_agent.generate_roadmap(roadmap_req)

        # Step 5: Adaptive Evaluation
        eval_res = self.evaluation_agent.evaluate_performance(
            score=gap_res.get("overallReadinessPercentage", 40),
            skill_name="Core Full-Stack",
            career_name=career_title,
        )

        return {
            "orchestrator": "LangGraph Adaptive Pipeline",
            "profileAnalysis": profile_res,
            "careerIntelligence": career_res,
            "skillGap": gap_res,
            "roadmap": roadmap_res,
            "adaptiveEvaluation": eval_res,
        }

orchestrator = MultiAgentOrchestrator()
