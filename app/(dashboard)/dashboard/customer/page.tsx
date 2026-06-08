import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Umbrella, MessageSquareHeart, MessageSquareWarning, Sparkles,
  ChevronRight, ChevronLeft, ShieldCheck, ArrowUpRight, Camera,
  AlertCircle, CheckCircle2, Wallet, GitPullRequest, MessagesSquare,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { ORDER_DEMO } from "@/lib/data/orders";
import { listReviewsByUid } from "@/lib/data/reviews";
import { listLeadsForCustomer } from "@/lib/data/leads";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listMediationsByUid } from "@/lib/data/mediations";
import { CUSTOMER_TABS } from "@/lib/dashboard/nav";
import { CustomerBottomNav } from "@/components/dashboard/customer-bottom-nav";
import { ResignBanner } from "@/components/agreements/resign-banner";


const MED_STATUS: Record<string, string> = { pending: "待受理", accepted: "受理中", closed: "已结案", rejected: "已驳回" };

export const metadata = { title: "我的 · 信阳市建筑装饰装修协会" };

export default async function CustomerDashboard() {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    redirect("/login?role=customer");
  }

  const myReviews = listReviewsByUid(session.uid);
  const myMediations = listMediationsByUid(session.uid);
  const myRequests = listLeadsForCustomer(session.uid, session.phone);
  // 真实信号：有「已签约」线索才视为有进行中的装修项目（真实排期系统接入前，详情仍用演示数据并明确标注）
  const hasProject = myRequests.some((l) => l.status === "signed");

  // 最近活动：由真实评价 / 调解 / 需求生成（无则隐藏）
  const fmtDay = (ts: number) => { const d = new Date(ts); return `${d.getMonth() + 1} 月 ${d.getDate()} 日`; };
  const activity = [
    ...myReviews.map((r) => ({ t: `评价了「${r.enterprise || "装修企业"}」 ${r.rating}★`, ts: r.createdAt, tag: "评价", color: "design" as const })),
    ...myMediations.map((m) => ({ t: `发起调解 · ${m.respondent || "纠纷"}（${MED_STATUS[m.status] ?? "处理中"}）`, ts: m.createdAt, tag: "调解", color: "decor" as const })),
    ...myRequests.map((l) => ({ t: `提交装修需求${l.type ? ` · ${l.type}` : ""}`, ts: l.createdAt, tag: "需求", color: "brand" as const })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 5);

  const o = ORDER_DEMO; // 仅用于空态「查看装修管理演示」入口（明确标注）
  // 施工管理（验收/变更/付款）实时数据系统尚未接入：不展示伪造待办。
  const pendingAcc = 0, pendingChg = 0, pendingPay = 0, pending = 0;
  // 本人真实已签约项目
  const signedLeads = myRequests.filter((l) => l.status === "signed");
  const ents = hasProject ? await getEnterprises() : [];
  const entName = (id: string) => ents.find((e) => e.id === id || e.slug === id)?.name ?? "协会会员企业";
  const proj = signedLeads[0];

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* hero */}
      <div className="bg-foreground text-background pt-10 pb-24 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-cat-decor/35 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-cat-design/15 blur-2xl" />

        <Container className="relative max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-1 text-[12px] text-background/70 hover:text-background mb-5">
            <ChevronLeft className="h-3.5 w-3.5" /> 返回信阳建装首页
          </Link>
          <div className="flex items-center gap-3">
            <span className="h-12 w-12 rounded-full bg-gradient-to-br from-cat-decor to-[#e6531f] text-white inline-flex items-center justify-center text-[18px] font-semibold shadow-lg">
              {session.name.slice(0, 1)}
            </span>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold">{session.name}</div>
              <div className="text-[11px] text-background/70">协会业主{session.phone ? ` · ID C${session.phone.slice(-6)}` : ""}</div>
            </div>
          </div>

          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-[11px]">
            <ShieldCheck className="h-3 w-3 text-accent-yellow" /> 协会消费保护 · 装修纠纷 14 天调解兜底
          </div>
        </Container>
      </div>

      <Container className="max-w-2xl -mt-16 relative space-y-3">
        {/* 协议待重签横幅 —— 暂无真实「版本变更需重签」检测，无待重签时不显示（接入后传真实列表即可）*/}
        <ResignBanner pending={[]} href="/dashboard/resign" />

        {/* 待办横幅（仅有进行中项目时）*/}
        {hasProject && pending > 0 && (
          <Link
            href={`/dashboard/customer/projects/${o.id}`}
            className="block rounded-3xl bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-4 shadow-lg active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 rounded-2xl bg-white/20 inline-flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
                <span className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-40" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold">您有 {pending} 项待办</div>
                <div className="text-[11px] text-white/80 mt-0.5">
                  {pendingAcc > 0 && `${pendingAcc} 项验收 · `}
                  {pendingChg > 0 && `${pendingChg} 项变更 · `}
                  {pendingPay > 0 && `${pendingPay} 笔付款`}
                  {pendingAcc + pendingChg + pendingPay === 0 && "全部已处理"}
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </div>
          </Link>
        )}

        {/* 当前项目卡 —— 有进行中项目才显示；否则引导开始装修 */}
        {!hasProject ? (
          <div className="rounded-3xl bg-background border border-border p-5 shadow-sm">
            <div className="text-[11px] tracking-widest text-muted-foreground uppercase mb-2">MY PROJECT</div>
            <div className="text-[16px] font-semibold tracking-tight">还没有进行中的装修项目</div>
            <p className="text-[12px] text-muted-foreground mt-1 leading-5">发布需求或用 AI 估价匹配协会认证企业，签约后这里会显示施工进度、验收与付款。</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/ai/decor" className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-[0.98]"><Sparkles className="h-4 w-4 text-accent-yellow" /> AI 估价</Link>
              <Link href="/members" className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface">找企业</Link>
              <Link href={`/dashboard/customer/projects/${o.id}`} className="h-10 px-3 rounded-full text-[12px] text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">查看装修管理演示 <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        ) : (
        <Link
          href="/dashboard/customer/projects"
          className="block rounded-3xl bg-background border border-border p-5 shadow-sm active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] tracking-widest text-muted-foreground uppercase">MY PROJECT</div>
            <Badge tone="tea">已签约</Badge>
          </div>
          <div className="text-[18px] font-semibold tracking-tight">{proj?.type || "装修项目"}{proj?.area ? ` · ${proj.area}㎡` : ""}</div>
          <div className="text-[12px] text-muted-foreground mt-1">{proj ? entName(proj.enterpriseId) : "协会会员企业"}{proj?.budget ? ` · 预算 ${proj.budget} 万` : ""}</div>
          {signedLeads.length > 1 && <div className="text-[11px] text-muted-foreground mt-1">共 {signedLeads.length} 个已签约项目</div>}
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">施工进度 / 验收 / 付款实时同步即将上线</span>
            <span className="inline-flex items-center gap-1 text-brand font-medium shrink-0">查看 <ArrowUpRight className="h-3.5 w-3.5" /></span>
          </div>
        </Link>
        )}

        {/* 4 tile 快捷 */}
        {/* 我的需求 */}
        <Link href="/dashboard/customer/requests" className="block rounded-3xl border border-border bg-background p-4 active:scale-[0.99] transition-transform">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand inline-flex items-center justify-center shrink-0"><MessagesSquare className="h-5 w-5" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold">我的需求</div>
              <div className="text-[11px] text-muted-foreground">已向企业提交 {myRequests.length} 条 · 跟踪处理进度</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Tile icon={Umbrella}              title="我的保单" sub="查看 / 投保" href="/dashboard/customer/insurance" tone="decor" />
          <Tile icon={MessageSquareHeart}    title="写评价"   sub={myReviews.length > 0 ? `${myReviews.length} 条已发布` : "完工后来打分"} href="/dashboard/customer/review" tone="design" badge={hasProject && pendingAcc > 0 ? String(pendingAcc) : undefined} />
          <Tile icon={MessageSquareWarning}  title="发起调解" sub="14 天内介入" href="/ai/mediate" tone="yellow" />
          <Tile icon={Sparkles}              title="AI 装修顾问" sub="小装 · 在线" href="/ai/decor" tone="brand" />
        </div>

        {/* 项目待办分项卡片（仅有进行中项目时）*/}
        {hasProject && pending > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[13px] font-semibold">待您处理</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {o.acceptance.filter((a) => a.status === "ready").map((a) => (
                  <Link key={a.id} href={`/dashboard/customer/projects/${o.id}#acceptance`} className="rounded-2xl border border-cat-decor/30 bg-cat-decor-soft p-4 active:scale-[0.99] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-cat-decor" />
                      <Badge tone="decor">验收待确认</Badge>
                    </div>
                    <div className="text-[14px] font-semibold">{a.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">计划于 {a.scheduledAt}</div>
                    <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-cat-decor font-medium">立即确认 <ArrowUpRight className="h-3 w-3" /></div>
                  </Link>
                ))}
                {o.changeOrders.filter((c) => c.status === "pending").map((c) => (
                  <Link key={c.id} href={`/dashboard/customer/projects/${o.id}#changes`} className="rounded-2xl border border-cat-design/30 bg-cat-design-soft p-4 active:scale-[0.99] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <GitPullRequest className="h-4 w-4 text-cat-design" />
                      <Badge tone="design">变更待批</Badge>
                    </div>
                    <div className="text-[13px] font-semibold line-clamp-2">{c.description}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">费用 {c.costDelta > 0 ? "+" : ""}¥{c.costDelta.toLocaleString()} · 工期 {c.timeDelta > 0 ? "+" : ""}{c.timeDelta}天</div>
                  </Link>
                ))}
                {o.payments.filter((p) => !p.paidAt).slice(0, 1).map((p) => (
                  <Link key={p.id} href={`/dashboard/customer/projects/${o.id}#payment`} className="rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] p-4 active:scale-[0.99] transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-accent-tea" />
                      <Badge tone="tea">下期付款</Badge>
                    </div>
                    <div className="text-[14px] font-semibold">{p.stage}</div>
                    <div className="text-[18px] font-semibold text-accent-tea mt-1">¥{p.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">应付 {p.due}</div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {/* 最近活动（真实数据，无则不显示）*/}
        {activity.length > 0 && (
          <div className="rounded-3xl bg-background border border-border">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">最近活动</h3>
            </div>
            <ul className="divide-y divide-border">
              {activity.map((a, i) => (
                <li key={i} className="px-5 py-3.5 flex items-center gap-3 active:bg-surface/60 transition-colors">
                  <Badge tone={a.color} className="!text-[10px] shrink-0">{a.tag}</Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] truncate">{a.t}</div>
                    <div className="text-[11px] text-muted-foreground">{fmtDay(a.ts)}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 推荐 */}
        <Link href="/insurance" className="block rounded-3xl bg-gradient-to-br from-foreground via-brand-600 to-brand text-white p-5 shadow-lg active:scale-[0.99] transition-transform">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-accent-yellow shrink-0" />
            <div className="flex-1">
              <div className="text-[15px] font-semibold">家装质保险 · 协会版</div>
              <div className="text-[12px] text-white/80 mt-0.5">299 起 · 10 年质保 · 企业跑路也能赔</div>
            </div>
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </Link>

        {/* 我的评价（按登录账号）*/}
        <div className="rounded-3xl border border-border bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-semibold inline-flex items-center gap-1.5"><MessageSquareHeart className="h-4 w-4 text-cat-decor" /> 我的评价</div>
            <Link href="/review" className="text-[12px] text-brand">去评价 →</Link>
          </div>
          {myReviews.length === 0 ? (
            <div className="text-[12px] text-muted-foreground py-1">还没有评价。完工后到 <Link href="/review" className="text-brand">口碑评价</Link> 给装企打分。</div>
          ) : (
            <div className="space-y-2">
              {myReviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-surface p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium truncate">{r.enterprise}</span>
                    <span className="text-[12px] text-[#FFB400] shrink-0">{"★".repeat(r.rating)}</span>
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{r.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 我的调解申请（按登录账号）*/}
        <div className="rounded-3xl border border-border bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-semibold inline-flex items-center gap-1.5"><MessageSquareWarning className="h-4 w-4 text-cat-decor" /> 我的调解申请</div>
            <Link href="/mediate" className="text-[12px] text-brand">申请调解 →</Link>
          </div>
          {myMediations.length === 0 ? (
            <div className="text-[12px] text-muted-foreground py-1">没有调解申请。遇到纠纷可到 <Link href="/mediate" className="text-brand">协会调解</Link> 提交。</div>
          ) : (
            <div className="space-y-2">
              {myMediations.map((m) => (
                <div key={m.id} className="rounded-2xl bg-surface p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium truncate">{m.respondent || "调解申请"}</span>
                    <Badge tone={m.status === "closed" ? "tea" : m.status === "rejected" ? "decor" : "yellow"}>{MED_STATUS[m.status] ?? m.status}</Badge>
                  </div>
                  <div className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{m.detail}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>

      <CustomerBottomNav tabs={CUSTOMER_TABS} />
    </div>
  );
}

function Tile({ icon: Icon, title, sub, href, tone, badge }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; sub: string; href: string;
  tone: "brand" | "build" | "decor" | "design" | "yellow";
  badge?: string;
}) {
  const TONE: Record<string, string> = {
    brand: "bg-brand-50 text-brand",
    build: "bg-cat-build-soft text-cat-build",
    decor: "bg-cat-decor-soft text-cat-decor",
    design: "bg-cat-design-soft text-cat-design",
    yellow: "bg-[#fff6d6] text-[#a37200]",
  };
  return (
    <Link href={href} className="relative rounded-2xl bg-background border border-border p-4 flex items-start gap-3 active:scale-[0.98] transition-transform">
      <span className={`h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0 ${TONE[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold truncate">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
      </div>
      {badge && (
        <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-cat-decor text-white text-[10px] font-semibold inline-flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}
