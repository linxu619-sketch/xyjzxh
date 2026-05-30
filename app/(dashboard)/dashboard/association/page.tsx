import Link from "next/link";
import {
  ShieldCheck, CheckCircle2, Sparkles, AlertCircle, ChevronRight,
  Users2, FileCheck2, MessageSquareWarning, Wallet, TrendingUp, Activity,
} from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatCard, Panel } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "协会工作台 · 信阳市建筑装修协会" };

const TODOS = [
  { tag: "会员审核", color: "brand" as const,  title: "信阳同信建工 入会申请待复审", time: "2 小时前", urgent: true },
  { tag: "报备",     color: "build" as const,  title: "P-2026-0512 茶博园景观二期 待审", time: "3 小时前", urgent: true },
  { tag: "调解",     color: "decor" as const,  title: "WX 投诉：金茂悦府工期延误 7 天", time: "5 小时前", urgent: true },
  { tag: "内容",     color: "design" as const, title: "建博会新闻稿待发布", time: "今天" },
  { tag: "金融",     color: "tea" as const,    title: "中原银行 · 建装贷 5 月对账", time: "今天" },
];

const AI_USAGE = [
  { name: "小协", topic: "入会咨询",  n: 284,  pct: 14 },
  { name: "小装", topic: "C 端估价", n: 1812, pct: 90 },
  { name: "小报", topic: "报备预审", n: 196,  pct: 10 },
  { name: "小和", topic: "调解初筛", n: 47,   pct: 2.5 },
];

const PENDING_MEMBERS = [
  { name: "信阳同信建工", cat: "建筑", date: "2026-05-29", status: "材料齐全", catColor: "build" as const },
  { name: "明禾装饰工程", cat: "装修", date: "2026-05-28", status: "等待资质核验", catColor: "decor" as const },
  { name: "鹿鸣空间设计", cat: "设计", date: "2026-05-27", status: "现场核查中", catColor: "design" as const },
];

export default async function AssociationDashboard() {
  return (
    <AssociationShell
      title="协会工作台 · 总览"
      subtitle="今天 · 2026-05-30 · 周六 · 全平台健康"
      actions={
        <>
          <Link
            href="/dashboard/association/reports"
            className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> 待审报备 12
          </Link>
        </>
      }
    >
      {/* 紧急提醒条 */}
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-brand to-brand-600 text-white p-4 flex items-center gap-3 shadow-md">
        <span className="relative h-9 w-9 rounded-xl bg-white/20 inline-flex items-center justify-center shrink-0">
          <AlertCircle className="h-5 w-5" />
          <span className="absolute inset-0 rounded-xl bg-white/20 animate-ping opacity-40" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">22 项待办 · 7 会员审核 · 12 报备 · 3 调解</div>
          <div className="text-[11px] text-white/85 mt-0.5">3 项调解距 14 天结案限期 ≤ 5 天</div>
        </div>
        <Link
          href="/dashboard/association/members"
          className="hidden md:inline-flex items-center gap-1 text-[12px] font-medium bg-accent-yellow text-foreground h-9 px-4 rounded-full"
        >
          立即处理 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="在册会员"     value="1,052" sub="较上月" trend={{ dir: "up", value: "12" }} color="brand" />
        <StatCard label="本月报备"     value="187"   sub="待审 12" trend={{ dir: "up", value: "8.4%" }} color="build" />
        <StatCard label="保险出单"     value="1,284" sub="本月" trend={{ dir: "up", value: "23%" }} color="decor" />
        <StatCard label="待处理调解"  value="3"     sub="14 天结案率 94%" color="design" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* 待办 */}
        <Panel
          title="待办事项"
          className="lg:col-span-2"
          action={<Link href="#" className="text-[12px] text-brand inline-flex items-center gap-0.5">全部 22 <ChevronRight className="h-3 w-3" /></Link>}
        >
          <ul className="divide-y divide-border">
            {TODOS.map((t, i) => (
              <li key={i} className="flex items-center gap-3 py-3 text-[13px] active:bg-surface/60 transition-colors -mx-2 px-2 rounded-lg">
                <Badge tone={t.color}>{t.tag}</Badge>
                {t.urgent && <span className="text-[10px] text-cat-decor inline-flex items-center gap-0.5 shrink-0"><AlertCircle className="h-2.5 w-2.5" /></span>}
                <span className="flex-1 truncate">{t.title}</span>
                <span className="text-muted-foreground text-[11px] hidden md:inline shrink-0">{t.time}</span>
                <Link href="#" className="text-brand text-[12px] font-medium shrink-0">处理</Link>
              </li>
            ))}
          </ul>
        </Panel>

        {/* AI 员工对话 */}
        <Panel
          title="AI 员工本周对话"
          action={<Link href="/dashboard/association/ai" className="text-[12px] text-brand">详情</Link>}
        >
          <ul className="space-y-3">
            {AI_USAGE.map((a) => (
              <li key={a.name} className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-xl bg-foreground text-background text-[12px] font-semibold inline-flex items-center justify-center shrink-0">
                  {a.name.slice(-1)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{a.name} <span className="text-muted-foreground font-normal text-[11px] ml-1">· {a.topic}</span></div>
                  <div className="h-1.5 bg-surface rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-brand-600 rounded-full transition-all duration-700"
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[13px] font-semibold tabular-nums shrink-0">{a.n.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">本周总对话</span>
            <span className="font-semibold tabular-nums">{AI_USAGE.reduce((a, x) => a + x.n, 0).toLocaleString()}</span>
          </div>
        </Panel>

        {/* 最新会员 */}
        <Panel
          title="最新会员申请"
          action={<Link href="/dashboard/association/members" className="text-[12px] text-brand">审核</Link>}
          className="lg:col-span-2"
        >
          <ul className="divide-y divide-border">
            {PENDING_MEMBERS.map((m, i) => (
              <li key={i} className="py-3 flex items-center gap-3 active:bg-surface/60 transition-colors -mx-2 px-2 rounded-lg">
                <div className="h-10 w-10 rounded-xl bg-surface inline-flex items-center justify-center text-[12px] font-semibold shrink-0">
                  {m.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5 mt-0.5">
                    <Badge tone={m.catColor} className="!text-[9px]">{m.cat}</Badge>
                    <span>提交 {m.date}</span>
                  </div>
                </div>
                <Badge tone={m.status === "材料齐全" ? "tea" : "yellow"}>{m.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>

        {/* 平台健康 */}
        <Panel title="平台健康" action={<span className="text-[10px] text-accent-tea inline-flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-accent-tea animate-pulse" /> 实时</span>}>
          <ul className="space-y-3 text-[13px]">
            <HealthRow label="API 响应"      value="99.98%" tone="tea" />
            <HealthRow label="报备审批 SLA"  value="≤ 24h"  tone="tea" />
            <HealthRow label="调解结案率"    value="94%"    tone="brand" />
            <HealthRow label="客诉满意度"    value="4.7"    tone="design" sub="/ 5.0" />
          </ul>
          <div className="mt-4 rounded-xl bg-[#e6f7f1] text-accent-tea p-3 text-[11px] inline-flex items-center gap-1.5 w-full">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> 所有指标处于绿色阈值
          </div>
        </Panel>

        {/* 数据 mini 趋势 */}
        <Panel title="本月数据趋势" className="lg:col-span-3" action={<Link href="#" className="text-[12px] text-brand">更多 →</Link>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "新会员", icon: Users2, value: 23, change: "+8", color: "text-brand" },
              { label: "新报备", icon: FileCheck2, value: 187, change: "+14%", color: "text-cat-build" },
              { label: "保险出单", icon: Wallet, value: 1284, change: "+23%", color: "text-cat-decor" },
              { label: "调解结案", icon: MessageSquareWarning, value: 12, change: "+2", color: "text-cat-design" },
            ].map((s) => {
              const Ic = s.icon;
              return (
                <div key={s.label} className="rounded-2xl bg-surface p-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground tracking-wider uppercase">
                    <Ic className="h-3 w-3" /> {s.label}
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className={`text-[28px] font-semibold tracking-tight tabular-nums ${s.color}`}>{s.value.toLocaleString()}</span>
                    <span className="text-[11px] text-accent-tea font-medium inline-flex items-center gap-0.5">
                      <TrendingUp className="h-2.5 w-2.5" /> {s.change}
                    </span>
                  </div>
                  {/* mini sparkline */}
                  <div className="mt-3 flex items-end gap-0.5 h-6">
                    {[3, 5, 4, 6, 4, 7, 5, 8, 6, 9, 7, 10].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-foreground/15" style={{ height: `${h * 8}%` }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </AssociationShell>
  );
}

function HealthRow({ label, value, tone, sub }: { label: string; value: string; tone: "tea" | "brand" | "design"; sub?: string }) {
  const T: Record<string, string> = {
    tea: "text-accent-tea", brand: "text-brand", design: "text-cat-design",
  };
  return (
    <li className="flex items-center justify-between">
      <span>{label}</span>
      <span className={`font-semibold ${T[tone]} tabular-nums`}>
        {value}{sub && <span className="text-muted-foreground font-normal text-[11px] ml-0.5">{sub}</span>}
      </span>
    </li>
  );
}
