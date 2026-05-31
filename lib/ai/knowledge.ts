// AI 员工「专业知识库」第一期（RAG · 检索增强）
// ------------------------------------------------------------
// 设计：每个 AI 员工挂一份本领域知识；聊天时按用户问题检索 top-K，
//       拼进该员工的 system 提示词，让回答更专业、可控。
// 现状：演示种子数据 + 轻量关键词/二元组检索（“FTS 起步”形态）。
//       待 Supabase 配好后，可把存储换成 Postgres 全文检索 / pgvector，
//       检索接口 retrieveKnowledge 保持不变。
// 后续：第二期由协会后台维护词条、审核对话沉淀；第三期做用户级记忆。

import type { AiEmployeeKey } from "./prompts";

export type KnowledgeEntry = {
  id: string;
  title: string;
  keywords: string[]; // 命中即强相关
  content: string;
  source?: string;
};

// 每个员工的知识库（种子）。未列出的员工暂无词条，回答仅依据其人设。
export const KNOWLEDGE: Partial<Record<AiEmployeeKey, KnowledgeEntry[]>> = {
  advisor: [
    {
      id: "join-materials",
      title: "企业会员入会材料与流程",
      keywords: ["入会", "加入", "材料", "申请", "流程", "怎么加入", "会员"],
      content:
        "企业会员入会需提供：营业执照副本、法人身份证、相关资质证书（建筑业/装饰装修/设计）、近2年代表项目业绩。流程：在线提交申请→秘书处材料初审(1-2工作日)→（高级会员/理事单位）现场核查→缴费签约开通子站。提交入口在 /join?type=enterprise。",
      source: "协会入会须知",
    },
    {
      id: "member-types",
      title: "两类会员的区别",
      keywords: ["个人会员", "企业会员", "设计师", "区别", "身份", "工长", "监理"],
      content:
        "协会会员分两类：①企业会员（建筑/装修/设计公司，以单位入会）；②个人会员（独立设计师、项目经理、监理、独立工长等专业个人，以个人身份入会，需实名+专业+证书，无需营业执照）。业主属于消费者，不是会员。个人入会入口 /join?type=individual。",
      source: "协会章程",
    },
  ],
  report: [
    {
      id: "gz-materials",
      title: "工装报备所需材料",
      keywords: ["报备", "工装", "材料", "省厅", "图纸", "备案", "需要什么"],
      content:
        "工装报备必备材料：企业资质、施工合同、设计图纸、安全方案、保险信息。信阳已与省厅数据打通，一次填报双向同步。开始报备：/projects/new 多步表单，支持 AI 预审，24h 反馈。",
      source: "工装报备指南",
    },
  ],
  ins: [
    {
      id: "home-warranty",
      title: "家装质保险保什么",
      keywords: ["家装质保险", "保险", "质保", "保什么", "理赔", "安心家装"],
      content:
        "家装质保险（安心家装险）覆盖施工质量缺陷、隐蔽工程渗漏、延期赔付等，保期通常含施工期+约定质保年限。投保与理赔入口 /insurance。出险先在“理赔申请”提交材料，协会协助跟进。",
      source: "保险产品说明",
    },
    {
      id: "worker-insurance",
      title: "工人意外险 / 工伤保障",
      keywords: ["工人", "意外险", "工伤", "工地", "施工人员", "雇主"],
      content:
        "面向施工现场人员的意外/工伤保障，按项目或按人投保，个人会员可享协会专属费率。具体保额与投保在 /insurance 选择对应险种。",
      source: "保险产品说明",
    },
  ],
  fin: [
    {
      id: "loan",
      title: "建装贷与电子保函",
      keywords: ["贷款", "建装贷", "保函", "额度", "利率", "资金", "缺口", "分期"],
      content:
        "协会对接合作银行提供建装贷（经营周转）、电子保函（投标/履约）、保理与设备分期。利率额度以银行审批为准，协会不预承诺。提交意向：/finance，由客户经理对接。",
      source: "金融服务介绍",
    },
  ],
  know: [
    {
      id: "acceptance-spec",
      title: "现行验收规范版本",
      keywords: ["验收", "规范", "标准", "哪一版", "2026", "国标"],
      content:
        "《信阳市住宅装饰装修工程质量验收规范（2026版）》自2026年6月1日起施行，在防水、电气、消防三方面强化标准。规范与案例可在知识库检索：/knowledge?q=验收规范。",
      source: "协会知识库",
    },
  ],
  mediate: [
    {
      id: "mediation-flow",
      title: "装修纠纷调解流程",
      keywords: ["调解", "纠纷", "投诉", "工期", "延误", "返工", "维权", "赔付"],
      content:
        "调解三步：①整理证据（合同/聊天记录/照片/验收单）②在 /services 提交调解申请 ③14天内协会调解委员会介入。协会保持中立，不预判责任。涉及消费保险的可同步走理赔。",
      source: "调解委员会",
    },
  ],
  decor: [
    {
      id: "price-range",
      title: "信阳本地装修估价参考",
      keywords: ["估价", "报价", "预算", "多少钱", "平米", "㎡", "全包", "半包", "够吗"],
      content:
        "信阳本地参考价：基础装修 800-1500 元/㎡，整装 1500-3500 元/㎡。全包含主材，半包主材自购。精确报价需结合户型/风格/材料并联系企业。AI 估价用小装，找企业去 /members。",
      source: "装修估价参考",
    },
    {
      id: "pick-company",
      title: "怎么挑靠谱装修公司",
      keywords: ["选企业", "靠谱", "怎么选", "装修公司", "口碑", "找装企"],
      content:
        "挑企业看四点：协会认证、实名评价、代表案例、所在区域。在 /members 按评分/案例筛选并打开企业子站查看。业主可购买安心家装险（/insurance）获得协会担保保护。",
      source: "选企业指南",
    },
  ],
  design: [
    {
      id: "styles",
      title: "常见装修风格与选择",
      keywords: ["风格", "现代", "北欧", "新中式", "原木", "法式", "工业", "配色", "软装", "适合"],
      content:
        "常见风格：现代极简、原木、新中式、法式、工业风等。建议结合家庭成员、使用习惯与采光决定。小设不出具施工图，需要落地图纸请到 /members?cat=design 找协会签约设计师。",
      source: "设计知识库",
    },
    {
      id: "layout",
      title: "户型优化与改造要点",
      keywords: ["户型", "改造", "开放式", "采光", "动线", "小户型", "厨房"],
      content:
        "户型优化重点：采光、动线、收纳。厨房改开放式要注意油烟与燃气安全规范（部分小区/燃气公司有限制）。提交户型图后可由设计师给优化方案。",
      source: "设计知识库",
    },
  ],
  hr: [
    {
      id: "find-job",
      title: "从业者找活与招工对接",
      keywords: ["找活", "接活", "招工", "找工作", "工长", "师傅", "日薪", "招聘"],
      content:
        "从业者按工种/工龄/期望日薪匹配协会企业的招工或散单，在 /dashboard/practitioner/jobs 看活。企业发布岗位、浏览简历在 /talents。小才不承诺一定拿到活，只给方法与下一步。",
      source: "人才中心",
    },
    {
      id: "wage-dispute",
      title: "欠薪 / 工伤 维权",
      keywords: ["欠薪", "拖欠", "工资", "工伤", "维权", "讨薪", "申诉"],
      content:
        "遇欠薪/工伤：先整理证据（合同、考勤、转账记录、伤情材料），再起草协会调解申请；协会坚决不撮合“挂证”等违规。续证/技能培训在 /dashboard/practitioner/training。",
      source: "人才中心",
    },
  ],
  biz: [
    {
      id: "site-conversion",
      title: "提升企业子站转化",
      keywords: ["子站", "转化", "线索", "获客", "运营", "提高"],
      content:
        "提升子站转化：完善案例与透明报价、开启在线接单、及时回复客户线索、维护好评价。线索来源与转化数据在 /dashboard/enterprise 查看。",
      source: "经营助手",
    },
    {
      id: "ops-data",
      title: "经营数据与报备进度查询",
      keywords: ["报备进度", "导出", "订单", "经营数据", "线索", "BI", "后台"],
      content:
        "经营数据、客户线索、施工订单、报备进度都在 /dashboard/enterprise 自助查询与导出。涉及经营敏感数据需企业员工登录后查看；未登录请先去 /login。",
      source: "经营助手",
    },
  ],
};

// —— 轻量检索（中文友好）：关键词命中 + 二元组重叠打分 ——
function bigrams(s: string): string[] {
  const t = s.replace(/\s+/g, "");
  const out: string[] = [];
  for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
  return out;
}

// 对一组词条按与 query 的相关度打分排序，取前 k 条（纯函数，DB / 种子通用）
export function rankEntries(
  entries: KnowledgeEntry[],
  query: string,
  k = 3,
): KnowledgeEntry[] {
  if (!entries.length || !query.trim()) return [];
  const grams = bigrams(query);
  const scored = entries.map((e) => {
    let score = 0;
    for (const kw of e.keywords) if (query.includes(kw)) score += 3;
    const text = e.title + e.content;
    for (const g of grams) if (text.includes(g)) score += 1;
    return { e, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => x.e);
}

// 基于内置种子的检索（DB 不可用时的回退；线上用 knowledge-source 的 DB 版）
export function retrieveKnowledge(key: string, query: string, k = 3): KnowledgeEntry[] {
  return rankEntries(KNOWLEDGE[key as AiEmployeeKey] ?? [], query, k);
}

// 拼成注入 system 提示词的「参考资料」块；无命中返回空串
export function buildKnowledgeBlock(entries: KnowledgeEntry[]): string {
  if (!entries.length) return "";
  const items = entries
    .map((e) => `【${e.title}】${e.content}`)
    .join("\n");
  return (
    `\n\n# 内部知识库（参考资料，请自然融入回答，不要照抄；以协会最新规定为准，如与提问无关可忽略）\n${items}`
  );
}
