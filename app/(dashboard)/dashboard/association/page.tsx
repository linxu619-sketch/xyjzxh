import Link from "next/link";
import {
  ShieldCheck, ChevronRight,
  Users2, FileCheck2, Newspaper, Sparkles,
  Download, BookOpen, Eye, ExternalLink, Home, Building2, UserRound, Store,
} from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatCard, Panel } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";
import { countByStatus, listApplications } from "@/lib/data/applications";
import { listReports } from "@/lib/data/reports";
import { listMediations } from "@/lib/data/mediations";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listPractitioners } from "@/lib/data/practitioners-source";
import { listPublished } from "@/lib/data/news-source";
import { questionCounts } from "@/lib/ai/knowledge-source";
import { AI_EMPLOYEES } from "@/lib/site";

export const metadata = { title: "协会工作台 · 信阳市建筑装饰装修协会" };

const TYPE_LABEL: Record<string, string> = { enterprise: "企业会员", individual: "个人会员", customer: "业主" };

function fmtDate(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function AssociationDashboard() {
  const appCounts = countByStatus();
  const pendingApps = listApplications("pending");
  const pendingReports = listReports("pending");
  const pendingMeds = listMediations("pending");
  const enterprises = await getEnterprises();
  const pracs = listPractitioners();
  const news = listPublished();
  const memberCount = enterprises.length + pracs.length;

  // 待办（真实，按来源汇总，链接到各详情）
  const todos = [
    ...pendingApps.map((a) => ({ tag: "会员审核", color: "brand" as const, title: `${a.applicant} · ${TYPE_LABEL[a.type] ?? a.type}待审`, href: `/dashboard/association/members/${a.id}` })),
    ...pendingReports.map((r) => ({ tag: "报备", color: "build" as const, title: `${r.code} ${r.project} 待审`, href: `/dashboard/association/reports/${r.id}` })),
    ...pendingMeds.map((m) => ({ tag: "调解", color: "decor" as const, title: `${m.applicant}：${m.detail}`, href: `/dashboard/association/mediations/${m.id}` })),
  ].slice(0, 6);

  // 平台 AI 本月真实用量
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const aiUsage = questionCounts(monthStart.getTime());
  const aiName: Record<string, string> = Object.fromEntries(AI_EMPLOYEES.map((e) => [e.key, e.name]));
  const topAi = Object.entries(aiUsage.byKey).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <AssociationShell
      title="协会工作台 · 总览"
      tone="brand"
    >
      {/* 门面预览 · 一键跳各端首页（公开页新开标签；工作台为协会只读预览样板账号） */}
      <div className="mb-5 rounded-2xl border border-border bg-background p-4">
        <div className="text-[13px] font-semibold mb-1 inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> 门面预览 · 一键体验各端首页</div>
        <p className="text-[11px] text-muted-foreground mb-3">业主/协会门户与企业子站为公开页;企业、从业者工作台以协会身份只读预览样板账号,便于测试。</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            // 强制业主门面：否则在协会工作台(cookie=xh)下 "/" 会被重写成 /xh，与协会首页一样
            { icon: Home, t: "业主门户首页", d: "xyjzxh.com 主页", href: "/?face=consumer", tone: "decor" },
            { icon: Building2, t: "企业工作台", d: "经营后台(预览)", href: "/dashboard/enterprise", tone: "build" },
            { icon: Store, t: "企业子站(样板)", d: "面向业主的品牌页", href: "/biz/mingjia", tone: "tea" },
            { icon: UserRound, t: "从业者门户", d: "个人工作台(预览)", href: "/dashboard/practitioner", tone: "design" },
          ].map((c) => {
            const Ic = c.icon;
            const SOFT: Record<string, string> = { brand: "bg-brand-50 text-brand", build: "bg-cat-build-soft text-cat-build", decor: "bg-cat-decor-soft text-cat-decor", design: "bg-cat-design-soft text-cat-design", tea: "bg-[#e6f7f1] text-accent-tea" };
            return (
              <a key={c.href} href={c.href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-border bg-background p-3 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                <div className="flex items-center justify-between">
                  <span className={`h-9 w-9 rounded-xl inline-flex items-center justify-center ${SOFT[c.tone]}`}><Ic className="h-4 w-4" /></span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-2 text-[13px] font-semibold">{c.t}</div>
                <div className="text-[11px] text-muted-foreground">{c.d}</div>
              </a>
            );
          })}
        </div>
      </div>

      {/* KPI（真实，点卡片直达对应列表）*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="待审会员" value={appCounts.pending} sub={`已通过 ${appCounts.approved}`} color="brand" href="/dashboard/association/members" />
        <StatCard label="待审报备" value={pendingReports.length} sub="工装报备" color="build" href="/dashboard/association/reports?f=pending" />
        <StatCard label="待处理调解" value={pendingMeds.length} sub="纠纷调解" color="decor" href="/dashboard/association/mediations" />
        <StatCard label="在册会员" value={memberCount} sub={`企业 ${enterprises.length} · 个人 ${pracs.length}`} color="design" href="/dashboard/association/users" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* 待办（真实） */}
        <Panel title="待办事项" className="lg:col-span-2"
          action={<Link href="/dashboard/association/members" className="text-[12px] text-brand inline-flex items-center gap-0.5">会员审核 <ChevronRight className="h-3 w-3" /></Link>}
        >
          {todos.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-muted-foreground">暂无待办，所有审核已处理完 ✓</div>
          ) : (
            <ul className="divide-y divide-border">
              {todos.map((t, i) => (
                <li key={i}>
                  <Link href={t.href} className="flex items-center gap-3 py-3 text-[13px] hover:bg-surface transition-colors -mx-2 px-2 rounded-lg">
                    <Badge tone={t.color}>{t.tag}</Badge>
                    <span className="flex-1 truncate">{t.title}</span>
                    <span className="text-brand text-[12px] font-medium shrink-0">处理 →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* AI 助手本月（平台真实） */}
        <Panel title="AI 助手 · 平台本月" action={<Link href="/dashboard/association/ai" className="text-[12px] text-brand">配置</Link>}>
          {topAi.length === 0 ? (
            <div className="py-6 text-center text-[12px] text-muted-foreground">本月暂无 AI 咨询记录。</div>
          ) : (
            <ul className="space-y-3">
              {topAi.map(([k, n]) => (
                <li key={k} className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-foreground text-background text-[12px] font-semibold inline-flex items-center justify-center shrink-0">{(aiName[k] ?? k).slice(-1)}</span>
                  <div className="flex-1 min-w-0 text-[13px] font-medium">{aiName[k] ?? k}</div>
                  <span className="text-[13px] font-semibold tabular-nums shrink-0">{n.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">本月总对话</span>
            <span className="font-semibold tabular-nums">{aiUsage.total.toLocaleString()}</span>
          </div>
        </Panel>

        {/* 最新会员申请（真实待审） */}
        <Panel title="最新会员申请" className="lg:col-span-2"
          action={<Link href="/dashboard/association/members" className="text-[12px] text-brand">审核</Link>}
        >
          {pendingApps.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-muted-foreground">暂无待审会员申请。</div>
          ) : (
            <ul className="divide-y divide-border">
              {pendingApps.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <Link href={`/dashboard/association/members/${m.id}`} className="py-3 flex items-center gap-3 hover:bg-surface transition-colors -mx-2 px-2 rounded-lg">
                    <div className="h-10 w-10 rounded-xl bg-surface inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{m.applicant.slice(0, 2)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{m.applicant}</div>
                      <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5 mt-0.5">
                        <Badge tone={m.type === "enterprise" ? "build" : m.type === "individual" ? "design" : "decor"} className="!text-[9px]">{TYPE_LABEL[m.type] ?? m.type}</Badge>
                        <span>提交 {fmtDate(m.createdAt)}</span>
                      </div>
                    </div>
                    <Badge tone="yellow">待审核</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* 平台规模（真实） */}
        <Panel title="平台规模" action={<span className="text-[10px] text-accent-tea inline-flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-accent-tea animate-pulse" /> 实时</span>}>
          <ul className="space-y-3 text-[13px]">
            <ScaleRow icon={Users2} label="在册企业会员" value={enterprises.length} />
            <ScaleRow icon={ShieldCheck} label="在册个人会员" value={pracs.length} />
            <ScaleRow icon={Newspaper} label="已发布新闻" value={news.length} />
            <ScaleRow icon={FileCheck2} label="累计入会申请" value={appCounts.pending + appCounts.approved + appCounts.rejected} />
          </ul>
          <div className="mt-4 rounded-xl bg-[#e6f7f1] text-accent-tea p-3 text-[11px] inline-flex items-center gap-1.5 w-full">
            <Sparkles className="h-3.5 w-3.5 shrink-0" /> 数据来自本地数据库，实时更新
          </div>
        </Panel>

        {/* 平台文档下载 */}
        <Panel title="平台文档" className="lg:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div className="flex items-start gap-3">
              <span className="h-11 w-11 rounded-xl bg-brand-50 text-brand inline-flex items-center justify-center shrink-0"><BookOpen className="h-5 w-5" /></span>
              <div>
                <div className="text-[14px] font-semibold">平台现状总览 · 使用说明书</div>
                <div className="text-[12px] text-muted-foreground mt-0.5 leading-5">含项目完成度、四端使用说明、核心业务闭环与运维要点（Word 文档，可用 Word / WPS 打开）</div>
              </div>
            </div>
            <div className="shrink-0 flex gap-2">
              <Link href="/dashboard/association/docs" className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center justify-center gap-1.5 hover:bg-surface active:scale-95">
                <BookOpen className="h-4 w-4" /> 在线预览
              </Link>
              <a
                href="/docs/xyjzxh-platform-guide.doc"
                download="信阳建装平台说明书.doc"
                className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center justify-center gap-1.5 hover:bg-brand transition-colors active:scale-95"
              >
                <Download className="h-4 w-4" /> 下载 Word
              </a>
            </div>
          </div>
        </Panel>

      </div>
    </AssociationShell>
  );
}

function ScaleRow({ icon: Ic, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <li className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Ic className="h-3.5 w-3.5" /> {label}</span>
      <span className="font-semibold tabular-nums">{value.toLocaleString()}</span>
    </li>
  );
}
