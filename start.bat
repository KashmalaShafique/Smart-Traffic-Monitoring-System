@echo off
echo Starting Smart Traffic System...

:: Start Django Backend
start "Django Backend" cmd /k "cd /d D:\Documents\SmartTrafficSystem\SmartTrafficSystem\traffic_backend && D:\Documents\SmartTrafficSystem\SmartTrafficSystem\venv\Scripts\activate && python manage.py runserver"

:: Wait 6 seconds for backend to fully start
timeout /t 6 /nobreak

:: Start React Frontend
start "React Frontend" cmd /k "cd /d D:\Documents\SmartTrafficSystem\SmartTrafficSystem\frontend\traffic-dashboard && npm run dev"

:: Wait 5 seconds for frontend to start
timeout /t 5 /nobreak

:: Logout first to clear session, then open login page
start msedge -inprivate http://127.0.0.1:8000/auth/login/

echo All systems started!