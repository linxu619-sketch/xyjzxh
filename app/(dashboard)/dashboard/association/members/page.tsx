import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { ENTERPRISES } from "@/lib/data/enterprises";
import { listApplications, type Application, type AppStatus } from "@/lib/data/applications";

export const metadata = { title: "会员审核 · 协会工作台" };

const FILTERABLE: AppStatus[] = ["pending", "approved", "rejected"];

const TYPE_LABEL = { enterprise: "企业会员", individual: "个人会员", customer: "业主" } as const;
const TYPE_TONE = { enterprise: "build", individual: "design", customer: "decor" } as const;
const STATUS_LABEL: Record<string, string> = { pending: "待审核", approved: "已通过", rejected: "已驳回" };

function summarize(a: Application): string {
  const p = a.payload as Record<string, string>;
  return [p.entType || p.profession, p.region || p.city].filter(Boolean).join(" · ");
}

export default async function MembersAdmin({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const all = listApplications();
  const active = f && FILTERABLE.includes(f as AppStatus) ? (f as AppStatus) : undefined;
  const list = active ? all.filter((a) => a.status === active) : all;
  const count = (st: AppStatus) => all.filter((a) => a.status === st).length;
  const base = "/dashboard/association/members";
  const href = (st: AppStatus) => (active === st ? base : `${base}?f=${st}`);

  return (
    <AssociationShell
      title="会员审核"
      subtitle={`${count("pending")} 份待审 · 已在册企业 ${ENTERPRISES.length} 家`}
    >
      {/* 可点统计筛选 */}
      <StatFilters
        items={[
          { key: "pending", label: "待审核", value: count("pending"), color: "text-cat-decor", href: href("pending"), active: active === "pending" },
          { key: "approved", label: "已通过", value: count("approved"), color: "text-accent-tea", href: href("approved"), active: active === "approved" },
          { key: "rejected", label: "已驳回", value: count("rejected"), color: "text-cat-design", href: href("rejected"), active: active === "rejected" },
          { key: "enterprises", label: "在册企业", value: ENTERPRISES.length, color: "text-cat-build", href: "/members" },
        ]}
      />

      {/* 入会申请（点整行进入详情处理）*/}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>入会申请 · 点击查看并处理</span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal">清除筛选（{STATUS_LABEL[active]}）✕</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? `没有「${STATUS_LABEL[active]}」的申请。` : "暂无入会申请。用户在 /join → /register 提交后会出现在这里。"}</div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((a) => (
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
