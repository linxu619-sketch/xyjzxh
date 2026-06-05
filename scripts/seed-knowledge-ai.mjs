// 让 AI 依据「真实存在的权威文件/主题」整理一批知识库草稿，写入 knowledge_drafts(pending)。
// 用法： node scripts/seed-knowledge-ai.mjs
// 说明：读取 .runtime-settings.json 里的 DeepSeek key；每条一次调用；按标题去重；
//       产出进草稿箱待人工审核，不直接入库。
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const db = new DatabaseSync(join(ROOT, "data", "app.db"));
db.exec("PRAGMA journal_mode=WAL;");

// ---- 读取 DeepSeek 配置 ----
let cfg = {};
try { cfg = (JSON.parse(readFileSync(join(ROOT, ".runtime-settings.json"), "utf8")).ai) || {}; } catch { /**/ }
const API_KEY = cfg.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
const BASE = (cfg.deepseekBaseUrl || process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/$/, "");
const LEGACY = { "deepseek-chat": "deepseek-v4-flash", "deepseek-reasoner": "deepseek-v4-flash" };
const rawModel = cfg.deepseekModel || process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const MODEL = LEGACY[rawModel] ?? rawModel;
if (!API_KEY) { console.error("未找到 DeepSeek key（.runtime-settings.json 或 DEEPSEEK_API_KEY）"); process.exit(1); }

// ---- 12 份真实权威文件/主题（覆盖 5 个分类，避开已有 K001–K008）----
const TOPICS = [
  { category: "国标规范", title: "GB 50325-2020 民用建筑工程室内环境污染控制标准", publisher: "住房和城乡建设部", note: "装修后室内氡/甲醛/苯/TVOC等污染物限量与检测验收。" },
  { category: "国标规范", title: "GB 18580-2017 等 室内装饰装修材料有害物质限量(十项强制性国标)", publisher: "国家标准", note: "人造板/涂料/胶粘剂/壁纸/地毯等材料的有害物质限量强制标准体系。" },
  { category: "国标规范", title: "JGJ 367-2015 住宅室内装饰装修设计规范", publisher: "住房和城乡建设部", note: "住宅室内装饰装修的设计要求：空间、给排水电气、防火、隔声、无障碍等。" },
  { category: "地方政策", title: "河南省绿色建筑条例", publisher: "河南省人大常委会", note: "河南省域内绿色建筑的规划、建设、运营与激励要求,与装修绿色化相关。" },
  { category: "地方政策", title: "建筑工程施工发包与承包违法行为认定查处管理办法", publisher: "住房和城乡建设部", note: "挂靠、转包、违法分包、出借资质等违法行为的认定与查处,关乎会员企业合规。" },
  { category: "技术资料", title: "室内防水工程施工与质量控制技术要点", publisher: "行业技术资料", note: "厨卫/阳台防水基层处理、涂膜厚度、闭水试验、节点处理与常见渗漏防治。" },
  { category: "技术资料", title: "装饰装修工程施工现场安全文明施工要点", publisher: "行业技术资料", note: "动火/用电/高处作业、成品保护、扬尘噪声、垃圾清运等现场管理要点。" },
  { category: "技术资料", title: "既有住宅适老化改造技术要点", publisher: "行业技术资料", note: "面向老年人居住的住宅改造：防滑、扶手、无障碍、紧急呼叫、照明等。" },
  { category: "典型案例", title: "家装增项加价纠纷调解典型案例", publisher: "协会调解委员会", note: "施工中频繁增项、超预算加价引发的纠纷及其调解思路与依据。" },
  { category: "典型案例", title: "工程质量保修与保证金返还争议处理案例", publisher: "协会调解委员会", note: "保修期内质量问题责任划分、质保金扣留与返还争议的处理。" },
  { category: "合同范本", title: "住宅室内装饰装修工程施工合同(示范文本)", publisher: "住房和城乡建设部 / 市场监管总局", note: "家庭居室装饰装修施工合同示范文本的构成与关键条款使用提示。" },
  { category: "合同范本", title: "建设工程施工专业分包合同(示范文本) GF-2003-0213", publisher: "住房和城乡建设部", note: "专业分包合同示范文本的适用范围、主要条款与签约注意事项。" },
];

const SYSTEM = `你是建筑装饰装修行业协会的知识库编辑。我会给你一份【真实存在】的权威文件或主题,请你依据对该文件的了解,整理成一条知识库词条。
要求：
- 内容必须基于该真实文件/主题客观整理,不要编造具体条文编号、数据、奖补金额;不确定的细节就概括表述,并可在要点中提示"以官方正式文本为准"。
- 分类必须用我给的分类,不要改。
- 输出**严格 JSON**,不要任何多余文字或解释：
{
  "excerpt": "一句话摘要,不超过45字",
  "sections": [ { "h": "小节标题", "points": ["要点", "要点"] } ],
  "tags": ["标签","标签"]
}
- sections 给 2-4 个小节(如 适用范围 / 主要内容 / 关键要点 / 使用提示 等),每节 2-5 条要点。tags 给 2-4 个。`;

function parseJson(raw) {
  let j = String(raw).replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const fence = j.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) j = fence[1].trim();
  const a = j.indexOf("{"), b = j.lastIndexOf("}");
  if (a >= 0 && b > a) j = j.slice(a, b + 1);
  return JSON.parse(j);
}

async function draft(topic) {
  const user = `分类：${topic.category}\n标题：${topic.title}\n发布/来源：${topic.publisher}\n主题说明：${topic.note}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL, stream: false, max_tokens: 1200, temperature: 0.4,
        thinking: { type: "disabled" },
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 160)}`);
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const o = parseJson(content);
    const sections = Array.isArray(o.sections)
      ? o.sections.map((s) => ({ h: String(s?.h || "内容要点").trim() || "内容要点", points: (Array.isArray(s?.points) ? s.points : []).map((p) => String(p).trim()).filter(Boolean) })).filter((s) => s.points.length)
      : [];
    const tags = Array.isArray(o.tags) ? o.tags.map((x) => String(x).trim()).filter(Boolean).slice(0, 4) : [];
    if (!sections.length) throw new Error("AI 未返回有效要点");
    return { excerpt: String(o.excerpt || topic.title).trim().slice(0, 80), sections, tags };
  } finally { clearTimeout(t); }
}

function titleExists(title) {
  const a = db.prepare("SELECT 1 FROM knowledge_drafts WHERE title=? LIMIT 1").get(title);
  const b = db.prepare("SELECT 1 FROM knowledge_articles WHERE title=? LIMIT 1").get(title);
  return !!(a || b);
}

const ins = db.prepare("INSERT INTO knowledge_drafts (id,title,category,tags,excerpt,content,source_name,source_url,status,created_at) VALUES (?,?,?,?,?,?,?,?,'pending',?)");

const LIMIT = process.env.LIMIT ? Math.max(1, Number(process.env.LIMIT)) : TOPICS.length;
let ok = 0, skip = 0, fail = 0;
for (let i = 0; i < Math.min(LIMIT, TOPICS.length); i++) {
  const tp = TOPICS[i];
  if (titleExists(tp.title)) { console.log(`[skip] 已存在：${tp.title}`); skip++; continue; }
  process.stdout.write(`[${i + 1}/${TOPICS.length}] 起草：${tp.title} … `);
  try {
    const d = await draft(tp);
    const id = `KD-ai-${Date.now().toString(36)}-${i}`;
    ins.run(id, tp.title, tp.category, JSON.stringify(d.tags), d.excerpt, JSON.stringify(d.sections),
      `AI 整理 · ${tp.publisher}`, `ai-seed://${i}`, Date.now() - i);
    console.log(`OK (${d.sections.length} 节, ${d.tags.length} 标签)`);
    ok++;
  } catch (e) {
    console.log(`失败：${e.message}`);
    fail++;
  }
}

console.log(`\n完成：新增 ${ok} 条草稿,跳过 ${skip} 条(已存在),失败 ${fail} 条。`);
console.log(`当前草稿箱待审：${db.prepare("SELECT COUNT(*) c FROM knowledge_drafts WHERE status='pending'").get().c} 条`);
db.close();
