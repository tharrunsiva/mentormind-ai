@echo off
TITLE MentorMind AI - All Services Launcher
echo ==========================================================
echo           Starting MentorMind AI Services
echo ==========================================================

REM 1. MongoDB
echo [1/4] Starting MongoDB...
start "MentorMind - MongoDB" cmd /k "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe --dbpath \"d:\MentorMind AI\data\db\" --port 27017"

timeout /t 3 > nul

REM 2. Python AI Service
echo [2/4] Starting Python FastAPI AI Service (Port 8000)...
start "MentorMind - AI Service" cmd /k "cd ai-service && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 > nul

REM 3. Node.js Backend API
echo [3/4] Starting Node.js Express Backend (Port 5000)...
start "MentorMind - Node Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 > nul

REM 4. React Frontend
echo [4/4] Starting React Frontend (Port 5173)...
start "MentorMind - Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================================
echo  All services launched in separate windows!
echo  Frontend UI:  http://localhost:5173
echo  Backend API:  http://localhost:5000/api
echo  AI Service:   http://localhost:8000
echo ==========================================================
pause
