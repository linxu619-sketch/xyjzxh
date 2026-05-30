@echo off
setlocal enabledelayedexpansion
title 信阳建装 · 一键启动（请勿关闭本窗口）

REM 切换到脚本所在目录
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

REM ---------- 3. 启动开发服务器 ----------
echo [3/3] 正在启动开发服务器...
echo.
echo   ------------------------------------------------------------
echo   网站启动后，在浏览器访问以下地址：
echo.
echo     消费者门户（业主找装修）  http://localhost:3000
echo     协会门户（企业/从业者）   http://localhost:3000/xh
echo.
echo   就绪后会自动打开「消费者门户」。看协会门户请用上面带 /xh 的地址。
echo   ------------------------------------------------------------
echo.
echo   【重要】本窗口就是服务器，使用期间请勿关闭！关闭窗口=停止网站。
echo.

REM 后台轮询：等服务器真正就绪后再自动打开浏览器（最多等 90 秒）
start "" powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "for($i=0;$i -lt 90;$i++){try{$null=Invoke-WebRequest -UseBasicParsing 'http://localhost:3000' -TimeoutSec 2;Start-Process 'http://localhost:3000';break}catch{Start-Sleep -Seconds 1}}"

call npm run dev

echo.
echo 服务器已停止。
pause
