import Link from "next/link";
import {
  ExternalLink, Sparkles, AlertCircle, ChevronRight,
  Phone, FileCheck2, Eye, Globe2, Pencil, Library, Megaphone, MessagesSquare,
  ListChecks, Clock,
} from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { StatCard, Panel } from "@/components/dashboard/widgets";
import { Badge } from "@/components/ui/badge";
import { getSession, type Session } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReportsByUid, listReportsByEnterprise } from "@/lib/data/reports";
import { listLeadsByEnterprise } from "@/lib/data/leads";
import { lastActivityByLead } from "@/lib/data/lead-activities";
import { leadTodos, reportTodos, type LeadTodo, type ReportTodo } from "@/lib/data/followup";
import { listCasesByEnterprise } from "@/lib/data/cases";
import { questionCounts } from "@/lib/ai/knowledge-source";
import { listPublished } from "@/lib/data/news-source";
import { listKnowledge } from "@/lib/data/knowledge-source";
import { AI_EMPLOYEES } from "@/lib/site";
import { effectiveEnterpriseId, isEnterprisePreview } from "@/lib/dashboard/preview";
import { entScopesOwnData, entStaffId, canAccessEnt, ENT_ROLE_LABEL } from "@/lib/auth/ent-access";
import type { EntStaffRole } from "@/lib/data/enterprise-staff";

export const metadata = { title: "企业工作台 · 信阳市建筑装饰装修协会" };

const RPT_LABEL: Record<string, { label: string; tone: "tea" | "decor" | "yellow" }> = {
  approved: { label: "已通过", tone: "tea" }, rejected: { label: "已驳回", tone: "decor" }, pending: { label: "待审", tone: "yellow" },
};

function dstr(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

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

  // 团队成员（受限会话）：只看分派给自己的工作，渲染「我的工作台」
  if (entScopesOwnData(session) && eid) {
    return <StaffOverview session={session!} brand={brand} eid={eid} names={[ent?.name, ent?.hero.brand].filter(Boolean) as string[]} />;
  }

  const myReports = session && !isEnterprisePreview(session) ? listReportsByUid(session.uid) : [];
  const myLeads = eid ? listLeadsByEnterprise(eid) : [];
  const myCases = eid ? listCasesByEnterprise(eid) : [];
  const newLeads = myLeads.filter((l) => l.status === "new").length;
  // 待办 · 待跟进：停滞线索（全公司）+ 被驳回需整改的报备
  const ownerNames = [ent?.name, ent?.hero.brand].filter(Boolean) as string[];
  const leadTodoList = leadTodos(myLeads, lastActivityByLead(myLeads.map((l) => l.id)), new Date().getTime());
  const reportTodoList = eid ? reportTodos(listReportsByEnterprise(ownerNames)) : [];
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

      {/* 待办 · 待跟进（真实数据驱动：停滞线索 + 待整改报备） */}
      <TodoBlock leads={leadTodoList} reports={reportTodoList} scope="company" />

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

// 团队成员的「我的工作台」：只看分派给自己的线索/报备 + 个人业绩
async function StaffOverview({ session, brand, eid, names }: { session: Session; brand: string; eid: string; names: string[] }) {
  const sid = entStaffId(session);
  const role = (session.staffRole as EntStaffRole) ?? "viewer";
  const roleLabel = ENT_ROLE_LABEL[role] ?? "成员";
  const canLeads = canAccessEnt(session.staffRole, "/dashboard/enterprise/leads");
  const canProjects = canAccessEnt(session.staffRole, "/dashboard/enterprise/projects");

  const myLeads = canLeads ? listLeadsByEnterprise(eid).filter((l) => l.assigneeStaffId === sid) : [];
  const myReports = canProjects ? listReportsByEnterprise(names).filter((r) => r.assigneeStaffId === sid) : [];
  const signed = myLeads.filter((l) => l.status === "signed").length;
  const activeLeads = myLeads.filter((l) => ["contacting", "surveying"].includes(l.status)).length;
  const approved = myReports.filter((r) => r.status === "approved").length;
  // 我的待办：分派给我、待跟进的线索 + 被驳回需整改的报备
  const leadTodoList = canLeads ? leadTodos(myLeads, lastActivityByLead(myLeads.map((l) => l.id)), new Date().getTime()) : [];
  const reportTodoList = canProjects ? reportTodos(myReports) : [];

  return (
    <EnterpriseShell title={`${session.name} · 我的工作台`} subtitle={`${brand} · ${roleLabel}`}>
      <div className="mb-5 rounded-2xl border border-cat-build/30 bg-cat-build-soft/40 p-4 flex items-start gap-3">
        <span className="h-10 w-10 rounded-xl bg-cat-build text-white inline-flex items-center justify-center shrink-0"><MessagesSquare className="h-5 w-5" /></span>
        <div className="min-w-0">
          <div className="text-[14px] font-semibold">你是 {brand} 的{roleLabel}</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">这里只显示<b className="text-foreground">分派给你</b>的工作与你的业绩。需要分派 / 看全公司数据，请联系企业负责人。</div>
        </div>
      </div>

      {(canLeads || canProjects) && <TodoBlock leads={leadTodoList} reports={reportTodoList} scope="mine" />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {canLeads && <StatCard label="我的线索" value={myLeads.length} sub={`跟进中 ${activeLeads}`} color="decor" />}
        {canLeads && <StatCard label="我的签单" value={signed} sub={myLeads.length ? `签单率 ${((signed / myLeads.length) * 100).toFixed(0)}%` : "—"} color="tea" />}
        {canProjects && <StatCard label="我的报备" value={myReports.length} sub={`已通过 ${approved}`} color="build" />}
        {canProjects && <StatCard label="报备通过" value={approved} sub="协会审批" color="design" />}
        {!canLeads && !canProjects && <StatCard label="角色" value={roleLabel} sub="只读 / 专项" color="build" />}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {canLeads && (
          <Panel title="我的线索" action={<Link href="/dashboard/enterprise/leads" className="text-[12px] text-brand inline-flex items-center gap-0.5">全部 {myLeads.length} 条 <ChevronRight className="h-3 w-3" /></Link>}>
            {myLeads.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-muted-foreground">还没有分派给你的线索。</div>
            ) : (
              <ul className="divide-y divide-border">
                {myLeads.slice(0, 6).map((l) => (
                  <li key={l.id}>
                    <Link href={`/dashboard/enterprise/leads/${l.id}`} className="py-3 flex items-center gap-3 -mx-2 px-2 rounded-lg hover:bg-surface transition-colors group">
                      <span className="h-9 w-9 rounded-full bg-cat-decor-soft text-cat-decor inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{l.name.slice(0, 1)}</span>
                      <span className="flex-1 min-w-0">
                        <span className="font-medium truncate block group-hover:text-brand transition-colors">{l.name}</span>
                        <span className="text-[11px] text-muted-foreground truncate block">{l.type || "—"}{l.area ? ` · ${l.area}㎡` : ""} · {l.source}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
        {canProjects && (
          <Panel title="我的报备" action={<Link href="/dashboard/enterprise/projects" className="text-[12px] text-brand inline-flex items-center gap-0.5">全部 {myReports.length} 条 <ChevronRight className="h-3 w-3" /></Link>}>
            {myReports.length === 0 ? (
              <div className="py-8 text-center text-[13px] text-muted-foreground">还没有分派给你的报备。</div>
            ) : (
              <ul className="divide-y divide-border">
                {myReports.slice(0, 6).map((r) => {
                  const st = RPT_LABEL[r.status] ?? RPT_LABEL.pending;
                  return (
                    <li key={r.id} className="py-3 flex items-center gap-3">
                      <FileCheck2 className="h-4 w-4 text-cat-build shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{r.project}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5"><code className="font-mono">{r.code}</code> · {dstr(r.createdAt)}</div>
                      </div>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-surface p-4 text-[12px] text-muted-foreground inline-flex items-center gap-2">
        <Megaphone className="h-4 w-4 text-cat-build" /> 协会通知 / 知识库见左侧「协会资讯」。
      </div>
    </EnterpriseShell>
  );
}

// 待办 · 待跟进 区块（老板看全公司 / 成员看分派给自己；空时显示"已清空"）
function TodoBlock({ leads, reports, scope }: { leads: LeadTodo[]; reports: ReportTodo[]; scope: "mine" | "company" }) {
  const total = leads.length + reports.length;
  if (total === 0) {
    return (
      <div className="mb-5 rounded-2xl border border-border bg-surface p-4 flex items-center gap-3">
        <span className="h-9 w-9 rounded-xl bg-accent-tea/15 text-accent-tea inline-flex items-center justify-center shrink-0"><ListChecks className="h-5 w-5" /></span>
        <div className="text-[13px]"><b className="text-accent-tea">待办已清空</b><span className="text-muted-foreground"> · {scope === "mine" ? "分派给你的线索都跟进到位了" : "暂无待跟进线索 / 待整改报备"}</span></div>
      </div>
    );
  }
  const showLeads = leads.slice(0, 6);
  const moreLeads = leads.length - showLeads.length;
  return (
    <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft/30 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-cat-decor/20">
        <span className="relative h-8 w-8 rounded-xl bg-cat-decor text-white inline-flex items-center justify-center shrink-0">
          <AlertCircle className="h-4 w-4" />
          <span className="absolute inset-0 rounded-xl bg-cat-decor/40 animate-ping opacity-30" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold">待办 · {total} 项需要处理</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {leads.length > 0 && <span>{leads.length} 条线索待跟进</span>}
            {leads.length > 0 && reports.length > 0 && <span> · </span>}
            {reports.length > 0 && <span>{reports.length} 项报备待整改</span>}
            {scope === "company" ? " · 全公司" : " · 分派给你"}
          </div>
        </div>
      </div>
      <ul className="divide-y divide-cat-decor/15">
        {showLeads.map((t) => (
          <li key={`l-${t.lead.id}`}>
            <Link href={`/dashboard/enterprise/leads/${t.lead.id}`} className="flex items-center gap-3 px-4 py-2.5 -mx-0 hover:bg-cat-decor-soft/40 transition-colors group">
              <span className="h-8 w-8 rounded-full bg-cat-decor-soft text-cat-decor inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{t.lead.name.slice(0, 1)}</span>
              <span className="flex-1 min-w-0">
                <span className="text-[13px] font-medium truncate block group-hover:text-brand transition-colors">{t.lead.name}<span className="text-muted-foreground font-normal"> · {t.lead.type || "线索"}{t.lead.area ? ` · ${t.lead.area}㎡` : ""}</span></span>
                <span className="text-[11px] mt-0.5 inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> {t.reason}</span>
              </span>
              <Badge tone={t.tone === "decor" ? "decor" : "yellow"} className="shrink-0">{t.tone === "decor" ? "待首联" : "停滞"}</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          </li>
        ))}
        {reports.map((t) => (
          <li key={`r-${t.report.id}`}>
            <Link href={`/dashboard/enterprise/projects/${t.report.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cat-decor-soft/40 transition-colors group">
              <span className="h-8 w-8 rounded-full bg-cat-build-soft text-cat-build inline-flex items-center justify-center shrink-0"><FileCheck2 className="h-4 w-4" /></span>
              <span className="flex-1 min-w-0">
                <span className="text-[13px] font-medium truncate block group-hover:text-brand transition-colors">{t.report.project}</span>
                <span className="text-[11px] mt-0.5 inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> {t.reason}</span>
              </span>
              <Badge tone="decor" className="shrink-0">已驳回</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      {moreLeads > 0 && (
        <Link href="/dashboard/enterprise/leads" className="block px-4 py-2.5 text-[12px] text-brand border-t border-cat-decor/15 hover:bg-cat-decor-soft/30 transition-colors">
          还有 {moreLeads} 条待跟进线索，查看全部 →
        </Link>
      )}
    </div>
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
