@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
  py -3 run.py %*
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python 3.9+ is required. Install Python and enable Add Python to PATH.
  ) else (
    python run.py %*
  )
)
pause
