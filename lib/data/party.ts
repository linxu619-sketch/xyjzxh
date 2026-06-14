// 党的建设模块 —— 类型 + 种子常量（纯数据，无 DB 依赖；DB 不可用时回退）

export type PartyCommittee = { id: string; name: string; post: string; duty: string; sort: number };
export type PartyMember = { id: string; name: string; kind: string; org: string; role: string; highlight: string; photo?: string; joined?: string; sort: number };
export type PartyMeeting = { id: string; type: string; title: string; date: string; location: string; host: string; attend: string; summary: string; images: string[] };
export type PartyTopic = { id: string; title: string; summary: string; cover?: string; keywords: string[] };

// 三会一课 / 主题党日 的会议类型
export const MEETING_TYPES = ["支部党员大会", "支部委员会", "党小组会", "党课", "主题党日"] as const;
// 党员名册类别
export const MEMBER_KINDS = ["党员", "党员企业", "入党积极分子"] as const;
// 支部委员常见职务
export const COMMITTEE_POSTS = ["支部书记", "组织委员", "宣传委员", "纪检委员", "委员"] as const;

/* ---------- 种子数据（首次建库灌入，可在后台增删） ---------- */

export const SEED_COMMITTEE: PartyCommittee[] = [
  { id: "pc-1", name: "解彦波", post: "支部书记", duty: "主持支部委员会全面工作，把方向、管大局、抓落实", sort: 1 },
  { id: "pc-2", name: "（待完善）", post: "组织委员", duty: "党员发展、组织生活、党费收缴与党员教育管理", sort: 2 },
  { id: "pc-3", name: "（待完善）", post: "宣传委员", duty: "理论学习、思想宣传、党建动态与意识形态工作", sort: 3 },
  { id: "pc-4", name: "（待完善）", post: "纪检委员", duty: "党风廉政、纪律监督与作风建设", sort: 4 },
];

export const SEED_MEMBERS: PartyMember[] = [
  { id: "pm-1", name: "解彦波", kind: "党员", org: "协会党支部", role: "支部书记", highlight: "带头讲党课、亮身份作表率，推动党建与协会服务深度融合。", joined: "2008", sort: 1 },
  { id: "pm-2", name: "信阳华泰建工有限公司", kind: "党员企业", org: "会长单位", role: "党员示范企业", highlight: "设立党员先锋岗，承诺诚信经营、按时足额支付农民工工资。", joined: "", sort: 2 },
  { id: "pm-3", name: "信阳名家装饰工程有限公司", kind: "党员企业", org: "副会长单位", role: "党员示范企业", highlight: "党员骨干带队攻坚，工地质量与安全双承诺。", joined: "", sort: 3 },
];

export const SEED_MEETINGS: PartyMeeting[] = [
  { id: "mt-1", type: "主题党日", title: "「党建引领行业自律」主题党日", date: "2026-05-18", location: "协会党群活动室", host: "解彦波", attend: "应到 12 实到 11", summary: "重温入党誓词，集中学习行业自律公约，组织党员志愿服务，讨论把党建优势转化为服务会员的实效。", images: [] },
  { id: "mt-2", type: "党课", title: "支部书记讲党课：把党的创新理论落到协会服务", date: "2026-04-20", location: "协会会议室", host: "解彦波", attend: "应到 12 实到 12", summary: "围绕学习贯彻习近平新时代中国特色社会主义思想，讲解如何在入会、报备、调解、培训中体现党建引领。", images: [] },
  { id: "mt-3", type: "支部委员会", title: "二季度支部委员会", date: "2026-04-02", location: "协会会议室", host: "解彦波", attend: "应到 4 实到 4", summary: "研究部署二季度党建工作计划、主题党日安排与党员发展事宜。", images: [] },
];

export const SEED_TOPICS: PartyTopic[] = [
  { id: "tp-1", title: "学习贯彻党的创新理论", summary: "持续深入学习习近平新时代中国特色社会主义思想，推动学习成果转化为行业高质量发展的实践。", keywords: ["习近平", "新时代", "创新理论", "理论学习", "二十大", "全会"] },
  { id: "tp-2", title: "党建引领行业自律", summary: "把党建工作融入会员服务全流程，发挥党组织战斗堡垒和党员先锋模范作用。", keywords: ["党建引领", "行业自律", "主题党日", "先锋", "诚信经营"] },
];
