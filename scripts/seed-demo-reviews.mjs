import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("data/app.db");
function brand(id){ const r=db.prepare("SELECT hero,name FROM enterprises WHERE slug=? OR id=?").get(id,id); try{return JSON.parse(r.hero).brand||r.name;}catch{return r.name;} }
const pool = {
  mingjia: [
    ["周先生","金茂悦府 1602 整装",5,"从设计到落地还原度很高，项目经理每周主动汇报进度，水电改造规范，验收很顺。"],
    ["孙女士","御景湾别墅软装",5,"软装搭配很有品味，预算控制到位，入住后邻居都来问哪家做的。"],
    ["王先生","南湖一号三居",4,"整体满意，材料环保，工人素质高，唯一小问题沟通群偶尔回得慢。"],
    ["陈女士","茶都商务办公",5,"工装赶工期还能保证质量，消防弱电一次过验收，很专业。"],
    ["李先生","老房翻新",5,"老破小翻新出了新房的感觉，性价比超预期，强烈推荐。"],
  ],
  huatai: [
    ["市政张工","茶博园景观二期",5,"央企级施工管理，安全文明工地，按期封顶，配合度高。"],
    ["赵总","申城大道商办",5,"总承包能力强，BIM 管控到位，机电幕墙交付质量过硬。"],
    ["刘经理","管廊EPC项目",4,"设计施工一体省心，造价透明，验收一次通过。"],
    ["业主代表","厂区扩建",5,"进度快、变更签证规范，资料齐全，值得长期合作。"],
  ],
  yashe: [
    ["林女士","别墅新中式",5,"主案设计师审美在线，方案两版定稿，软装陈列很高级。"],
    ["吴先生","样板间设计",5,"现代极简做得很克制，收纳与美感兼顾，落地还原度高。"],
    ["民宿主理人","茶山民宿",4,"原木风很出片，保留了在地味道，客人评价都不错。"],
    ["周女士","公寓改造",5,"小户型空间优化神了，动线舒服，灯光层次很棒。"],
  ],
};
const cat = { mingjia:"decor", huatai:"build", yashe:"design" };
const stmt = db.prepare("INSERT INTO reviews (user,enterprise,project,rating,content,category,created_at) VALUES (?,?,?,?,?,?,?)");
let now = Date.now();
for (const [id, rows] of Object.entries(pool)) {
  const b = brand(id);
  // 去重：若该品牌评价已 >=4 则跳过
  const c = db.prepare("SELECT COUNT(*) c FROM reviews WHERE enterprise=?").get(b).c;
  if (c >= 4) { console.log(id, b, "已有", c, "跳过"); continue; }
  rows.forEach((r,i)=> stmt.run(r[0], b, r[1], r[2], r[3], cat[id], now - i*86400000));
  console.log(id, "->", b, "补", rows.length, "条");
}
db.close();
