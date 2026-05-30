@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title 信阳市建筑装修协会 · 生产模式启动

REM 切换到脚本所在目录
cd /d "%~dp0"

echo ============================================================
echo   信阳市建筑装修协会 网站 · 生产模式启动
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
echo [1/5] Node.js 版本：%NODE_VER%
echo.

REM ---------- 2. 安装依赖（仅当缺失时）----------
if not exist "node_modules" (
    echo [2/5] 首次运行，正在安装依赖（可能需要几分钟）...
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b 1
    )
) else (
    echo [2/5] 依赖已就绪，跳过安装。
)
echo.

REM ---------- 3. 检查环境变量文件 ----------
if not exist ".env.local" (
    echo [3/5] 未发现 .env.local，将以「演示模式」运行（AI 用内置示例回复）。
) else (
    echo [3/5] 已发现 .env.local，使用其中配置。
)
echo.

REM ---------- 4. 构建生产版本（无构建产物时才构建）----------
REM 改过代码后想重新构建：删除本目录下的 .next 文件夹，或带参数运行 「启动-生产模式.bat rebuild」
if /i "%~1"=="rebuild" (
    echo [4/5] 收到 rebuild 参数，强制重新构建...
    if exist ".next" rmdir /s /q ".next"
)
if not exist ".next\BUILD_ID" (
    echo [4/5] 正在构建生产版本（首次/改动后需要，约 1-2 分钟）...
    call npm run build
    if errorlevel 1 (
        echo [错误] 构建失败，请查看上方报错信息。
        pause
        exit /b 1
    )
) else (
    echo [4/5] 已检测到生产构建产物，跳过构建。
    echo        （如改过代码需更新，请删除 .next 文件夹，或运行：启动-生产模式.bat rebuild）
)
echo.

REM ---------- 5. 启动生产服务器并打开浏览器 ----------
echo [5/5] 正在启动生产服务器... 启动后将自动打开浏览器。
echo        访问地址：http://localhost:3000
echo        关闭本窗口即可停止服务器。
echo.

start "" cmd /c "timeout /t 5 >nul & start "" http://localhost:3000"

call npm run start

echo.
echo 服务器已停止。
pause
