@echo off
cd /d "%~dp0"
set URL=http://localhost:5173/index.html?api=http://127.0.0.1:8000
echo.
echo   PrismQuant frontend
echo   -------------------
echo   Serving this folder at http://localhost:5173
echo   API base        http://127.0.0.1:8000
echo.
echo   The browser opens in 2 seconds. Keep this window open.
echo   Press Ctrl+C to stop the server.
echo.
start "" /b cmd /c "timeout /t 2 >nul & start %URL%"
python -m http.server 5173
pause
