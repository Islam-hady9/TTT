@echo off
echo 🐟 Tibyan Aquaculture Backend Setup
echo ====================================

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit .env and set your SECRET_KEY!
)

echo.
echo ✅ Setup complete!
echo.
echo To start the server:
echo   venv\Scripts\activate.bat
echo   python run.py
echo.
echo API will be available at: http://localhost:8000
echo API docs: http://localhost:8000/docs

pause
