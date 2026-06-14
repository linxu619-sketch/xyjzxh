import Link from "next/link";
import { ChevronRight, Eye, CheckCircle2, AlertCircle, ExternalLink, Users2, IdCard, CalendarCheck, Layers } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listNews } from "@/lib/data/news-source";
import { listCommittee, listMembers, listMeetings, listTopics } from "@/lib/data/party-source";
import { PublishPartyNews } from "./PublishPartyNews";

export const metadata = { title: "党的建设 · 协会工作台" };

const PARTY_CATS = ["党建", "理论学习"];

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function PartyAdmin({ searchParams }: { searchParams: Promise<{ cat?: string; nok?: string; nerr?: string }> }) {
  const { cat, nok, nerr } = await searchParams;
  const all = listNews().filter((n) => PARTY_CATS.includes(n.category));
  const active = cat && PARTY_CATS.includes(cat) ? cat : undefined;
  const list = active ? all.filter((n) => n.category === active) : all;
  const dongtai = all.filter((n) => n.category === "党建").length;
  const study = all.filter((n) => n.category === "理论学习").length;
  const totalViews = all.reduce((a, n) => a + n.views, 0);
  const base = "/dashboard/association/cpc";
  const catHref = (c: string) => (active === c ? base : `${base}?cat=${encodeURIComponent(c)}`);

  // 支部建设各模块数量（班子 / 名册 / 台账 / 专题）
  const cCommittee = listCommittee().length;
  const cMembers = listMembers().length;
  const cMeetings = listMeetings().length;
  const cTopics = listTopics().length;
  const BRANCH_CARDS = [
    { href: "/dashboard/association/cpc/branch?tab=committee", icon: Users2, label: "支部班子", n: cCommittee },
    { href: "/dashboard/association/cpc/branch?tab=members", icon: IdCard, label: "党员名册", n: cMembers },
    { href: "/dashboard/association/cpc/branch?tab=meetings", icon: CalendarCheck, label: "三会一课台账", n: cMeetings },
    { href: "/dashboard/association/cpc/branch?tab=topics", icon: Layers, label: "党建专题", n: cTopics },
  ];

  return (
    <AssociationShell title="党的建设" subtitle={`党建动态 ${dongtai} · 理论学习 ${study}`}>
      {nok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已发布！</b>党建专栏与门户即时可见。</div></div>}
      {nerr && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3"><AlertCircle className="h-5 w-5 shrink-0" /><div className="text-[13px]">发布失败：请填写标题与正文。</div></div>}

      {/* 发布入口（醒目）+ 说明 + 查看前台专栏 */}
      <div className="mb-5 rounded-2xl border border-party/20 bg-party-soft p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="text-[13px] text-foreground">党支部在此<b className="text-party">发布与管理</b>党建动态与理论学习，内容即时同步到党建专栏 <code className="font-mono text-[12px]">xh.xyjzxh.com/cpc</code>。</div>
        <div className="flex items-center gap-2 shrink-0">
          <PublishPartyNews />
          <a href="/cpc" target="_blank" rel="noreferrer" className="h-9 px-4 rounded-full border border-party/30 bg-background text-party text-[12px] font-medium inline-flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5" /> 查看专栏</a>
        </div>
      </div>

      {/* 支部建设入口（班子 / 名册 / 台账 / 专题） */}
      <div className="mb-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {BRANCH_CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className="rounded-2xl border border-border bg-background p-4 hover:border-party/40 hover:shadow-sm transition-all group">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-party-soft text-party"><Icon className="h-5 w-5" /></span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-party transition-colors" />
              </div>
              <div className="mt-3 text-[14px] font-semibold">{c.label}</div>
              <div className="text-[12px] text-muted-foreground">{c.n} 条 · 点击管理</div>
            </Link>
          );
        })}
      </div>

      <StatFilters
        items={[
          { key: "dt", label: "党建动态", value: dongtai, color: "text-party", href: catHref("党建"), active: active === "党建" },
          { key: "study", label: "理论学习", value: study, color: "text-party", href: catHref("理论学习"), active: active === "理论学习" },
          { key: "views", label: "总阅读", value: totalViews.toLocaleString(), color: "text-accent-tea" },
          { key: "all", label: "全部", value: all.length, color: "text-cat-design", href: base, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>党建内容 · 点击查看与管理</span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal">清除筛选 ✕</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? "没有该类别的内容。" : "还没有党建内容。点右上「发布党建内容」发布第一条。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_0.7fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>标题</span><span>发布单位</span><span>发布时间</span><span>阅读</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {list.map((n) => (
                <li key={n.id}>
                  <Link href={`/dashboard/association/cpc/${n.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_0.7fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate flex items-center gap-1.5"><Badge tone="party" className="!px-1.5 !py-0">{n.category}</Badge>{n.hot && <Badge tone="decor" className="!px-1.5 !py-0">热</Badge>}{n.title}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">{n.author} · {fmt(n.createdAt)} · {n.views} 阅读</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{n.author}</span>
                    <span className="hidden md:block text-muted-foreground tabular-nums">{fmt(n.createdAt)}</span>
                    <span className="hidden md:inline-flex items-center gap-0.5 text-muted-foreground"><Eye className="h-3 w-3" />{n.views}</span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0">
                      <Badge tone={n.status === "published" ? "tea" : "neutral"}>{n.status === "published" ? "已发布" : "草稿"}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AssociationShell>
  );
}
