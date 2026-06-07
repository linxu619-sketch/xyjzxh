import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { listMediations, type MediationStatus } from "@/lib/data/mediations";

export const metadata = { title: "调解纠纷 · 协会工作台" };

const STATUS_LABEL: Record<string, string> = { pending: "待受理", accepted: "受理中", closed: "已结案", rejected: "已驳回" };
const STATUS_TONE: Record<string, "yellow" | "brand" | "tea" | "decor"> = { pending: "yellow", accepted: "brand", closed: "tea", rejected: "decor" };
const FILTERABLE: MediationStatus[] = ["pending", "accepted", "closed"];

export default async function MediationsAdmin({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const all = listMediations();
  // 默认落在「待受理」；显式 ?f=all 才看全部
  const active = f === "all" ? undefined : f && FILTERABLE.includes(f as MediationStatus) ? (f as MediationStatus) : "pending";
  const list = active ? all.filter((m) => m.status === active) : all;
  const count = (st: MediationStatus) => all.filter((m) => m.status === st).length;
  const base = "/dashboard/association/mediations";
  const href = (st: MediationStatus) => `${base}?f=${st}`;

  return (
    <AssociationShell
      title="调解纠纷"
      subtitle={`${count("pending")} 起待受理 · 累计 ${all.length} 起`}
      actions={
        <Link href="/ai/mediate" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 小和
        </Link>
      }
    >
      <StatFilters
        items={[
          { key: "pending", label: "待受理", value: count("pending"), color: "text-cat-decor", href: href("pending"), active: active === "pending" },
          { key: "accepted", label: "受理中", value: count("accepted"), color: "text-brand", href: href("accepted"), active: active === "accepted" },
          { key: "closed", label: "已结案", value: count("closed"), color: "text-accent-tea", href: href("closed"), active: active === "closed" },
          { key: "all", label: "全部", value: all.length, color: "text-cat-design", href: `${base}?f=all`, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>调解申请 · {active ? STATUS_LABEL[active] : "全部"}（{list.length}）</span>
          {active
            ? <Link href={`${base}?f=all`} className="text-[12px] text-brand font-normal">查看全部 →</Link>
            : <Link href={base} className="text-[12px] text-brand font-normal">回到待受理 →</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? `没有「${STATUS_LABEL[active]}」的调解。` : "暂无调解申请。用户在 /mediate 提交后会出现在这里。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_1fr_2.4fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>申请人</span><span>被投诉方</span><span>纠纷摘要</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {list.map((m) => (
                <li key={m.id}>
                  <Link href={`/dashboard/association/mediations/${m.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_1fr_2.4fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{m.applicant}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">{m.respondent ? `投诉 ${m.respondent} · ` : ""}{m.detail}</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{m.respondent || "—"}</span>
                    <span className="hidden md:block text-muted-foreground truncate">{m.detail}</span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0">
                      <Badge tone={STATUS_TONE[m.status] ?? "yellow"}>{STATUS_LABEL[m.status] ?? m.status}</Badge>
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
