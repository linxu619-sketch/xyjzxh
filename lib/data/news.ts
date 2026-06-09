// 新闻动态 mock 数据
export type NewsItem = {
  id: string;
  category: "党建" | "协会公告" | "政策解读" | "行业新闻" | "会员动态" | "活动通知";
  title: string;
  excerpt: string;
  date: string;
  author?: string;
  views: number;
  hot?: boolean;
  color: "build" | "decor" | "design" | "brand" | "tea" | "party";
};

export const NEWS_ITEMS: NewsItem[] = [
  { id: "N001", category: "协会公告", color: "build", date: "2026-05-28", views: 2840, hot: true,
    title: "关于发布《信阳市住宅装饰装修工程质量验收规范（2026版）》的通知",
    excerpt: "新版规范在防水、电气、消防三方面强化标准，6 月 1 日起正式实施。会员单位应在 5 日内组织学习并完成现场对照。",
    author: "协会秘书处" },
  { id: "N002", category: "政策解读", color: "decor", date: "2026-05-22", views: 1986, hot: true,
    title: "全省工装报备实现\"一网通办\"，信阳成为首批试点",
    excerpt: "协会平台与省厅系统打通，企业一次填报即可同步省级监管，预计节约 70% 重复填报工时。",
    author: "技术委员会" },
  { id: "N003", category: "行业新闻", color: "design", date: "2026-05-15", views: 1648,
    title: "2026 信阳建博会启动报名 — AI 与绿色建造成主题",
    excerpt: "会展同期开放协会专属展区，会员企业享受 5 折展位，新增 AI 装修体验馆。" },
  { id: "N004", category: "活动通知", color: "brand", date: "2026-05-12", views: 1024,
    title: "5 月 30 日 · 协会高级会员季度交流会",
    excerpt: "本期主题：AI 在装修营销中的落地。地点：协会四楼大会议室。" },
  { id: "N005", category: "会员动态", color: "tea", date: "2026-05-09", views: 826,
    title: "华泰建工承建的茶博园景观二期工程顺利封顶",
    excerpt: "茶博园景观二期采用低碳混凝土与本地茶叶残渣再生骨料，绿色建造一体化样板。" },
  { id: "N006", category: "政策解读", color: "decor", date: "2026-05-04", views: 612,
    title: "财政部、住建部联合发文，家装质保险纳入消费券支持范围",
    excerpt: "信阳率先试点 — 业主购买协会版安心家装险可叠加 100 元消费券。" },
  { id: "N007", category: "协会公告", color: "build", date: "2026-04-28", views: 504,
    title: "2026 第二批会员入会公示（共 23 家）",
    excerpt: "公示期 7 天，对名单有异议者可通过协会秘书处或 AI 小协反馈。" },
  { id: "N008", category: "行业新闻", color: "design", date: "2026-04-21", views: 482,
    title: "信阳市文旅厅与协会签订战略合作 — 茶旅民宿设计师培养计划启动",
    excerpt: "三年内培养 200 名本地茶旅民宿设计师，协会负责课程与认证。" },
];

export function getNews(id: string) {
  return NEWS_ITEMS.find((n) => n.id === id);
}
