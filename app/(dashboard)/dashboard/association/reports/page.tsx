import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { listReports, type ReportStatus } from "@/lib/data/reports";

export const metadata = { title: "工装报备审批 · 协会工作台" };

const TYPE_TONE: Record<string, "decor" | "build" | "design" | "tea"> = { 家装: "decor", 工装: "build", 公装: "design", 市政: "tea" };
const STATUS_LABEL: Record<string, string> = { pending: "待审核", approved: "已通过", rejected: "已驳回" };
const FILTERABLE: ReportStatus[] = ["pending", "approved", "rejected"];

export default async function ReportsAdmin({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const all = listReports();
  const active = f && FILTERABLE.includes(f as ReportStatus) ? (f as ReportStatus) : undefined;
  const list = active ? all.filter((r) => r.status === active) : all;
  const count = (st: ReportStatus) => all.filter((r) => r.status === st).length;
  const base = "/dashboard/association/reports";
  const href = (st: ReportStatus) => (active === st ? base : `${base}?f=${st}`);

  return (
    <AssociationShell
      title="工装报备审批"
      subtitle={`${count("pending")} 项待审 · 累计 ${all.length} 项`}
      actions={
        <Link href="#" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 批量预审
        </Link>
      }
    >
      <StatFilters
        items={[
          { key: "pending", label: "待审", value: count("pending"), color: "text-cat-decor", href: href("pending"), active: active === "pending" },
          { key: "approved", label: "已通过", value: count("approved"), color: "text-accent-tea", href: href("approved"), active: active === "approved" },
          { key: "rejected", label: "已驳回", value: count("rejected"), color: "text-cat-design", href: href("rejected"), active: active === "rejected" },
          { key: "all", label: "累计报备", value: all.length, color: "text-cat-build", href: base, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>工装报备 · 点击查看并审批</span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal">清除筛选（{STATUS_LABEL[active]}）✕</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? `没有「${STATUS_LABEL[active]}」的报备。` : "暂无报备。企业在 /projects/new 提交后会出现在这里。"}</div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((r) => (
              <li key={r.id}>
                <Link href={`/dashboard/association/reports/${r.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-surface transition-colors">
                  <code className="text-[12px] font-mono text-muted-foreground shrink-0 hidden sm:inline">{r.code}</code>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{r.project}</span>
                      {r.type && <Badge tone={TYPE_TONE[r.type] ?? "build"}>{r.type}</Badge>}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5 truncate">{r.enterprise} · {r.area || "—"}㎡ · {r.budget || "—"}万</div>
                  </div>
                  <Badge tone={r.status === "approved" ? "tea" : r.status === "rejected" ? "decor" : "yellow"} className="shrink-0">{STATUS_LABEL[r.status]}</Badge>
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
