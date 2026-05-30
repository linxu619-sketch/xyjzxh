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
- **界面语言**：简体中文。
- **AI 数字员工**：未配置 key 时走「演示模式」（内置示例回复）；提供方优先级 DeepSeek > Anthropic。
- **AI 对话记忆**：当前仅单次会话内多轮连续，刷新/新会话即清空，无持久化。（如需长期记忆另行确认后实现）

## 启动方式

- 开发：双击 `启动.bat`（黑窗口=服务器，使用期间勿关；就绪后自动打开消费者门户）。
- 生产部署方式待定（已不使用本地"生产模式"脚本）。

---
*新增约定时，在对应分类下追加一条，并在 `CHANGELOG.md` 记录这次变更。*
