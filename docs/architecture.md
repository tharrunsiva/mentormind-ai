# MentorMind AI — System Architecture

**MentorMind AI** is an intelligent full-stack career development and learning acceleration platform that combines deterministic evaluation metrics with a multi-agent orchestration architecture.

---

## 1. High-Level System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client Tier ["Client Tier (Frontend - React + Vite)"]
        UI["Web App (React.js, Bootstrap 5, Recharts)"]
        AuthContext["Auth Context & Token Interceptors"]
        SocketClient["Socket.IO Client (Real-time Peer Chat)"]
    end

    subgraph Backend Tier ["Application Tier (Node.js & Express)"]
        APIGateway["Express REST API (Port 5000)"]
        AuthMiddleware["JWT & RBAC Middleware"]
        Controllers["Controllers & Business Services"]
        SocketServer["Socket.IO Server (Port 5000)"]
    end

    subgraph Data Tier ["Data Tier (MongoDB)"]
        DB[("MongoDB Database (Port 27017)<br/>22 Mongoose Collections")]
    end

    subgraph AI Tier ["AI Intelligence Tier (FastAPI & LangGraph)"]
        FastAPI["FastAPI AI Service (Port 8000)"]
        Orchestrator["LangGraph Multi-Agent Orchestrator"]
        LLM["Configurable LLM Provider<br/>(Gemini / OpenAI / Heuristic Engine)"]
        PyMuPDF["PyMuPDF Resume Parsing Engine"]
    end

    UI -->|HTTP Requests| APIGateway
    UI <-->|WebSockets| SocketServer
    APIGateway --> AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers <-->|Mongoose ODM| DB
    Controllers -->|Internal REST Calls| FastAPI
    FastAPI --> Orchestrator
    FastAPI --> PyMuPDF
    Orchestrator --> LLM
```

---

## 2. Multi-Agent Orchestration Graph

The platform coordinates 10 specialized AI agents working together in a unified state graph:

```mermaid
sequenceDiagram
    autonumber
    actor Learner as Learner
    participant Frontend as React Client
    participant NodeAPI as Node.js Backend
    participant AIService as FastAPI AI Service
    participant MultiAgent as 10 Specialized Agents
    participant Database as MongoDB

    Learner->>Frontend: Uploads Resume / Sets Career Goal
    Frontend->>NodeAPI: POST /api/profile/resume or /api/careers/set-target
    NodeAPI->>AIService: POST /ai/extract-resume / /ai/skill-gap
    AIService->>MultiAgent: Agent 1 (Profile) + Agent 2 (Career) + Agent 3 (Skill Gap)
    MultiAgent-->>AIService: Calculated Gaps & Priority Weights
    AIService-->>NodeAPI: Structured Diagnostic Matrix
    NodeAPI->>Database: Save SkillGapReport & Profile Updates
    NodeAPI->>AIService: POST /ai/generate-roadmap
    AIService->>MultiAgent: Agent 4 (Learning Path) + Agent 5 (Resources)
    MultiAgent-->>AIService: 4-Phase Personalized Roadmap with Resources
    AIService-->>NodeAPI: Generated Roadmap Tasks & Milestones
    NodeAPI->>Database: Save LearningRoadmap & RoadmapTasks
    NodeAPI-->>Frontend: Ready! Displays Dynamic Dashboard & Timeline
```

---

## 3. The 10 Specialized Agents

| # | Agent Name | Primary Responsibility |
|---|------------|------------------------|
| **1** | **Profile Analysis Agent** | Ingests parsed resume data and learner profile to extract validated skill proficiencies. |
| **2** | **Career Intelligence Agent** | Analyzes industry job requirements and explains role suitability without generic claims. |
| **3** | **Skill Gap Analysis Agent** | Calculates exact differences: `Skill Gap = Required Proficiency - Current Proficiency`. |
| **4** | **Learning Path Agent** | Organizes topics into prerequisite-ordered phases and assigns estimated study times. |
| **5** | **Resource Recommendation Agent** | Matches curated documentation, tutorials, and hands-on platforms to skill gaps. |
| **6** | **Assessment Agent** | Generates skill questions and provides rubric-driven feedback on short answers. |
| **7** | **Progress Evaluation Agent** | Tracks assessment scores and triggers adaptive roadmap adjustments. |
| **8** | **AI Mentor Agent** | Context-aware conversational co-pilot answering domain questions and explaining concepts. |
| **9** | **Peer Matching Agent** | Calculates weighted compatibility based on mutual goals and complementary skills. |
| **10** | **Mock Interview Agent** | Simulates technical, behavioral, and HR interviews with objective rubric scoring. |

---

## 4. Differentiating Algorithms

### A. AI Peer Skill Matching Formula

Compatibility is scored from 0% to 100% across five weighted factors:

$$\text{Compatibility} = 0.30 \cdot C_{\text{career}} + 0.35 \cdot S_{\text{comp}} + 0.15 \cdot I_{\text{interests}} + 0.10 \cdot A_{\text{avail}} + 0.10 \cdot L_{\text{style}}$$

- **Career Similarity ($C_{\text{career}}$):** 30% — Same target role yields maximum score.
- **Complementary Skills ($S_{\text{comp}}$):** 35% — Evaluates whether Learner A can teach what Learner B wants to learn, and vice versa.
- **Learning Interests ($I_{\text{interests}}$):** 15% — Shared topic domains and project types.
- **Availability Compatibility ($A_{\text{avail}}$):** 10% — Closeness in weekly study hours.
- **Learning Style Compatibility ($L_{\text{style}}$):** 10% — Alignment in preferred collaboration format.

### B. Adaptive Learning Engine Thresholds

The system continuously evaluates assessment performance:

- **Score $< 50\%$ (Remediation Mode):**
  Identifies weak topics, queues prerequisite refresher modules, and reduces topic difficulty.
- **Score $50\% - 75\%$ (Consolidation Mode):**
  Recommends targeted practice exercises and reinforces fundamental syntax.
- **Score $> 75\%$ (Acceleration Mode):**
  Unlocks advanced topics, accelerates pacing, and suggests real-world capstone projects.
