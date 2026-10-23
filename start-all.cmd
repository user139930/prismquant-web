@echo off
rem PrismQuant one-click launcher (thin wrapper, ASCII only)
rem The real work is in start-all.py, which handles Unicode paths safely.
cd /d "%~dp0"

rem Prefer the managed Python if present, else fall back to plain "python".
set "PY=C:\Users\Admin\.workbuddy\binaries\python\versions\3.13.12\python.exe"
if not exist "%PY%" set "PY=python"

"%PY%" "%~dp0start-all.py"
pause
