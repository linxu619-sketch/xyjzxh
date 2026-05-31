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
  const active = f && FILTERABLE.includes(f as MediationStatus) ? (f as MediationStatus) : undefined;
  const list = active ? all.filter((m) => m.status === active) : all;
  const count = (st: MediationStatus) => all.filter((m) => m.status === st).length;
  const base = "/dashboard/association/mediations";
  const href = (st: MediationStatus) => (active === st ? base : `${base}?f=${st}`);

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
          { key: "all", label: "累计", value: all.length, color: "text-cat-design", href: base, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>调解申请 · 点击查看并处理</span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal">清除筛选（{STATUS_LABEL[active]}）✕</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? `没有「${STATUS_LABEL[active]}」的调解。` : "暂无调解申请。用户在 /mediate 提交后会出现在这里。"}</div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((m) => (
              <li key={m.id}>
                <Link href={`/dashboard/association/mediations/${m.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-surface transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{m.applicant}</span>
                      {m.respondent && <span className="text-[12px] text-muted-foreground">投诉 {m.respondent}</span>}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 truncate">{m.detail}</div>
                  </div>
                  <Badge tone={STATUS_TONE[m.status] ?? "yellow"} className="shrink-0">{STATUS_LABEL[m.status] ?? m.status}</Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AssociationShell>
  );
}
