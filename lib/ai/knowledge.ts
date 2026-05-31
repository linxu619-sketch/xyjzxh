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
};

// —— 轻量检索（中文友好）：关键词命中 + 二元组重叠打分 ——
function bigrams(s: string): string[] {
  const t = s.replace(/\s+/g, "");
  const out: string[] = [];
  for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
  return out;
}

export function retrieveKnowledge(
  key: string,
  query: string,
  k = 3,
): KnowledgeEntry[] {
  const entries = KNOWLEDGE[key as AiEmployeeKey];
  if (!entries || !query.trim()) return [];

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
