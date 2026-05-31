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

function init(): DB {
  const dir = join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(join(dir, "app.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  seedEnterprises(db);
  seedAiKnowledge(db);
  return db;
}

export function getDb(): DB {
  if (!g.__xyjzxhDb) g.__xyjzxhDb = init();
  return g.__xyjzxhDb;
}
