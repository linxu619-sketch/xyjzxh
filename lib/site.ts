// 站点数据 — 统一在此维护，便于后续接入 Supabase

export const SITE = {
  name: "信阳市建筑装饰装修协会",
  shortName: "信阳建装",
  brand: "XY-ASSOC",
  slogan: "让每一次装修都有协会守护",
  subSlogan:
    "汇聚 1000+ 家本地建筑、装修与设计企业 · 工装报备 · 消费保险 · AI 在线服务一站直达",
  domain: "xyjzxh.com",         // 消费者主域：xyjzxh.com
  associationHost: "xh",        // 协会门户：xh.xyjzxh.com
  tel: "0376-000-0000",
  address: "河南省信阳市浉河区行政中心",
  copyrightFrom: 2025,
};

// 协会门户（xh.xyjzxh.com）主导航 — B2B/B2小小b
export const ASSOCIATION_NAV = [
  { label: "协会首页", href: "/xh" },
  { label: "会员目录", href: "/members" },
  { label: "协会服务", href: "/services" },
  { label: "工装报备", href: "/projects" },
  { label: "建材超市", href: "/supplies" },
  { label: "从业者", href: "/practitioners" },
  { label: "金融", href: "/finance" },
  { label: "消费保险", href: "/insurance" },
  { label: "知识库", href: "/knowledge" },
  { label: "人才中心", href: "/talents" },
  { label: "新闻动态", href: "/news" },
  { label: "AI 助手", href: "/ai" },
];

// 消费者门户（xyjzxh.com）主导航 — C 端
export const CONSUMER_NAV = [
  { label: "首页", href: "/" },
  { label: "找装企", href: "/members?cat=decor" },
  { label: "案例", href: "/members?cat=design" },
  { label: "估价", href: "/ai/decor" },
  { label: "评价", href: "/review" },
  { label: "保险", href: "/insurance" },
  { label: "我的项目", href: "/dashboard/customer" },
];

// 兼容旧 import
export const NAV = ASSOCIATION_NAV;

// 三大品类（首页大色块）
export const CATEGORIES = [
  {
    key: "build",
    title: "建筑企业",
    en: "Construction",
    desc: "本地具备资质的建筑施工、市政、机电、装饰装修壹级二级总承包企业。",
    count: 326,
    color: "build",
    badge: "总承包 / 专业承包 / 劳务",
  },
  {
    key: "decor",
    title: "装修企业",
    en: "Decoration",
    desc: "家装、工装、整装、局装企业一网打尽，按口碑、案例、价格自由筛选。",
    count: 542,
    color: "decor",
    badge: "家装 / 工装 / 整装",
  },
  {
    key: "design",
    title: "设计公司及个人",
    en: "Design",
    desc: "签约设计公司、室内/景观/软装设计师，按风格与作品集匹配业主。",
    count: 184,
    color: "design",
    badge: "公装 / 家装 / 软装 / 景观",
  },
] as const;

// 12 大服务模块
export const SERVICES = [
  { key: "service", title: "协会服务", desc: "入会 · 资质认证 · 培训 · 调解 · 年检", color: "brand" },
  { key: "tenant", title: "企业子站", desc: "二级域名 · 独立品牌页 · 在线接单", color: "brand" },
  { key: "construction", title: "施工全流程", desc: "咨询 · 签约 · 计划 · 验收 · 收款 · 变更", color: "build" },
  { key: "supplies", title: "建材超市", desc: "协会集采 · 分层定价 · 会员专属价", color: "tea" },
  { key: "projects", title: "工装报备", desc: "项目登记 · 施工备案 · 验收上传", color: "build" },
  { key: "finance", title: "金融服务", desc: "贷款 · 保函 · 保理 · 设备分期", color: "design" },
  { key: "insurance", title: "消费保险", desc: "家装质保险 · 工程履约险 · 工人意外险", color: "decor" },
  { key: "knowledge", title: "知识库", desc: "国标规范 · 政策法规 · 技术资料 · 案例", color: "tea" },
  { key: "talents", title: "人才中心", desc: "招聘 · 求职 · 证书查询 · 培训报名", color: "yellow" },
  { key: "review", title: "口碑评价", desc: "实名评价 · 投诉跟踪 · 双向打分", color: "decor" },
  { key: "news", title: "新闻动态", desc: "行业新闻 · 政策解读 · 协会公告", color: "design" },
  { key: "ai", title: "AI 助手矩阵", desc: "10 位 AI 员工 · 全场景在线服务", color: "build" },
];

// AI 员工矩阵（≤10 个）
// face: member=面向企业/从业者(bp) · consumer=面向业主(C) · both=两端通用
export const AI_EMPLOYEES = [
  { key: "advisor", name: "小协", role: "协会咨询官", duty: "入会 · 政策 · 资质", color: "brand", emoji: "🤝", face: "member" },
  { key: "decor", name: "小装", role: "装修顾问", duty: "选企业 · 估价 · 看案例", color: "decor", emoji: "🛋", face: "consumer" },
  { key: "design", name: "小设", role: "设计助手", duty: "户型 · 风格 · 配色", color: "design", emoji: "✏️", face: "consumer" },
  { key: "fin", name: "小金", role: "金融顾问", duty: "贷款 · 保函 · 撮合", color: "tea", emoji: "💼", face: "member" },
  { key: "ins", name: "小保", role: "保险顾问", duty: "险种 · 投保 · 理赔", color: "yellow", emoji: "🛡", face: "both" },
  { key: "report", name: "小报", role: "工装报备助手", duty: "填报 · 合规 · 跟进", color: "build", emoji: "📑", face: "member" },
  { key: "know", name: "小知", role: "知识库导航员", duty: "规范 · 标准 · 案例检索", color: "design", emoji: "📚", face: "member" },
  { key: "hr", name: "小才", role: "招聘匹配官", duty: "人岗匹配 · 简历优化", color: "tea", emoji: "🧑‍🔧", face: "member" },
  { key: "mediate", name: "小和", role: "调解助手", duty: "投诉初筛 · 调解导流", color: "decor", emoji: "⚖️", face: "both" },
  { key: "biz", name: "小经", role: "企业经营助手", duty: "BI · 客户管理 · 后台答疑", color: "brand", emoji: "📊", face: "member" },
] as const;

// 首页新闻（示例）
export const NEWS = [
  {
    tag: "协会公告",
    date: "2026-05-28",
    title: "关于发布《信阳市住宅装饰装修工程质量验收规范（2026版）》的通知",
    excerpt: "新版规范在防水、电气、消防三方面强化标准，6月1日起正式实施。",
    color: "build",
  },
  {
    tag: "政策解读",
    date: "2026-05-22",
    title: "全省工装报备实现\"一网通办\"，信阳成为首批试点",
    excerpt: "协会平台与省厅系统打通，企业一次填报即可同步省级监管。",
    color: "decor",
  },
  {
    tag: "行业新闻",
    date: "2026-05-15",
    title: "2026 信阳建博会启动报名 — AI 与绿色建造成主题",
    excerpt: "会展同期开放协会专属展区，会员企业享受 5 折展位。",
    color: "design",
  },
];
