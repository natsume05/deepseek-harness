@echo off
rem ============================================================
rem  DeepSeek Harness update + launch (ui-redesign branch)
rem  Pulls the latest code, rebuilds the frontend, then starts
rem  the Web GUI at http://127.0.0.1:3080
rem ============================================================
setlocal
cd /d "%~dp0"

echo [dsh] Pulling latest code...
git pull
if errorlevel 1 goto :fail

echo [dsh] Building (takes a few minutes)...
call pnpm run build
if errorlevel 1 goto :fail

echo [dsh] Starting Web GUI at http://127.0.0.1:3080
echo [dsh] Press Ctrl+C in this window to stop.
start "" /b cmd /c "timeout /t 4 /nobreak >nul & start http://127.0.0.1:3080"
call pnpm dsh web
exit /b %errorlevel%

:fail
echo [dsh] Failed. See output above.
pause
