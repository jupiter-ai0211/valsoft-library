@echo off
REM Quick Start Script for LibraFlow (Windows)
REM Run this to start development after setup

echo.
echo 🚀 LibraFlow - Library Management System
echo =========================================
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo.
    echo Steps to setup:
    echo 1. Copy .env.example to .env
    echo 2. Add your Supabase credentials
    echo 3. Run this script again
    echo.
    echo See SETUP.md for detailed instructions
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

echo ✅ Setup complete!
echo.
echo 📖 Documentation files:
echo   - README.md ............ Main documentation
echo   - SETUP.md ............ Step-by-step setup guide
echo   - FEATURES.md ........ Complete feature list
echo   - PLAN.md ............ Project plan
echo.
echo 🚀 Starting development server...
echo    Open http://localhost:5173 when ready
echo.
echo 🔑 Test Accounts:
echo    Admin: admin@example.com / Password123!
echo    Librarian: librarian@example.com / Password123!
echo    Member: member@example.com / Password123!
echo.

call npm run dev
pause
