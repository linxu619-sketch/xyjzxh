import Link from "next/link";
import {
  ArrowLeft, Phone, MapPin, MessageSquareText, CheckCircle2, XCircle, RotateCcw, ClipboardCheck, UserCog,
} from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getLead, type LeadStatus } from "@/lib/data/leads";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";
import { listStaffByEnterprise, type EntStaffRole } from "@/lib/data/enterprise-staff";
import { updateLeadStatusAction } from "../actions";
import { AssigneeSelect } from "../AssigneeSelect";

export const metadata = { title: "线索详情 · 企业工作台" };

const ROLE_LABEL: Record<EntStaffRole, string> = {
  owner: "负责人", admin: "管理员", sales: "销售顾问", site_manager: "项目经理",
  designer: "设计师", finance: "财务", viewer: "查看者",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "新线索", contacting: "沟通中", surveying: "量房中", signed: "已签单", lost: "已流失",
};
const STATUS_TONE: Record<LeadStatus, "build" | "brand" | "tea" | "neutral"> = {
  new: "build", contacting: "brand", surveying: "brand", signed: "tea", lost: "neutral",
};

// 当前状态可执行的下一步动作
const FLOW: Record<LeadStatus, { to: LeadStatus; label: string; icon: "next" | "sign" | "lost" | "reopen" }[]> = {
  new: [{ to: "contacting", label: "开始跟进", icon: "next" }, { to: "lost", label: "标记流失", icon: "lost" }],
  contacting: [{ to: "surveying", label: "已约量房", icon: "next" }, { to: "lost", label: "标记流失", icon: "lost" }],
  surveying: [{ to: "signed", label: "已签单", icon: "sign" }, { to: "lost", label: "标记流失", icon: "lost" }],
  signed: [],
  lost: [{ to: "new", label: "重新激活", icon: "reopen" }],
};

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const lead = getLead(Number(id));
  const owned = lead && session?.enterpriseId && lead.enterpriseId === session.enterpriseId;

  if (!lead || !owned) {
    return (
      <EnterpriseShell title="线索详情">
        <Link href="/dashboard/enterprise/leads" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回线索列表</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该线索，或它不属于本企业。</div>
      </EnterpriseShell>
    );
  }

  const flow = FLOW[lead.status] ?? [];
  const eid = effectiveEnterpriseId(session);
  const staff = eid ? listStaffByEnterprise(eid).filter((m) => m.status === "active") : [];
  const assigneeOptions = staff.map((m) => ({ value: m.id, label: `${m.name} · ${ROLE_LABEL[m.role]}` }));
  const assignee = staff.find((m) => m.id === lead.assigneeStaffId);

  return (
    <EnterpriseShell title="线索详情" subtitle={`${lead.name} · ${lead.source}`}>
      <Link href="/dashboard/enterprise/leads" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回线索列表</Link>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-full bg-cat-decor-soft text-cat-decor inline-flex items-center justify-center text-[14px] font-semibold">{lead.name.slice(0, 1)}</span>
            <span className="text-[16px] font-semibold">{lead.name}</span>
          </div>
          <Badge tone={STATUS_TONE[lead.status]}>{STATUS_LABEL[lead.status]}</Badge>
        </div>
        <dl className="divide-y divide-border">
          <Row k="联系电话" v={<a href={`tel:${lead.phone}`} className="text-brand inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {lead.phone}</a>} />
          <Row k="项目类型" v={lead.type || "—"} />
          <Row k="风格偏好" v={lead.style || "—"} />
          <Row k="面积 / 预算" v={`${lead.area || "—"} ㎡ · ${lead.budget || "—"} 万`} />
          <Row k="项目地址" v={lead.address ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{lead.address}</span> : "—"} />
          <Row k="补充需求" v={lead.note || "—"} />
          <Row k="来源" v={lead.source} />
          <Row k="提交时间" v={fmt(lead.createdAt)} />
        </dl>
      </div>

      {/* 负责人 / 分派 */}
      <div className="mt-5 rounded-2xl border border-border bg-background p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-9 w-9 rounded-xl bg-cat-build-soft text-cat-build inline-flex items-center justify-center shrink-0"><UserCog className="h-4 w-4" /></span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">负责人</div>
            <div className="text-[12px] text-muted-foreground">
              {assignee ? <>当前由 <b className="text-foreground">{assignee.name}</b>（{ROLE_LABEL[assignee.role]}）跟进</> : "尚未分派；选一名成员负责跟进，业绩计入其团队看板。"}
            </div>
          </div>
        </div>
        {staff.length === 0 ? (
          <Link href="/dashboard/enterprise/team" className="text-[12px] text-brand inline-flex items-center gap-0.5 shrink-0">先去添加团队成员 →</Link>
        ) : (
          <AssigneeSelect leadId={lead.id} staffId={lead.assigneeStaffId} options={assigneeOptions} />
        )}
      </div>

      {/* 状态流转 */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        {flow.length === 0 ? (
          <div className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-accent-tea" /> 当前状态：{STATUS_LABEL[lead.status]} · 无需进一步操作。</div>
        ) : (
          flow.map((f) => (
            <form key={f.to} action={updateLeadStatusAction}>
              <input type="hidden" name="id" value={lead.id} />
              <input type="hidden" name="status" value={f.to} />
              <button className={btnClass(f.icon)}>
                {f.icon === "sign" ? <ClipboardCheck className="h-4 w-4" /> : f.icon === "lost" ? <XCircle className="h-4 w-4" /> : f.icon === "reopen" ? <RotateCcw className="h-4 w-4" /> : <MessageSquareText className="h-4 w-4" />}
                {f.label}
              </button>
            </form>
          ))
        )}
      </div>
    </EnterpriseShell>
  );
}

function btnClass(icon: "next" | "sign" | "lost" | "reopen") {
  const base = "h-11 px-6 rounded-full text-[14px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform";
  if (icon === "sign") return `${base} bg-accent-tea text-white`;
  if (icon === "lost") return `${base} border border-cat-decor/40 text-cat-decor`;
  if (icon === "reopen") return `${base} border border-border text-foreground`;
  return `${base} bg-foreground text-background`;
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4 text-[14px]">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right break-all whitespace-pre-wrap">{v || "—"}</dd>
    </div>
  );
}
