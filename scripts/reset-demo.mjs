// 上线前清空演示数据。
// 用法：
//   node --experimental-sqlite scripts/reset-demo.mjs            # 预演(dry-run)：只统计不删除
//   node --experimental-sqlite scripts/reset-demo.mjs --confirm  # 清空「事务/UGC 数据」(保留企业/产品/知识等目录)
//   node --experimental-sqlite scripts/reset-demo.mjs --hard --confirm  # 额外清空目录数据(企业/从业者/案例/招聘/新闻/培训/商城商品等)
import { DatabaseSync } from "node:sqlite";

const args = process.argv.slice(2);
const confirm = args.includes("--confirm");
const hard = args.includes("--hard");
const db = new DatabaseSync("data/app.db");

// 事务 / UGC 数据：日常使用与批量演示产生的记录
const TRANSACTIONAL = [
  "leads", "reviews", "supply_orders", "supply_cart",
  "finance_applications", "insurance_orders", "insurance_claims",
  "mediations", "project_reports", "applications", "accounts",
  "ai_questions", "job_applications", "training_enrollments", "orders",
];
// 目录数据：企业/从业者档案与可在后台维护的内容（仅 --hard 清空）
const CATALOG = [
  "enterprise_cases", "enterprise_team", "enterprises", "practitioners",
  "jobs", "news", "trainings", "supply_products",
  "finance_products", "insurance_products",
];

const targets = hard ? [...TRANSACTIONAL, ...CATALOG] : TRANSACTIONAL;

function count(t) { try { return db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c; } catch { return "(无此表)"; } }

console.log(`模式：${hard ? "HARD（事务 + 目录）" : "事务/UGC 数据"} · ${confirm ? "执行删除" : "预演 DRY-RUN（不删除）"}`);
console.log("将处理以下表的当前行数：");
let total = 0;
for (const t of targets) {
  const c = count(t);
  if (typeof c === "number") total += c;
  console.log(`  ${t}: ${c}`);
}
console.log(`合计约 ${total} 行`);

if (!confirm) {
  console.log("\n⚠ 这是预演,未删除任何数据。确认无误后加 --confirm 执行;连目录数据一起清加 --hard --confirm。");
  console.log("⚠ 强烈建议执行前先备份 data/app.db。");
} else {
  let deleted = 0;
  for (const t of targets) {
    try { const r = db.prepare(`DELETE FROM ${t}`).run(); deleted += r.changes; } catch { /* 表不存在,忽略 */ }
  }
  console.log(`\n✓ 已清空 ${targets.length} 个表,删除约 ${deleted} 行。`);
  console.log("提示：下次访问平台时,空表(如企业/产品)会按种子重新生成基础数据;若要完全空白,清空后立即导入真实数据。");
}
