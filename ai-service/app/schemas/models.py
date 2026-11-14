from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SkillInput(BaseModel):
    name: str
    level: Optional[str] = "Beginner"
    score: Optional[float] = 40.0

class ProfileAnalysisRequest(BaseModel):
    user_name: str
    education: Optional[str] = ""
    experience_level: Optional[str] = "Beginner"
    skills: List[SkillInput] = []
    target_career: str = "Full Stack Developer"
    interests: List[str] = []

class CareerAnalysisRequest(BaseModel):
    career_title: str
    description: Optional[str] = ""
    user_skills: List[SkillInput] = []

class SkillGapRequest(BaseModel):
    target_career: str
    current_skills: List[SkillInput]
    required_skills: List[Dict[str, Any]] = []

class RoadmapGenerationRequest(BaseModel):
    user_name: str
    target_career: str
    skills: List[SkillInput] = []
    weekly_hours: Optional[int] = 10
    learning_style: Optional[str] = "Hands-on"

class MentorChatRequest(BaseModel):
    user_name: str
    message: str
    context: Dict[str, Any] = {}

class PeerMatchRequest(BaseModel):
    user_id: str
    user_name: str
    target_career: str
    skills: List[SkillInput] = []
    weekly_hours: int = 10
    interests: List[str] = []
    candidates: List[Dict[str, Any]] = []

class InterviewGenerationRequest(BaseModel):
    job_role: str
    category: str = "technical"
    difficulty: str = "Entry"
    question_count: int = 4

class InterviewEvaluationRequest(BaseModel):
    job_role: str
    question: str
    ideal_answer: Optional[str] = ""
    user_answer: str
    difficulty: str = "Entry"

class AdaptiveLearningRequest(BaseModel):
    user_name: str
    target_career: str
    recent_score: float
    skill_tested: str
    current_phase: int = 1
