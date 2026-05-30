import Link from "next/link";
import {
  ShieldCheck, Briefcase, GraduationCap, Wallet, Sparkles, Bell,
  ChevronRight, Star, BadgeCheck, ArrowUpRight, AlertCircle, MapPin, TrendingUp,
  Clock,
} from "lucide-react";
import { Container } from "@/components/container";
import { CustomerBottomNav } from "@/components/dashboard/customer-bottom-nav";
import { PRACTITIONER_TABS } from "@/lib/dashboard/nav";
import { Badge } from "@/components/ui/badge";
import { DEMO_PRACTITIONER, PRACTITIONER_JOBS, INCOME_RECORDS } from "@/lib/data/practitioners";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "我的 · 从业者门户" };

export default async function PractitionerHome() {
  const session = await getSession();
  if (!session || session.role !== "practitioner") {
    redirect("/login?role=practitioner");
  }

  const p = DEMO_PRACTITIONER;
  const lastIncome = INCOME_RECORDS[0];
  const prevIncome = INCOME_RECORDS[1];
  const incomeTrend = prevIncome ? Math.round(((lastIncome.gross - prevIncome.gross) / prevIncome.gross) * 100) : 0;
  const expiringCert = p.certs.find((c) => c.expiresAt && new Date(c.expiresAt) < new Date("2026-09-01"));
  const urgentJobs = PRACTITIONER_JOBS.filter((j) => j.urgent).length;

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* hero */}
      <div className="bg-foreground text-background pt-10 pb-24 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-cat-design/35 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-brand/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-accent-yellow/10 blur-2xl" />

        <Container className="relative max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-full bg-gradient-to-br from-cat-design to-[#6d3df0] text-white inline-flex items-center justify-center text-[18px] font-semibold shadow-lg">
                {p.realName.slice(0, 1)}
              </span>
              <div className="leading-tight">
                <div className="text-[15px] font-semibold">{p.nickname ?? p.realName}</div>
                <div className="text-[11px] text-background/70">{p.kind} · {p.yearsOfExp} 年 · ID {p.id}</div>
              </div>
            </div>
            <Link href="#" className="relative h-9 w-9 rounded-full bg-white/10 backdrop-blur inline-flex items-center justify-center active:scale-95 transition-transform">
              <Bell className="h-4 w-4" />
              {(urgentJobs > 0 || expiringCert) && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cat-decor animate-pulse" />
              )}
            </Link>
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-[11px]">
            <ShieldCheck className="h-3 w-3 text-accent-yellow" /> 已实名 · 协会认证 · 信用 <b className="text-accent-yellow ml-0.5">748</b>
          </div>
        </Container>
      </div>

      <Container className="max-w-2xl -mt-16 relative space-y-3">
        {/* 提醒条：紧急岗位 / 证书到期 */}
        {(urgentJobs > 0 || expiringCert) && (
          <Link
            href="/dashboard/practitioner/jobs"
            className="block rounded-3xl bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-4 shadow-lg active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-3">
              <span className="relative h-10 w-10 rounded-2xl bg-white/20 inline-flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
                <span className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-40" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold">
                  {urgentJobs > 0 ? `${urgentJobs} 个急招岗位` : "证书即将到期"}
                  {urgentJobs > 0 && expiringCert && " · 1 本证书 3 月内到期"}
                </div>
                <div className="text-[11px] text-white/80 mt-0.5">
                  {urgentJobs > 0 ? "AI 已为你匹配 3 条" : `${expiringCert?.name} 到期 ${expiringCert?.expiresAt}`}
                </div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </div>
          </Link>
        )}

        {/* 信用 + 收入 + 评分 */}
        <div className="rounded-3xl bg-background border border-border p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center divide-x divide-border">
            <Stat label="协会信用" value="748" sub="优秀" color="text-brand" />
            <Stat
              label="本月收入"
              value={`¥${(lastIncome.gross / 1000).toFixed(1)}k`}
              sub={
                <span className="inline-flex items-center gap-0.5">
                  <TrendingUp className={`h-2.5 w-2.5 ${incomeTrend > 0 ? "text-accent-tea" : "text-cat-decor"}`} />
                  {incomeTrend > 0 ? "+" : ""}{incomeTrend}%
                </span>
              }
              color="text-cat-decor"
            />
            <Stat
              label="评分"
              value={
                <span className="inline-flex items-center gap-0.5">
                  <Star className="h-4 w-4 fill-[#FFB400] text-[#FFB400]" />
                  {p.rating.toFixed(1)}
                </span>
              }
              sub={`${p.jobsDone} 单`}
              color="text-foreground"
            />
          </div>
        </div>

        {/* 四宫格 */}
        <div className="grid grid-cols-2 gap-3">
          <Tile icon={Briefcase} title="找活" sub={`${PRACTITIONER_JOBS.length} 条新岗位`} href="/dashboard/practitioner/jobs" tone="build" badge={urgentJobs > 0 ? "🔥" : undefined} />
          <Tile icon={GraduationCap} title="培训" sub={p.certs.length + " 本证书"} href="/dashboard/practitioner/training" tone="design" badge={expiringCert ? "!" : undefined} />
          <Tile icon={ShieldCheck} title="工伤险" sub={p.insured ? "在保中" : "立即投保"} href="/dashboard/practitioner/insurance" tone="tea" />
          <Tile icon={Wallet} title="钱包" sub={`月均 ¥${Math.round(INCOME_RECORDS.reduce((a, r) => a + r.gross, 0) / INCOME_RECORDS.length / 1000)}k`} href="/dashboard/practitioner/income" tone="decor" />
        </div>

        {/* 为你推荐 · 移动横滑 */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-[14px] font-semibold tracking-tight">为你推荐</h3>
            <Link href="/dashboard/practitioner/jobs" className="text-[12px] text-brand">全部 {PRACTITIONER_JOBS.length} →</Link>
          </div>
          <div className="-mx-5 px-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2.5 pb-2">
              {PRACTITIONER_JOBS.slice(0, 4).map((j) => (
                <Link
                  key={j.id}
                  href="#"
                  className="snap-start shrink-0 w-[78vw] max-w-[300px] rounded-2xl border border-border bg-background p-4 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <Badge tone="brand">{j.openings} 名额</Badge>
                    {j.urgent && <Badge tone="decor">🔥 急招</Badge>}
                    <span className="text-[10px] text-muted-foreground ml-auto inline-flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />{j.postedAt}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold line-clamp-2 min-h-[36px] leading-5">{j.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-2">
                    <span>{j.enterprise}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{j.district}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="text-[16px] font-semibold text-cat-decor tabular-nums">¥{j.daily}<span className="text-[10px] font-normal text-muted-foreground"> /天</span></div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-brand font-medium">报名 <ArrowUpRight className="h-3 w-3" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* AI 入口 */}
        <Link href="/ai/hr" className="block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cat-design/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-accent-yellow shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold">AI 小才 · 找活 / 申诉 / 培训</div>
              <div className="text-[11px] text-background/70 mt-0.5">本月已服务 2,840 位师傅</div>
            </div>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </Link>

        {/* 协会权益 */}
        <Link href="/practitioners" className="block rounded-3xl bg-gradient-to-br from-cat-design to-[#6d3df0] text-white p-5 active:scale-[0.99] transition-transform">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-6 w-6 text-accent-yellow shrink-0" />
            <div className="flex-1">
              <div className="text-[15px] font-semibold">协会权益清单</div>
              <div className="text-[11px] text-white/80 mt-0.5">工伤险 · 防欠薪 · 收入证明 · 调解 · 培训</div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* 近期活动 */}
        <div className="rounded-3xl bg-background border border-border">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">最近</h3>
            <Link href="#" className="text-[12px] text-brand">全部</Link>
          </div>
          <ul className="divide-y divide-border">
            {[
              { t: "「金茂悦府 1602」水电隐蔽验收通过", d: "今天 09:24", tag: "项目", color: "build" as const },
              { t: "工伤险已自动续保 · 至 2027-04-30",   d: "昨天",      tag: "保障", color: "tea" as const },
              { t: "5 月收入 ¥26,800 已可下载证明",     d: "5 月 31 日", tag: "钱包", color: "decor" as const },
              { t: "AI 小才推荐了 3 个匹配岗位",        d: "5 月 30 日", tag: "AI",   color: "design" as const },
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
      </Container>

      <CustomerBottomNav tabs={PRACTITIONER_TABS} />
    </div>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: React.ReactNode; sub: React.ReactNode; color: string }) {
  return (
    <div className="px-2">
      <div className="text-[10px] text-muted-foreground tracking-wider uppercase">{label}</div>
      <div className={`mt-1 text-[20px] font-semibold tracking-tight leading-none ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function Tile({ icon: Icon, title, sub, href, tone, badge }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; sub: string; href: string;
  tone: "brand" | "build" | "decor" | "design" | "tea" | "yellow";
  badge?: string;
}) {
  const TONE: Record<string, string> = {
    brand: "bg-brand-50 text-brand",
    build: "bg-cat-build-soft text-cat-build",
    decor: "bg-cat-decor-soft text-cat-decor",
    design: "bg-cat-design-soft text-cat-design",
    tea: "bg-[#e6f7f1] text-accent-tea",
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
