# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 信阳市建筑装饰装修协会网站 — Next.js **16.2.6** (App Router) · React 19 · TypeScript · Tailwind v4 · 本地 SQLite。
> 项目文档为中文，代码注释为中文，提交信息与 CHANGELOG 均为中文。

## 必读文件（开始前先读）

- **@AGENTS.md** — 入口，链接到下面两份。
- **@CONVENTIONS.md** — 已确认、长期保持一致的开发约定与网站特性（双门面架构、SQLite 数据源、会员体系、AI 数字员工、启动方式等）。**这些是硬性约定，必须遵守。**
- **`UI-STYLE.md`** — 前端格式 / 样式规范（图片上传、证件长宽比、分步向导、圆角、配色）。做任何 UI 前先看。
- **`CHANGELOG.md`** — 每次改动的记录；版本号与 `package.json` 始终一致（SemVer）。
- **改版 Next.js**：这是有重大改动的 Next.js（16.2.6）。**写任何 Next 代码前先读 `node_modules/next/dist/docs/` 里的相关文档**，留意 deprecation 提示——你训练数据里的 Next API 可能已失效。

## 强制工作流（来自 CONVENTIONS）

每完成一次有意义的改动，**立即**：
1. 在 `CHANGELOG.md` 新建一个版本号条目（不使用「未发布」缓冲区）。
2. 同步 `package.json` 的 `version`（SemVer：补丁=修 bug/文案；次版本=新功能/新页面；主版本=重大改版）。
3. 提交一个 Git commit。

## 常用命令

```bash
npm run dev      # 开发服务器，端口 3000（已配 --max-old-space-size=4096）
npm run build    # 生产构建
npm run lint     # ESLint（eslint-config-next core-web-vitals + typescript）
npm run clean    # 删除 .next
```

- **本地启动（Windows）**：双击 `启动.bat`（后台运行，日志写 `server.log`，就绪后自动开浏览器）；`停止.bat` 按端口 3000 杀进程树。
- ⚠️ `.bat` 必须存为 **GBK(cp936)** 编码；用 Write/Edit 改过后会变回 UTF-8，必须重新转码（命令见 CONVENTIONS.md）。
- 无单测框架；验证靠 `npm run build` / `npm run lint` + 手动访问。
- 路径别名：`@/*` → 项目根（见 `tsconfig.json`）。

## 架构要点（需读多文件才能看清的部分）

**域名分流 / 三门面**（核心，详见 CONVENTIONS）。逻辑在 `middleware.ts`：按 host 把请求分到
消费者门户（`/` → `app/(main)/page.tsx`）、协会门户（`xh.*` 重写到 `/xh`）、企业子站（`<租户>.*` 重写到 `/biz/<tenant>`）。
当前门面用 cookie `xy_face` + 响应头 `x-face` 标记。本地访问协会门户用 `localhost:3000/xh` 或 `xh.lvh.me:3000`。
> 注意：CONVENTIONS 记录 `middleware` 已被改版 Next 标记为废弃、待迁移到 `proxy`（技术债）；改这块前先确认。

**路由分组**（`app/`）：
- `(main)/` — 公开门户页（消费者 + 协会共用，`/xh` 为协会主页）。会员、从业者、AI、保险、金融、新闻、入会 `/join`、注册 `/register`、登录 `/login` 等都在这里。
- `(dashboard)/dashboard` — 控制台（客户/从业者/企业/协会职员/系统管理员）。
- `biz/[tenant]` — 企业子站（由 middleware 重写进入）。
- `legal/` — 协议签署页。
- `api/` — Route Handlers：`chat`（AI 对话）、`upload` / `upload-doc`、`esign/callback`、`cron/knowledge-fetch`、`health`。

**数据层（关键模式）**：本地 **SQLite**（Node 24 内置 `node:sqlite`，零依赖、零配置）。
- 库文件 `data/app.db`（gitignore）；schema + 首访自动建表 + 种子灌库都在 `lib/db/sqlite.ts`。
- 种子数据是 `lib/data/*.ts`（mock 常量，如 `enterprises.ts`）；真实查询封装在 `lib/data/*-source.ts`。
- **数据源约定**：`*-source.ts` 从 SQLite 读，**查询失败回退对应 mock 常量**，保证 UI 不崩（见 `enterprises-source.ts` 的 `getEnterprises`）。
- **新页面接真实库**：仿 `enterprises-source.ts` 加 `getXXX()`，在 `sqlite.ts` 加表/种子。当前已迁真实库的：`/members`（enterprises）。
- Supabase 等服务器数据库代码已作为**死代码移除**；上线多人访问时再迁（迁移说明见 `.env.example` 的 `DATABASE_URL`、`db/README.md`）。

**鉴权 / 角色**：`lib/auth/`——`session.ts`（会话）、`login.ts`（含密码登录防爆破：同手机号 10 分钟内错满 5 次锁 10 分钟）、`password.ts`、`roles.ts`（`STAFF_ROLES` + `PERMISSIONS` 权限矩阵）、`system-admin.ts`。
三身份两类会员（业主 customer / 企业 enterprise / 个人 practitioner）规则见 CONVENTIONS「会员体系」。

**AI 数字员工**：`lib/ai/`——`chat.ts`、`prompts.ts`、`providers/`（DeepSeek V4 优先于 Anthropic；未配 key 走演示模式）、`knowledge.ts`/`knowledge-fetch.ts`（每个员工独立知识库 RAG，按 `employee_key` 隔离；**绝不自动写入未经审核的对话内容**）。前端对话页 `/ai/[key]` 为沉浸式（隐藏全站底栏）。

**组件**：`components/`——`global-bottom-nav.tsx`（移动端固定底栏，两门面各一套标签）、`site-header.tsx` / `site-footer.tsx`、`ai-dock.tsx`（桌面悬浮 AI）、`ui/`、`sections/`、`dashboard/`、`agreements/`、`print/`。

**安全**：全站安全响应头在 `next.config.ts` `headers()`（nosniff、SAMEORIGIN、Referrer-Policy、Permissions-Policy、有限 CSP `frame-ancestors/object-src/base-uri/form-action`，生产下发 HSTS）。CSP **刻意不限制 script/style/connect**，以免破坏 Next 内联引导与 dev HMR——改 CSP 前注意这点。
