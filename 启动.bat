@echo off
setlocal enabledelayedexpansion
title 信阳建装 · 一键启动

cd /d "%~dp0"

echo ============================================================
echo   信阳市建筑装饰装修协会（信阳建装）· 一键启动
echo ============================================================
echo.

REM ---------- 1. 检查 Node.js ----------
where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node -v') do set NODE_VER=%%v
echo [1/3] Node.js 版本：%NODE_VER%
echo.

REM ---------- 2. 安装依赖（仅当缺失时）----------
if not exist "node_modules" (
    echo [2/3] 首次运行，正在安装依赖（可能需要几分钟）...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        echo.
        pause
        exit /b 1
    )
) else (
    echo [2/3] 依赖已就绪。
)
echo.

REM ---------- 若已在运行，直接打开浏览器 ----------
powershell -NoProfile -Command "if(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue){exit 9}else{exit 0}"
if errorlevel 9 (
    echo [提示] 网站已在运行，直接为你打开浏览器。
    start "" http://localhost:3000
    echo.
    echo 要停止网站请双击「停止.bat」。本窗口可关闭。
    echo.
    pause
    exit /b 0
)

REM ---------- 3. 后台启动服务器 ----------
echo [3/3] 正在后台启动网站服务器...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npm run dev > server.log 2>&1' -WorkingDirectory '%~dp0' -WindowStyle Hidden"

echo     正在等待服务器就绪（通常几秒）...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($i=0;$i -lt 90;$i++){try{$null=Invoke-WebRequest -UseBasicParsing 'http://localhost:3000' -TimeoutSec 2; $ok=$true; break}catch{Start-Sleep -Seconds 1}}; if($ok){Start-Process 'http://localhost:3000'; exit 0}else{exit 1}"
if errorlevel 1 (
    echo.
    echo [警告] 等待超时，服务器可能启动失败。请查看本目录下的 server.log 排查。
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   网站已在后台启动！
echo.
echo     消费者门户（业主找装修）  http://localhost:3000
echo     协会门户（企业/从业者）   http://localhost:3000/xh
echo.
echo   * 本窗口现在可以关闭，网站会继续在后台运行。
echo   * 要停止网站，请双击「停止.bat」。
echo ============================================================
echo.
pause
