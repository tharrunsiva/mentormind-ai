# MentorMind AI - Windows PowerShell All-in-One Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         Starting MentorMind AI Services" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. MongoDB
Write-Host "`n[1/4] Starting MongoDB Daemon..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& 'C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe' --dbpath '$root\data\db' --port 27017"

Start-Sleep -Seconds 2

# 2. Python FastAPI AI Service
Write-Host "[2/4] Starting Python FastAPI AI Service on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ai-service'; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 2

# 3. Node.js Express Backend
Write-Host "[3/4] Starting Node.js Backend API on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; npm run dev"

Start-Sleep -Seconds 2

# 4. React Vite Frontend
Write-Host "[4/4] Starting React Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  All 4 MentorMind AI Services are launching!" -ForegroundColor Green
Write-Host "  - Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend:    http://localhost:5000/api" -ForegroundColor White
Write-Host "  - AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "==========================================================`n" -ForegroundColor Green
