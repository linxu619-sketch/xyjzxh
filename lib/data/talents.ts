// 人才中心 mock 数据
export type JobType = "全职" | "项目制" | "兼职" | "实习";

export type Job = {
  id: string;
  title: string;
  enterprise: string;
  enterpriseId: string;
  category: "build" | "decor" | "design";
  type: JobType;
  salaryMin: number; // 千/月
  salaryMax: number;
  district: string;
  experience: string;
  education: string;
  tags: string[];
  hot?: boolean;
  postedAt: string;
};

export const JOBS: Job[] = [
  { id: "J001", title: "土建项目经理", enterprise: "华泰建工", enterpriseId: "e001",
    category: "build", type: "全职", salaryMin: 15, salaryMax: 25, district: "浉河区",
    experience: "5-10 年", education: "本科", tags: ["一级建造师", "市政"], hot: true, postedAt: "2026-05-27" },
  { id: "J002", title: "首席设计师", enterprise: "雅舍设计事务所", enterpriseId: "e003",
    category: "design", type: "全职", salaryMin: 20, salaryMax: 40, district: "平桥区",
    experience: "8-15 年", education: "本科", tags: ["原木风", "软装", "高端住宅"], hot: true, postedAt: "2026-05-25" },
  { id: "J003", title: "整装家装设计师", enterprise: "名家装饰", enterpriseId: "e002",
    category: "decor", type: "全职", salaryMin: 8, salaryMax: 18, district: "羊山新区",
    experience: "2-5 年", education: "大专", tags: ["家装", "酷家乐", "谈单"], postedAt: "2026-05-26" },
  { id: "J004", title: "BIM 工程师", enterprise: "中恒建设集团信阳分公司", enterpriseId: "e004",
    category: "build", type: "全职", salaryMin: 10, salaryMax: 18, district: "浉河区",
    experience: "3-5 年", education: "本科", tags: ["BIM", "Revit", "土建"], postedAt: "2026-05-22" },
  { id: "J005", title: "景观设计实习生", enterprise: "山水景观设计院", enterpriseId: "e009",
    category: "design", type: "实习", salaryMin: 4, salaryMax: 6, district: "浉河区",
    experience: "在校", education: "本科", tags: ["景观", "SketchUp", "PS"], postedAt: "2026-05-24" },
  { id: "J006", title: "装修工程监理", enterprise: "壹品装饰", enterpriseId: "e008",
    category: "decor", type: "全职", salaryMin: 8, salaryMax: 12, district: "浉河区",
    experience: "3-5 年", education: "大专", tags: ["监理", "验收"], postedAt: "2026-05-20" },
  { id: "J007", title: "软装陈列师", enterprise: "蓝色空间软装", enterpriseId: "e012",
    category: "design", type: "项目制", salaryMin: 12, salaryMax: 20, district: "羊山新区",
    experience: "3-8 年", education: "本科", tags: ["软装", "样板房"], postedAt: "2026-05-19" },
  { id: "J008", title: "施工员", enterprise: "建宇建筑工程", enterpriseId: "e007",
    category: "build", type: "全职", salaryMin: 6, salaryMax: 10, district: "罗山县",
    experience: "1-3 年", education: "大专", tags: ["土建", "六大员"], postedAt: "2026-05-18" },
];

export const CERTIFICATES = [
  { code: "JZS-2024-008712", name: "二级建造师 · 建筑工程", holder: "张某某", enterprise: "华泰建工", issued: "2024-05" },
  { code: "JZS-2023-014219", name: "一级建造师 · 市政工程",   holder: "李某某", enterprise: "中恒建设", issued: "2023-09" },
  { code: "ZSS-2024-002284", name: "高级室内设计师",         holder: "王某",   enterprise: "雅舍设计", issued: "2024-02" },
  { code: "JLY-2023-009361", name: "建筑工程监理工程师",     holder: "赵某某", enterprise: "壹品装饰", issued: "2023-11" },
];

export const TRAININGS = [
  { id: "T1", title: "2026 上半年 二级建造师考前冲刺", date: "2026-06-15", days: 5, fee: 980, seats: 40, enrolled: 27, tag: "建造师" },
  { id: "T2", title: "新版工程质量验收规范宣贯", date: "2026-06-08", days: 1, fee: 0, seats: 200, enrolled: 168, tag: "规范" },
  { id: "T3", title: "室内设计师 IFI 国际认证", date: "2026-07-01", days: 14, fee: 4800, seats: 24, enrolled: 12, tag: "设计师" },
  { id: "T4", title: "BIM 高级工程师实战工作坊", date: "2026-06-22", days: 7, fee: 2680, seats: 30, enrolled: 19, tag: "BIM" },
];
