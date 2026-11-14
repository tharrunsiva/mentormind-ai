import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .schemas.models import (
    ProfileAnalysisRequest,
    CareerAnalysisRequest,
    SkillGapRequest,
    RoadmapGenerationRequest,
    MentorChatRequest,
    PeerMatchRequest,
    InterviewEvaluationRequest,
    AdaptiveLearningRequest,
)
from .agents import (
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
from .services.resume_parser import extract_resume_pdf
from .services.llm_provider import llm_service
from .graphs.orchestrator import orchestrator

app = FastAPI(
    title="MentorMind AI Multi-Agent Service",
    description="Multi-agent career intelligence, skill gap analysis, adaptive roadmaps, and interview simulations.",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agents
profile_agent = ProfileAnalysisAgent()
career_agent = CareerIntelligenceAgent()
gap_agent = SkillGapAgent()
roadmap_agent = LearningPathAgent()
resource_agent = ResourceRecommendationAgent()
assessment_agent = AssessmentAgent()
evaluation_agent = ProgressEvaluationAgent()
mentor_agent = AIMentorAgent()
peer_agent = PeerMatchingAgent()
interview_agent = MockInterviewAgent()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MentorMind AI Python Multi-Agent Service",
        "provider": llm_service.active_provider,
        "agents": 10,
        "mode": "Live Provider" if llm_service.active_provider != "demo" else "Autonomous High-Fidelity Fallback Mode",
    }

@app.post("/ai/extract-resume")
async def extract_resume(file: UploadFile = File(...)):
    """Extracts text, skills, and projects from a PDF resume using PyMuPDF."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")
    contents = await file.read()
    data = extract_resume_pdf(contents, file.filename)
    return {"success": True, "data": data}

@app.post("/ai/analyze-profile")
def analyze_profile(req: ProfileAnalysisRequest):
    return profile_agent.analyze(req)

@app.post("/ai/analyze-career")
def analyze_career(req: CareerAnalysisRequest):
    return career_agent.analyze(req)

@app.post("/ai/skill-gap")
def analyze_skill_gap(req: SkillGapRequest):
    return gap_agent.evaluate_gap(req)

@app.post("/ai/generate-roadmap")
def generate_roadmap(req: RoadmapGenerationRequest):
    return roadmap_agent.generate_roadmap(req)

@app.post("/ai/recommend-resources")
def recommend_resources(skill_name: str, difficulty: str = "Beginner"):
    return resource_agent.recommend(skill_name, difficulty)

@app.post("/ai/generate-assessment")
def generate_assessment(skill_name: str, level: str = "Intermediate"):
    return assessment_agent.generate_questions(skill_name, level)

@app.post("/ai/mentor-chat")
async def mentor_chat(req: MentorChatRequest):
    return await mentor_agent.reply(req)

@app.post("/ai/match-peers")
def match_peers(req: PeerMatchRequest):
    return peer_agent.match(req)

@app.post("/ai/evaluate-interview-answer")
def evaluate_interview_answer(req: InterviewEvaluationRequest):
    return interview_agent.evaluate_response(
        job_role=req.job_role,
        question=req.question,
        ideal_answer=req.ideal_answer,
        user_answer=req.user_answer,
    )

@app.post("/ai/adapt-learning")
def adapt_learning(req: AdaptiveLearningRequest):
    return evaluation_agent.evaluate_performance(
        score=req.recent_score,
        skill_name=req.skill_tested,
        career_name=req.target_career,
    )

@app.post("/ai/pipeline")
async def run_pipeline(state: dict):
    return await orchestrator.run_full_pipeline(state)
