<#
.SYNOPSIS
  注册「信阳建装 · 每日知识库抓取」Windows 计划任务（默认每天 06:00）。
.DESCRIPTION
  创建一个每日触发的计划任务，调用同目录 knowledge-fetch.bat 抓取知识库更新。
  需以管理员身份运行 PowerShell。
.PARAMETER Secret
  CRON_SECRET，必填，与服务端 .env.local 中的 CRON_SECRET 一致。
.PARAMETER SiteUrl
  站点地址，默认 http://127.0.0.1:3000（本机直连）。
.PARAMETER Time
  每日触发时间，默认 06:00。
.EXAMPLE
  .\register-windows-task.ps1 -Secret "你的密钥" -Time "06:00"
.EXAMPLE
  # 卸载：
  Unregister-ScheduledTask -TaskName "XYJZXH-KnowledgeFetch" -Confirm:$false
#>
param(
  [Parameter(Mandatory = $true)] [string]$Secret,
  [string]$SiteUrl = "http://127.0.0.1:3000",
  [string]$Time = "06:00"
)

$ErrorActionPreference = "Stop"
$taskName = "XYJZXH-KnowledgeFetch"
$bat = Join-Path $PSScriptRoot "knowledge-fetch.bat"
if (-not (Test-Path $bat)) { throw "找不到 $bat" }

# 通过命令行参数把密钥与地址传给 .bat（不依赖任务环境变量）
# cmd /c 规则：最外层再包一对引号，cmd 会剥掉首尾引号，保留内部带空格路径/参数的引号
$argLine = '/c ""{0}" "{1}" "{2}""' -f $bat, $Secret, $SiteUrl
$action  = New-ScheduledTaskAction -Execute "cmd.exe" -Argument $argLine
$trigger = New-ScheduledTaskTrigger -Daily -At $Time
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -RunOnlyIfNetworkAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "已删除旧任务，重新注册..."
}

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
  -Settings $settings -Principal $principal `
  -Description "每日抓取知识库更新（AI 起草进草稿箱待审）" | Out-Null

Write-Host "✓ 已注册计划任务 '$taskName'，每天 $Time 运行。"
Write-Host "  立即测试： Start-ScheduledTask -TaskName $taskName"
Write-Host "  查看日志： $PSScriptRoot\logs\knowledge-cron.log"
Write-Host "  卸载：     Unregister-ScheduledTask -TaskName $taskName -Confirm:`$false"
