// 工装报备 mock 数据
export type ProjectStatus = "draft" | "submitted" | "reviewing" | "approved" | "in-progress" | "completed";

export type ProjectReport = {
  id: string;
  name: string;
  type: "家装" | "工装" | "公装" | "市政";
  enterprise: string;
  enterpriseId: string;
  area: number;          // ㎡
  budget: number;        // 万元
  district: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;      // 0-100
  insured: boolean;
  reportedAt: string;
};

export const STATUS_META: Record<ProjectStatus, { label: string; tone: string }> = {
  draft:       { label: "草稿",   tone: "neutral" },
  submitted:   { label: "已提交", tone: "brand" },
  reviewing:   { label: "审核中", tone: "yellow" },
  approved:    { label: "已通过", tone: "tea" },
  "in-progress":{ label: "施工中", tone: "decor" },
  completed:   { label: "已竣工", tone: "design" },
};

export const PROJECTS: ProjectReport[] = [
  { id: "P-2026-0501", name: "金茂悦府 12 栋整装", type: "家装", enterprise: "名家装饰", enterpriseId: "e002",
    area: 168, budget: 32, district: "浉河区", startDate: "2026-05-20", endDate: "2026-08-15",
    status: "in-progress", progress: 42, insured: true, reportedAt: "2026-05-12" },
  { id: "P-2026-0498", name: "茶都商务大厦办公装修", type: "工装", enterprise: "壹品装饰", enterpriseId: "e008",
    area: 2400, budget: 280, district: "羊山新区", startDate: "2026-04-10", endDate: "2026-09-30",
    status: "in-progress", progress: 68, insured: true, reportedAt: "2026-04-01" },
  { id: "P-2026-0492", name: "万象城海底捞餐饮空间", type: "公装", enterprise: "远景空间设计", enterpriseId: "e006",
    area: 860, budget: 156, district: "羊山新区", startDate: "2026-05-01", endDate: "2026-07-20",
    status: "approved", progress: 12, insured: false, reportedAt: "2026-04-22" },
  { id: "P-2026-0487", name: "息县乡村振兴示范小区", type: "市政", enterprise: "华泰建工", enterpriseId: "e001",
    area: 18000, budget: 4200, district: "息县", startDate: "2026-03-15", endDate: "2027-02-28",
    status: "in-progress", progress: 28, insured: true, reportedAt: "2026-03-01" },
  { id: "P-2026-0476", name: "御景湾别墅软装升级", type: "家装", enterprise: "雅舍设计事务所", enterpriseId: "e003",
    area: 320, budget: 86, district: "平桥区", startDate: "2026-02-10", endDate: "2026-05-20",
    status: "completed", progress: 100, insured: true, reportedAt: "2026-01-28" },
  { id: "P-2026-0512", name: "信阳茶博园景观二期", type: "公装", enterprise: "山水景观设计院", enterpriseId: "e009",
    area: 5600, budget: 680, district: "浉河区", startDate: "2026-06-01", endDate: "2026-12-30",
    status: "reviewing", progress: 0, insured: true, reportedAt: "2026-05-26" },
  { id: "P-2026-0508", name: "光山县中医院门诊楼装修", type: "工装", enterprise: "万家美装饰", enterpriseId: "e010",
    area: 3200, budget: 420, district: "光山县", startDate: "2026-05-25", endDate: "2026-10-20",
    status: "submitted", progress: 0, insured: false, reportedAt: "2026-05-25" },
];

export function getProject(id: string) {
  return PROJECTS.find((p) => p.id === id);
}
