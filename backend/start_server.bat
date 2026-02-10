@echo off
echo Starting Student Feedback Analyzer Backend...
cd /d %~dp0

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment and starting server...
call venv\Scripts\activate.bat
python app.py
pause

