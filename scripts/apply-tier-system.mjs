// 一次性：把单一会员等级迁移为「两套互不相干梯队」并回填企业会员账号（幂等）
// 用法：node scripts/apply-tier-system.mjs
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/app.db");
const DAY = 86400000;
const now = Date.now();

// 1) 历史单一梯队 → 两套独立梯队（按 role 分流）
db.exec(`
  UPDATE accounts SET tier='会员单位' WHERE role='enterprise'  AND tier='普通会员';
  UPDATE accounts SET tier='理事单位' WHERE role='enterprise'  AND tier='高级会员';
  UPDATE accounts SET tier='注册会员' WHERE role='individual'  AND tier='普通会员';
  UPDATE accounts SET tier='资深会员' WHERE role='individual'  AND tier IN ('高级会员','理事单位');
`);

// 2) 演示：从业者 p-5 升资深会员
try { db.exec("UPDATE accounts SET tier='资深会员' WHERE member_ref='p-5'"); } catch {}

// 3) 回填：给已建档企业补「活跃企业会员账号」+ 分布治理梯队等级
const ENT_TIER_SEED = ["会长单位", "副会长单位", "常务理事单位", "理事单位", "理事单位"];
const ents = db.prepare("SELECT id,name FROM enterprises ORDER BY id").all();
const has = db.prepare("SELECT 1 FROM accounts WHERE member_ref=? LIMIT 1");
const ins = db.prepare(
  "INSERT INTO accounts (phone,role,status,name,member_ref,tier,created_at) VALUES (?, 'enterprise','active',?,?,?,?)",
);
let added = 0;
ents.forEach((e, i) => {
  if (has.get(e.id)) return;
  const tier = ENT_TIER_SEED[i] ?? "会员单位";
  const phone = `1370001${String(i + 1).padStart(4, "0")}`;
  try { ins.run(phone, e.name, e.id, tier, now - i * DAY); added++; } catch {}
});

const dist = db.prepare("SELECT role, tier, COUNT(*) c FROM accounts WHERE role IN ('enterprise','individual') GROUP BY role,tier ORDER BY role,tier").all();
console.log(`回填企业账号：+${added}`);
console.log("当前等级分布：");
for (const r of dist) console.log(`  ${r.role.padEnd(11)} ${String(r.tier).padEnd(8)} × ${r.c}`);
db.close();
