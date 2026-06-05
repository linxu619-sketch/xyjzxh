@echo off
REM ============================================================
REM XYJZXH - Daily knowledge-base fetch (Windows)
REM ------------------------------------------------------------
REM Triggers: AI fetch -> draft inbox (pending review).
REM Intended to be called daily by Windows Task Scheduler.
REM Usage:
REM   knowledge-fetch.bat <CRON_SECRET> [SITE_URL]
REM   or set env vars CRON_SECRET / SITE_URL and run with no args.
REM Notes: args take priority over env; SITE_URL defaults to
REM        http://127.0.0.1:3000
REM ============================================================
setlocal enabledelayedexpansion

set "SECRET=%~1"
if "%SECRET%"=="" set "SECRET=%CRON_SECRET%"
set "URL=%~2"
if "%URL%"=="" set "URL=%SITE_URL%"
if "%URL%"=="" set "URL=http://127.0.0.1:3000"

if "%SECRET%"=="" (
  echo [ERROR] CRON_SECRET not provided ^(arg or env var^)
  exit /b 1
)

set "LOGDIR=%~dp0logs"
if not exist "%LOGDIR%" mkdir "%LOGDIR%"

set "STAMP=%date% %time%"
echo [%STAMP%] fetching %URL%/api/cron/knowledge-fetch >> "%LOGDIR%\knowledge-cron.log"
curl -sS --max-time 150 -H "Authorization: Bearer %SECRET%" "%URL%/api/cron/knowledge-fetch" >> "%LOGDIR%\knowledge-cron.log" 2>&1
set "RC=%ERRORLEVEL%"
echo. >> "%LOGDIR%\knowledge-cron.log"
echo [%STAMP%] curl exit code %RC% >> "%LOGDIR%\knowledge-cron.log"

endlocal & exit /b %RC%
