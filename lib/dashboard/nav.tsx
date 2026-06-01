import {
  LayoutDashboard, Users2, FileCheck2, MessageSquareWarning, Library,
  Newspaper, Wallet, Sparkles, Settings, Globe2, MessagesSquare,
  Briefcase, MessageSquareHeart, Home, FileText, Umbrella,
  Hammer, ShoppingBag, Truck, FileSignature, GraduationCap, Store,
} from "lucide-react";

const I = "h-4 w-4";

export const ASSOC_NAV = [
  { href: "/dashboard/association",            label: "总览",     icon: <LayoutDashboard className={I} /> },
  { href: "/dashboard/association/members",    label: "会员审核", icon: <Users2 className={I} /> },
  { href: "/dashboard/association/reports",    label: "工装报备", icon: <FileCheck2 className={I} /> },
  { href: "/dashboard/association/mediations", label: "调解纠纷", icon: <MessageSquareWarning className={I} /> },
  { href: "/dashboard/association/training",   label: "培训管理", icon: <GraduationCap className={I} /> },
  { href: "/dashboard/association/supplies",   label: "建材超市", icon: <ShoppingBag className={I} /> },
  { href: "/dashboard/association/knowledge",  label: "知识库",   icon: <Library className={I} /> },
  { href: "/dashboard/association/news",       label: "新闻",     icon: <Newspaper className={I} /> },
  { href: "/dashboard/association/finance",    label: "金融保险", icon: <Wallet className={I} /> },
  { href: "/dashboard/association/agreements", label: "协议管理", icon: <FileSignature className={I} /> },
  { href: "/dashboard/association/ai",         label: "AI 配置",  icon: <Sparkles className={I} /> },
  { href: "/dashboard/association/settings",   label: "系统设置", icon: <Settings className={I} /> },
];

export const ENT_NAV = [
  { href: "/dashboard/enterprise",          label: "总览",       icon: <LayoutDashboard className={I} /> },
  { href: "/dashboard/enterprise/site",     label: "我的子站",   icon: <Globe2 className={I} /> },
  { href: "/dashboard/enterprise/leads",    label: "客户线索",   icon: <MessagesSquare className={I} /> },
  { href: "/dashboard/enterprise/orders",   label: "施工订单",   icon: <Hammer className={I} /> },
  { href: "/dashboard/enterprise/projects", label: "项目与报备", icon: <FileCheck2 className={I} /> },
  { href: "/dashboard/enterprise/supplies", label: "建材采购",   icon: <Truck className={I} /> },
  { href: "/dashboard/enterprise/store",    label: "我的店铺",   icon: <Store className={I} /> },
  { href: "/dashboard/enterprise/team",     label: "团队管理",   icon: <Users2 className={I} /> },
  { href: "/dashboard/enterprise/jobs",     label: "招聘",       icon: <Briefcase className={I} /> },
  { href: "/dashboard/enterprise/reviews",  label: "口碑评价",   icon: <MessageSquareHeart className={I} /> },
  { href: "/dashboard/enterprise/finance",  label: "金融保险",   icon: <Wallet className={I} /> },
  { href: "/dashboard/enterprise/ai",       label: "AI 员工",    icon: <Sparkles className={I} /> },
  { href: "/dashboard/enterprise/settings", label: "企业设置",   icon: <Settings className={I} /> },
];

/* ============================================================
   底部 5 tab — 移动 dashboard
   ⚠️ 注意：icon 用 string key 而不是 component 函数
   因为这些常量会从 server 跨到 client 组件，函数不能序列化
   client 组件用 ICON_MAP 把 key 映射回组件再渲染
   ============================================================ */

export type TabIconKey =
  | "home" | "projects" | "insurance" | "ai" | "settings"
  | "jobs" | "training" | "wallet" | "user";

export type BottomTab = {
  href: string;
  label: string;
  icon: TabIconKey;
};

export const CUSTOMER_TABS: BottomTab[] = [
  { href: "/dashboard/customer",           label: "我的",   icon: "home" },
  { href: "/dashboard/customer/projects",  label: "项目",   icon: "projects" },
  { href: "/dashboard/customer/insurance", label: "保险",   icon: "insurance" },
  { href: "/ai",                           label: "AI",     icon: "ai" },
  { href: "/dashboard/customer/settings",  label: "设置",   icon: "settings" },
];

export const PRACTITIONER_TABS: BottomTab[] = [
  { href: "/dashboard/practitioner",          label: "首页",   icon: "home" },
  { href: "/dashboard/practitioner/jobs",     label: "找活",   icon: "jobs" },
  { href: "/dashboard/practitioner/training", label: "培训",   icon: "training" },
  { href: "/dashboard/practitioner/income",   label: "钱包",   icon: "wallet" },
  { href: "/dashboard/practitioner/profile",  label: "我的",   icon: "user" },
];
