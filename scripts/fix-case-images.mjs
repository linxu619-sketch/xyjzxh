// 把 enterprise_cases 里指向 loremflickr 外链/失效的封面与图集，改指向本地真实样例图。
// 本地有 3 组样例(e002/huatai/yashe),组合成 10 套完整图集,按案例顺序循环分配。
// 用法： node scripts/fix-case-images.mjs
import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const P = "/samples/cases/";

// 构造 10 套图集(封面 + 画廊)
const SETS = [];
for (const n of [1, 2, 3, 4]) {
  SETS.push({ cover: `${P}case-e002-${n}.jpg`, images: [`${P}case-e002-${n}.jpg`, ...[1, 2, 3, 4].map((g) => `${P}case-e002-${n}-g${g}.jpg`)] });
}
for (const fam of ["huatai", "yashe"]) {
  for (const n of [1, 2, 3]) {
    SETS.push({ cover: `${P}case-${fam}-${n}-0.jpg`, images: [0, 1, 2, 3, 4].map((m) => `${P}case-${fam}-${n}-${m}.jpg`) });
  }
}

// 校验所有引用的本地文件确实存在
const missing = [];
for (const s of SETS) for (const img of s.images) if (!existsSync(join(ROOT, "public", img))) missing.push(img);
if (missing.length) { console.error("缺失本地文件,中止：", missing.slice(0, 5)); process.exit(1); }
console.log(`已构造 ${SETS.length} 套本地图集,文件全部存在。`);

const db = new DatabaseSync(join(ROOT, "data", "app.db"));
db.exec("PRAGMA journal_mode=WAL;");
const rows = db.prepare("SELECT id FROM enterprise_cases ORDER BY enterprise_id, id").all();
const upd = db.prepare("UPDATE enterprise_cases SET cover=?, images=? WHERE id=?");
let i = 0;
for (const r of rows) {
  const s = SETS[i % SETS.length];
  upd.run(s.cover, JSON.stringify(s.images), r.id);
  i++;
}
console.log(`已为 ${i} 条案例重置为本地图集。`);

// 自检：还有几条断图
const after = db.prepare("SELECT cover FROM enterprise_cases").all();
let bad = 0;
for (const r of after) if (!r.cover || !existsSync(join(ROOT, "public", r.cover))) bad++;
console.log(`重置后断图: ${bad} 条`);
db.close();
