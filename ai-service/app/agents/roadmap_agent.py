from typing import Dict, Any, List
from ..schemas.models import RoadmapGenerationRequest

class LearningPathAgent:
    """Agent 4: Generates personalized, phased roadmaps based on career goals and gaps."""

    def generate_roadmap(self, data: RoadmapGenerationRequest) -> Dict[str, Any]:
        career = data.target_career or "Full Stack Developer"
        skills = [s.name for s in data.skills]

        phases = [
            {
                "phaseNumber": 1,
                "title": f"Phase 1: Foundations & Architecture for {career}",
                "description": "Establish coding syntax, git workflows, and development environment.",
                "estimatedDurationWeeks": 2,
                "tasks": [
                    {
                        "topic": "Version Control & Branching Workflows",
                        "skillName": "Git & GitHub",
                        "description": "Collaborative pull requests, conventional commits, and merge hygiene.",
                        "estimatedHours": 4,
                        "priority": "High"
                    },
                    {
                        "topic": "Core Language Specifications & Modern ES6+",
                        "skillName": "JavaScript" if "Full Stack" in career or "Frontend" in career else "Python",
                        "description": "Functional patterns, asynchronous promises, and memory management.",
                        "estimatedHours": 6,
                        "priority": "High"
                    }
                ]
            },
            {
                "phaseNumber": 2,
                "title": f"Phase 2: Core Engineering Frameworks",
                "description": "Deep-dive into component lifecycles, state management, and declarative UIs.",
                "estimatedDurationWeeks": 3,
                "tasks": [
                    {
                        "topic": "Component Architecture & Reactive State Lifecycles",
                        "skillName": "React.js" if "Frontend" in career or "Full Stack" in career else "FastAPI",
                        "description": "Hooks, composition, routing, and predictable state transitions.",
                        "estimatedHours": 8,
                        "priority": "High"
                    },
                    {
                        "topic": "Responsive Layouts & Design System Tokens",
                        "skillName": "HTML5 & CSS3",
                        "description": "CSS Grid, Flexbox, accessible markup, and layout performance.",
                        "estimatedHours": 5,
                        "priority": "Medium"
                    }
                ]
            },
            {
                "phaseNumber": 3,
                "title": "Phase 3: Backend Services, API Contracts & Storage",
                "description": "Architect resilient REST/GraphQL server endpoints and document/relational schemas.",
                "estimatedDurationWeeks": 3,
                "tasks": [
                    {
                        "topic": "RESTful API Architecture & Middleware Security",
                        "skillName": "Express.js" if "Full Stack" in career else "PostgreSQL",
                        "description": "Route controllers, validation, authentication tokens, and error logging.",
                        "estimatedHours": 7,
                        "priority": "High"
                    },
                    {
                        "topic": "Database Modeling, Aggregations & Indexing",
                        "skillName": "MongoDB",
                        "description": "Document schema design, indexing strategies, and optimized queries.",
                        "estimatedHours": 6,
                        "priority": "High"
                    }
                ]
            },
            {
                "phaseNumber": 4,
                "title": "Phase 4: Capstone Engineering & Career Readiness",
                "description": "Deploy full monorepo to production cloud tiers and conduct mock interviews.",
                "estimatedDurationWeeks": 2,
                "tasks": [
                    {
                        "topic": "Containerization & Cloud Infrastructure Deployment",
                        "skillName": "Docker",
                        "description": "Dockerfiles, environment variables, and CI/CD automated deployments.",
                        "estimatedHours": 8,
                        "priority": "High"
                    },
                    {
                        "topic": "Technical Mock Interview & Architectural Defense",
                        "skillName": "REST APIs",
                        "description": "Simulate technical questioning and explain design tradeoffs.",
                        "estimatedHours": 4,
                        "priority": "Medium"
                    }
                ]
            }
        ]

        return {
            "agent": "Learning Path Agent",
            "phases": phases,
            "totalPhases": len(phases),
            "estimatedWeeks": 10,
        }
