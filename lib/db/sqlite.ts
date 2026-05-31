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
  const rows: [string, string, number, number, number, string, number][] = [
    ["张师傅", "工长", 18, 4.8, 142, "浉河区", 1],
    ["李师傅", "木工", 22, 4.9, 218, "平桥区", 1],
    ["王师傅", "水电工", 12, 4.7, 86, "羊山新区", 1],
    ["赵师傅", "瓦工", 16, 4.6, 102, "光山县", 1],
    ["孙女士", "设计师", 8, 4.9, 62, "浉河区", 0],
    ["周师傅", "油漆工", 10, 4.5, 88, "息县", 1],
    ["钱师傅", "项目经理", 14, 4.8, 56, "罗山县", 1],
    ["陈监理", "监理", 20, 4.9, 184, "浉河区", 1],
  ];
  const stmt = db.prepare("INSERT INTO practitioners (name,kind,years,rating,jobs,city,insured,phone,created_at) VALUES (?,?,?,?,?,?,?,?,?)");
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], "", now - i * DAY));
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
  return db;
}

// 对已存在的库做幂等列迁移（新增列时用）
function migrate(db: DB) {
  const alters = [
    "ALTER TABLE insurance_orders ADD COLUMN uid TEXT",
    "ALTER TABLE mediations ADD COLUMN uid TEXT",
    "ALTER TABLE reviews ADD COLUMN uid TEXT",
    "ALTER TABLE project_reports ADD COLUMN uid TEXT",
  ];
  for (const sql of alters) {
    try { db.exec(sql); } catch { /* 列已存在，忽略 */ }
  }
}

export function getDb(): DB {
  if (!g.__xyjzxhDb) g.__xyjzxhDb = init();
  return g.__xyjzxhDb;
}
