@echo off
rem ============================================================
rem  DeepSeek Harness quick launcher (ui-redesign build)
rem  Double-click to start the Web GUI at http://127.0.0.1:3080
rem  using the existing frontend build. First run builds it.
rem  To pull the latest code and rebuild, use start-dsh-update.bat
rem ============================================================
setlocal
cd /d "%~dp0"

if not exist "apps\web\dist\index.html" (
  echo [dsh] No frontend build found. Building (first run, ~1-3 min)...
  call pnpm run build
  if errorlevel 1 goto :fail
) else (
  echo [dsh] Using existing frontend build.
  echo [dsh] Run start-dsh-update.bat to pull the latest code and rebuild.
)

echo [dsh] Starting Web GUI at http://127.0.0.1:3080
echo [dsh] Press Ctrl+C in this window to stop.
start "" /b cmd /c "timeout /t 4 /nobreak >nul & start http://127.0.0.1:3080"
call pnpm dsh web
exit /b %errorlevel%

:fail
echo [dsh] Build failed. See output above.
pause
