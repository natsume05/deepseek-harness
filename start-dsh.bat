@echo off
rem ============================================================
rem  DeepSeek Harness quick launcher (ui-redesign build)
rem  Double-click to start the Web GUI at http://127.0.0.1:3080
rem  using the existing frontend build. First run builds it.
rem  To pull the latest code and rebuild, use start-dsh-update.bat
rem
rem  IMPORTANT: keep this file inside the repo folder. To launch
rem  from the desktop, right-click it -> Send to -> Desktop
rem  shortcut. Do NOT copy the .bat itself to the desktop.
rem ============================================================
setlocal
cd /d "%~dp0"
title DeepSeek Harness

if not exist "package.json" (
  echo [dsh] ERROR: this script must run from the repository root.
  echo [dsh] Keep it in the repo folder and use a desktop SHORTCUT.
  echo.
  pause
  exit /b 1
)

if /i "%~1"=="-check" (
  echo [dsh] check: repository root OK
  if exist "apps\web\dist\index.html" (
    echo [dsh] check: frontend build present
  ) else (
    echo [dsh] check: frontend build MISSING - first run will build it
  )
  echo [dsh] check: pnpm version:
  pnpm --version
  exit /b 0
)

if not exist "apps\web\dist\index.html" (
  echo [dsh] No frontend build found. Building (first run, ~1-3 min)...
  call pnpm run build
  if errorlevel 1 goto :fail
) else (
  echo [dsh] Using existing frontend build.
  echo [dsh] Run start-dsh-update.bat to pull the latest code and rebuild.
)

echo.
echo [dsh] Starting Web GUI at http://127.0.0.1:3080
echo [dsh] Keep this window open. Press Ctrl+C to stop.
call pnpm dsh web
if errorlevel 1 goto :fail

echo.
echo [dsh] Stopped. Press any key to close.
pause >nul
exit /b 0

:fail
echo.
echo [dsh] Something failed - see the messages above.
echo [dsh] This window stays open so you can read them.
pause
exit /b 1
