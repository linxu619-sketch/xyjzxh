@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 信阳市建筑装修协会 · 一键启动

REM 切换到脚本所在目录
cd /d "%~dp0"

echo ============================================================
echo   信阳市建筑装修协会 网站 · 一键启动
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
echo [1/4] Node.js 版本：%NODE_VER%
echo.

REM ---------- 2. 安装依赖（仅当缺失时）----------
if not exist "node_modules" (
    echo [2/4] 首次运行，正在安装依赖（可能需要几分钟）...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b 1
    )
) else (
    echo [2/4] 依赖已就绪，跳过安装。
)
echo.

REM ---------- 3. 检查环境变量文件 ----------
if not exist ".env.local" (
    echo [3/4] 未发现 .env.local，将以「演示模式」运行（AI 用内置示例回复）。
    echo        如需接入真实 AI / Supabase，请复制 .env.local.example 为 .env.local 并填写。
) else (
    echo [3/4] 已发现 .env.local，使用其中配置。
)
echo.

REM ---------- 4. 启动开发服务器并打开浏览器 ----------
echo [4/4] 正在启动开发服务器... 启动后将自动打开浏览器。
echo        访问地址：http://localhost:3000
echo        关闭本窗口即可停止服务器。
echo.

REM 延迟几秒后自动打开浏览器（等待编译）
start "" cmd /c "timeout /t 8 >nul & start "" http://localhost:3000"

call npm run dev

echo.
echo 服务器已停止。
pause
