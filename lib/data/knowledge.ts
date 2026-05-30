// 知识库 mock 数据
export type KnowledgeItem = {
  id: string;
  title: string;
  category: "国标规范" | "地方政策" | "技术资料" | "典型案例" | "合同范本";
  tags: string[];
  date: string;
  size?: string;
  hot?: boolean;
  excerpt: string;
};

export const KNOWLEDGE: KnowledgeItem[] = [
  { id: "K001", title: "GB 50210-2018 建筑装饰装修工程质量验收标准", category: "国标规范",
    tags: ["验收", "装饰装修", "国标"], date: "2018-09-01", size: "8.4 MB", hot: true,
    excerpt: "规定了建筑装饰装修工程的施工质量验收要求和方法。" },
  { id: "K002", title: "信阳市建设工程招投标管理实施细则（2026 修订）", category: "地方政策",
    tags: ["招投标", "本地"], date: "2026-03-15", hot: true,
    excerpt: "本细则适用于信阳市行政区域内房屋建筑、市政工程的招投标活动。" },
  { id: "K003", title: "JGJ/T 304-2013 住宅室内装饰装修工程质量验收规范",
    category: "国标规范", tags: ["住宅", "验收"], date: "2013-12-01", size: "5.1 MB",
    excerpt: "明确住宅室内装饰装修工程的检查项目、方法和判定标准。" },
  { id: "K004", title: "工装报备一次通过率提升 35% — 名家装饰最佳实践",
    category: "典型案例", tags: ["报备", "实践"], date: "2026-04-10", hot: true,
    excerpt: "通过 AI 预审 + 模板化提交，名家装饰 Q1 报备一次通过率显著提升。" },
  { id: "K005", title: "建设工程施工合同（示范文本）GF-2017-0201", category: "合同范本",
    tags: ["施工合同", "范本"], date: "2017-09-01", size: "1.2 MB",
    excerpt: "住建部与市场监管总局联合发布的施工合同示范文本。" },
  { id: "K006", title: "装配式建筑 SI 体系技术导则", category: "技术资料",
    tags: ["装配式", "绿色建筑"], date: "2025-12-20", size: "3.8 MB",
    excerpt: "面向河南省装配式建筑施工与构件生产的技术指引。" },
  { id: "K007", title: "家装消费纠纷调解典型案例（10 则）", category: "典型案例",
    tags: ["调解", "纠纷"], date: "2026-05-01",
    excerpt: "本协会调解委员会近一年办结的典型案例汇编。" },
  { id: "K008", title: "GB 50300-2013 建筑工程施工质量验收统一标准",
    category: "国标规范", tags: ["验收", "统一标准"], date: "2013-09-06", size: "2.6 MB",
    excerpt: "建筑工程施工质量验收的统一性、基础性国家标准。" },
];

export const KNOWLEDGE_CATEGORIES = [
  { key: "国标规范", color: "build", count: 86 },
  { key: "地方政策", color: "brand", count: 42 },
  { key: "技术资料", color: "design", count: 124 },
  { key: "典型案例", color: "decor", count: 58 },
  { key: "合同范本", color: "tea", count: 32 },
] as const;
