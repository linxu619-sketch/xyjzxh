import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Newspaper, Building2, UserRound,
  FileCheck2, ShoppingBag, Wallet, Umbrella, Library, GraduationCap,
  Globe2, CalendarDays, Star, ShieldCheck, Sparkles, ChevronRight,
  HardHat, HeartHandshake,
  LayoutDashboard, Users2, MessageSquareWarning, MessagesSquare, Hammer, Briefcase, Clock,
  Flag,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listApplications, getLatestApplicationByPhone } from "@/lib/data/applications";
import { listReports } from "@/lib/data/reports";
import { listMediations } from "@/lib/data/mediations";
import { listLeadsByEnterprise } from "@/lib/data/leads";
import { listOpenJobs } from "@/lib/data/jobs";
import { listByStatus, reconcileBuyer } from "@/lib/data/supplies-source";
import { listOrdersByEnterprise } from "@/lib/data/orders-source";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Numbers } from "@/components/sections/numbers";
import { AiTeam } from "@/components/sections/ai-team";
import { SITE } from "@/lib/site";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listPublished } from "@/lib/data/news-source";
import { listOpenTrainings } from "@/lib/data/training";
import { cn } from "@/lib/cn";

function fmtDate(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const metadata = {
  title: "会员之家 · 信阳市建筑装饰装修协会",
  description:
    "信阳市建筑装饰装修协会官方会员平台 — 面向企业会员与个人会员，提供入会、协会公告、工装报备、建材集采、金融保险、培训认证、知识库与 AI 助手等服务与交流。",
};

// —— 会员办事大厅 ——
const MEMBER_SERVICES = [
  { icon: HeartHandshake, t: "协会服务", d: "认证 · 报备 · 纠纷调解", href: "/services", tone: "brand" },
  { icon: FileCheck2, t: "工装报备", d: "项目登记 · 省厅直连", href: "/projects", tone: "build" },
  { icon: Building2, t: "会员目录", d: "企业 / 个人会员名录", href: "/members", tone: "brand" },
  { icon: HardHat, t: "从业者", d: "工长 · 设计师 · 监理", href: "/practitioners", tone: "design" },
  { icon: ShoppingBag, t: "建材集采", d: "协会集采 · 分层定价", href: "/supplies", tone: "tea" },
  { icon: Wallet, t: "金融服务", d: "建装贷 · 保函 · 分期", href: "/finance", tone: "design" },
  { icon: Umbrella, t: "保险保障", d: "工程险 · 工伤意外险", href: "/insurance", tone: "decor" },
  { icon: Library, t: "知识库", d: "规范 · 标准 · 案例", href: "/knowledge", tone: "tea" },
  { icon: GraduationCap, t: "人才 · 培训", d: "招聘 · 继续教育 · 证书", href: "/talents", tone: "yellow" },
  { icon: Globe2, t: "企业子站", d: "二级域名独立品牌页", href: "/tenant", tone: "brand" },
];

// —— 会员登录态：各角色工作台快捷入口 ——
const MEMBER_HOME: Record<string, {
  label: string; dashboard: string;
  tiles: { key: string; icon: React.ComponentType<{ className?: string }>; t: string; d: string; href: string; tone: string }[];
}> = {
  association: {
    label: "协会工作台", dashboard: "/dashboard/association",
    tiles: [
      { key: "members", icon: Users2, t: "会员审核", d: "入会申请待处理", href: "/dashboard/association/members", tone: "brand" },
      { key: "reports", icon: FileCheck2, t: "工装报备", d: "报备审批", href: "/dashboard/association/reports", tone: "build" },
      { key: "mediations", icon: MessageSquareWarning, t: "调解纠纷", d: "投诉与调解", href: "/dashboard/association/mediations", tone: "decor" },
      { key: "supplies", icon: ShoppingBag, t: "建材超市", d: "上架审核 · 对账", href: "/dashboard/association/supplies", tone: "tea" },
    ],
  },
  enterprise: {
    label: "企业工作台", dashboard: "/dashboard/enterprise",
    tiles: [
      { key: "site", icon: Globe2, t: "我的子站", d: "编辑品牌页", href: "/dashboard/enterprise/site", tone: "brand" },
      { key: "leads", icon: MessagesSquare, t: "客户线索", d: "接收与跟进", href: "/dashboard/enterprise/leads", tone: "build" },
      { key: "orders", icon: Hammer, t: "施工订单", d: "进度与验收", href: "/dashboard/enterprise/orders", tone: "decor" },
      { key: "supplies", icon: ShoppingBag, t: "建材采购", d: "集采 · 我的店铺", href: "/dashboard/enterprise/supplies", tone: "tea" },
    ],
  },
  practitioner: {
    label: "从业者工作台", dashboard: "/dashboard/practitioner",
    tiles: [
      { key: "jobs", icon: Briefcase, t: "找活", d: "招聘与对接", href: "/dashboard/practitioner/jobs", tone: "build" },
      { key: "training", icon: GraduationCap, t: "培训", d: "继续教育 · 证书", href: "/dashboard/practitioner/training", tone: "design" },
      { key: "income", icon: Wallet, t: "钱包", d: "收入与提现", href: "/dashboard/practitioner/income", tone: "tea" },
      { key: "profile", icon: UserRound, t: "我的资料", d: "认证主页 / 名片", href: "/dashboard/practitioner/profile", tone: "brand" },
    ],
  },
};

const TONE_SOFT: Record<string, string> = {
  brand: "bg-brand-50 text-brand",
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
  tea: "bg-[#e6f7f1] text-accent-tea",
  yellow: "bg-[#fff6d6] text-[#a37200]",
};

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
};

// 协会门户（xh.xyjzxh.com）首页 — 面向会员（企业会员 + 个人会员）的服务与交流平台
// 内容优先排序：Hero → 办事大厅 → 资讯中心 → 活动培训 → 会员风采 → 数据墙 → 入会引导 → AI
export default async function AssociationHome() {
  const FEATURED = (await getEnterprises()).filter((e) => e.featured).slice(0, 6);
  const notices = listPublished().slice(0, 6);
  const trainings = listOpenTrainings().slice(0, 3);
  const session = await getSession();
  const roleKey = session?.role === "system_admin" ? "association" : (session?.role ?? "");
  const home = !session?.pending ? MEMBER_HOME[roleKey] : undefined;
  // 入会进度横幅：session.pending 对「审核中」与「已驳回」都为真，需读真实申请状态区分，避免把驳回误报为审核中
  const pendingApp = session?.pending ? getLatestApplicationByPhone(session.phone) : undefined;
  const appRejected = pendingApp?.status === "rejected";

  // 真实数据：badges = 红点待办；infos = 中性数字文案
  let badges: Record<string, number> = {};
  let infos: Record<string, string> = {};
  if (home && session) {
    if (roleKey === "association") {
      badges = {
        members: listApplications("pending").length,
        reports: listReports("pending").length,
        mediations: listMediations("pending").length,
        supplies: listByStatus("pending").length,
      };
    } else if (roleKey === "enterprise" && session.enterpriseId) {
      const eid = session.enterpriseId;
      badges = {
        leads: listLeadsByEnterprise(eid).filter((l) => l.status === "new").length,
        orders: listOrdersByEnterprise(eid).filter((o) => o.stage !== "accepted").length,
        supplies: reconcileBuyer("enterprise", eid).overdueCount,
      };
    } else if (roleKey === "practitioner") {
      infos = {
        jobs: `${listOpenJobs().length} 个在招`,
        training: `${listOpenTrainings().length} 门课程`,
      };
    }
  }

  return (
    <>
      {/* HERO — 会员之家（精简，仅身份与信任标识） */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" aria-hidden />
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-brand/15 blur-3xl" aria-hidden />
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-cat-build/15 blur-3xl" aria-hidden />

        <Container className="relative pt-8 md:pt-14 pb-8 md:pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border px-3 py-1 text-[11px] mb-6 shadow-sm">
              <Badge tone="brand" className="!px-2 !py-0">会员之家</Badge>
              <span className="text-muted-foreground">服务企业会员与个人会员 · 行业交流平台</span>
            </div>
            <h1 className="text-[34px] sm:text-[44px] md:text-[64px] font-semibold tracking-tight leading-[1.05]">
              {SITE.shortName}<span className="text-gradient-brand">会员之家</span>
            </h1>
            <p className="mt-5 md:mt-6 text-[14px] md:text-[18px] leading-7 md:leading-8 text-muted-foreground max-w-2xl">
              {SITE.name}官方会员平台 — 面向<b className="text-foreground">企业会员</b>与<b className="text-foreground">个人会员</b>的一站式服务与行业交流:一套账号,办事、获客、集采、金融、培训一次到位（下方办事大厅直达）。
            </p>
            <div className="mt-5 md:mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 协会认证</span>
              <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-cat-build" /> 报备直连省厅</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-cat-decor" /> 会员 AI 助手</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 入会进度 —— 区分审核中 / 已驳回，提示进度页 */}
      {session?.pending && (
        <section className={`border-b border-border ${appRejected ? "bg-cat-decor-soft/60" : "bg-[#fff6d6]/60"}`}>
          <Container className="py-3">
            <Link href="/dashboard/pending" className={`flex items-center gap-2 text-[13px] font-medium ${appRejected ? "text-cat-decor" : "text-[#a37200]"}`}>
              <Clock className="h-4 w-4 shrink-0" />
              <span className="flex-1 min-w-0">{appRejected ? "您的入会申请未通过 · 点击查看详情并可补料重提" : "您的入会申请审核中 · 点击查看审核进度"}</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </Link>
          </Container>
        </section>
      )}

      {/* 会员登录态：工作台快捷入口（仅已通过审核的会员/工作人员可见）*/}
      {home && session && (
        <section className="border-b border-border bg-surface">
          <Container className="py-4 md:py-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-[14px] md:text-[15px] font-semibold tracking-tight">
                欢迎回来，{session.name} 👋
              </div>
              <Link href={home.dashboard} className="text-[12px] text-brand inline-flex items-center gap-0.5 shrink-0">
                进入{home.label} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {home.tiles.map((s) => {
                const Icon = s.icon;
                const n = badges[s.key] ?? 0;
                const sub = n > 0 ? `${n} 项待处理` : (infos[s.key] ?? s.d);
                return (
                  <Link key={s.t} href={s.href} className="group relative rounded-2xl border border-border bg-background p-3.5 flex items-center gap-2.5 active:scale-[0.98] transition-transform">
                    <span className={cn("relative h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0", TONE_SOFT[s.tone])}>
                      <Icon className="h-4 w-4" />
                      {n > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-cat-decor text-white text-[10px] font-semibold inline-flex items-center justify-center ring-2 ring-background">
                          {n > 99 ? "99+" : n}
                        </span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold truncate">{s.t}</div>
                      <div className={cn("text-[11px] truncate", n > 0 ? "text-cat-decor font-medium" : "text-muted-foreground")}>{sub}</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* 会员办事大厅 —— 会员最高频，功能入口前置 */}
      <section id="services" className="py-8 md:py-12 scroll-mt-16">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-12">
            <div className="max-w-2xl">
              <div className="text-[12px] tracking-[0.2em] text-cat-decor uppercase font-medium">SERVICES · 会员服务</div>
              <h2 className="mt-2 text-[26px] md:text-[40px] font-semibold tracking-tight">会员办事大厅</h2>
            </div>
            <p className="text-[13px] md:text-[15px] text-muted-foreground max-w-md">入会、报备、集采、金融、培训、知识与 AI — 一处入口、一套账号、一次到位。</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            {MEMBER_SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.t} href={s.href} className="group relative overflow-hidden rounded-2xl bg-background p-4 md:p-6 ring-1 ring-border transition-all active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-md">
                  <div className={cn("inline-flex h-10 md:h-11 w-10 md:w-11 items-center justify-center rounded-xl", TONE_SOFT[s.tone])}>
                    <Icon className="h-4 md:h-5 w-4 md:w-5" />
                  </div>
                  <div className="mt-3 md:mt-4 text-[13px] md:text-[15px] font-semibold tracking-tight">{s.t}</div>
                  <div className="mt-1 text-[11px] md:text-[12px] text-muted-foreground leading-4 md:leading-5">{s.d}</div>
                  <ArrowUpRight className="absolute top-3 md:top-5 right-3 md:right-5 h-3.5 md:h-4 w-3.5 md:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 党建引领 —— 卡片形式，低调融入（介于办事大厅与资讯之间）*/}
      <section className="pb-2 md:pb-4">
        <Container>
          <Link href="/cpc" className="group flex items-center gap-4 md:gap-5 rounded-3xl border border-party/20 bg-party-soft p-5 md:p-6 transition-all md:hover:shadow-md md:hover:-translate-y-0.5">
            <span className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-party text-white inline-flex items-center justify-center shrink-0">
              <Flag className="h-6 w-6 md:h-7 md:w-7" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] tracking-[0.18em] uppercase text-party font-medium">党的建设</div>
              <div className="mt-0.5 text-[15px] md:text-[17px] font-semibold tracking-tight">党建引领行业高质量发展</div>
              <div className="text-[12px] md:text-[13px] text-muted-foreground mt-0.5 truncate">支部概况 · 党建动态 · 理论学习 · 三会一课</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[13px] font-medium text-party shrink-0">
              <span className="hidden sm:inline">进入专栏</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </Link>
        </Container>
      </section>

      {/* 资讯中心 —— 公告通知 + 行业新闻合并（同源 listPublished，去重展示） */}
      <section className="py-8 md:py-12 bg-surface">
        <Container>
          <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
              <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium inline-flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5" /> INFO · 资讯中心
              </div>
              <h2 className="mt-2 text-[26px] md:text-[40px] font-semibold tracking-tight">公告 · 政策 · 行业动态</h2>
            </div>
            <Link href="/news" className="text-[13px] text-brand shrink-0">查看全部 →</Link>
          </div>
          <div className="rounded-3xl border border-border bg-background divide-y divide-border overflow-hidden">
            {notices.length === 0 ? (
              <div className="px-6 py-10 text-center text-[13px] text-muted-foreground">暂无资讯。</div>
            ) : notices.map((a) => (
              <Link key={a.id} href={`/news/${a.id}`} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-surface transition-colors group">
                <Badge tone="brand" className="!px-2 !py-0.5 shrink-0">{a.category}</Badge>
                <span className="flex-1 min-w-0 truncate text-[14px] md:text-[15px] group-hover:text-brand transition-colors">{a.title}</span>
                <span className="text-[12px] text-muted-foreground shrink-0 tabular-nums">{fmtDate(a.createdAt)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 协会活动 & 培训 */}
      <section className="py-8 md:py-12">
        <Container>
          <div className="flex items-end justify-between gap-4 mb-6 md:mb-10">
            <div>
              <div className="text-[12px] tracking-[0.2em] text-cat-design uppercase font-medium inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> EVENTS · 活动培训
              </div>
              <h2 className="mt-2 text-[26px] md:text-[40px] font-semibold tracking-tight">近期活动与培训</h2>
            </div>
            <Link href="/dashboard/practitioner/training" className="text-[13px] text-brand shrink-0">培训报名 →</Link>
          </div>
          {trainings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-background p-10 text-center text-[13px] text-muted-foreground">暂无在招课程。协会发布培训后会在此展示。</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {trainings.map((t) => (
                <div key={t.id} className="rounded-3xl border border-border bg-background p-5 md:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-cat-design-soft text-cat-design inline-flex items-center justify-center">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <Badge tone="design" className="!px-2 !py-0.5">{t.category}</Badge>
                    <span className="ml-auto text-[11px] text-muted-foreground">{t.fee}</span>
                  </div>
                  <div className="mt-4 text-[15px] font-semibold tracking-tight leading-snug line-clamp-2">{t.title}</div>
                  <div className="mt-2 text-[12px] text-muted-foreground">{t.schedule || "时间待定"}{t.location ? ` · ${t.location}` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* 会员风采 */}
      <section className="py-8 md:py-12 bg-surface">
        <Container>
          <div className="flex items-end justify-between gap-4 mb-6 md:mb-10">
            <div>
              <div className="text-[12px] tracking-[0.2em] text-cat-build uppercase font-medium">MEMBERS · 会员风采</div>
              <h2 className="mt-2 text-[26px] md:text-[40px] font-semibold tracking-tight">优秀会员单位</h2>
            </div>
            <Link href="/members" className="text-[13px] text-brand shrink-0">全部会员 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {FEATURED.map((e) => (
              <Link key={e.id} href={`/members/${e.slug}`} className="group rounded-3xl border border-border bg-background p-5 hover:shadow-md transition-all md:hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <span className={cn("h-12 w-12 rounded-2xl text-white inline-flex items-center justify-center font-semibold", BG[e.color] ?? "bg-brand")}>
                    {e.hero.brand.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold truncate">{e.name}</div>
                    <div className="text-[11px] text-muted-foreground">{e.district} · {e.staff}</div>
                  </div>
                </div>
                <div className="mt-3 text-[13px] text-muted-foreground line-clamp-2">{e.short}</div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px]">
                  <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" /><span className="font-semibold">{e.rating.toFixed(1)}</span><span className="text-muted-foreground">({e.reviews})</span></span>
                  <span className="text-muted-foreground">{e.cases} 案例</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 数据墙 —— 规模佐证，靠后展示 */}
      <Numbers />

      {/* 两类会员入会引导 —— 放最后，顶栏已有「申请入会」常驻入口 */}
      <section id="join" className="py-8 md:py-12 bg-surface scroll-mt-16">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
            <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium">MEMBERSHIP · 会员通道</div>
            <h2 className="mt-2 text-[26px] md:text-[40px] font-semibold tracking-tight">两类会员，各得其所</h2>
            <p className="mt-3 text-[14px] text-muted-foreground">企业以单位入会，专业个人以个人身份入会 — 权益与服务各有侧重。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <MemberCard
              icon={Building2}
              tone="build"
              title="企业会员"
              who="建筑施工 · 装饰装修 · 设计公司"
              perks={["二级域名子站 · 在线接单", "工装报备直通省厅", "流量分发与协会认证", "建材集采 · 金融保险优惠", "企业经营后台 + AI 员工"]}
            />
            <MemberCard
              icon={UserRound}
              tone="design"
              title="个人会员"
              who="独立设计师 · 项目经理 · 监理 · 独立工长"
              perks={["协会认证个人主页 / 名片", "专业认证徽章背书", "项目对接与接单", "工伤 / 意外保险保障", "培训、继续教育与证书"]}
            />
          </div>
        </Container>
      </section>

      {/* 面向会员的 AI 助手 */}
      <AiTeam />
    </>
  );
}

function MemberCard({
  icon: Icon, tone, title, who, perks,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "build" | "design";
  title: string; who: string; perks: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-background p-6 md:p-8 flex flex-col">
      <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-90 bg-gradient-to-br",
        tone === "build" ? "from-cat-build to-[#0e44c9]" : "from-cat-design to-[#6d3df0]")} />
      <div className="relative">
        <span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white",
          tone === "build" ? "bg-cat-build" : "bg-cat-design")}>
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-[24px] md:text-[28px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{who}</p>
      </div>
      <ul className="relative mt-5 space-y-2 flex-1">
        {perks.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[13px] md:text-[14px]">
            <ShieldCheck className="h-4 w-4 text-accent-tea mt-0.5 shrink-0" /> {p}
          </li>
        ))}
      </ul>
      <div className="relative mt-6 text-[12px] text-muted-foreground inline-flex items-center gap-1">
        <ArrowRight className="h-3.5 w-3.5 text-brand" /> 点右上角「申请入会」选择「{title}」提交
      </div>
    </div>
  );
}
