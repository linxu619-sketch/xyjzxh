// 一次性迁移：把 supply_products 升级为 B2B 会员互助商城结构（与 lib/db/sqlite.ts 的 migrate 一致）
// 用法：node scripts/migrate-supplies.mjs
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

const db = new DatabaseSync(join(process.cwd(), "data", "app.db"));
db.exec("PRAGMA journal_mode = WAL;");

const alters = [
  "ALTER TABLE supply_products ADD COLUMN brand TEXT",
  "ALTER TABLE supply_products ADD COLUMN seller_type TEXT DEFAULT 'association'",
  "ALTER TABLE supply_products ADD COLUMN seller_id TEXT",
  "ALTER TABLE supply_products ADD COLUMN seller_name TEXT",
  "ALTER TABLE supply_products ADD COLUMN reason_type TEXT",
  "ALTER TABLE supply_products ADD COLUMN reason_note TEXT",
  "ALTER TABLE supply_products ADD COLUMN proof_url TEXT",
  "ALTER TABLE supply_products ADD COLUMN moq INTEGER DEFAULT 1",
  "ALTER TABLE supply_products ADD COLUMN reject_reason TEXT",
  "ALTER TABLE accounts ADD COLUMN tier TEXT DEFAULT '普通会员'",
];
let added = 0;
for (const sql of alters) {
  try { db.exec(sql); added++; } catch { /* 已存在 */ }
}

db.exec(`
  UPDATE supply_products SET seller_type='association' WHERE seller_type IS NULL OR seller_type='';
  UPDATE supply_products SET seller_id='assoc'        WHERE seller_id IS NULL OR seller_id='';
  UPDATE supply_products SET seller_name='协会集采'    WHERE seller_name IS NULL OR seller_name='';
  UPDATE supply_products SET reason_type='direct'      WHERE reason_type IS NULL OR reason_type='';
  UPDATE supply_products SET moq=1                     WHERE moq IS NULL;
  UPDATE supply_products SET brand=supplier            WHERE (brand IS NULL OR brand='') AND supplier IS NOT NULL AND supplier!='';
`);

const has = db.prepare("SELECT COUNT(*) AS c FROM supply_products WHERE seller_type IN ('enterprise','practitioner')").get().c;
if (has === 0) {
  const rows = [
    ["美巢墙锢界面剂", "辅材", "组(18kg)", "渗透型 抗碱", "美巢", "美巢", "enterprise", "e002", "名家装饰", "agent", "美巢集团信阳区域独家代理，凭授权书。", "/samples/cert.svg", 5, 96, 72, "pending"],
    ["海螺 PO42.5 散装水泥", "辅材", "吨", "PO42.5R 散装", "海螺", "海螺", "enterprise", "e001", "信阳华泰建工", "agent", "海螺水泥信阳总代，量大直发。", "/samples/cert.svg", 10, 420, 360, "active"],
    ["原创软装布艺套餐", "后期", "套", "客厅整套 可定制", "栖物原创", "栖物原创", "practitioner", "p-5", "孙女士(设计师)", "self", "本人原创设计、工厂直缝，自产自销。", "/samples/work-1.svg", 1, 3600, 2680, "pending"],
  ];
  const stmt = db.prepare(
    `INSERT INTO supply_products
      (name,category,unit,spec,supplier,brand,seller_type,seller_id,seller_name,reason_type,reason_note,proof_url,moq,market_price,member_price,status,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  );
  const now = Date.now();
  rows.forEach((r, i) => stmt.run(r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13], r[14], r[15], now - i * 3600000));
  try { db.exec("UPDATE accounts SET tier='高级会员' WHERE member_ref='p-5'"); } catch { /* ignore */ }
  console.log("seeded 3 member listings");
} else {
  console.log("member listings already present:", has);
}

const counts = db.prepare("SELECT status, COUNT(*) c FROM supply_products GROUP BY status").all();
console.log("alters applied:", added, "| status counts:", JSON.stringify(counts));
db.close();
