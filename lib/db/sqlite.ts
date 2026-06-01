import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { ENTERPRISES } from "@/lib/data/enterprises";
import { KNOWLEDGE } from "@/lib/ai/knowledge";

/* ============================================================
   本地 SQLite 数据库（Node 24 内置 node:sqlite，零依赖、零云端）
   ------------------------------------------------------------
   - 数据库文件：<项目>/data/app.db（已 gitignore）
   - 首次访问自动建表，并用 lib/data 里的种子数据灌库
   - 单机/本地运行用；将来上线多人访问再迁移到服务器数据库
   ============================================================ */

type DB = InstanceType<typeof DatabaseSync>;

const g = globalThis as unknown as { __xyjzxhDb?: DB };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS enterprises (
  id            TEXT PRIMARY KEY,
  slug          TEXT,
  name          TEXT,
  category      TEXT,
  district      TEXT,
  founded       INTEGER,
  staff_size    TEXT,
  qualification TEXT,   -- JSON 数组
  tags          TEXT,   -- JSON 数组
  short         TEXT,
  hero          TEXT,   -- JSON
  contact       TEXT,   -- JSON
  rating        REAL,
  reviews       INTEGER,
  cases         INTEGER,
  verified      INTEGER, -- 0/1
  featured      INTEGER, -- 0/1
  theme         TEXT,    -- 子站主题色(build/decor/design/tea/brand)；空则按类别默认
  status        TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS ai_knowledge (
  id           TEXT PRIMARY KEY,
  employee_key TEXT NOT NULL,
  title        TEXT,
  keywords     TEXT,    -- JSON 数组
  content      TEXT,
  source       TEXT,
  enabled      INTEGER DEFAULT 1, -- 0/1
  created_at   INTEGER
);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_emp ON ai_knowledge(employee_key);

CREATE TABLE IF NOT EXISTS ai_questions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_key TEXT,
  question     TEXT,
  created_at   INTEGER
);
CREATE INDEX IF NOT EXISTS idx_ai_questions_emp ON ai_questions(employee_key, created_at);

CREATE TABLE IF NOT EXISTS applications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  type        TEXT,    -- enterprise | individual | customer
  applicant   TEXT,    -- 企业名 / 姓名 / 称呼
  phone       TEXT,
  payload     TEXT,    -- JSON 其余字段
  status      TEXT DEFAULT 'pending', -- pending | approved | rejected
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status, created_at);

CREATE TABLE IF NOT EXISTS project_reports (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  uid         TEXT,
  code        TEXT,
  project     TEXT,
  type        TEXT,
  enterprise  TEXT,
  area        TEXT,
  budget      TEXT,
  manager     TEXT,
  phone       TEXT,
  payload     TEXT,    -- JSON 其余字段
  status      TEXT DEFAULT 'pending', -- pending | approved | rejected
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON project_reports(status, created_at);

CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  uid         TEXT,
  user        TEXT,
  enterprise  TEXT,
  project     TEXT,
  rating      INTEGER,
  content     TEXT,
  category    TEXT,
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);

CREATE TABLE IF NOT EXISTS insurance_orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  uid         TEXT,    -- 提交时登录用户 id（未登录为空）
  product     TEXT,
  applicant   TEXT,
  phone       TEXT,
  note        TEXT,
  status      TEXT DEFAULT 'pending', -- pending | contacted | done
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_ins_status ON insurance_orders(status, created_at);

CREATE TABLE IF NOT EXISTS mediations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  uid         TEXT,
  applicant   TEXT,
  phone       TEXT,
  respondent  TEXT,   -- 被投诉方（企业/项目）
  detail      TEXT,
  status      TEXT DEFAULT 'pending', -- pending | accepted | closed | rejected
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_mediations_status ON mediations(status, created_at);

CREATE TABLE IF NOT EXISTS practitioners (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id      INTEGER UNIQUE,  -- 来源入会申请 id（防重复入册）
  name        TEXT,
  kind        TEXT,
  years       INTEGER,
  rating      REAL,
  jobs        INTEGER,
  city        TEXT,
  insured     INTEGER,
  phone       TEXT,
  created_at  INTEGER
);

CREATE TABLE IF NOT EXISTS leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id TEXT,    -- 归属企业（子站留资即该企业 id）
  name          TEXT,
  phone         TEXT,
  type          TEXT,    -- 项目类型
  style         TEXT,
  area          TEXT,
  budget        TEXT,
  address       TEXT,
  note          TEXT,
  source        TEXT,    -- 子站表单 | 在线咨询 | AI 估价 ...
  status        TEXT DEFAULT 'new', -- new | contacting | surveying | signed | lost
  created_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_leads_ent ON leads(enterprise_id, created_at);

CREATE TABLE IF NOT EXISTS enterprise_cases (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id TEXT,
  title         TEXT,
  cover         TEXT,    -- 封面图 URL
  area          TEXT,
  tag           TEXT,
  detail        TEXT,    -- 项目描述
  images        TEXT,    -- 案例图集 JSON 数组(1-10张)；cover 为首图
  created_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_cases_ent ON enterprise_cases(enterprise_id, created_at);

CREATE TABLE IF NOT EXISTS enterprise_team (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id TEXT,
  name          TEXT,
  role          TEXT,
  exp           TEXT,
  photo         TEXT,    -- 成员照片 URL
  bio           TEXT,    -- 详细介绍
  created_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_team_ent ON enterprise_team(enterprise_id, created_at);

CREATE TABLE IF NOT EXISTS jobs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id   TEXT,
  enterprise_name TEXT,
  title           TEXT,
  kind            TEXT,    -- 工种
  district        TEXT,
  daily           INTEGER, -- 日薪
  openings        INTEGER, -- 名额
  duration        TEXT,    -- 工期
  urgent          INTEGER DEFAULT 0,
  detail          TEXT,
  status          TEXT DEFAULT 'open', -- open | closed
  created_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_ent ON jobs(enterprise_id, created_at);

CREATE TABLE IF NOT EXISTS job_applications (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id             INTEGER,
  enterprise_id      TEXT,
  practitioner_phone TEXT,
  name               TEXT,
  phone              TEXT,
  note               TEXT,
  status             TEXT DEFAULT 'pending', -- pending | accepted | rejected
  created_at         INTEGER
);
CREATE INDEX IF NOT EXISTS idx_japp_job ON job_applications(job_id, created_at);
CREATE INDEX IF NOT EXISTS idx_japp_phone ON job_applications(practitioner_phone, created_at);

CREATE TABLE IF NOT EXISTS accounts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  phone         TEXT UNIQUE,
  role          TEXT,    -- enterprise | individual | customer
  status        TEXT DEFAULT 'pending', -- pending | active | rejected
  password_hash TEXT,    -- 企业用;个人/业主短信登录可空
  name          TEXT,
  app_id        INTEGER, -- 关联入会申请
  member_ref    TEXT,    -- 通过后绑定:企业 enterprise_id 或 从业者 p-id
  created_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_accounts_phone ON accounts(phone);

CREATE TABLE IF NOT EXISTS news (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category    TEXT,
  title       TEXT,
  excerpt     TEXT,
  content     TEXT,
  author      TEXT,
  color       TEXT,
  hot         INTEGER DEFAULT 0,
  views       INTEGER DEFAULT 0,
  status      TEXT DEFAULT 'published', -- published | draft
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status, created_at);

CREATE TABLE IF NOT EXISTS trainings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT,
  category    TEXT,
  instructor  TEXT,
  location    TEXT,
  schedule    TEXT,
  capacity    INTEGER,
  fee         TEXT,
  detail      TEXT,
  status      TEXT DEFAULT 'open', -- open | closed
  created_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status, created_at);

CREATE TABLE IF NOT EXISTS training_enrollments (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  training_id        INTEGER,
  practitioner_phone TEXT,
  name               TEXT,
  phone              TEXT,
  created_at         INTEGER
);
CREATE INDEX IF NOT EXISTS idx_tenroll_t ON training_enrollments(training_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tenroll_p ON training_enrollments(practitioner_phone, created_at);

CREATE TABLE IF NOT EXISTS supply_products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT,
  category      TEXT,
  unit          TEXT,
  spec          TEXT,
  supplier      TEXT,
  brand         TEXT,                      -- 品牌（平台内排他键：同品牌只允许一家在售）
  seller_type   TEXT DEFAULT 'association',-- association | enterprise | practitioner
  seller_id     TEXT,                      -- 企业 enterprise_id 或 从业者 p-id 或 assoc
  seller_name   TEXT,
  reason_type   TEXT,                      -- agent(独家代理) | self(自产自销) | direct(厂家直供)
  reason_note   TEXT,                      -- 资格说明
  proof_url     TEXT,                      -- 资格证明图
  moq           INTEGER DEFAULT 1,         -- 起批量
  image_url     TEXT,                      -- 商品效果图 URL
  price_tiers   TEXT,                      -- 阶梯量价 JSON: [{minQty,price}] 买得越多单价越低
  market_price  INTEGER,
  member_price  INTEGER,
  status        TEXT DEFAULT 'active',     -- pending(待审) | active(在架) | rejected(驳回) | off(下架)
  reject_reason TEXT,
  created_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_supply_status ON supply_products(status, created_at);
CREATE INDEX IF NOT EXISTS idx_supply_seller ON supply_products(seller_type, seller_id);
CREATE INDEX IF NOT EXISTS idx_supply_brand ON supply_products(brand);

CREATE TABLE IF NOT EXISTS supply_orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id   TEXT,                  -- 兼容旧数据/企业采购（买家为企业时同 buyer_id）
  enterprise_name TEXT,
  buyer_type      TEXT,                  -- enterprise | practitioner
  buyer_id        TEXT,
  buyer_name      TEXT,
  seller_type     TEXT,                  -- association | enterprise | practitioner（履约方）
  seller_id       TEXT,
  seller_name     TEXT,
  product_id      INTEGER,
  product_name    TEXT,
  unit            TEXT,
  qty             INTEGER,
  unit_price      INTEGER,
  total           INTEGER,
  status          TEXT DEFAULT 'pending', -- pending | confirmed | shipped | done
  created_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_sorder_ent ON supply_orders(enterprise_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sorder_buyer ON supply_orders(buyer_type, buyer_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sorder_seller ON supply_orders(seller_type, seller_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sorder_status ON supply_orders(status, created_at);

CREATE TABLE IF NOT EXISTS finance_products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT,
  provider    TEXT,
  type        TEXT,
  rate_label  TEXT,
  amount_label TEXT,
  term_label  TEXT,
  for_whom    TEXT,
  color       TEXT,
  status      TEXT DEFAULT 'active',
  created_at  INTEGER
);

CREATE TABLE IF NOT EXISTS finance_applications (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id   TEXT,
  enterprise_name TEXT,
  product_id      INTEGER,
  product_name    TEXT,
  amount          TEXT,
  note            TEXT,
  status          TEXT DEFAULT 'pending', -- pending | approved | rejected | disbursed
  created_at      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_finapp_ent ON finance_applications(enterprise_id, created_at);
CREATE INDEX IF NOT EXISTS idx_finapp_status ON finance_applications(status, created_at);

CREATE TABLE IF NOT EXISTS orders (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id  TEXT,
  code           TEXT,
  customer_name  TEXT,
  customer_phone TEXT,
  scope          TEXT,
  type           TEXT,
  area           TEXT,
  district       TEXT,
  amount         INTEGER,
  stage          TEXT DEFAULT 'signed', -- signed | planning | in-progress | accepted
  progress       INTEGER DEFAULT 0,
  received_pct   INTEGER DEFAULT 0,
  created_at     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_orders_ent ON orders(enterprise_id, created_at);
`;

function seedEnterprises(db: DB) {
  const row = db.prepare("SELECT COUNT(*) AS c FROM enterprises").get() as { c: number };
  if (row.c > 0) return;
  const stmt = db.prepare(
    `INSERT INTO enterprises
      (id,slug,name,category,district,founded,staff_size,qualification,tags,short,hero,contact,rating,reviews,cases,verified,featured,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'active')`,
  );
  for (const e of ENTERPRISES) {
    stmt.run(
      e.id, e.slug, e.name, e.category, e.district, e.founded, e.staff,
      JSON.stringify(e.qualification ?? []),
      JSON.stringify(e.tags ?? []),
      e.short ?? "",
      JSON.stringify(e.hero ?? {}),
      JSON.stringify(e.contact ?? {}),
      e.rating ?? 0, e.reviews ?? 0, e.cases ?? 0,
      e.verified ? 1 : 0, e.featured ? 1 : 0,
    );
  }
}

function seedAiKnowledge(db: DB) {
  const row = db.prepare("SELECT COUNT(*) AS c FROM ai_knowledge").get() as { c: number };
  if (row.c > 0) return;
  const stmt = db.prepare(
    `INSERT INTO ai_knowledge (id,employee_key,title,keywords,content,source,enabled,created_at)
     VALUES (?,?,?,?,?,?,1,?)`,
  );
  const now = Date.now();
  for (const [key, entries] of Object.entries(KNOWLEDGE)) {
    for (const e of entries ?? []) {
      stmt.run(`${key}:${e.id}`, key, e.title, JSON.stringify(e.keywords ?? []), e.content, e.source ?? null, now);
    }
  }
}

function isEmpty(db: DB, table: string): boolean {
  return (db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as { c: number }).c === 0;
}
const DAY = 86400000;

function seedPractitioners(db: DB) {
  if (!isEmpty(db, "practitioners")) return;
  const rows: [string, string, number, number, number, string, number, string][] = [
    ["张师傅", "工长", 18, 4.8, 142, "浉河区", 1, "13900020001"],
    ["李师傅", "木工", 22, 4.9, 218, "平桥区", 1, "13900020002"],
    ["王师傅", "水电工", 12, 4.7, 86, "羊山新区", 1, "13900020003"],
    ["赵师傅", "瓦工", 16, 4.6, 102, "光山县", 1, "13900020004"],
    ["孙女士", "设计师", 8, 4.9, 62, "浉河区", 0, "13900020005"],
    ["周师傅", "油漆工", 10, 4.5, 88, "息县", 1, "13900020006"],
    ["钱师傅", "项目经理", 14, 4.8, 56, "罗山县", 1, "13900020007"],
    ["陈监理", "监理", 20, 4.9, 184, "浉河区", 1, "13900020008"],
  ];
  const stmt = db.prepare("INSERT INTO practitioners (name,kind,years,rating,jobs,city,insured,phone,created_at) VALUES (?,?,?,?,?,?,?,?,?)");
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], now - i * DAY));
}

function seedReviews(db: DB) {
  if (!isEmpty(db, "reviews")) return;
  const rows: [string, string, string, number, string, string][] = [
    ["刘女士", "名家装饰", "金茂悦府 1602", 5, "项目经理特别负责，水电改造多次主动来工地，质量超预期。", "decor"],
    ["陈先生", "壹品装饰", "茶都商务 22F", 5, "设计师很懂年轻人审美，方案改了两版就定稿，施工严格按图。", "decor"],
    ["孙先生", "华泰建工", "茶博园景观二期", 4, "整体满意，进度严格，唯独沟通群有时回得慢。", "build"],
    ["周女士", "雅舍设计事务所", "御景湾别墅软装", 5, "软装搭配出乎意料，节奏感和留白处理得很到位。", "design"],
    ["王女士", "万家美装饰", "弦山街老房翻新", 4, "县域价格做出市区品质，性价比之选。", "decor"],
    ["杨先生", "中恒建设", "申城大道商办", 5, "央企施工就是稳，安全文明施工到位。", "build"],
  ];
  const stmt = db.prepare("INSERT INTO reviews (user,enterprise,project,rating,content,category,created_at) VALUES (?,?,?,?,?,?,?)");
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], now - i * DAY));
}

function seedApplications(db: DB) {
  if (!isEmpty(db, "applications")) return;
  const rows: [string, string, string, Record<string, string>, string][] = [
    ["enterprise", "信阳同信建工有限公司", "13800010001", { entName: "信阳同信建工有限公司", entType: "建筑施工", region: "浉河区", creditCode: "91411500AAAA0001", subdomain: "tongxin", contactName: "同先生", contactPhone: "13800010001", "营业执照": "/samples/license.svg", "身份证人像面": "/samples/id-front.svg", "身份证国徽面": "/samples/id-back.svg", "资质证书": "/samples/cert.svg", "项目业绩": "/samples/work-1.svg；/samples/work-2.svg" }, "pending"],
    ["enterprise", "明禾装饰工程有限公司", "13800010002", { entName: "明禾装饰工程有限公司", entType: "装饰装修", region: "羊山新区", creditCode: "91411500AAAA0002", subdomain: "minghe", contactName: "何女士", contactPhone: "13800010002", "营业执照": "/samples/license.svg", "身份证人像面": "/samples/id-front.svg", "身份证国徽面": "/samples/id-back.svg", "资质证书": "/samples/cert.svg", "项目业绩": "/samples/work-1.svg；/samples/work-2.svg" }, "pending"],
    ["individual", "林之远", "13800010003", { realName: "林之远", profession: "设计师", idcard: "411500199001011234", years: "9", phone: "13800010003", "身份证人像面": "/samples/id-front.svg", "身份证国徽面": "/samples/id-back.svg", "资格证书": "/samples/cert.svg", "代表作品": "/samples/work-1.svg；/samples/work-2.svg" }, "pending"],
    ["enterprise", "鹿鸣空间设计有限公司", "13800010004", { entName: "鹿鸣空间设计有限公司", entType: "设计公司", region: "平桥区", creditCode: "91411500AAAA0004", subdomain: "luming", contactName: "鹿女士", contactPhone: "13800010004", "营业执照": "/samples/license.svg", "身份证人像面": "/samples/id-front.svg", "身份证国徽面": "/samples/id-back.svg", "项目业绩": "/samples/work-1.svg；/samples/work-2.svg" }, "approved"],
    ["individual", "吴小明", "13800010005", { realName: "吴小明", profession: "独立工长", idcard: "411500198805053456", years: "6", phone: "13800010005", "身份证人像面": "/samples/id-front.svg", "身份证国徽面": "/samples/id-back.svg", "代表作品": "/samples/work-1.svg" }, "rejected"],
  ];
  const stmt = db.prepare("INSERT INTO applications (type,applicant,phone,payload,status,created_at) VALUES (?,?,?,?,?,?)");
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], JSON.stringify(r[3]), r[4], now - i * DAY));
}

function seedReports(db: DB) {
  if (!isEmpty(db, "project_reports")) return;
  type RR = { project: string; type: string; enterprise: string; area: string; budget: string; manager: string; phone: string; payload: Record<string, string>; status: string };
  const rows: RR[] = [
    { project: "金茂悦府 12 栋 1602 整装", type: "家装", enterprise: "名家装饰", area: "168", budget: "32", manager: "刘工", phone: "13800020001", payload: { planStart: "2026-05-20", planEnd: "2026-08-15", address: "浉河区金茂悦府", summary: "三居室整装，含水电改造与全屋定制" }, status: "pending" },
    { project: "茶都商务大厦 22F 办公装修", type: "工装", enterprise: "壹品装饰", area: "1200", budget: "260", manager: "张工", phone: "13800020002", payload: { planStart: "2026-06-01", planEnd: "2026-10-01", address: "平桥区茶都商务大厦", summary: "整层办公空间，含消防与弱电" }, status: "pending" },
    { project: "万象城海底捞餐饮空间", type: "公装", enterprise: "名家装饰", area: "860", budget: "180", manager: "王工", phone: "13800020003", payload: { planStart: "2026-04-10", planEnd: "2026-07-10", address: "羊山新区万象城", summary: "餐饮空间，含厨房工程" }, status: "approved" },
    { project: "御景湾别墅软装", type: "家装", enterprise: "雅舍设计事务所", area: "320", budget: "120", manager: "孙工", phone: "13800020004", payload: { planStart: "2026-03-01", planEnd: "2026-06-01", address: "浉河区御景湾", summary: "别墅软装整体方案" }, status: "approved" },
    { project: "弦山街老房翻新", type: "家装", enterprise: "万家美装饰", area: "98", budget: "16", manager: "周工", phone: "13800020005", payload: { planStart: "2026-05-01", planEnd: "2026-06-20", address: "息县弦山街", summary: "老房翻新，水电全改" }, status: "rejected" },
  ];
  const insert = db.prepare("INSERT INTO project_reports (uid,code,project,type,enterprise,area,budget,manager,phone,payload,status,created_at) VALUES ('', '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  const upd = db.prepare("UPDATE project_reports SET code=? WHERE id=?");
  const now = Date.now();
  rows.forEach((r, i) => {
    const info = insert.run(r.project, r.type, r.enterprise, r.area, r.budget, r.manager, r.phone, JSON.stringify(r.payload), r.status, now - i * DAY);
    const id = Number(info.lastInsertRowid);
    upd.run("P-2026-" + String(1000 + id).padStart(4, "0"), id);
  });
}

function seedInsurance(db: DB) {
  if (!isEmpty(db, "insurance_orders")) return;
  const rows: [string, string, string, string, string][] = [
    ["安心家装险（协会版）", "刘女士", "13800030001", "金茂悦府 168㎡ 整装", "pending"],
    ["家装质保险", "陈先生", "13800030002", "茶都商务办公", "contacted"],
    ["建筑工人团意险", "名家装饰", "13800030003", "工人 12 人", "done"],
    ["工程履约保证保险", "壹品装饰", "13800030004", "茶都商务 22F", "pending"],
  ];
  const stmt = db.prepare("INSERT INTO insurance_orders (uid,product,applicant,phone,note,status,created_at) VALUES (NULL,?,?,?,?,?,?)");
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], now - i * DAY));
}

function seedMediations(db: DB) {
  if (!isEmpty(db, "mediations")) return;
  const rows: [string, string, string, string, string][] = [
    ["王女士", "13800040001", "某装饰公司", "工期延误 20 天，要求按合同支付违约金。", "pending"],
    ["李先生", "13800040002", "某建工", "墙面瓷砖大面积空鼓，要求返工或减免尾款。", "accepted"],
    ["张先生", "13800040003", "某设计工作室", "设计方案与实际施工不符，要求整改。", "pending"],
    ["赵女士", "13800040004", "某装企", "已在协会主持下达成和解，各让一步。", "closed"],
  ];
  const stmt = db.prepare("INSERT INTO mediations (uid,applicant,phone,respondent,detail,status,created_at) VALUES (NULL,?,?,?,?,?,?)");
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], now - i * DAY));
}

function seedLeads(db: DB) {
  if (!isEmpty(db, "leads")) return;
  // 演示线索归属 e002（名家装饰，演示登录默认绑定的企业）
  type LR = { name: string; phone: string; type: string; style: string; area: string; budget: string; address: string; note: string; source: string; status: string };
  const rows: LR[] = [
    { name: "刘女士", phone: "13811110001", type: "家装 · 整装", style: "现代极简", area: "120", budget: "30", address: "浉河区金茂悦府", note: "三居室，想要开放式厨房，预算偏紧。", source: "子站表单", status: "surveying" },
    { name: "陈先生", phone: "13811110002", type: "工装 · 办公", style: "不限", area: "320", budget: "60", address: "羊山新区茶都商务", note: "整层办公室翻新，含弱电。", source: "在线咨询", status: "contacting" },
    { name: "王女士", phone: "13811110003", type: "家装 · 半包", style: "新中式", area: "98", budget: "20", address: "平桥区南湖一号", note: "老房翻新，主要改水电与厨卫。", source: "子站表单", status: "new" },
    { name: "孙总", phone: "13811110004", type: "工装 · 商业", style: "不限", area: "1200", budget: "180", address: "羊山新区万象城", note: "餐饮空间，含厨房工程。", source: "AI 估价", status: "surveying" },
    { name: "周女士", phone: "13811110005", type: "家装 · 整装", style: "原木", area: "85", budget: "16", address: "浉河区弦山街", note: "小户型，性价比优先。", source: "口碑评价", status: "signed" },
    { name: "赵先生", phone: "13811110006", type: "家装 · 整装", style: "北欧", area: "140", budget: "28", address: "平桥区御景湾", note: "已选定其他公司。", source: "子站表单", status: "lost" },
  ];
  const stmt = db.prepare(
    "INSERT INTO leads (enterprise_id,name,phone,type,style,area,budget,address,note,source,status,created_at) VALUES ('e002',?,?,?,?,?,?,?,?,?,?,?)",
  );
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r.name, r.phone, r.type, r.style, r.area, r.budget, r.address, r.note, r.source, r.status, now - i * 7200000));
}

function seedCases(db: DB) {
  if (!isEmpty(db, "enterprise_cases")) return;
  // 演示案例归属 e002（名家装饰），封面用样例图
  const rows: [string, string, string, string, string][] = [
    ["金茂悦府 1602 · 现代极简整装", "/samples/cases/case-e002-1.jpg", "168", "整装", "三居室整装项目，业主追求极简与收纳并重。全屋定制柜体到顶，客餐厅一体化设计，水电改造按规范全程留痕，18 道工序质检交付，工期 75 天。"],
    ["御景湾别墅 · 新中式软装", "/samples/cases/case-e002-2.jpg", "320", "软装", "独栋别墅软装整体方案，新中式风格。从空间动线、硬装收口到家具、布艺、灯具、挂画一站式陈列搭配，进口品牌主材，呈现东方雅致的居住氛围。"],
    ["茶都商务 22F · 办公空间", "/samples/cases/case-e002-3.jpg", "1200", "工装", "整层办公空间装修，含开放工位、会议室、洽谈区与茶水间。同步完成消防、弱电、中央空调改造，工装报备直连省厅，30 天交付投用。"],
    ["南湖一号 · 原木风三居", "/samples/cases/case-e002-4.jpg", "120", "家装", "小三居原木风整装，性价比之选。以浅色木饰面 + 白墙营造温馨通透感，主材环保 E0 级，含厨卫翻新与全屋定制，预算可控。"],
  ];
  const stmt = db.prepare("INSERT INTO enterprise_cases (enterprise_id,title,cover,area,tag,detail,images,created_at) VALUES ('e002',?,?,?,?,?,?,?)");
  const now = Date.now();
  rows.forEach((r, i) => {
    const cid = i + 1; // 全新库自增 id 即 1..4
    const imgs = [r[1], `/samples/cases/case-e002-${cid}-g1.jpg`, `/samples/cases/case-e002-${cid}-g2.jpg`, `/samples/cases/case-e002-${cid}-g3.jpg`, `/samples/cases/case-e002-${cid}-g4.jpg`];
    stmt.run(r[0], r[1], r[2], r[3], r[4], JSON.stringify(imgs), now - i * DAY);
  });
}

function seedTeam(db: DB) {
  if (!isEmpty(db, "enterprise_team")) return;
  // [name, role, exp, bio]
  const rows: [string, string, string, string][] = [
    ["李工", "首席设计师", "15 年经验 · 注册一级", "从业 15 年，主持金茂悦府、御景湾等 200+ 高端整装与软装项目。擅长极简与收纳一体化设计，注重空间动线与光影，注册一级建造师，多次获省级装饰设计奖。"],
    ["张工", "项目总监", "20 年 · 一级建造师", "20 年工程管理经验，一级建造师。主导大型工装与住宅交付，建立 18 道工序质检体系，确保工期与品质双达标。"],
    ["王工", "技术总工", "12 年 · BIM 专家", "12 年施工技术与 BIM 应用经验，负责施工图深化与节点把控，推动绿色建造与新材料落地。"],
    ["赵工", "材料主管", "10 年 · 供应链", "10 年供应链与材料把控经验，对接协会集采，严选环保 E0 级主材，为业主控本增质。"],
  ];
  const stmt = db.prepare("INSERT INTO enterprise_team (enterprise_id,name,role,exp,photo,bio,created_at) VALUES ('e002',?,?,?,?,?,?)");
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], `/samples/team/team-e002-${i + 1}.jpg`, r[3], now - i * 3600000));
}

function seedJobs(db: DB) {
  if (!isEmpty(db, "jobs")) return;
  // [enterprise_id, enterprise_name, title, kind, district, daily, openings, duration, urgent, detail]
  const rows: [string, string, string, string, string, number, number, string, number, string][] = [
    ["e002", "名家装饰", "急招水电工 5 名 · 金茂悦府工地", "水电工", "浉河区", 380, 5, "约 25 天", 1, "金茂悦府整装项目，水电改造阶段，需持证、能看图，包午餐。"],
    ["e002", "名家装饰", "木工 3 名 · 全屋定制安装", "木工", "羊山新区", 420, 3, "约 40 天", 0, "全屋定制柜体现场安装，熟练工优先，长期合作。"],
    ["e001", "信阳华泰建工", "土建项目经理 1 名", "项目经理", "浉河区", 800, 1, "长期", 0, "市政项目现场管理，一级建造师优先，五险一金。"],
    ["e008", "壹品装饰", "油漆工 4 名 · 茶都商务办公装修", "油漆工", "平桥区", 360, 4, "约 20 天", 1, "办公空间乳胶漆与造型，需自带工具，结算及时。"],
    ["e002", "名家装饰", "监理 1 名 · 多工地巡检", "监理", "浉河区", 500, 1, "长期", 0, "负责在施工地质量与安全巡检，需相关证书与经验。"],
  ];
  const stmt = db.prepare(
    "INSERT INTO jobs (enterprise_id,enterprise_name,title,kind,district,daily,openings,duration,urgent,detail,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?, 'open', ?)",
  );
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], now - i * 43200000));
}

function init(): DB {
  const dir = join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(join(dir, "app.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  migrate(db);
  seedEnterprises(db);
  seedAiKnowledge(db);
  seedPractitioners(db);
  seedReviews(db);
  seedApplications(db);
  seedReports(db);
  seedInsurance(db);
  seedMediations(db);
  seedLeads(db);
  seedCases(db);
  seedTeam(db);
  seedJobs(db);
  seedAccounts(db);
  seedNews(db);
  seedTrainings(db);
  seedSupplyProducts(db);
  normalizeSupplyProducts(db);
  seedSupplyMemberListings(db);
  seedFinanceProducts(db);
  seedOrders(db);
  return db;
}

function seedOrders(db: DB) {
  if (!isEmpty(db, "orders")) return;
  // 归属 e002（名家装饰）。[code,customer,phone,scope,type,area,district,amount,stage,progress,received]
  const rows: [string, string, string, string, string, string, string, number, string, number, number][] = [
    ["ORD-2026-0512", "刘女士", "13800030001", "金茂悦府 12 栋 1602 整装", "家装", "168", "浉河区", 318600, "in-progress", 42, 65],
    ["ORD-2026-0498", "陈先生", "13800030002", "茶都商务大厦 22F 办公装修", "工装", "2400", "羊山新区", 2800000, "in-progress", 68, 50],
    ["ORD-2026-0476", "周女士", "13800030003", "御景湾别墅软装", "家装", "320", "浉河区", 560000, "accepted", 100, 100],
    ["ORD-2026-0531", "王总", "13800030004", "南湖一号 401 整装", "家装", "140", "平桥区", 268000, "planning", 0, 30],
  ];
  const stmt = db.prepare(
    "INSERT INTO orders (enterprise_id,code,customer_name,customer_phone,scope,type,area,district,amount,stage,progress,received_pct,created_at) VALUES ('e002',?,?,?,?,?,?,?,?,?,?,?,?)",
  );
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], now - i * 5 * DAY));
}

function seedFinanceProducts(db: DB) {
  if (!isEmpty(db, "finance_products")) return;
  // [name, provider, type, rate_label, amount_label, term_label, for_whom, color]
  const rows: [string, string, string, string, string, string, string, string][] = [
    ["建装贷", "中原银行信阳分行", "经营贷", "年化 3.45% 起", "≤ 500 万", "12-36 个月", "在册装修/建筑企业", "brand"],
    ["工程保函", "中国建设银行", "保函", "费率 0.8% 起", "≤ 2000 万", "按工期", "承接工程项目企业", "build"],
    ["工程款保理", "信阳农商银行", "保理", "年化 5.8% 起", "≤ 工程款 80%", "按账期", "有应收工程款企业", "decor"],
    ["设备分期", "平安租赁", "融资租赁", "月费率 0.5% 起", "≤ 300 万", "12-24 个月", "需采购设备企业", "design"],
  ];
  const stmt = db.prepare(
    "INSERT INTO finance_products (name,provider,type,rate_label,amount_label,term_label,for_whom,color,status,created_at) VALUES (?,?,?,?,?,?,?,?, 'active', ?)",
  );
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], now - i * 3600000));
}

function seedSupplyProducts(db: DB) {
  if (!isEmpty(db, "supply_products")) return;
  // [name, category, unit, spec, supplier, market_price, member_price]
  const rows: [string, string, string, string, string, number, number][] = [
    ["立邦多乐士内墙乳胶漆", "墙面涂料", "桶(18L)", "净味五合一", "立邦中国", 580, 459],
    ["东方雨虹防水涂料", "防水材料", "组(20kg)", "JS聚合物水泥基", "东方雨虹", 320, 245],
    ["伟星PPR给水管", "水电材料", "支(4m)", "DN25 冷热通用", "伟星新材", 38, 27],
    ["西门子开关插座", "电气", "个", "致典系列 五孔", "西门子", 45, 32],
    ["圣象多层实木地板", "地板", "㎡", "E0级 锁扣", "圣象集团", 268, 199],
    ["蒙娜丽莎瓷砖", "瓷砖", "㎡", "750×1500 通体大理石", "蒙娜丽莎", 188, 138],
  ];
  const stmt = db.prepare(
    "INSERT INTO supply_products (name,category,unit,spec,supplier,market_price,member_price,status,created_at) VALUES (?,?,?,?,?,?,?, 'active', ?)",
  );
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], now - i * 3600000));
}

function seedTrainings(db: DB) {
  if (!isEmpty(db, "trainings")) return;
  // [title, category, instructor, location, schedule, capacity, fee, detail]
  const rows: [string, string, string, string, string, number, string, string][] = [
    ["工装报备「一网通办」专题培训", "政策合规", "协会技术委员会", "协会四楼培训中心", "2026-06-08 09:00-12:00", 60, "免费", "讲解新版工装报备流程与省厅一网通办对接，含现场答疑。"],
    ["二级建造师考前冲刺班", "职业认证", "李教授（特邀）", "线上直播", "2026-06-15 起 · 每周六", 100, "会员价 ¥800", "建筑/机电实务重点串讲 + 历年真题精讲，含模拟测试。"],
    ["BIM 建模与施工应用实操", "技能提升", "王工 · BIM 专家", "协会实训室", "2026-06-20 全天", 30, "会员价 ¥1200", "Revit 基础到施工出图全流程实操，自带笔记本。"],
    ["绿色建造与新材料应用交流会", "行业交流", "多位行业专家", "信阳建博会展区", "2026-06-22 14:00-17:00", 200, "免费", "低碳混凝土、再生骨料等新材料案例分享与交流。"],
  ];
  const stmt = db.prepare(
    "INSERT INTO trainings (title,category,instructor,location,schedule,capacity,fee,detail,status,created_at) VALUES (?,?,?,?,?,?,?,?, 'open', ?)",
  );
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], now - i * 86400000));
}

function seedNews(db: DB) {
  if (!isEmpty(db, "news")) return;
  // [category, title, excerpt, author, color, hot, date]
  const rows: [string, string, string, string, string, number, string][] = [
    ["协会公告", "关于发布《信阳市住宅装饰装修工程质量验收规范（2026版）》的通知", "新版规范在防水、电气、消防三方面强化标准，6 月 1 日起正式实施。会员单位应在 5 日内组织学习并完成现场对照。", "协会秘书处", "build", 1, "2026-05-28"],
    ["政策解读", "全省工装报备实现「一网通办」，信阳成为首批试点", "协会平台与省厅系统打通，企业一次填报即可同步省级监管，预计节约 70% 重复填报工时。", "技术委员会", "decor", 1, "2026-05-22"],
    ["行业新闻", "2026 信阳建博会启动报名 — AI 与绿色建造成主题", "会展同期开放协会专属展区，会员企业享受 5 折展位，新增 AI 装修体验馆。", "协会秘书处", "design", 0, "2026-05-15"],
    ["活动通知", "5 月 30 日 · 协会高级会员季度交流会", "本期主题：AI 在装修营销中的落地。地点：协会四楼大会议室。", "协会秘书处", "brand", 0, "2026-05-12"],
    ["会员动态", "华泰建工承建的茶博园景观二期工程顺利封顶", "茶博园景观二期采用低碳混凝土与本地茶叶残渣再生骨料，绿色建造一体化样板。", "会员服务部", "tea", 0, "2026-05-09"],
    ["政策解读", "财政部、住建部联合发文，家装质保险纳入消费券支持范围", "信阳率先试点 — 业主购买协会版安心家装险可叠加 100 元消费券。", "金融保险委员会", "decor", 0, "2026-05-04"],
    ["协会公告", "2026 第二批会员入会公示（共 23 家）", "公示期 7 天，对名单有异议者可通过协会秘书处或 AI 小协反馈。", "协会秘书处", "build", 0, "2026-04-28"],
  ];
  const stmt = db.prepare(
    "INSERT INTO news (category,title,excerpt,content,author,color,hot,views,status,created_at) VALUES (?,?,?,?,?,?,?,?, 'published', ?)",
  );
  for (const r of rows) {
    const content = `${r[2]}\n\n本通知由${r[3]}发布。各会员单位请及时关注协会平台公告，如有疑问可联系协会秘书处或咨询 AI 小协。\n\n（示例正文，可在后台编辑为完整内容。）`;
    const t = Date.parse(r[6]) || Date.now();
    stmt.run(r[0], r[1], r[2], content, r[3], r[4], r[5], Math.floor(400 + Math.abs(Date.parse(r[6])) % 2600), t);
  }
}

function seedAccounts(db: DB) {
  if (!isEmpty(db, "accounts")) return;
  // 给已建档的从业者补 active 个人会员账号（手机号即登录名）
  const rows = db.prepare("SELECT id,name,phone FROM practitioners WHERE phone IS NOT NULL AND phone != ''").all() as { id: number; name: string; phone: string }[];
  const stmt = db.prepare("INSERT INTO accounts (phone,role,status,name,member_ref,created_at) VALUES (?, 'individual','active',?,?,?)");
  const now = Date.now();
  for (const r of rows) {
    try { stmt.run(r.phone, r.name, `p-${r.id}`, now); } catch { /* 手机号重复忽略 */ }
  }
}

// 对已存在的库做幂等列迁移（新增列时用）
function migrate(db: DB) {
  const alters = [
    "ALTER TABLE insurance_orders ADD COLUMN uid TEXT",
    "ALTER TABLE mediations ADD COLUMN uid TEXT",
    "ALTER TABLE reviews ADD COLUMN uid TEXT",
    "ALTER TABLE project_reports ADD COLUMN uid TEXT",
    // 商城 B2B 会员互助改造：卖家 / 品牌排他 / 上架理由 / 审核
    "ALTER TABLE supply_products ADD COLUMN brand TEXT",
    "ALTER TABLE supply_products ADD COLUMN seller_type TEXT DEFAULT 'association'",
    "ALTER TABLE supply_products ADD COLUMN seller_id TEXT",
    "ALTER TABLE supply_products ADD COLUMN seller_name TEXT",
    "ALTER TABLE supply_products ADD COLUMN reason_type TEXT",
    "ALTER TABLE supply_products ADD COLUMN reason_note TEXT",
    "ALTER TABLE supply_products ADD COLUMN proof_url TEXT",
    "ALTER TABLE supply_products ADD COLUMN moq INTEGER DEFAULT 1",
    "ALTER TABLE supply_products ADD COLUMN reject_reason TEXT",
    "ALTER TABLE supply_products ADD COLUMN price_tiers TEXT", // 阶梯量价 JSON
    "ALTER TABLE supply_products ADD COLUMN image_url TEXT",   // 商品效果图
    // 会员等级（卖家可上架数量配额按等级区分）
    "ALTER TABLE accounts ADD COLUMN tier TEXT DEFAULT '普通会员'",
    // 采购单买家/卖家路由（B2B：买卖双方都是会员，订单路由到卖家履约）
    "ALTER TABLE supply_orders ADD COLUMN buyer_type TEXT",
    "ALTER TABLE supply_orders ADD COLUMN buyer_id TEXT",
    "ALTER TABLE supply_orders ADD COLUMN buyer_name TEXT",
    "ALTER TABLE supply_orders ADD COLUMN seller_type TEXT",
    "ALTER TABLE supply_orders ADD COLUMN seller_id TEXT",
    "ALTER TABLE supply_orders ADD COLUMN seller_name TEXT",
    // 企业案例描述（子站案例详情页）
    "ALTER TABLE enterprise_cases ADD COLUMN detail TEXT",
    "ALTER TABLE enterprise_cases ADD COLUMN images TEXT",  // 案例图集(1-10)
    // 团队成员照片 + 详细介绍
    "ALTER TABLE enterprise_team ADD COLUMN photo TEXT",
    "ALTER TABLE enterprise_team ADD COLUMN bio TEXT",
    // 企业子站主题色（企业自选）
    "ALTER TABLE enterprises ADD COLUMN theme TEXT",
  ];
  for (const sql of alters) {
    try { db.exec(sql); } catch { /* 列已存在，忽略 */ }
  }
}

// 把历史/种子的协会自营商品补齐卖家与品牌字段（幂等）
function normalizeSupplyProducts(db: DB) {
  db.exec(`
    UPDATE supply_products SET seller_type='association' WHERE seller_type IS NULL OR seller_type='';
    UPDATE supply_products SET seller_id='assoc'        WHERE seller_id IS NULL OR seller_id='';
    UPDATE supply_products SET seller_name='协会集采'    WHERE seller_name IS NULL OR seller_name='';
    UPDATE supply_products SET reason_type='direct'      WHERE reason_type IS NULL OR reason_type='';
    UPDATE supply_products SET moq=1                     WHERE moq IS NULL;
    UPDATE supply_products SET brand=supplier            WHERE (brand IS NULL OR brand='') AND supplier IS NOT NULL AND supplier!='';
  `);
  // 旧采购单：买家=企业、卖家=协会集采
  db.exec(`
    UPDATE supply_orders SET buyer_type='enterprise'  WHERE buyer_type IS NULL OR buyer_type='';
    UPDATE supply_orders SET buyer_id=enterprise_id    WHERE (buyer_id IS NULL OR buyer_id='') AND enterprise_id IS NOT NULL;
    UPDATE supply_orders SET buyer_name=enterprise_name WHERE (buyer_name IS NULL OR buyer_name='') AND enterprise_name IS NOT NULL;
    UPDATE supply_orders SET seller_type='association' WHERE seller_type IS NULL OR seller_type='';
    UPDATE supply_orders SET seller_id='assoc'         WHERE seller_id IS NULL OR seller_id='';
    UPDATE supply_orders SET seller_name='协会集采'     WHERE seller_name IS NULL OR seller_name='';
  `);
}

// 演示：灌入几条会员自助上架的商品（含待审/在架），用于跑通审核与卖家闭环（幂等）
function seedSupplyMemberListings(db: DB) {
  const has = (db.prepare("SELECT COUNT(*) AS c FROM supply_products WHERE seller_type IN ('enterprise','practitioner')").get() as { c: number }).c;
  if (has > 0) return;
  // [name, category, unit, spec, supplier(=brand来源), brand, seller_type, seller_id, seller_name, reason_type, reason_note, proof_url, moq, market, member, status]
  const rows: [string, string, string, string, string, string, string, string, string, string, string, string, number, number, number, string][] = [
    ["美巢墙锢界面剂", "辅材", "组(18kg)", "渗透型 抗碱", "美巢", "美巢", "enterprise", "e002", "名家装饰", "agent", "美巢集团信阳区域独家代理，凭授权书。", "/samples/cert.svg", 5, 96, 72, "pending"],
    ["海螺 PO42.5 散装水泥", "辅材", "吨", "PO42.5R 散装", "海螺", "海螺", "enterprise", "e001", "信阳华泰建工", "agent", "海螺水泥信阳总代，量大直发。", "/samples/cert.svg", 10, 420, 360, "active"],
    ["原创软装布艺套餐", "后期", "套", "客厅整套 可定制", "栖物原创", "栖物原创", "practitioner", "p-5", "孙女士(设计师)", "self", "本人原创设计、工厂直缝，自产自销。", "/samples/work-1.svg", 1, 3600, 2680, "pending"],
    // 价格擂台演示：挑战华泰在架的「海螺」(¥360)，报更低价 ¥348
    ["海螺 PO42.5 散装水泥", "辅材", "吨", "PO42.5R 散装", "海螺", "海螺", "enterprise", "e002", "名家装饰", "agent", "海螺水泥另一区域代理，量大价更优，发起价格擂台。", "/samples/cert.svg", 10, 420, 348, "pending"],
  ];
  const stmt = db.prepare(
    `INSERT INTO supply_products
      (name,category,unit,spec,supplier,brand,seller_type,seller_id,seller_name,reason_type,reason_note,proof_url,moq,market_price,member_price,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  );
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[14], r[15], now - i * 3600000));
  // 演示等级：给一个从业者账号升为高级会员（配额 20）
  try { db.exec("UPDATE accounts SET tier='高级会员' WHERE member_ref='p-5'"); } catch { /* ignore */ }
}

export function getDb(): DB {
  if (!g.__xyjzxhDb) g.__xyjzxhDb = init();
  return g.__xyjzxhDb;
}
