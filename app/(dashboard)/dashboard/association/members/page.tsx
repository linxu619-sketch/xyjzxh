import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { ENTERPRISES } from "@/lib/data/enterprises";
import { listApplications, type Application } from "@/lib/data/applications";

export const metadata = { title: "会员审核 · 协会工作台" };

const TYPE_LABEL = { enterprise: "企业会员", individual: "个人会员", customer: "业主" } as const;
const TYPE_TONE = { enterprise: "build", individual: "design", customer: "decor" } as const;
const STATUS_LABEL: Record<string, string> = { pending: "待审核", approved: "已通过", rejected: "已驳回" };

function summarize(a: Application): string {
  const p = a.payload as Record<string, string>;
  return [p.entType || p.profession, p.region || p.city].filter(Boolean).join(" · ");
}

export default function MembersAdmin() {
  const all = listApplications();
  const pending = all.filter((a) => a.status === "pending");

  return (
    <AssociationShell
      title="会员审核"
      subtitle={`${pending.length} 份待审 · 已在册企业 ${ENTERPRISES.length} 家`}
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "待审核", v: pending.length, c: "text-cat-decor" },
          { l: "已通过", v: all.filter((a) => a.status === "approved").length, c: "text-accent-tea" },
          { l: "已驳回", v: all.filter((a) => a.status === "rejected").length, c: "text-cat-design" },
          { l: "在册企业", v: ENTERPRISES.length, c: "text-cat-build" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* 入会申请（点整行进入详情处理）*/}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold">入会申请 · 点击查看并处理</div>
        {all.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无入会申请。用户在 /join → /register 提交后会出现在这里。</div>
        ) : (
          <ul className="divide-y divide-border">
            {all.map((a) => (
              <li key={a.id}>
                <Link href={`/dashboard/association/members/${a.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-surface transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{a.applicant}</span>
                      <Badge tone={TYPE_TONE[a.type]}>{TYPE_LABEL[a.type]}</Badge>
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 truncate">
                      {a.phone}{summarize(a) ? ` · ${summarize(a)}` : ""}
                    </div>
                  </div>
                  <Badge tone={a.status === "approved" ? "tea" : a.status === "rejected" ? "decor" : "yellow"} className="shrink-0">{STATUS_LABEL[a.status]}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 企业通过后自动入册 /members，个人会员入册 /practitioners。
      </div>
    </AssociationShell>
  );
}
