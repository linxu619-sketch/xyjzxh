# 开发约定与网站特性 CONVENTIONS

> 本文件记录**一旦确认就要长期保持一致**的开发习惯与网站特性。
> 每条都是「已确认的决定」，后续开发必须遵守；如需改变，先在这里更新并在 CHANGELOG 记录。
> 本文件会被 `AGENTS.md` 自动加载，每次开发会话都会读取。

## 协作流程（硬性）

1. **每次改动直接定版本并提交**（发布节奏 = A）：每完成一次有意义的改动，立即在 `CHANGELOG.md` 新建一个版本号条目（**不使用「未发布」缓冲区**），同步 `package.json` 版本号，并提交一个 Git commit。
2. **版本号同步**：CHANGELOG 的版本号与 `package.json` 的 `version` 始终一致，遵循 SemVer。
3. **约定先于代码**：开始一类新功能/风格前，先确认是否已有约定；确认为网站特性后写入本文件，之后保持一致。

## 技术约定

- **改版 Next.js**：这是一个有重大改动的 Next.js（16.2.6），写任何代码前先读 `node_modules/next/dist/docs/` 里的相关文档，留意 deprecation 提示。
- **默认端口**：3000。
- **数据库 = 本地 SQLite（默认，零配置）**：用 Node 24 内置 `node:sqlite`，库文件 `data/app.db`（已 gitignore），首次访问自动建表并用 `lib/data/*` 种子灌库；数据源在 `lib/db/sqlite.ts` + `lib/data/*-source.ts`，查询失败回退 mock。新页面迁真实库：仿 `enterprises-source.ts` 加 `getXXX()`。**上线给多人访问时再迁服务器数据库**（Supabase 等，代码里 Supabase 接入保留为休眠状态，见 db/README.md）。当前已迁：`/members`（enterprises）。
- **`middleware` 已废弃** → 应迁移到 `proxy`（当前为技术债，待处理）。
- **批处理脚本（`.bat`）必须存为 GBK(cp936) 编码**（无 BOM、CRLF 换行）。中文版 Windows 的 `cmd.exe` 用 GBK 逐字节解析 `.bat`，若存成 UTF-8，中文多字节会让命令解析错位、报「不是内部或外部命令」导致启动失败（`chcp 65001` 救不了）。
  - ⚠️ **用 Write/Edit 工具改过 `.bat` 后，它会变回 UTF-8，必须重新转 GBK**：
    ```powershell
    $p='D:\xyjzxh\启动.bat'; $t=Get-Content -Raw -Encoding UTF8 $p; $t=($t -split "`r?`n") -join "`r`n"; [IO.File]::WriteAllText($p,$t,[Text.Encoding]::GetEncoding(936))
    ```
  - `.gitattributes` 已将 `*.bat` 设为 `-text`（二进制），防止 git 改动其字节。

## 网站特性

- **双主页 / 三门面架构（核心特性，务必记住）**：网站按**域名（host）**分流到不同门面，逻辑在 `middleware.ts`：
  | 门面 | 生产域名 | 本地开发地址 | 入口路由 |
  |------|---------|-------------|---------|
  | 消费者门户（业主找装修） | `xyjzxh.com` | `localhost:3000` | `/`（`app/(main)/page.tsx`，`ConsumerHome`）|
  | 协会门户（企业/从业者） | `xh.xyjzxh.com` | `xh.lvh.me:3000`（或 `localhost:3000/xh`） | `/` 重写到 `/xh`（`app/(main)/xh/page.tsx`，`AssociationHome`）|
  | 企业子站 | `<租户>.xyjzxh.com` | `<租户>.lvh.me:3000` | 重写到 `/biz/<租户>` |
  - 当前门面通过 cookie `xy_face` 与响应头 `x-face` 标记。
  - **本地访问协会门户的正确方式**（`localhost:3000` 只显示消费者门户）：
    - `localhost:3000/xh` — 最简单、离线即用，但 face 标记仍是 consumer（仅看内容够用）。
    - `xh.lvh.me:3000` — 真实子域名分流（face=xh），需联网；`middleware.ts` 的 `DEV_ROOTS` 已内置 `lvh.me`。
    - ⚠️ **不要用 `xh.localhost:3000`**：Windows 浏览器默认不解析 `*.localhost`，打不开。
- **移动端全站固定底栏**（`components/global-bottom-nav.tsx`，挂在 `(main)` 布局）：每个门户页移动端固定显示，桌面端隐藏（桌面用顶部导航 + 悬浮 AI 按钮 `AiDock`）。两门面各一套标签：
  - 消费者：首页 / 找装企 / **AI估价**(中间凸起) / 评价 / 我的
  - 协会：协会(首页) / 会员 / **AI** / 工装报备 / 我的
  - 例外（不叠加底栏）：AI 聊天页 `/ai/[key]`（有自己的输入框）、客户/从业者控制台（有自己的 `CustomerBottomNav`）。
  - **保险**不进消费者门户底栏（放首页/服务入口）；客户控制台底栏保留保险。
- **会员体系（三身份、两类会员）**：
  - **业主（消费者，role=customer）**：**不是协会会员**，只在消费者门户注册账号；**不出现在"申请入会"里**。
  - **企业会员（role=enterprise）**：建筑施工 / 装饰装修 / 设计公司等单位；入会填企业全称、统一社会信用代码、资质、子域名等。
  - **个人会员（role=practitioner）**：**专业个人为主**（独立设计师 / 项目经理 / 监理 / 独立工长）；入会填实名、专业/工种、身份证、从业年限、资格证书；**不要营业执照/信用代码/子域名**。普通工人（瓦工/水电工等）走"从业者登记找活"，不算正式会员。
  - `/join` 顶部分企业/个人两类；`/register` 入会语境只显示企业会员/个人会员两 tab。**"设计师个人"不再放在企业类型里**。
- **协会门户主页 `/xh` 定位**：面向会员（企业+个人）的**服务与交流平台**（公告通知、两类会员通道、会员办事大厅、会员风采、活动培训、行业新闻、AI 助手）。**不放消费者"找装修/找企业"营销**——那属于消费者主页 `/`。
- **界面语言**：简体中文。
- **AI 数字员工**：未配置 key 时走「演示模式」（内置示例回复）；提供方优先级 DeepSeek > Anthropic。DeepSeek 使用 **V4**（`deepseek-v4-flash` 默认 / `deepseek-v4-pro` 最高能力），思考模式用 `thinking` 参数控制；旧名 `deepseek-chat/reasoner`（2026-07-24 停用）在代码里自动映射到 v4-flash。
- **AI 对话记忆**：当前仅单次会话内多轮连续，刷新/新会话即清空，无持久化。（如需长期记忆另行确认后实现）
- **AI 员工知识库（RAG，第一期）**：每个 AI 员工有独立知识库 `lib/ai/knowledge.ts`（按 `employee_key` 隔离），聊天时按用户问题检索 top-K 拼进该员工 `system`。现为种子数据 + 关键词/二元组检索；待 Supabase 配好换 Postgres FTS/pgvector，`retrieveKnowledge` 接口不变。**绝不自动写入未经审核的对话内容**（第二期由协会审核后入库）。
- **AI 对话框**：推理模型(reasoner)的思考过程由后端包进 `<think>…</think>`（不再逐 token 加 🧠），前端 `ChatWindow` 解析为**可折叠的「思考过程」**（思考时动画展开、出答案后收起）；出错显示「重试」卡片。对话页 `/ai/[key]` 为**沉浸式**（隐藏全站底栏，靠左上角返回键回 AI 大厅）。

## 启动方式

- 启动：双击 `启动.bat` —— **服务器在后台运行**，启动器窗口可随意关闭、网站继续运行；就绪后自动打开消费者门户。运行日志写入 `server.log`。
- 停止：双击 `停止.bat` —— 结束后台服务器（按端口 3000 杀进程树）。
- 生产部署方式待定（已不使用本地"生产模式"脚本）。

---
*新增约定时，在对应分类下追加一条，并在 `CHANGELOG.md` 记录这次变更。*
