@echo off
REM ============================================================
REM  EZ Teleprompter - one-click Windows build
REM  Produces a single-file portable .exe + an installer in dist\
REM  Requirements: Node.js 18+ for Windows (https://nodejs.org)
REM  Just double-click this file.
REM ============================================================
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [!] Node.js was not found.
  echo     Install Node.js 18+ from https://nodejs.org then run this again.
  echo.
  pause
  exit /b 1
)

echo.
echo === Installing dependencies (first run only) ===
call npm install
if errorlevel 1 goto :fail

echo.
echo === Building the portable .exe + installer ===
call npm run dist
if errorlevel 1 goto :fail

echo.
echo === Done! Your files are in the dist\ folder: ===
echo     - "EZ Teleprompter-1.0.0-x64.exe"          (installer)
echo     - "EZ Teleprompter-1.0.0-portable.exe"     (single-file, no install)
echo.
start "" "%~dp0dist"
pause
exit /b 0

:fail
echo.
echo [!] Build failed. See the messages above.
echo.
pause
exit /b 1
