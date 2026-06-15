import Link from "next/link";
import { ArrowLeft, MapPin, History, Send, MessageSquareText, ShieldCheck, UserCog, CalendarDays } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { effectiveEnterpriseId, isEnterprisePreview } from "@/lib/dashboard/preview";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getReport } from "@/lib/data/reports";
import { listReportActivities } from "@/lib/data/report-activities";
import { listStaffByEnterprise, type EntStaffRole } from "@/lib/data/enterprise-staff";
import { entScopesOwnData, entStaffId, ENT_ROLE_LABEL } from "@/lib/auth/ent-access";
import { ReportAssigneeSelect } from "../ReportAssigneeSelect";
import { addReportNoteAction } from "../actions";

export const metadata = { title: "报备详情 · 企业工作台" };

const ROLE_LABEL: Record<EntStaffRole, string> = {
  owner: "负责人", admin: "管理员", sales: "销售顾问", site_manager: "项目经理",
  designer: "设计师", finance: "财务", viewer: "查看者",
};
const RPT_STATUS: Record<string, { label: string; tone: "tea" | "decor" | "yellow" }> = {
  approved: { label: "已通过", tone: "tea" }, rejected: { label: "已驳回", tone: "decor" }, pending: { label: "待协会审批", tone: "yellow" },
};

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function ReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const eid = effectiveEnterpriseId(session);
  const preview = isEnterprisePreview(session);
  const ent = eid ? await getEnterpriseBySlugOrId(eid) : undefined;
  const names = [ent?.name, ent?.hero.brand].filter(Boolean).map((n) => (n as string).trim());
  const report = getReport(Number(id));
  const owned = report && names.includes((report.enterprise || "").trim());
  const scoped = entScopesOwnData(session);
  const sid = entStaffId(session);
  const accessible = owned && (!scoped || report!.assigneeStaffId === sid);

  if (!report || !accessible) {
    return (
      <EnterpriseShell title="报备详情">
        <Link href="/dashboard/enterprise/projects" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回项目与报备</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该报备，或它不属于本企业。</div>
      </EnterpriseShell>
    );
  }

  const st = RPT_STATUS[report.status] ?? RPT_STATUS.pending;
  const pv = (k: string) => { const v = report.payload?.[k]; return typeof v === "string" && v.trim() ? v : ""; };
  const staff = eid ? listStaffByEnterprise(eid).filter((m) => m.status === "active") : [];
  const assigneeOptions = staff.map((m) => ({ value: m.id, label: `${m.name} · ${ROLE_LABEL[m.role]}` }));
  const assignee = staff.find((m) => m.id === report.assigneeStaffId);
  const activities = listReportActivities(report.id);
  const roleText = (r: string) => ENT_ROLE_LABEL[r as EntStaffRole] ?? r;
  const period = [pv("planStart"), pv("planEnd")].filter(Boolean).join(" 至 ");
  const canAssign = !preview && !scoped && staff.length > 0;

  return (
    <EnterpriseShell title="报备详情" subtitle={`${report.project} · ${report.code}`}>
      <Link href="/dashboard/enterprise/projects" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回项目与报备</Link>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold truncate">{report.project}</div>
            <code className="text-[12px] font-mono text-muted-foreground">{report.code}</code>
          </div>
          <Badge tone={st.tone}>{st.label}</Badge>
        </div>
        <dl className="divide-y divide-border">
          <Row k="项目类型" v={report.type || "—"} />
          <Row k="面积 / 预算" v={`${report.area || "—"} ㎡ · ${report.budget || "—"} 万`} />
          {period && <Row k="计划工期" v={<span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />{period}</span>} />}
          {pv("address") && <Row k="项目地址" v={<span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{pv("address")}</span>} />}
          {pv("summary") && <Row k="项目概况" v={pv("summary")} />}
          <Row k="项目经理" v={`${report.manager || pv("manager") || "—"}${report.phone ? ` · ${report.phone}` : ""}`} />
          {pv("safetyOfficer") && <Row k="安全负责人" v={`${pv("safetyOfficer")}${pv("safetyCert") ? ` · ${pv("safetyCert")}` : ""}`} />}
          <Row k="提交时间" v={fmt(report.createdAt)} />
        </dl>
        <div className="px-5 py-3 border-t border-border text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 审批状态由协会工装报备审核决定，企业端只读。
        </div>
      </div>

      {/* 负责人 / 分派 */}
      <div className="mt-5 rounded-2xl border border-border bg-background p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-9 w-9 rounded-xl bg-cat-build-soft text-cat-build inline-flex items-center justify-center shrink-0"><UserCog className="h-4 w-4" /></span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">负责人</div>
            <div className="text-[12px] text-muted-foreground">{assignee ? <>当前由 <b className="text-foreground">{assignee.name}</b>（{ROLE_LABEL[assignee.role]}）负责</> : "尚未分派给成员。"}</div>
          </div>
        </div>
        {canAssign
          ? <ReportAssigneeSelect reportId={report.id} staffId={report.assigneeStaffId} options={assigneeOptions} />
          : scoped ? <span className="text-[12px] text-muted-foreground shrink-0">由你负责</span> : null}
      </div>

      {/* 跟进记录 */}
      <div className="mt-6 rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5">
          <History className="h-4 w-4 text-cat-build" /> 跟进记录 <span className="text-[12px] font-normal text-muted-foreground">（{activities.length}）</span>
        </div>
        {!preview && (
          <form action={addReportNoteAction} className="px-5 py-4 border-b border-border">
            <input type="hidden" name="id" value={report.id} />
            <div className="flex flex-col sm:flex-row gap-2.5 sm:items-end">
              <textarea name="note" rows={2} required placeholder="记一条跟进：如「已现场交底，材料进场，下周开工」…" className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-foreground/30 resize-none" />
              <button className="h-10 px-5 rounded-xl bg-foreground text-background text-[13px] font-medium inline-flex items-center justify-center gap-1.5 shrink-0"><Send className="h-3.5 w-3.5" /> 记录</button>
            </div>
          </form>
        )}
        {activities.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-muted-foreground">还没有跟进记录。记第一条施工/对接进展。</div>
        ) : (
          <ul className="divide-y divide-border">
            {activities.map((a) => (
              <li key={a.id} className="px-5 py-3.5 flex gap-3">
                <span className="h-8 w-8 rounded-full bg-cat-build-soft text-cat-build inline-flex items-center justify-center shrink-0"><MessageSquareText className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] whitespace-pre-wrap break-words">{a.note}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5"><b className="text-foreground">{a.authorName}</b>{a.authorRole && <> · {roleText(a.authorRole)}</>} · {fmt(a.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </EnterpriseShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4 text-[14px]">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right break-all whitespace-pre-wrap">{v || "—"}</dd>
    </div>
  );
}
