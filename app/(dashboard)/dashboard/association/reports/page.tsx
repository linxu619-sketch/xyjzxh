import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { listReports, type ReportStatus } from "@/lib/data/reports";

export const metadata = { title: "工装报备审批 · 协会工作台" };

const TYPE_TONE: Record<string, "decor" | "build" | "design" | "tea"> = { 家装: "decor", 工装: "build", 公装: "design", 市政: "tea" };
const STATUS_LABEL: Record<string, string> = { pending: "待审", approved: "已通过", rejected: "已驳回" };
const FILTERABLE: ReportStatus[] = ["pending", "approved", "rejected"];

export default async function ReportsAdmin({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const all = listReports();
  // 默认落在「待审」；显式 ?f=all 才看全部
  const active = f === "all" ? undefined : f && FILTERABLE.includes(f as ReportStatus) ? (f as ReportStatus) : "pending";
  const list = active ? all.filter((r) => r.status === active) : all;
  const count = (st: ReportStatus) => all.filter((r) => r.status === st).length;
  const base = "/dashboard/association/reports";
  const href = (st: ReportStatus) => `${base}?f=${st}`;

  return (
    <AssociationShell
      title="工装报备审批"
      subtitle={`${count("pending")} 项待审 · 累计 ${all.length} 项`}
      actions={
        <span className="h-9 px-4 rounded-full border border-white/25 bg-white/10 text-white/80 text-[13px] font-medium inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 批量预审 · 即将开放
        </span>
      }
    >
      <StatFilters
        items={[
          { key: "pending", label: "待审", value: count("pending"), color: "text-cat-decor", href: href("pending"), active: active === "pending" },
          { key: "approved", label: "已通过", value: count("approved"), color: "text-accent-tea", href: href("approved"), active: active === "approved" },
          { key: "rejected", label: "已驳回", value: count("rejected"), color: "text-cat-design", href: href("rejected"), active: active === "rejected" },
          { key: "all", label: "全部报备", value: all.length, color: "text-cat-build", href: `${base}?f=all`, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>工装报备 · {active ? STATUS_LABEL[active] : "全部"}（{list.length}）</span>
          {active
            ? <Link href={`${base}?f=all`} className="text-[12px] text-brand font-normal">查看全部 →</Link>
            : <Link href={base} className="text-[12px] text-brand font-normal">回到待审 →</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? `没有「${STATUS_LABEL[active]}」的报备。` : "暂无报备。企业在 /projects/new 提交后会出现在这里。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[110px_1.8fr_1.2fr_0.7fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>报备号</span><span>项目</span><span>企业</span><span>面积/预算</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {list.map((r) => (
                <li key={r.id}>
                  <Link href={`/dashboard/association/reports/${r.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[110px_1.8fr_1.2fr_0.7fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="hidden md:block font-mono text-[12px] text-muted-foreground truncate">{r.code}</span>
                    <span className="min-w-0">
                      <span className="font-medium truncate flex items-center gap-1.5">{r.project}{r.type && <Badge tone={TYPE_TONE[r.type] ?? "build"} className="!px-1.5 !py-0">{r.type}</Badge>}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">{r.enterprise} · {r.area || "—"}㎡ · {r.budget || "—"}万</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{r.enterprise}</span>
                    <span className="hidden md:block text-muted-foreground">{r.area || "—"}㎡ · {r.budget || "—"}万</span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0">
                      <Badge tone={r.status === "approved" ? "tea" : r.status === "rejected" ? "decor" : "yellow"}>{STATUS_LABEL[r.status]}</Badge>
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
