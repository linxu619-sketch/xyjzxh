import Link from "next/link";
import {
  ExternalLink, Sparkles, AlertCircle, ChevronRight,
  Phone, FileCheck2, Eye, Globe2, Pencil, Library, Megaphone,
} from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { StatCard, Panel } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReportsByUid } from "@/lib/data/reports";
import { listLeadsByEnterprise } from "@/lib/data/leads";
import { listCasesByEnterprise } from "@/lib/data/cases";
import { questionCounts } from "@/lib/ai/knowledge-source";
import { listPublished } from "@/lib/data/news-source";
import { listKnowledge } from "@/lib/data/knowledge-source";
import { AI_EMPLOYEES } from "@/lib/site";
import { effectiveEnterpriseId, isEnterprisePreview } from "@/lib/dashboard/preview";

export const metadata = { title: "企业工作台 · 信阳市建筑装饰装修协会" };

const RPT_STATUS: Record<string, { label: string; tone: "tea" | "decor" | "yellow" }> = {
  approved: { label: "已通过", tone: "tea" },
  rejected: { label: "已驳回", tone: "decor" },
  pending: { label: "待审核", tone: "yellow" },
};

function maskPhone(p: string) {
  return p.length === 11 ? `${p.slice(0, 3)}****${p.slice(-4)}` : p;
}

function fmtDate(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function EnterpriseDashboard() {
  const session = await getSession();
  const eid = effectiveEnterpriseId(session);
  const ent = eid ? await getEnterpriseBySlugOrId(eid) : undefined;
  const brand = ent?.hero.brand ?? ent?.name ?? "企业工作台";
  const slug = ent?.slug ?? "mingjia";
  const myReports = session && !isEnterprisePreview(session) ? listReportsByUid(session.uid) : [];
  const myLeads = eid ? listLeadsByEnterprise(eid) : [];
  const myCases = eid ? listCasesByEnterprise(eid) : [];
  const newLeads = myLeads.filter((l) => l.status === "new").length;
  const pendingReports = myReports.filter((r) => r.status === "pending").length;
  // 真实线索漏斗
  const totalLeads = myLeads.length;
  const signedLeads = myLeads.filter((l) => l.status === "signed").length;
  const contactedLeads = myLeads.filter((l) => ["contacting", "surveying", "signed"].includes(l.status)).length;
  const surveyedLeads = myLeads.filter((l) => ["surveying", "signed"].includes(l.status)).length;
  // 平台 AI 助手本月真实用量（来自 ai_questions 记录）
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const aiUsage = questionCounts(monthStart.getTime());
  const aiName: Record<string, string> = Object.fromEntries(AI_EMPLOYEES.map((e) => [e.key, e.name]));
  const topAi = Object.entries(aiUsage.byKey).sort((a, b) => b[1] - a[1]).slice(0, 4);
  // 协会层资讯打通：党建动态在前 + 协会公告/政策在后（企业会员属协会层，可在自己后台看党建与协会资讯）
  const partyFeed = listPublished("党建").slice(0, 2);
  const otherFeed = listPublished().filter((n) => n.category !== "党建").slice(0, 3);
  const assocFeed = [...partyFeed, ...otherFeed].slice(0, 5);
  // 知识库精选（热门在前），与协会资讯一并打通到工作台
  const kFeed = [...listKnowledge()].sort((a, b) => Number(b.hot) - Number(a.hot)).slice(0, 4);

  return (
    <EnterpriseShell
      title={`${brand} · 工作台`}
      subtitle={`子站 ${slug}.xyjzxh.com · 本月数据`}
      actions={
        <>
          <a
            href={`/biz/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <Eye className="h-3.5 w-3.5" /> 业主视角看子站 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </>
      }
    >
      {/* 我的对外门面：上接协会 / 本页是后台 / 下接业主看到的子站 */}
      <div className="mb-5 rounded-2xl border border-cat-build/30 bg-cat-build-soft/40 p-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <span className="h-10 w-10 rounded-xl bg-cat-build text-white inline-flex items-center justify-center shrink-0"><Globe2 className="h-5 w-5" /></span>
          <div className="min-w-0">
            <div className="text-[14px] font-semibold">这里是经营后台 · 你的对外门面是子站</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">业主在 <code className="font-mono text-foreground">{slug}.xyjzxh.com</code> 看到的就是你的子站。常以业主视角预览,体验真实感官。</div>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href={`/biz/${slug}`} target="_blank" rel="noreferrer" className="h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> 业主视角预览</a>
          <Link href="/dashboard/enterprise/site" className="h-9 px-4 rounded-full border border-border bg-background text-[12px] font-medium inline-flex items-center gap-1.5"><Pencil className="h-3.5 w-3.5" /> 编辑子站</Link>
        </div>
      </div>

      {/* 紧急提醒条 */}
      <div className="mb-5 rounded-2xl bg-gradient-to-r from-cat-decor to-[#e6531f] text-white p-4 flex items-center gap-3 shadow-md">
        <span className="relative h-9 w-9 rounded-xl bg-white/20 inline-flex items-center justify-center shrink-0">
          <AlertCircle className="h-5 w-5" />
          <span className="absolute inset-0 rounded-xl bg-white/20 animate-ping opacity-40" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">{newLeads} 条新线索待跟进 · {pendingReports} 项报备等审核</div>
          <div className="text-[11px] text-white/85 mt-0.5">线索与报备为本企业真实数据 · 点右侧前往处理</div>
        </div>
        <Link
          href="/dashboard/enterprise/leads"
          className="hidden md:inline-flex items-center gap-1 text-[12px] font-medium bg-accent-yellow text-foreground h-9 px-4 rounded-full"
        >
          跟进线索 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* 数据说明 */}
      <div className="mb-2 text-[11px] text-muted-foreground">
        本页均为真实数据：线索 / 报备 / 案例 / 评分 / 转化漏斗为本企业数据，AI 用量为平台级统计。
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="累计线索"   value={totalLeads} sub={`待跟进 ${newLeads}`} color="decor" />
        <StatCard label="已签单"     value={signedLeads} sub={totalLeads ? `签单率 ${((signedLeads / totalLeads) * 100).toFixed(0)}%` : "—"} color="tea" />
        <StatCard label="子站案例"   value={myCases.length} sub="展示于子站" color="build" />
        <StatCard label="口碑评分"   value={(ent?.rating ?? 0).toFixed(1)} sub={`共 ${ent?.reviews ?? 0} 评价`} color="design" />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        {/* 最新线索（真实，子站留资） */}
        <Panel
          title="最新线索"
          className="lg:col-span-2"
          action={
            <Link href="/dashboard/enterprise/leads" className="text-[12px] text-brand inline-flex items-center gap-0.5">
              全部 {myLeads.length} 条 <ChevronRight className="h-3 w-3" />
            </Link>
          }
        >
          {myLeads.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-muted-foreground">
              还没有客户线索。访客在子站「提交需求」表单留资后会实时出现在这里。
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {myLeads.slice(0, 5).map((l) => (
                <li key={l.id} className="py-3 flex items-center gap-3 text-[13px] -mx-2 px-2 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cat-decor to-[#e6531f] text-white inline-flex items-center justify-center text-[13px] font-semibold shrink-0">
                    {l.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium flex items-center gap-1.5">
                      {l.name}
                      <span className="text-muted-foreground font-normal text-[12px] truncate">· {l.type || "—"}{l.area ? ` · ${l.area}㎡` : ""}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span>{l.source}</span>
                      {l.budget && <><span>·</span><span className="text-cat-decor font-medium tabular-nums">¥{l.budget} 万</span></>}
                      <span className="hidden md:inline">· {maskPhone(l.phone)}</span>
                    </div>
                  </div>
                  <a href={`tel:${l.phone}`} className="h-8 w-8 rounded-full hover:bg-cat-build-soft text-cat-build inline-flex items-center justify-center shrink-0" title="拨打">
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* 线索转化漏斗（真实） */}
        <Panel title="线索转化漏斗">
          {totalLeads === 0 ? (
            <div className="py-6 text-center text-[13px] text-muted-foreground">暂无线索数据。子站留资后这里显示真实转化。</div>
          ) : (
            <div className="space-y-3 text-[13px]">
              <FunnelRow label="线索" value={String(totalLeads)} total={totalLeads} color="text-foreground" />
              <FunnelRow label="已跟进" value={String(contactedLeads)} total={totalLeads} color="text-cat-build" />
              <FunnelRow label="已量房" value={String(surveyedLeads)} total={totalLeads} color="text-cat-decor" />
              <FunnelRow label="已签单" value={String(signedLeads)} total={totalLeads} color="text-accent-tea" />
            </div>
          )}
          <div className="mt-4 rounded-2xl bg-foreground text-background p-4 flex items-start gap-2.5 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cat-design/30 blur-2xl" />
            <Sparkles className="relative h-4 w-4 text-accent-yellow mt-0.5 shrink-0" />
            <div className="relative text-[12px] leading-5">
              {newLeads > 0
                ? <><b>提示：</b>有 {newLeads} 条新线索待跟进，及时回电可提升签单率。</>
                : <><b>提示：</b>完善子站案例与团队，有助于提升留资转化。</>}
            </div>
          </div>
        </Panel>

        {/* 我的工装报备（真实，本企业账号提交） */}
        <Panel
          title="我的工装报备"
          className="lg:col-span-2"
          action={
            <Link href="/dashboard/enterprise/projects" className="text-[12px] text-brand inline-flex items-center gap-0.5">
              全部 {myReports.length} 条 <ChevronRight className="h-3 w-3" />
            </Link>
          }
        >
          {myReports.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-muted-foreground">
              还没有在线报备。去 <Link href="/projects/new" className="text-brand">新建报备</Link>，提交后会实时出现在这里。
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {myReports.slice(0, 6).map((r) => {
                const st = RPT_STATUS[r.status] ?? RPT_STATUS.pending;
                return (
                  <li key={r.id} className="py-3 flex items-center gap-3">
                    <FileCheck2 className="h-4 w-4 text-cat-build shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{r.project}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        <code className="font-mono">{r.code}</code> · {r.area || "—"}㎡ · {r.budget || "—"}万
                      </div>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* AI 助手本月（平台级真实统计） */}
        <Panel title="AI 助手 · 本月">
          <div className="text-[34px] font-semibold tracking-tight leading-none text-cat-design">{aiUsage.total}</div>
          <div className="mt-1 text-[12px] text-muted-foreground">本月 AI 咨询次数 · 平台级统计</div>
          {topAi.length > 0 ? (
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {topAi.map(([k, n]) => (
                <li key={k} className="flex items-center justify-between">
                  <span><b>{aiName[k] ?? k}</b></span>
                  <span className="font-semibold tabular-nums text-cat-design">{n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 text-[12px] text-muted-foreground">本月暂无 AI 咨询记录。访客在 AI 估价 / 咨询中提问后这里累计。</div>
          )}
          <Link href="/dashboard/enterprise/ai" className="mt-4 inline-flex items-center gap-1 text-[12px] text-brand">
            <Sparkles className="h-3 w-3" /> 配置专属 AI →
          </Link>
        </Panel>

        {/* 协会资讯 + 知识库（协会层内容打通到企业工作台；详情在工作台内阅读，不跳出。子站属业主层，不放此内容）*/}
        <Panel
          title="协会资讯 · 知识库"
          className="lg:col-span-3"
          action={
            <Link href="/dashboard/enterprise/association" className="text-[12px] text-brand inline-flex items-center gap-0.5">
              进入协会资讯 <ChevronRight className="h-3 w-3" />
            </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* 协会通知 / 新闻 / 党建 */}
            <div>
              <div className="text-[11px] tracking-wider text-muted-foreground uppercase mb-1 inline-flex items-center gap-1.5"><Megaphone className="h-3.5 w-3.5 text-cat-build" /> 通知 · 新闻 · 党建</div>
              {assocFeed.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-muted-foreground">协会暂无资讯。</div>
              ) : (
                <ul className="divide-y divide-border">
                  {assocFeed.map((n) => (
                    <li key={n.id}>
                      <Link href={`/dashboard/enterprise/association/news/${n.id}`} className="py-2.5 flex items-center gap-2.5 -mx-2 px-2 rounded-lg hover:bg-surface transition-colors group">
                        <Badge tone={n.category === "党建" ? "party" : "brand"} className="!px-2 !py-0.5 shrink-0">{n.category}</Badge>
                        <span className="flex-1 min-w-0 truncate text-[13px] group-hover:text-foreground transition-colors">{n.title}</span>
                        <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums hidden lg:inline">{fmtDate(n.createdAt)}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* 知识库精选 */}
            <div className="mt-4 md:mt-0">
              <div className="text-[11px] tracking-wider text-muted-foreground uppercase mb-1 inline-flex items-center gap-1.5"><Library className="h-3.5 w-3.5 text-cat-design" /> 知识库精选</div>
              {kFeed.length === 0 ? (
                <div className="py-6 text-center text-[13px] text-muted-foreground">知识库暂无资料。</div>
              ) : (
                <ul className="divide-y divide-border">
                  {kFeed.map((k) => (
                    <li key={k.id}>
                      <Link href={`/dashboard/enterprise/association/knowledge/${k.id}`} className="py-2.5 flex items-center gap-2.5 -mx-2 px-2 rounded-lg hover:bg-surface transition-colors group">
                        <Badge tone="design" className="!px-2 !py-0.5 shrink-0">{k.category}</Badge>
                        <span className="flex-1 min-w-0 truncate text-[13px] group-hover:text-foreground transition-colors">{k.title}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </EnterpriseShell>
  );
}

function FunnelRow({ label, value, total, color }: { label: string; value: string; total: number; color: string }) {
  const pct = (Number(value.replace(/[^\d]/g, "")) / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted-foreground text-[12px]">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-semibold tabular-nums ${color}`}>{value}</span>
          {pct < 100 && <span className="text-[10px] text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cat-build to-cat-decor transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
