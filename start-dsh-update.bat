@echo off
rem ============================================================
rem  DeepSeek Harness update + launch (ui-redesign branch)
rem  Pulls the latest code, rebuilds the frontend, then starts
rem  the Web GUI at http://127.0.0.1:3080
rem
rem  IMPORTANT: keep this file inside the repo folder. To launch
rem  from the desktop, right-click it -> Send to -> Desktop
rem  shortcut. Do NOT copy the .bat itself to the desktop.
rem ============================================================
setlocal
cd /d "%~dp0"
title DeepSeek Harness - Update

if not exist "package.json" (
  echo [dsh] ERROR: this script must run from the repository root.
  echo [dsh] Keep it in the repo folder and use a desktop SHORTCUT.
  echo.
  pause
  exit /b 1
)

if /i "%~1"=="-check" (
  echo [dsh] check: repository root OK
  echo [dsh] check: pnpm version:
  pnpm --version
  exit /b 0
)

echo [dsh] Pulling latest code...
git pull
if errorlevel 1 goto :fail

echo.
echo [dsh] Building (takes a few minutes)...
call pnpm run build
if errorlevel 1 goto :fail

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
