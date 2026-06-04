// 一次性：给已办结但无办理人的种子记录回填演示办理人 + 时间（单据落款用）
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("data/app.db");
const now = Date.now(), DAY = 86400000;
const ppl = ["王秘书", "李审核", "张干事", "协会秘书处"];

function bf(table, by, at, cond) {
  const rows = db.prepare(`SELECT id FROM ${table} WHERE ${cond}`).all();
  const up = db.prepare(`UPDATE ${table} SET ${by}=?, ${at}=? WHERE id=?`);
  rows.forEach((r, i) => up.run(ppl[i % ppl.length], now - (i + 1) * DAY, r.id));
  return rows.length;
}

console.log("applications 审批:", bf("applications", "reviewed_by", "reviewed_at", "status IN ('approved','rejected') AND (reviewed_by IS NULL OR reviewed_by='')"));
// 已通过实名核验但无核验人的补上
{
  const rows = db.prepare("SELECT id FROM applications WHERE idverify_status='verified' AND (idverify_by IS NULL OR idverify_by='')").all();
  const up = db.prepare("UPDATE applications SET idverify_by=?, idverify_at=? WHERE id=?");
  rows.forEach((r, i) => up.run("李审核", now - (i + 2) * DAY, r.id));
  console.log("idverify 补:", rows.length);
}
console.log("project_reports 审批:", bf("project_reports", "reviewed_by", "reviewed_at", "status IN ('approved','rejected')"));
console.log("insurance_claims 经办:", bf("insurance_claims", "handled_by", "handled_at", "status IN ('reviewing','settled','rejected')"));
console.log("finance_applications 审批:", bf("finance_applications", "reviewed_by", "reviewed_at", "status IN ('approved','rejected','disbursed')"));
console.log("mediations 经办:", bf("mediations", "handled_by", "handled_at", "status IN ('accepted','closed','rejected')"));
db.close();
