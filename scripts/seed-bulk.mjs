// 一次性批量灌入演示数据（中文、真实感）。运行：node --experimental-sqlite scripts/seed-bulk.mjs
import { DatabaseSync } from "node:sqlite";
const db = new DatabaseSync("data/app.db");
const now = Date.now();
const DAY = 86400000;
const R = (a) => a[Math.floor(Math.random() * a.length)];
const RI = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const ago = (d) => now - Math.floor(Math.random() * d * DAY);
const img = (w, h, kw, n) => `https://loremflickr.com/${w}/${h}/${kw}?lock=${n}`;

const DISTRICTS = ["浉河区", "平桥区", "羊山新区", "明港镇", "潢川县", "固始县", "光山县", "商城县", "新县", "罗山县", "淮滨县", "息县"];
const SURNAMES = "王李张刘陈杨赵黄周吴徐孙马朱胡郭何高林郑谢罗梁宋唐许韩冯邓曹彭曾".split("");
const STYLES = ["现代简约", "北欧", "新中式", "轻奢", "日式", "美式", "侘寂风", "原木风", "法式"];
const TYPES = ["整装", "半包", "全包", "局部翻新", "旧房改造", "工装", "公装"];
const COMMUNITIES = ["金茂悦府", "建业森林半岛", "上城风华", "羊山中央公园", "信阳碧桂园", "正商红河谷", "华信湖畔花园", "联兴上海城", "和美华庭", "锦绣山水", "鼎瑞府", "万达华府"];
const CASE_TAGS = ["三室两厅", "两室一厅", "大平层", "别墅", "复式", "loft", "办公空间", "餐饮门店"];
const KINDS = ["木工工长", "水电工", "泥瓦工", "油漆工", "全屋定制", "独立设计师", "项目监理", "防水工", "吊顶安装", "整装项目经理"];

function fakePhone() { return "1" + R("345789") + String(RI(100000000, 999999999)); }
function name2() { return R(SURNAMES) + R(["先生", "女士", "总", "工"]); }
function fullName() { return R(SURNAMES) + R("伟芳娜秀英敏静丽强磊军洋勇艳杰娟涛明超霞平刚桂英建华志强") + (Math.random() < .4 ? R("国红丽华") : ""); }

const log = {};
function ins(table, cols, rowsArr) {
  const ph = cols.map(() => "?").join(",");
  const st = db.prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${ph})`);
  let n = 0;
  for (const row of rowsArr) { st.run(...row); n++; }
  log[table] = (log[table] || 0) + n;
}

// 取现有企业 / 商品 / 金融产品
const ents = db.prepare("SELECT id,name,slug,category,district,hero FROM enterprises WHERE status='active'").all()
  .map(e => { let brand = e.name; try { brand = JSON.parse(e.hero || "{}").brand || e.name; } catch {} return { ...e, brand }; });
const finProds = db.prepare("SELECT id,name FROM finance_products WHERE status='active'").all();
const supProds = db.prepare("SELECT id,name,unit,member_price,seller_type,seller_id,seller_name FROM supply_products WHERE status='active'").all();

// ---- 1) 线索 leads（每个企业 3-8 条，多状态）----
{
  const statuses = ["new", "new", "contacting", "surveying", "signed", "lost"];
  const rows = [];
  for (const e of ents) {
    const k = RI(3, 8);
    for (let i = 0; i < k; i++) {
      const area = RI(70, 320);
      rows.push([e.id, name2(), fakePhone(), R(TYPES), R(STYLES), String(area), String(RI(8, 80)), `${R(DISTRICTS)}·${R(COMMUNITIES)}`, R(["新房想做整装", "婚房求设计", "老房翻新", "想了解报价", "对比几家", "朋友推荐来咨询", ""]), R(["子站表单", "在线咨询", "AI 估价", "电话", "朋友推荐"]), R(statuses), ago(90), null]);
    }
  }
  ins("leads", ["enterprise_id", "name", "phone", "type", "style", "area", "budget", "address", "note", "source", "status", "created_at", "uid"], rows);
}

// ---- 2) 评价 reviews（关联企业品牌名）----
{
  const goods = ["项目经理特别负责，水电改造时多次到工地，质量超预期。", "设计师懂年轻人审美，方案改两版就定稿，省心。", "施工干净规范，工地每天清扫，邻居都夸。", "报价透明没有增项，预算控制得很好。", "售后响应快，质保期内回来修了两次都没收费。", "全程协会监管，付款按节点，放心。", "材料都是品牌，进场让我核对验收。", "工期比合同还提前了五天交付。", "细节做得到位，收口、阴阳角都很直。", "整体满意，软装搭配很有品味。"];
  const mids = ["整体不错，材料到场比计划晚了几天，沟通后补偿到位。", "施工质量可以，前期沟通稍慢，后面改善了。", "性价比高，细节上还能再精致些。"];
  const rows = [];
  for (let i = 0; i < 70; i++) {
    const e = R(ents);
    const r = Math.random() < .82 ? 5 : (Math.random() < .7 ? 4 : 3);
    rows.push([null, name2(), e.brand, `${RI(80, 260)}㎡ ${R(TYPES)}`, r, r >= 5 ? R(goods) : R(mids), R(["build", "decor", "design"]), ago(120)]);
  }
  ins("reviews", ["uid", "user", "enterprise", "project", "rating", "content", "category", "created_at"], rows);
}

// ---- 3) 案例 / 团队：给案例<4 的企业补到 5；团队<3 补到 4 ----
{
  const caseRows = [], teamRows = [];
  let cimg = 5000, pimg = 7000;
  for (const e of ents) {
    const have = db.prepare("SELECT COUNT(*) c FROM enterprise_cases WHERE enterprise_id=?").get(e.id).c;
    for (let i = have; i < 5; i++) {
      const comm = R(COMMUNITIES), st = R(STYLES), area = RI(80, 260);
      caseRows.push([e.id, `${comm} · ${st}`, img(640, 480, "interior,home", cimg++), String(area), R(CASE_TAGS), ago(200), `本案位于${R(DISTRICTS)}${comm}，${area}㎡，${st}风格。注重收纳与采光，水电按规范施工，全程协会监管。`, JSON.stringify([img(800, 600, "livingroom", cimg++), img(800, 600, "kitchen", cimg++), img(800, 600, "bedroom", cimg++)])]);
    }
    const haveT = db.prepare("SELECT COUNT(*) c FROM enterprise_team WHERE enterprise_id=?").get(e.id).c;
    const roles = ["创始人 / 设计总监", "主任设计师", "项目经理", "工程总监", "软装设计师", "首席工长"];
    for (let i = haveT; i < 4; i++) {
      teamRows.push([e.id, fullName(), roles[i % roles.length], `${RI(5, 22)} 年`, ago(300), img(400, 500, "portrait,people", pimg++), `从业 ${RI(5, 22)} 年，主导 ${RI(60, 500)}+ 套实景案例，擅长${R(STYLES)}与${R(STYLES)}。`]);
    }
  }
  ins("enterprise_cases", ["enterprise_id", "title", "cover", "area", "tag", "created_at", "detail", "images"], caseRows);
  ins("enterprise_team", ["enterprise_id", "name", "role", "exp", "created_at", "photo", "bio"], teamRows);
}

// ---- 4) 新闻 news ----
{
  const items = [
    ["协会动态", "信阳市建筑装饰装修协会 2026 年第二季度会员大会顺利召开"],
    ["政策解读", "《河南省住宅装饰装修工程质量验收规范》要点解读"],
    ["行业资讯", "信阳家装市场上半年回暖，整装订单同比增长 23%"],
    ["协会动态", "协会与中原银行签署「建装贷」战略合作协议"],
    ["培训通知", "第十二期项目经理继续教育培训开始报名"],
    ["维权案例", "协会 14 天调解成功化解一起 38 万元装修纠纷"],
    ["行业资讯", "绿色低碳建材成趋势，协会推动会员企业升级"],
    ["协会动态", "20 家会员企业获评 2025 年度「信阳放心装企」"],
    ["政策解读", "工装报备「一网通办」全面上线，平均出函时间缩短至 3 天"],
    ["行业资讯", "AI 设计工具在本地装企的应用调研报告发布"],
    ["培训通知", "建筑工人安全生产暨工伤保险专题讲座通知"],
    ["协会动态", "协会建材集采平台累计为会员节省采购成本超 600 万元"],
  ];
  const rows = items.map(([cat, title], i) => [cat, title, `${title}。本文简要介绍相关背景、要点与协会下一步工作安排。`, `<p>${title}。</p><p>协会持续推动行业规范化、数字化发展，欢迎广大会员关注并参与。详情可咨询协会秘书处。</p>`, "协会秘书处", R(["brand", "build", "decor", "design", "tea"]), i < 3 ? 1 : 0, RI(120, 3800), "published", ago(100)]);
  ins("news", ["category", "title", "excerpt", "content", "author", "color", "hot", "views", "status", "created_at"], rows);
}

// ---- 5) 招聘 jobs（开放）----
{
  const rows = [];
  for (let i = 0; i < 16; i++) {
    const e = R(ents);
    const kind = R(KINDS);
    rows.push([e.id, e.name, `招${kind} ${RI(1, 5)}名`, kind, R(DISTRICTS), RI(220, 650), RI(1, 6), R(["3-6 个月", "长期", "单项目", "2-4 个月"]), `${e.name}诚招${kind}，要求有相关经验，按协会标准结算，工资协会监管账户托管。`, "open", ago(40)]);
  }
  ins("jobs", ["enterprise_id", "enterprise_name", "title", "kind", "district", "daily", "openings", "duration", "detail", "status", "created_at"], rows);
}

// ---- 6) 商城会员上架 supply_products ----
{
  const cats = ["主材", "辅材", "瓷砖", "地板", "卫浴", "门窗", "涂料", "板材", "五金", "灯具"];
  const brands = [["马可波罗瓷砖", "瓷砖"], ["大自然地板", "地板"], ["箭牌卫浴", "卫浴"], ["皇派门窗", "门窗"], ["三棵树涂料", "涂料"], ["兔宝宝板材", "板材"], ["雷士照明", "灯具"], ["欧普照明", "灯具"], ["东鹏瓷砖", "瓷砖"], ["科勒卫浴", "卫浴"], ["立邦漆", "涂料"], ["圣象地板", "地板"], ["顶固五金", "五金"], ["TATA木门", "门窗"], ["德高防水", "辅材"]];
  const reasons = ["agent", "self", "direct"];
  const sellers = ents.filter(e => e.category !== "design").slice(0, 10);
  const rows = []; let pi = 6000;
  for (let i = 0; i < 16; i++) {
    const [brand, cat] = R(brands);
    const seller = R(sellers);
    const mp = RI(40, 600), mem = Math.round(mp * (0.6 + Math.random() * 0.25));
    rows.push([`${brand} ${R(["特供款", "工程款", "标准款", "爆款"])}`, cat, R(["片", "块", "桶", "套", "件", "㎡", "支"]), R(["600x600", "800x800", "标准", "18L", "定制"]), brand, mp, mem, "active", ago(60), brand, seller.category === "design" ? "enterprise" : "enterprise", seller.id, seller.name, R(reasons), R(["信阳独家代理", "厂家直供，量大从优", "自有渠道，价格到底"]), "", RI(1, 20), "", JSON.stringify(Math.random() < .5 ? [{ minQty: RI(50, 100), price: Math.round(mem * 0.92) }] : []), img(500, 500, "building,material", pi++)]);
  }
  ins("supply_products", ["name", "category", "unit", "spec", "supplier", "market_price", "member_price", "status", "created_at", "brand", "seller_type", "seller_id", "seller_name", "reason_type", "reason_note", "proof_url", "moq", "reject_reason", "price_tiers", "image_url"], rows);
}

// ---- 7) 商城采购单 supply_orders ----
if (supProds.length) {
  const rows = [];
  const sts = ["pending", "confirmed", "shipped", "done", "done"];
  for (let i = 0; i < 14; i++) {
    const p = R(supProds), buyer = R(ents), qty = RI(5, 60), total = (p.member_price || 100) * qty;
    const paid = Math.random() < .5;
    const due = ago(-20) + 30 * DAY;
    rows.push([buyer.id, buyer.name, p.id, p.name, p.unit || "件", qty, p.member_price || 100, total, R(sts), ago(50), "enterprise", buyer.id, buyer.name, p.seller_type || "association", p.seller_id || "assoc", p.seller_name || "协会集采", paid ? "paid" : "unpaid", due, paid ? ago(20) : 0]);
  }
  ins("supply_orders", ["enterprise_id", "enterprise_name", "product_id", "product_name", "unit", "qty", "unit_price", "total", "status", "created_at", "buyer_type", "buyer_id", "buyer_name", "seller_type", "seller_id", "seller_name", "settle_status", "due_at", "paid_at"], rows);
}

// ---- 8) 金融申请 finance_applications ----
if (finProds.length) {
  const rows = [];
  const sts = ["pending", "pending", "approved", "rejected", "disbursed"];
  for (let i = 0; i < 12; i++) {
    const e = R(ents), p = R(finProds);
    rows.push([e.id, e.name, p.id, p.name, `${RI(20, 800)} 万`, R(["扩大经营", "工程垫资", "采购设备", "周转", ""]), R(sts), ago(60)]);
  }
  ins("finance_applications", ["enterprise_id", "enterprise_name", "product_id", "product_name", "amount", "note", "status", "created_at"], rows);
}

// ---- 9) 保险投保单 insurance_orders ----
{
  const prods = ["安心家装险 · 协会版", "工程履约保证保险", "建筑工人团意险", "施工现场公众责任险", "材料运输一切险"];
  const rows = [];
  for (let i = 0; i < 14; i++) rows.push([null, R(prods), name2(), fakePhone(), R(["120㎡ 整装", "工地 30 人", "工程价 200 万", "", "急需出单"]), R(["pending", "pending", "contacted", "done", "done"]), ago(70)]);
  ins("insurance_orders", ["uid", "product", "applicant", "phone", "note", "status", "created_at"], rows);
}

// ---- 10) 调解 mediations ----
{
  const details = ["水电改造增项未提前告知，要求核减费用", "工期延误两个月，主张违约金", "瓷砖空鼓返工争议", "尾款与质保金结算分歧", "材料品牌与合同不符", "墙面开裂责任认定"];
  const rows = [];
  for (let i = 0; i < 8; i++) rows.push([null, name2(), fakePhone(), R(ents).name, R(details), R(["pending", "pending", "accepted", "closed"]), ago(80)]);
  ins("mediations", ["uid", "applicant", "phone", "respondent", "detail", "status", "created_at"], rows);
}

// ---- 11) 工装报备 project_reports ----
{
  const rows = [];
  for (let i = 0; i < 16; i++) {
    const e = R(ents), area = RI(200, 5000);
    const code = `P-2026-${String(700 + i).padStart(4, "0")}`;
    rows.push([null, code, `${R(COMMUNITIES)}${R(["商业综合体", "办公楼", "酒店", "门店", "厂房"])}装饰工程`, R(["工装", "公装", "市政"]), e.name, String(area), String(RI(50, 2000)), fullName(), fakePhone(), JSON.stringify({ region: R(DISTRICTS) }), R(["pending", "pending", "approved", "approved", "rejected"]), ago(90)]);
  }
  ins("project_reports", ["uid", "code", "project", "type", "enterprise", "area", "budget", "manager", "phone", "payload", "status", "created_at"], rows);
}

// ---- 12) 入会申请 applications（pending，供协会审核）+ 账号 ----
{
  const entNames = ["信阳鼎晟建筑装饰", "豫南匠心装饰", "申城景观工程", "天筑建设集团信阳分公司", "和居整装", "锦尚设计事务所"];
  const persons = ["赵建国", "李明轩", "王守业", "陈思远", "刘海涛", "周晓梅"];
  const legals = ["赵鼎晟", "周匠心", "孙景观", "钱天筑", "—", "—"];
  // 演示身份证号（非真实，仅供实名核验流程演示）
  const demoId = (s) => `41152${s % 10}${1978 + (s % 22)}${String(101 + (s % 280)).padStart(4, "0")}${String(1000 + (s % 9000))}`.slice(0, 18).padEnd(18, "0");
  const appRows = [], acctRows = [];
  for (let i = 0; i < 6; i++) {
    const isEnt = i < 4;
    const name = isEnt ? entNames[i] : persons[i];
    const phone = fakePhone();
    const payload = isEnt
      ? JSON.stringify({ entName: name, entType: R(["decor", "build", "design"]), region: R(DISTRICTS), subdomain: "", creditCode: `91411500MA${String(1000 + i)}XY`, legalName: legals[i], legalIdcard: demoId(i * 7 + 3), contactName: legals[i], contactPhone: phone })
      : JSON.stringify({ realName: name, kind: R(KINDS), profession: R(KINDS), years: RI(3, 20), region: R(DISTRICTS), idcard: demoId(i * 11 + 5) });
    appRows.push([isEnt ? "enterprise" : "individual", name, phone, payload, "pending", ago(15)]);
    acctRows.push([phone, isEnt ? "enterprise" : "individual", "pending", name, null, ago(15)]);
  }
  ins("applications", ["type", "applicant", "phone", "payload", "status", "created_at"], appRows);
  // accounts 需要 app_id 关联；逐条插入并回填
  const lastApps = db.prepare("SELECT id,applicant,phone,type FROM applications WHERE status='pending' ORDER BY id DESC LIMIT 6").all();
  const accSt = db.prepare("INSERT INTO accounts (phone,role,status,name,app_id,created_at) VALUES (?,?,?,?,?,?)");
  let an = 0;
  for (const a of lastApps) {
    const exists = db.prepare("SELECT 1 FROM accounts WHERE phone=?").get(a.phone);
    if (!exists) { accSt.run(a.phone, a.type, "pending", a.applicant, a.id, ago(15)); an++; }
  }
  log["accounts"] = an;
}

// ---- 13) AI 提问 ai_questions ----
{
  const byEmp = {
    advisor: ["怎么加入协会成为会员？", "入会需要哪些材料？", "协会会费多少？", "个人能入会吗？"],
    decor: ["100平半包大概多少钱？", "现代简约和北欧怎么选？", "水电改造要注意什么？", "全包和半包区别？", "装修一般多久完工？"],
    design: ["小户型怎么显大？", "客厅没有阳台怎么设计？", "新中式软装怎么搭？"],
    fin: ["建装贷利率多少？", "保函怎么申请？", "装修分期能贷多少？", "放款要多久？"],
    ins: ["家装质保险怎么买？", "工人意外险多少钱？", "出险了怎么理赔？"],
    report: ["工装报备怎么提交？", "报备要多久出函？", "需要哪些资料？"],
    know: ["验收规范有哪些？", "防水要做几遍？", "瓷砖空鼓标准？"],
    hr: ["找工长去哪里？", "怎么接活？", "培训证书怎么考？", "工资被拖欠怎么办？"],
  };
  const rows = [];
  for (const [emp, qs] of Object.entries(byEmp)) {
    for (const q of qs) { const t = RI(1, 6); for (let j = 0; j < t; j++) rows.push([emp, q, ago(28)]); }
  }
  ins("ai_questions", ["employee_key", "question", "created_at"], rows);
}

// ---- 14) 从业者 practitioners ----
{
  const rows = [];
  for (let i = 0; i < 20; i++) {
    rows.push([null, fullName(), R(KINDS), RI(3, 25), (4 + Math.random()).toFixed(1), RI(8, 260), R(DISTRICTS), Math.random() < .6 ? 1 : 0, fakePhone(), ago(200)]);
  }
  ins("practitioners", ["app_id", "name", "kind", "years", "rating", "jobs", "city", "insured", "phone", "created_at"], rows);
}

// ---- 15) 培训 trainings ----
{
  const items = [
    ["项目经理继续教育（第十二期）", "继续教育", "省建科院 张教授", "协会培训中心 3 楼", "2026-06-20 至 06-22", 60, "￥800/人"],
    ["建筑工人安全生产专题", "安全培训", "市住建局 李工", "线上直播", "2026-06-15 19:00", 200, "免费"],
    ["室内设计师软装提升营", "技能培训", "知名设计师 王老师", "羊山新区设计中心", "2026-07-01 至 07-03", 40, "￥1200/人"],
    ["BIM 与智能建造入门", "数字化", "工程师协会 周老师", "协会培训中心 2 楼", "2026-07-10 至 07-12", 50, "￥980/人"],
    ["工伤保险与劳动权益讲座", "政策", "人社局 陈科长", "线上直播", "2026-06-28 14:00", 300, "免费"],
    ["全屋定制工艺标准化", "技能培训", "兔宝宝学院讲师", "明港产业园", "2026-07-18 至 07-19", 45, "￥600/人"],
  ];
  const rows = items.map(it => [it[0], it[1], it[2], it[3], it[4], it[5], it[6], `${it[0]}，欢迎协会会员及从业者报名参加。`, "open", ago(20)]);
  ins("trainings", ["title", "category", "instructor", "location", "schedule", "capacity", "fee", "detail", "status", "created_at"], rows);
}

console.log("=== 灌入完成 ===");
for (const [k, v] of Object.entries(log)) console.log(`  +${v} ${k}`);
console.log("=== 当前总量 ===");
for (const t of ["enterprises", "practitioners", "leads", "reviews", "enterprise_cases", "enterprise_team", "news", "jobs", "supply_products", "supply_orders", "finance_applications", "insurance_orders", "mediations", "project_reports", "applications", "ai_questions", "trainings"]) {
  console.log(`  ${t}: ${db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c}`);
}
