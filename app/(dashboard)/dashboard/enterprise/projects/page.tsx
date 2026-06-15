import Link from "next/link";
import { Plus } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { effectiveEnterpriseId, isEnterprisePreview } from "@/lib/dashboard/preview";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReportsByEnterprise } from "@/lib/data/reports";
import { listStaffByEnterprise, type EntStaffRole } from "@/lib/data/enterprise-staff";
import { entScopesOwnData, entStaffId } from "@/lib/auth/ent-access";
import { ReportAssigneeSelect } from "./ReportAssigneeSelect";

export const metadata = { title: "项目与报备 · 企业工作台" };

const TYPE_TONE: Record<string, "decor" | "build" | "design" | "tea"> = { 家装: "decor", 工装: "build", 公装: "design", 市政: "tea" };
const RPT_STATUS: Record<string, string> = { pending: "待审", approved: "已通过", rejected: "已驳回" };
const ROLE_LABEL: Record<EntStaffRole, string> = {
  owner: "负责人", admin: "管理员", sales: "销售顾问", site_manager: "项目经理",
  designer: "设计师", finance: "财务", viewer: "查看者",
};

function fmtDate(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function ProjectsPage() {
  const session = await getSession();
  const eid = effectiveEnterpriseId(session);
  const preview = isEnterprisePreview(session);
  const ent = eid ? await getEnterpriseBySlugOrId(eid) : undefined;
  // 按企业名/简称汇总本企业全部报备（不再只看当前登录人；不再混入全平台 mock 项目）
  const names = [ent?.name, ent?.hero.brand].filter(Boolean) as string[];
  // 受限成员（项目经理/设计师）只看分派给自己的报备
  const scoped = entScopesOwnData(session);
  const sid = entStaffId(session);
  const reports = listReportsByEnterprise(names).filter((r) => !scoped || r.assigneeStaffId === sid);
  const count = (st: string) => reports.filter((r) => r.status === st).length;
  const unassigned = scoped ? 0 : reports.filter((r) => !r.assigneeStaffId).length;
  // 团队成员（在职）用于分派；名册映射用于只读展示
  const staff = eid ? listStaffByEnterprise(eid).filter((m) => m.status === "active") : [];
  const staffName = new Map(staff.map((m) => [m.id, m.name]));
  const assigneeOptions = staff.map((m) => ({ value: m.id, label: `${m.name} · ${ROLE_LABEL[m.role]}` }));

  return (
    <EnterpriseShell
      title="项目与报备"
      subtitle={`${ent?.name ?? "本企业"} · 待审 ${count("pending")} · 已通过 ${count("approved")} · 累计 ${reports.length}`}
      actions={
        <Link href="/projects/new" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 新建报备
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "待审", v: count("pending"), c: "text-cat-decor" },
          { l: "已通过", v: count("approved"), c: "text-accent-tea" },
          { l: "已驳回", v: count("rejected"), c: "text-cat-design" },
          { l: "累计报备", v: reports.length, c: "text-cat-build" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
          <div className="text-[14px] font-semibold inline-flex items-center gap-2">本企业报备（实时）
            {unassigned > 0 && <span className="text-[11px] font-normal text-accent-yellow border border-accent-yellow/40 rounded-full px-2 py-0.5">{unassigned} 条未分派</span>}
          </div>
          <span className="text-[12px] text-muted-foreground shrink-0">协会审批后状态即时回显</span>
        </div>
        {reports.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">
            还没有报备。点右上「新建报备」提交工装报备（<Link href="/projects/new" className="text-brand">/projects/new</Link>），协会审批后状态会在这里实时显示。
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[110px_1.5fr_0.7fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>报备号</span><span>项目</span><span>类型</span><span>面积/预算</span><span>负责人</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {reports.map((r) => (
                <li key={r.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[110px_1.5fr_0.7fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px]">
                  <code className="hidden md:block text-[12px] font-mono text-muted-foreground truncate">{r.code}</code>
                  <span className="min-w-0">
                    <Link href={`/dashboard/enterprise/projects/${r.id}`} className="font-medium truncate block hover:text-brand transition-colors">{r.project}</Link>
                    <span className="md:hidden text-[11px] text-muted-foreground truncate block">{r.code} · {r.area || "—"}㎡ · {r.budget || "—"}万 · {fmtDate(r.createdAt)}</span>
                  </span>
                  <span className="hidden md:block">{r.type && <Badge tone={TYPE_TONE[r.type] ?? "build"}>{r.type}</Badge>}</span>
                  <span className="hidden md:block text-muted-foreground">{r.area || "—"}㎡ · {r.budget || "—"}万</span>
                  <span className="hidden md:block">
                    {preview || scoped || staff.length === 0
                      ? <span className="text-[12px]">{r.assigneeStaffId && staffName.get(r.assigneeStaffId) ? <span className="text-foreground">{staffName.get(r.assigneeStaffId)}</span> : <span className="text-accent-yellow">未分派</span>}</span>
                      : <ReportAssigneeSelect reportId={r.id} staffId={r.assigneeStaffId} options={assigneeOptions} />}
                  </span>
                  <span className="text-right shrink-0">
                    <Badge tone={r.status === "approved" ? "tea" : r.status === "rejected" ? "decor" : "yellow"}>{RPT_STATUS[r.status] ?? r.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </EnterpriseShell>
  );
}
