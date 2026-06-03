import Link from "next/link";
import {
  ShieldCheck, Briefcase, GraduationCap, Wallet, Sparkles, Bell,
  ChevronRight, Star, BadgeCheck, ArrowUpRight, AlertCircle, MapPin, Clock, Store,
} from "lucide-react";
import { Container } from "@/components/container";
import { CustomerBottomNav } from "@/components/dashboard/customer-bottom-nav";
import { PRACTITIONER_TABS } from "@/lib/dashboard/nav";
import { Badge } from "@/components/ui/badge";
import { PRACTITIONER_JOBS } from "@/lib/data/practitioners";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "我的 · 从业者门户" };

export default async function PractitionerHome() {
  const session = await getSession();
  if (!session || session.role !== "practitioner") {
    redirect("/login?role=practitioner");
  }
  if (session.pending) redirect("/dashboard/pending");

  // 真实从业者记录（按登录手机号匹配协会名录）
  const me = getPractitionerByPhone(session.phone);
  const name = me?.name ?? session.name;
  const kind = me?.kind ?? "从业者";
  const years = me?.years ?? 0;
  const city = me?.city ?? "信阳";
  const pid = me?.id ?? session.uid;
  const rating = me?.rating ?? 5;
  const jobsDone = me?.jobs ?? 0;
  const insured = me?.insured ?? false;
  const urgentJobs = PRACTITIONER_JOBS.filter((j) => j.urgent).length;

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* hero */}
      <div className="bg-foreground text-background pt-10 pb-24 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-cat-design/35 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-44 w-44 rounded-full bg-brand/30 blur-3xl" />

        <Container className="relative max-w-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-full bg-gradient-to-br from-cat-design to-[#6d3df0] text-white inline-flex items-center justify-center text-[18px] font-semibold shadow-lg">
                {name.slice(0, 1)}
              </span>
              <div className="leading-tight">
                <div className="text-[15px] font-semibold">{name}</div>
                <div className="text-[11px] text-background/70">{kind}{years ? ` · ${years} 年` : ""} · ID {pid}</div>
              </div>
            </div>
            <Link href="#" className="relative h-9 w-9 rounded-full bg-white/10 backdrop-blur inline-flex items-center justify-center active:scale-95 transition-transform">
              <Bell className="h-4 w-4" />
              {urgentJobs > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cat-decor animate-pulse" />}
            </Link>
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-[11px]">
            <ShieldCheck className="h-3 w-3 text-accent-yellow" /> 已实名 · 协会认证从业者{insured ? " · 工伤险在保" : ""}
          </div>
        </Container>
      </div>

      <Container className="max-w-2xl -mt-16 relative space-y-3">
        {/* 提醒条：急招岗位 */}
        {urgentJobs > 0 && (
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
                <div className="text-[14px] font-semibold">{urgentJobs} 个急招岗位</div>
                <div className="text-[11px] text-white/80 mt-0.5">协会会员企业在招 · 点击查看</div>
              </div>
              <ChevronRight className="h-5 w-5" />
            </div>
          </Link>
        )}

        {/* 真实统计：评分 / 接单 / 工伤险 */}
        <div className="rounded-3xl bg-background border border-border p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center divide-x divide-border">
            <Stat
              label="评分"
              value={<span className="inline-flex items-center gap-0.5"><Star className="h-4 w-4 fill-[#FFB400] text-[#FFB400]" />{rating.toFixed(1)}</span>}
              sub="协会评价"
              color="text-foreground"
            />
            <Stat label="累计接单" value={`${jobsDone}`} sub="单" color="text-cat-decor" />
            <Stat label="工伤险" value={insured ? "在保" : "未保"} sub={insured ? "协会承保" : "去投保"} color={insured ? "text-accent-tea" : "text-muted-foreground"} />
          </div>
        </div>

        {/* 四宫格 */}
        <div className="grid grid-cols-2 gap-3">
          <Tile icon={Briefcase} title="找活" sub={`${PRACTITIONER_JOBS.length} 条岗位`} href="/dashboard/practitioner/jobs" tone="build" badge={urgentJobs > 0 ? "🔥" : undefined} />
          <Tile icon={GraduationCap} title="培训 · 证书" sub="继续教育 / 上传" href="/dashboard/practitioner/training" tone="design" />
          <Tile icon={ShieldCheck} title="工伤险" sub={insured ? "在保中" : "立即投保"} href="/dashboard/practitioner/insurance" tone="tea" />
          <Tile icon={Wallet} title="钱包 · 收入证明" sub="收入流水" href="/dashboard/practitioner/income" tone="decor" />
          <Tile icon={Store} title="我的店铺" sub="卖货 · 集采上架" href="/dashboard/practitioner/store" tone="yellow" />
        </div>

        {/* 为你推荐 · 纵向网格（协会会员企业岗位）*/}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-[14px] font-semibold tracking-tight">为你推荐</h3>
            <Link href="/dashboard/practitioner/jobs" className="text-[12px] text-brand">全部 {PRACTITIONER_JOBS.length} →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRACTITIONER_JOBS.slice(0, 4).map((j) => (
              <Link
                key={j.id}
                href="/dashboard/practitioner/jobs"
                className="rounded-2xl border border-border bg-background p-4 active:scale-[0.99] hover:shadow-md transition-all"
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

        {/* AI 入口 */}
        <Link href="/ai/hr" className="block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cat-design/30 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-accent-yellow shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold">AI 小才 · 找活 / 申诉 / 培训</div>
              <div className="text-[11px] text-background/70 mt-0.5">随时问 TA 关于接单、欠薪、证书的问题</div>
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

        <div className="text-center text-[10px] text-muted-foreground pt-1">
          {city} · 协会认证从业者 · ID {pid}
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
