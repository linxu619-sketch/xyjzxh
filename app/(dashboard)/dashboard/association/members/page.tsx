import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { getEnterprises } from "@/lib/data/enterprises-source";
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
  // 默认落在「待审核」（协会职员进来最该先处理待审）；显式 ?f=all 才看全部
  const active = f === "all" ? undefined : f && FILTERABLE.includes(f as AppStatus) ? (f as AppStatus) : "pending";
  const list = active ? all.filter((a) => a.status === active) : all;
  const count = (st: AppStatus) => all.filter((a) => a.status === st).length;
  const entCount = (await getEnterprises()).length;
  const base = "/dashboard/association/members";
  const href = (st: AppStatus) => `${base}?f=${st}`;

  return (
    <AssociationShell
      title="会员审核"
      subtitle={`${count("pending")} 份待审 · 已在册企业 ${entCount} 家`}
    >
      {/* 可点统计筛选 */}
      <StatFilters
        items={[
          { key: "pending", label: "待审核", value: count("pending"), color: "text-cat-decor", href: href("pending"), active: active === "pending" },
          { key: "approved", label: "已通过", value: count("approved"), color: "text-accent-tea", href: href("approved"), active: active === "approved" },
          { key: "rejected", label: "已驳回", value: count("rejected"), color: "text-cat-design", href: href("rejected"), active: active === "rejected" },
          { key: "enterprises", label: "在册企业", value: entCount, color: "text-cat-build", href: "/members" },
        ]}
      />

      {/* 入会申请（点整行进入详情处理）*/}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>入会申请 · {active ? STATUS_LABEL[active] : "全部"}（{list.length}）</span>
          {active
            ? <Link href={`${base}?f=all`} className="text-[12px] text-brand font-normal">查看全部 →</Link>
            : <Link href={base} className="text-[12px] text-brand font-normal">回到待审核 →</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? `没有「${STATUS_LABEL[active]}」的申请。` : "暂无入会申请。用户在 /join → /register 提交后会出现在这里。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.4fr_0.9fr_1fr_1.3fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>申请人</span><span>类型</span><span>手机号</span><span>简介</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {list.map((a) => (
                <li key={a.id}>
                  <Link href={`/dashboard/association/members/${a.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_0.9fr_1fr_1.3fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{a.applicant}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">{TYPE_LABEL[a.type]} · {a.phone}{summarize(a) ? ` · ${summarize(a)}` : ""}</span>
                    </span>
                    <span className="hidden md:block"><Badge tone={TYPE_TONE[a.type]}>{TYPE_LABEL[a.type]}</Badge></span>
                    <span className="hidden md:block text-muted-foreground tabular-nums">{a.phone}</span>
                    <span className="hidden md:block text-muted-foreground truncate">{summarize(a) || "—"}</span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0">
                      <Badge tone={a.status === "approved" ? "tea" : a.status === "rejected" ? "decor" : "yellow"}>{STATUS_LABEL[a.status]}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="mt-4 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 企业通过后自动入册 /members，个人会员入册 /practitioners。
      </div>
    </AssociationShell>
  );
}
