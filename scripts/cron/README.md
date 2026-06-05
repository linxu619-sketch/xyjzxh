# 每日知识库自动抓取 · 部署说明

让「AI 抓取 → 起草 → 草稿箱待审」每天自动跑一次。原理：操作系统的定时器（Linux cron / systemd、Windows 任务计划）每天定时去打一个**密钥保护的接口**，接口触发抓取，结果进**草稿箱**等人工审核（**不会自动发布**）。

> 本平台用本地 SQLite，必须跑在**常驻进程**（VPS / 服务器上 `next start`）才有意义；Vercel 等无状态 Serverless 不适用。

---

## 0. 前置：配置密钥（服务端，必做一次）

在服务器项目根目录的 `.env.local` 里加一行（值用随机长字符串）：

```bash
# 生成： node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
CRON_SECRET=把上面生成的随机串填这里
```

改完 **重启服务**（`next start` / pm2 restart 等）使其生效。

- 接口地址：`/api/cron/knowledge-fetch`
- 鉴权：请求头 `Authorization: Bearer <CRON_SECRET>`，或查询串 `?key=<CRON_SECRET>`
- 未配置 `CRON_SECRET` 时接口返回 **503 拒绝执行**（防止被滥用）。
- 接口支持 GET / POST，返回 JSON：`{ ok, totalNew, usedAI, sources:[...] }`。

手动验证一次（替换密钥与域名）：

```bash
curl -H "Authorization: Bearer 你的密钥" https://xyjzxh.com/api/cron/knowledge-fetch
```

---

## 1. Linux 服务器（crontab，最简单）

```bash
chmod +x /opt/xyjzxh/scripts/cron/knowledge-fetch.sh
crontab -e
```

加入一行（每天 06:00 跑；用本机直连 127.0.0.1 免走公网）：

```cron
0 6 * * * CRON_SECRET=你的密钥 SITE_URL=http://127.0.0.1:3000 /opt/xyjzxh/scripts/cron/knowledge-fetch.sh
```

日志在 `scripts/cron/logs/knowledge-cron.log`。

### 可选：用 systemd timer（比 crontab 更好管理）

`/etc/systemd/system/xyjzxh-knowledge.service`：

```ini
[Unit]
Description=XYJZXH 每日知识库抓取
[Service]
Type=oneshot
Environment=CRON_SECRET=你的密钥
Environment=SITE_URL=http://127.0.0.1:3000
ExecStart=/opt/xyjzxh/scripts/cron/knowledge-fetch.sh
```

`/etc/systemd/system/xyjzxh-knowledge.timer`：

```ini
[Unit]
Description=每天 06:00 触发知识库抓取
[Timer]
OnCalendar=*-*-* 06:00:00
Persistent=true
[Install]
WantedBy=timers.target
```

启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now xyjzxh-knowledge.timer
systemctl list-timers | grep xyjzxh      # 查看下次触发
```

---

## 2. Windows 服务器（任务计划程序）

以**管理员**打开 PowerShell，运行（默认每天 06:00）：

```powershell
cd D:\xyjzxh\scripts\cron
.\register-windows-task.ps1 -Secret "你的密钥" -Time "06:00"
```

- 立即测试一次：`Start-ScheduledTask -TaskName XYJZXH-KnowledgeFetch`
- 查看日志：`scripts\cron\logs\knowledge-cron.log`
- 卸载：`Unregister-ScheduledTask -TaskName XYJZXH-KnowledgeFetch -Confirm:$false`

> 默认任务为「当前用户已登录时运行」。若服务器无人登录需后台跑，把注册脚本里的
> `-LogonType Interactive` 改为 `-LogonType S4U`（无需密码、后台运行）。
>
> 也可不用 PS1，直接在「任务计划程序」里新建任务，操作设为：
> 程序 `cmd.exe`，参数 `/c "D:\xyjzxh\scripts\cron\knowledge-fetch.bat" 你的密钥`。

---

## 成本与行为说明

- 每次抓取会调用 DeepSeek 起草，**单次最多起草 6 条**草稿（引擎内置上限，控成本）。
- 抓到的内容**只进草稿箱**，需协会在后台「知识库管理 → 草稿箱」人工审核通过后才入库、对外可见。
- 抓哪些来源、启停，在后台「知识库管理 → 抓取来源管理」里配置。
- 改抓取频率：调整 cron 表达式 / systemd `OnCalendar` / 计划任务触发时间即可。
