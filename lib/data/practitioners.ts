// 从业者 mock 数据

export type PractitionerKind =
  | "工长"
  | "项目经理"
  | "设计师"
  | "监理"
  | "木工"
  | "瓦工"
  | "水电工"
  | "油漆工"
  | "安装工"
  | "杂工";

export type Practitioner = {
  id: string;
  realName: string;
  nickname?: string;
  phone: string;
  city: string;
  kind: PractitionerKind;
  yearsOfExp: number;
  certs: { name: string; issuer: string; issuedAt: string; expiresAt?: string }[];
  skills: string[];
  rating: number;        // 0-5
  jobsDone: number;
  income12mo: number;    // 元
  insured: boolean;
  blacklisted: boolean;
  bio: string;
  recentProjects: { project: string; enterprise: string; role: string; period: string }[];
};

export const DEMO_PRACTITIONER: Practitioner = {
  id: "P-2024-00284",
  realName: "张建国",
  nickname: "张师傅",
  phone: "138****2008",
  city: "信阳市 · 浉河区",
  kind: "工长",
  yearsOfExp: 18,
  certs: [
    { name: "二级建造师 · 建筑工程", issuer: "河南省住建厅", issuedAt: "2018-06", expiresAt: "2026-06" },
    { name: "建筑施工安全员 C 证",   issuer: "河南省住建厅", issuedAt: "2020-03", expiresAt: "2026-03" },
    { name: "高级木工 (国家职业资格 3 级)", issuer: "人社部",       issuedAt: "2015-09" },
  ],
  skills: ["整装统筹", "水电改造", "木作", "工艺质检", "工地标准化"],
  rating: 4.8,
  jobsDone: 142,
  income12mo: 286000,
  insured: true,
  blacklisted: false,
  bio: "信阳本地工长，18 年家装工地经验，主带「名家装饰」与「壹品装饰」整装项目；按工序透明记账，业主+企业双向评价 4.8 分。",
  recentProjects: [
    { project: "金茂悦府 1602", enterprise: "名家装饰", role: "工长 / 项目经理代理", period: "2026-05 至今" },
    { project: "茶都商务 22F",  enterprise: "壹品装饰", role: "现场协调",           period: "2026-04 - 2026-05" },
    { project: "御景湾 401",   enterprise: "名家装饰", role: "工长",               period: "2026-02 - 2026-04" },
  ],
};

// 公开求职 / 工人列表
export const PRACTITIONERS_LIST: {
  id: string; name: string; kind: PractitionerKind; years: number;
  city: string; rating: number; jobs: number; daily: number; insured: boolean;
}[] = [
  { id: "P001", name: "张师傅",  kind: "工长",     years: 18, city: "浉河区", rating: 4.8, jobs: 142, daily: 850, insured: true  },
  { id: "P002", name: "李师傅",  kind: "木工",     years: 22, city: "平桥区", rating: 4.9, jobs: 218, daily: 580, insured: true  },
  { id: "P003", name: "王师傅",  kind: "水电工",   years: 12, city: "羊山新区", rating: 4.7, jobs: 86,  daily: 480, insured: true  },
  { id: "P004", name: "赵师傅",  kind: "瓦工",     years: 16, city: "光山县",   rating: 4.6, jobs: 102, daily: 460, insured: true  },
  { id: "P005", name: "孙女士",  kind: "设计师",   years: 8,  city: "浉河区",   rating: 4.9, jobs: 62,  daily: 0,   insured: false },
  { id: "P006", name: "周师傅",  kind: "油漆工",   years: 10, city: "息县",     rating: 4.5, jobs: 88,  daily: 420, insured: true  },
  { id: "P007", name: "钱师傅",  kind: "项目经理", years: 14, city: "罗山县",   rating: 4.8, jobs: 56,  daily: 900, insured: true  },
  { id: "P008", name: "陈监理",  kind: "监理",     years: 20, city: "浉河区",   rating: 4.9, jobs: 184, daily: 720, insured: true  },
];

export const PRACTITIONER_JOBS = [
  { id: "PJ-2026-0612", title: "金茂悦府整装 · 招工长 / 项目经理", enterprise: "名家装饰", area: "168㎡", duration: "约 87 天", daily: "850-1000", openings: 1, district: "浉河区", urgent: true,  postedAt: "2 小时前" },
  { id: "PJ-2026-0611", title: "茶都商务大厦 22F · 招瓦工 + 水电工 (8 人)", enterprise: "壹品装饰", area: "2400㎡", duration: "约 90 天", daily: "480-620", openings: 8, district: "羊山新区", urgent: true,  postedAt: "今天 11:08" },
  { id: "PJ-2026-0610", title: "茶博园景观二期 · 招瓦工", enterprise: "华泰建工", area: "5600㎡", duration: "项目制", daily: "面议", openings: 4, district: "浉河区", urgent: false, postedAt: "昨天" },
  { id: "PJ-2026-0608", title: "海宁城软装 · 招独立设计师", enterprise: "雅舍设计", area: "320㎡", duration: "30 天", daily: "项目制 ¥45000", openings: 1, district: "平桥区", urgent: false, postedAt: "昨天" },
  { id: "PJ-2026-0606", title: "弦山街公寓翻新 · 招油漆工", enterprise: "万家美装饰", area: "98㎡",  duration: "12 天",  daily: "420", openings: 2, district: "光山县", urgent: false, postedAt: "2 天前" },
];

// 工伤险产品（团险）
export const WORKER_INSURANCE = [
  { id: "WI-001", name: "建筑工人意外险 · 协会团险版", insurer: "国寿财险",
    priceDaily: 5, priceMonthly: 120, priceYearly: 1280,
    cover: "意外身故 80 万 + 意外医疗 5 万 + 误工津贴 200 元/天",
    badges: ["7×24 报案", "无需企业出面", "T+1 即生效"] },
  { id: "WI-002", name: "防欠薪保函 · 个人专项",      insurer: "平安产险",
    priceDaily: 0, priceMonthly: 30,  priceYearly: 360,
    cover: "工资争议 7 天先垫付 ≤ 5 万",
    badges: ["协会牵头", "对接企业账款"] },
];

// 收入流水（演示）
export type IncomeRecord = {
  month: string; days: number; gross: number; tax?: number; net: number;
  projects: { name: string; enterprise: string; amount: number }[];
};

export const INCOME_RECORDS: IncomeRecord[] = [
  { month: "2026-05", days: 26, gross: 26800, tax: 0, net: 26800,
    projects: [
      { name: "金茂悦府 1602", enterprise: "名家装饰", amount: 18600 },
      { name: "御景湾 401",    enterprise: "名家装饰", amount: 8200  },
    ] },
  { month: "2026-04", days: 25, gross: 23500, tax: 0, net: 23500,
    projects: [
      { name: "茶都商务 22F",  enterprise: "壹品装饰", amount: 15300 },
      { name: "御景湾 401",    enterprise: "名家装饰", amount: 8200  },
    ] },
  { month: "2026-03", days: 22, gross: 21000, tax: 0, net: 21000,
    projects: [
      { name: "御景湾 401",    enterprise: "名家装饰", amount: 21000 },
    ] },
  { month: "2026-02", days: 18, gross: 16800, tax: 0, net: 16800,
    projects: [
      { name: "金茂悦府 0805", enterprise: "名家装饰", amount: 16800 },
    ] },
];

// 培训
export const PRACTITIONER_TRAININGS = [
  { id: "PT-1", title: "2026 上半年 · 二级建造师冲刺", fee: 980,  days: 5,  enrolled: 27, seats: 40, startAt: "2026-06-15", tag: "建造师", urgent: false },
  { id: "PT-2", title: "高级木工 · 国家职业资格 2 级",  fee: 1280, days: 14, enrolled: 18, seats: 24, startAt: "2026-07-01", tag: "工种", urgent: true },
  { id: "PT-3", title: "BIM 建模实战 (Revit + Navisworks)", fee: 2680, days: 7,  enrolled: 19, seats: 30, startAt: "2026-06-22", tag: "数字化", urgent: false },
  { id: "PT-4", title: "安全员 C 证 续期 (免费)",         fee: 0,    days: 1,  enrolled: 124, seats: 200, startAt: "2026-06-08", tag: "强制", urgent: false },
  { id: "PT-5", title: "AI + 装修估价快速上手",            fee: 380,  days: 2,  enrolled: 64, seats: 80, startAt: "2026-06-12", tag: "AI", urgent: false },
];

// 同行圈帖子
export const PEER_POSTS = [
  { author: "李师傅",  city: "平桥区", time: "5 分钟前",
    text: "请教各位老哥，金钰悦府那种回填层渗水，是先做整体二次防水还是局部加固划算？" },
  { author: "陈监理", city: "浉河区", time: "1 小时前",
    text: "新版 2026 验收规范防水那一节，今天宣贯会有人去吗？我打算下午去茶都路那场。" },
  { author: "孙设计", city: "浉河区", time: "今天",
    text: "酷家乐 + AI 起方案对比图，本地师傅做整装真心建议学一下，谈单效率翻倍。" },
];
