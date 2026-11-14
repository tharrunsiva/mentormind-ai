# MentorMind AI — Local Setup & Deployment Guide

This guide walks you through setting up and running the complete MentorMind AI application stack locally or in cloud production.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (Tested with v22.15.0)
- **Python**: v3.10 or higher (Tested with v3.12.4)
- **MongoDB**: Local MongoDB instance (Port 27017) or MongoDB Atlas connection string.

---

## 2. Quick Start (Services Summary)

MentorMind AI consists of three services running together:

| Component | Port | Directory | Run Command |
|-----------|------|-----------|-------------|
| **MongoDB Daemon** | `27017` | `data/db` | `mongod --dbpath "data/db"` |
| **Python AI Service** | `8000` | `ai-service/` | `& "venv/Scripts/uvicorn.exe" app.main:app --app-dir "ai-service" --host 127.0.0.1 --port 8000` |
| **Node.js Backend** | `5000` | `backend/` | `npm start` |
| **React Frontend** | `5173` | `frontend/` | `npm run dev` |

---

## 3. Step-by-Step Installation

### Step A: Database Setup
Start your local MongoDB service:
```bash
mongod --dbpath "data/db" --bind_ip 127.0.0.1 --port 27017
```

### Step B: Python AI Multi-Agent Service
1. Navigate to `ai-service`:
   ```bash
   cd ai-service
   ```
2. Activate or create virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env`:
   ```env
   PORT=8000
   AI_PROVIDER=demo
   GEMINI_API_KEY=
   OPENAI_API_KEY=
   ```
   *(Note: When no API key is provided, the autonomous high-fidelity fallback engine provides full functionality immediately!)*
5. Launch service:
   ```bash
   uvicorn app.main:app --app-dir . --host 127.0.0.1 --port 8000
   ```
   Verify at: `http://127.0.0.1:8000/health`

### Step C: Node.js Main Backend
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/mentormind
   JWT_SECRET=mentormind_super_secret_jwt_key_2025_prod
   JWT_EXPIRES_IN=7d
   AI_SERVICE_URL=http://localhost:8000
   ```
4. Run Database Seeder:
   ```bash
   npm run seed
   ```
   *(Populates 12 career paths, 30+ skills, assessments, curated resources, sample peers, and demo accounts).*
5. Start Backend Server:
   ```bash
   npm start
   ```
   Verify at: `http://localhost:5000/api/health`

### Step D: React Frontend
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open browser at: `http://localhost:5173/`

---

## 4. Pre-Configured Demo Accounts

For immediate demonstration without manual registration:

### Primary Learner Account
- **Email:** `demo@mentormind.ai`
- **Password:** `Password123!`
- **Role:** Learner
- **Profile:** Jordan Rivera (Full Stack Developer Path, 48% Readiness, active roadmap, 5-day streak)

### Administrator Account
- **Email:** `admin@mentormind.ai`
- **Password:** `AdminPassword123!`
- **Role:** Administrator
- **Access:** Platform stats, learner management, telemetry, and AI audit logs

### Sample Peer Accounts (for Peer Matching Demonstration)
- Maya Chen: `maya.backend@mentormind.ai` / `Password123!` (94% Compatibility Match)
- Carlos Mendez: `carlos.dev@mentormind.ai` / `Password123!` (88% Match)
- Aisha Al-Mansoor: `aisha.ai@mentormind.ai` / `Password123!` (82% Match)

---

## 5. Deployment Instructions

### Frontend (Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_URL`: Backend URL

### Node.js Backend (Render / Railway)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node src/server.js`
- Environment Variables:
  - `MONGODB_URI`: MongoDB Atlas connection URI
  - `JWT_SECRET`: Production secret key
  - `AI_SERVICE_URL`: URL of the deployed Python AI service

### Python AI Service (Render / Railway)
- Root Directory: `ai-service`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Environment Variables:
  - `AI_PROVIDER`: `gemini` or `openai` or `demo`
  - `GEMINI_API_KEY`: Google Gemini API Key (optional)
