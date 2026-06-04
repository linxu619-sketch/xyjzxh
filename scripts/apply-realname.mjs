// 一次性：为 applications 增加实名核验列 + 回填演示实名字段（幂等）
// 用法：node scripts/apply-realname.mjs
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/app.db");

// 1) 实名核验列（列已存在则忽略）
for (const sql of [
  "ALTER TABLE applications ADD COLUMN idverify_status TEXT DEFAULT 'unverified'",
  "ALTER TABLE applications ADD COLUMN idverify_by TEXT",
  "ALTER TABLE applications ADD COLUMN idverify_at INTEGER",
]) { try { db.exec(sql); } catch { /* 已存在 */ } }

// 2) 回填演示实名字段（仅补缺失的，不覆盖真实注册数据）
function fakeId(seed) {
  // 41152119(年)(月日)(序)(校验占位) —— 仅演示用，非真实身份证
  const y = 1975 + (seed % 25);
  const md = String(101 + (seed % 280)).padStart(4, "0");
  const sn = String(1000 + (seed % 9000));
  return `41152${String(seed % 10)}${y}${md}${sn}`.slice(0, 18).padEnd(18, "0");
}

const rows = db.prepare("SELECT id, type, applicant, payload FROM applications").all();
const upd = db.prepare("UPDATE applications SET payload = ? WHERE id = ?");
let n = 0;
for (const r of rows) {
  let p = {};
  try { p = r.payload ? JSON.parse(r.payload) : {}; } catch { p = {}; }
  let changed = false;
  if (r.type === "enterprise") {
    if (!p.legalName) { p.legalName = p.contactName || r.applicant || "法定代表人"; changed = true; }
    if (!p.legalIdcard) { p.legalIdcard = fakeId(r.id * 7 + 3); changed = true; }
    if (!p.creditCode) { p.creditCode = `91411500MA${String(r.id).padStart(4, "0")}XXXX`; changed = true; }
  } else if (r.type === "individual") {
    if (!p.realName) { p.realName = r.applicant || "申请人"; changed = true; }
    if (!p.idcard) { p.idcard = fakeId(r.id * 11 + 5); changed = true; }
  }
  if (changed) { upd.run(JSON.stringify(p), r.id); n++; }
}
console.log(`实名列已就绪；回填演示实名字段的申请：${n} / ${rows.length}`);
db.close();
