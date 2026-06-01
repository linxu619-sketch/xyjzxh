import { DatabaseSync } from "node:sqlite";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const db = new DatabaseSync(join(root,"data","app.db"));
async function grab(t,l,w=800,h=600){const r=await fetch(`https://loremflickr.com/${w}/${h}/${t}?lock=${l}`,{redirect:"follow"});if(!r.ok)throw new Error(r.status);return Buffer.from(await r.arrayBuffer());}
let lock=2000;
const PLAN = {
  huatai: {
    cases: [
      ["茶博园景观二期 · 绿色建造","880","工程","茶博园景观二期工程，采用低碳混凝土与本地再生骨料，绿色建造一体化样板，按期高质量封顶交付。","construction-site"],
      ["申城大道商办综合体","12000","工装","商办综合体总承包，含结构、机电、幕墙与精装一体化交付，BIM 全程管控，安全文明施工标杆工地。","building"],
      ["浉河区市政管廊 EPC","2600","市政","市政综合管廊 EPC 项目，设计施工一体化，工期与造价双控，验收一次通过。","architecture"],
    ],
    team: [["陈总工","技术总工","20 年大型工程技术管理经验，一级建造师，主导多项市政与商办总承包项目的技术把控与 BIM 落地。"],["刘项目经理","项目经理","15 年现场管理经验，擅长进度、成本、安全三控，带队完成茶博园等标杆项目。"],["王工","安全总监","12 年安全文明施工管理，建立标准化工地体系，确保零事故交付。"]],
    ckw: "construction-site", tkw: "businessman",
  },
  yashe: {
    cases: [
      ["御景湾别墅 · 新中式","320","软装","别墅新中式软装整体方案，空间动线与东方美学结合，进口主材，呈现雅致从容的高端居住氛围。","interior-design"],
      ["城市展厅样板间 · 现代极简","160","设计","现代极简样板间设计，灰白木质感搭配隐藏式收纳，光影层次丰富，落地还原度高。","modern-interior"],
      ["茶山民宿改造 · 原木风","240","设计","老宅改民宿，原木与素色为主，保留在地肌理，营造温润松弛的度假体验。","scandinavian-interior"],
    ],
    team: [["孙主案","主案设计师","注册室内设计师，10 年高端住宅与商业空间设计，多次获省级设计奖，擅长新中式与现代极简。"],["周设计师","软装设计师","8 年软装陈列经验，对接进口品牌资源，擅长别墅、样板间整体软装统筹。"],["李工","施工图深化","9 年施工图深化与节点把控经验，确保设计高还原落地。"]],
    ckw: "interior-design", tkw: "portrait",
  },
};
for (const [eid, cfg] of Object.entries(PLAN)) {
  const has = db.prepare("SELECT COUNT(*) c FROM enterprise_cases WHERE enterprise_id=?").get(eid).c;
  if (has > 0) { console.log(`${eid} 已有案例，跳过`); continue; }
  let ci = 0;
  for (const [title, area, tag, detail] of cfg.cases) {
    ci++;
    const imgs = [];
    for (let g = 0; g < 5; g++) {
      const buf = await grab(cfg.ckw, ++lock);
      const fn = `case-${eid}-${ci}-${g}.jpg`;
      writeFileSync(join(root,"public","samples","cases",fn), buf);
      imgs.push(`/samples/cases/${fn}`);
    }
    db.prepare("INSERT INTO enterprise_cases (enterprise_id,title,cover,area,tag,detail,images,created_at) VALUES (?,?,?,?,?,?,?,?)")
      .run(eid, title, imgs[0], area, tag, detail, JSON.stringify(imgs), Date.now() - ci*86400000);
  }
  let ti = 0;
  for (const [name, role, bio] of cfg.team) {
    ti++;
    const buf = await grab(cfg.tkw, ++lock, 400, 400);
    const fn = `team-${eid}-${ti}.jpg`;
    writeFileSync(join(root,"public","samples","team",fn), buf);
    db.prepare("INSERT INTO enterprise_team (enterprise_id,name,role,exp,photo,bio,created_at) VALUES (?,?,?,?,?,?,?)")
      .run(eid, name, role, bio.split("，")[0], `/samples/team/${fn}`, bio, Date.now() - ti*3600000);
  }
  console.log(`${eid} -> 案例${cfg.cases.length}(各5图) 团队${cfg.team.length}`);
}
db.close();
