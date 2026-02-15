@echo off
echo Starting Minimal Backend Server with Flask CLI...
set FLASK_APP=backend/app_minimal.py
set FLASK_DEBUG=1
python -m flask run --port 5000 --host=0.0.0.0
pause
