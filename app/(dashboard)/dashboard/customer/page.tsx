import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Umbrella, MessageSquareHeart, MessageSquareWarning, Sparkles,
  Bell, ChevronRight, ShieldCheck, ArrowUpRight, Camera,
  AlertCircle, CheckCircle2, Wallet, GitPullRequest,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { ORDER_DEMO } from "@/lib/data/orders";
import { listReviewsByUid } from "@/lib/data/reviews";
import { listMediationsByUid } from "@/lib/data/mediations";
import { CUSTOMER_TABS } from "@/lib/dashboard/nav";
import { CustomerBottomNav } from "@/components/dashboard/customer-bottom-nav";
import { ResignBanner } from "@/components/agreements/resign-banner";

const DEMO_RESIGNS = [
  {
    templateId: "tpl-cust-privacy",
    templateTitle: "用户隐私政策 v1.1.0",
    reason: "version_changed" as const,
    changelogPreview: "增加跨境传输章节 · AI 对话脱敏新方案",
    daysLeft: 12,
  },
];

const MED_STATUS: Record<string, string> = { pending: "待受理", accepted: "受理中", closed: "已结案", rejected: "已驳回" };

export const metadata = { title: "我的 · 信阳市建筑装饰装修协会" };

export default async function CustomerDashboard() {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    redirect("/login?role=customer");
  }

  const myReviews = listReviewsByUid(session.uid);
  const myMediations = listMediationsByUid(session.uid);

  const o = ORDER_DEMO;
  const progress = Math.round(o.schedule.reduce((a, t) => a + t.progress, 0) / o.schedule.length);
  const pendingAcc = o.acceptance.filter((a) => a.status === "ready").length;
  const pendingChg = o.changeOrders.filter((c) => c.status === "pending" && c.approverChain.find((x) => x.role === "业主" && !x.result)).length;
  const pendingPay = o.payments.filter((p) => !p.paidAt && new Date(p.due) <= new Date("2026-06-30")).length;
  const pending = pendingAcc + pendingChg + pendingPay;

  const stagesShort = [
    { k: "拆改", done: o.schedule.slice(0, 1).every((t) => t.progress === 100) },
    { k: "水电", done: o.schedule.slice(1, 3).every((t) => t.progress === 100) },
    { k: "泥木", done: o.schedule.slice(3, 6).every((t) => t.progress === 100), current: true },
    { k: "油漆", done: false },
    { k: "安装", done: false },
    { k: "竣工", done: false },
  ];

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* hero */}
      <div className="bg-foreground text-background pt-10 pb-24 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-cat-decor/35 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-cat-design/15 blur-2xl" />

        <Container className="relative max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-full bg-gradient-to-br from-cat-decor to-[#e6531f] text-white inline-flex items-center justify-center text-[18px] font-semibold shadow-lg">
                {session.name.slice(0, 1)}
              </span>
              <div className="leading-tight">
                <div className="text-[15px] font-semibold">{session.name}</div>
                <div className="text-[11px] text-background/70">浉河区 · 协会业主 · ID C00284</div>
              </div>
            </div>
            <span className="relative h-9 w-9 rounded-full bg-white/10 backdrop-blur inline-flex items-center justify-center" aria-label="通知">
              <Bell className="h-4 w-4" />
              {pending > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cat-decor animate-pulse" />
              )}
            </span>
          </div>

          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-[11px]">
            <ShieldCheck className="h-3 w-3 text-accent-yellow" /> 已加入消费保护 · 在保金额 30 万
          </div>
        </Container>
      </div>

      <Container className="max-w-2xl -mt-16 relative space-y-3">
        {/* 协议待重签横幅（PIPL · 优先级最高）*/}
        <ResignBanner pending={DEMO_RESIGNS} href="/dashboard/resign" />

        {/* 待办横幅 */}
        {pending > 0 && (
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

        {/* 当前项目卡 */}
        <Link
          href={`/dashboard/customer/projects/${o.id}`}
          className="block rounded-3xl bg-background border border-border p-5 shadow-sm active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] tracking-widest text-muted-foreground uppercase">CURRENT PROJECT</div>
            <Badge tone="decor">施工中</Badge>
          </div>
          <div className="text-[18px] font-semibold tracking-tight">{o.inquiry.address}</div>
          <div className="text-[12px] text-muted-foreground mt-1">{o.enterpriseName} · {o.id}</div>

          {/* 进度条 + 阶段点 */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[12px] mb-1.5">
              <span className="text-muted-foreground">总进度</span>
              <span className="font-semibold tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cat-decor to-[#ff7a45] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-6 gap-1.5 text-center">
            {stagesShort.map((s) => (
              <div key={s.k} className={`rounded-lg py-2 ${
                s.current ? "bg-cat-decor-soft text-cat-decor border border-cat-decor/30" :
                s.done ? "bg-[#e6f7f1] text-accent-tea" : "bg-surface text-muted-foreground"
              }`}>
                <div className="text-[9px]">{s.done ? "✓" : s.current ? "●" : "○"}</div>
                <div className="text-[10px] font-medium mt-0.5">{s.k}</div>
              </div>
            ))}
          </div>

          {/* 最新现场 */}
          {o.dailyLogs[0] && (
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-square w-10 rounded-md bg-gradient-to-br from-cat-decor/30 to-surface" />
                ))}
              </div>
              <div className="flex-1 min-w-0 text-[12px]">
                <div className="font-medium truncate">{o.dailyLogs[0].phase} · {o.dailyLogs[0].date}</div>
                <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                  <Camera className="h-2.5 w-2.5" /> {o.dailyLogs[0].photos} 张现场照
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </Link>

        {/* 4 tile 快捷 */}
        <div className="grid grid-cols-2 gap-3">
          <Tile icon={Umbrella}              title="我的保单" sub="1 份在保 · ¥162 万" href="/dashboard/customer/insurance" tone="decor" />
          <Tile icon={MessageSquareHeart}    title="写评价"   sub={`待评 ${o.acceptance.filter((a) => a.status === "approved").length > 0 ? "1" : "0"}`} href="/dashboard/customer/review" tone="design" badge={pendingAcc > 0 ? String(pendingAcc) : undefined} />
          <Tile icon={MessageSquareWarning}  title="发起调解" sub="14 天内介入" href="/ai/mediate" tone="yellow" />
          <Tile icon={Sparkles}              title="AI 装修顾问" sub="小装 · 在线" href="/ai/decor" tone="brand" />
        </div>

        {/* 项目待办分项卡片（横滑） */}
        {pending > 0 && (
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

        {/* 最近活动 */}
        <div className="rounded-3xl bg-background border border-border">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">最近活动</h3>
          </div>
          <ul className="divide-y divide-border">
            {[
              { t: "项目「金茂悦府」水电验收已通过", d: "今天 09:24", tag: "项目", color: "build" as const },
              { t: "AI 小装为您匹配了 3 家心仪企业", d: "昨天 21:08", tag: "AI", color: "brand" as const },
              { t: "「安心家装险」保单已生效", d: "5 月 22 日", tag: "保险", color: "decor" as const },
              { t: "您写的评价已被「名家装饰」感谢", d: "5 月 18 日", tag: "评价", color: "design" as const },
            ].map((a, i) => (
              <li key={i} className="px-5 py-3.5 flex items-center gap-3 active:bg-surface/60 transition-colors">
                <Badge tone={a.color} className="!text-[10px] shrink-0">{a.tag}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] truncate">{a.t}</div>
                  <div className="text-[11px] text-muted-foreground">{a.d}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </li>
            ))}
          </ul>
        </div>

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
