// 把 enterprise_team.photo 与 supply_products.image_url 的 loremflickr 外链改指向本地样例图。
// 用法： node scripts/fix-team-product-images.mjs
import { DatabaseSync } from "node:sqlite";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const db = new DatabaseSync(join(ROOT, "data", "app.db"));
db.exec("PRAGMA journal_mode=WAL;");

function localList(dir, prefix) {
  return readdirSync(join(ROOT, "public", "samples", dir))
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => `/samples/${dir}/${f}`);
}

const team = localList("team");
const products = localList("products");
if (!team.length || !products.length) { console.error("本地样例图为空,中止"); process.exit(1); }

// 团队照(仅替换 loremflickr 外链,保留已有真实/本地图)
const trows = db.prepare("SELECT id, photo FROM enterprise_team ORDER BY id").all();
const tupd = db.prepare("UPDATE enterprise_team SET photo=? WHERE id=?");
let ti = 0, tn = 0;
for (const r of trows) {
  if (r.photo && /loremflickr|^https?:/.test(r.photo)) { tupd.run(team[ti % team.length], r.id); ti++; tn++; }
}
console.log(`团队照已修 ${tn} 条`);

// 商品图
const prows = db.prepare("SELECT id, image_url FROM supply_products ORDER BY id").all();
const pupd = db.prepare("UPDATE supply_products SET image_url=? WHERE id=?");
let pi = 0, pn = 0;
for (const r of prows) {
  if (r.image_url && /loremflickr|^https?:/.test(r.image_url)) { pupd.run(products[pi % products.length], r.id); pi++; pn++; }
}
console.log(`商品图已修 ${pn} 条`);

// 自检
const badT = db.prepare("SELECT COUNT(*) c FROM enterprise_team WHERE photo LIKE ?").get("%loremflickr%").c;
const badP = db.prepare("SELECT COUNT(*) c FROM supply_products WHERE image_url LIKE ?").get("%loremflickr%").c;
console.log(`剩余外链 团队:${badT} 商品:${badP}`);
db.close();
