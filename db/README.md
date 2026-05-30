# 接入 Supabase · 5 步

## 1. 建项目

打开 https://supabase.com/dashboard/projects 点 **New Project**：
- 名字：`xyjzxh` 或随意
- Database Password：随便设一个强密码（自己留好）
- Region：选 **Singapore (ap-southeast-1)** 国内最快
- Pricing Plan：Free 够用

等 1-2 分钟到 Project 就绪。

## 2. 拿 URL + 两把 Key

进 Project → **Settings → API**：

| 字段 | 用途 |
|---|---|
| `Project URL` | 域名根 |
| `anon` `public` | 客户端用 · 受 RLS 保护 |
| `service_role` `secret` | 服务端用 · **绕过 RLS** · 保管好 |

## 3. 跑 Schema

进 **SQL Editor → New query**，把 `db/schema.sql` 全文粘进去，点 **Run**。
显示 "Success. No rows returned" 就 OK。

## 4. 跑 Seed

再新建 query，把 `db/seed.sql` 粘进去 Run。最后会输出：
```
status              | enterprises_count | staff_count | knowledge_count
种子数据已就绪     | 12                | 4           | 5
```

## 5. 填配置

**方式 A · 推荐**：登录平台 → 协会工作台 → 系统设置 → 对外集成 →
找到 "Supabase（数据库）" 三行：
- URL
- anon key
- service_role key

点顶部 **保存全部**。

**方式 B**：在项目根新建 `.env.local`：
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```
重启 dev。

## 验证

打开 `/members` 顶部应有徽章：**数据来自 Supabase**（绿色）。
若仍显示 **数据来自 Mock**（黄色），说明：
- key 填错（401）
- 表没建（schema 没跑）
- 域名错（typo）

可以在系统设置里点 "测试连接"（如有按钮）或直接看 dev 终端的报错。

## 数据库结构概览

| 表 | 用途 |
|---|---|
| `association_staff`   | 协会工作人员账号（含 何平俊 super_admin） |
| `enterprises`         | 会员企业（12 家种子）|
| `enterprise_staff`    | 企业员工账号 |
| `customers`           | C 端业主账号 |
| `project_reports`     | 工装报备 |
| `insurance_orders`    | 消费保险订单 |
| `finance_leads`       | 金融意向 |
| `jobs / resumes / job_applications` | 招聘 / 求职 |
| `mediations`          | 调解卷宗 |
| `reviews`             | 业主评价 |
| `knowledge_items`     | 知识库 |
| `ai_conversations`    | AI 对话元数据 |

详细 schema 见 `db/schema.sql`。

## 已迁移到 DB 的页面

| 页面 | 数据 |
|---|---|
| `/members` 会员目录 | ✅ enterprises 表 |
| ... 其余页面 | mock（按需迁移）|

要再迁哪个页面告诉我 — 模式很简单：
1. 把 `lib/data/xxx.ts` 加个 `lib/data/xxx-source.ts`（参考 `enterprises-source.ts`）
2. 页面里把 `import { XXX }` 改成 `await getXXX()`
3. 失败自动回退 mock，业务不会崩
