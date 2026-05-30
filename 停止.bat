@echo off
setlocal
title 信阳建装 · 停止网站

cd /d "%~dp0"

echo 正在停止网站服务器...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$o=@(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -Expand OwningProcess -Unique); if($o.Count -gt 0){foreach($procId in $o){ Start-Process taskkill -ArgumentList '/PID',$procId,'/T','/F' -Wait -WindowStyle Hidden }; Write-Host '网站已停止。'}else{ Write-Host '网站当前未在运行（端口 3000 没有进程）。' }"

echo.
echo 完成，本窗口即将关闭。
timeout /t 3 >nul
