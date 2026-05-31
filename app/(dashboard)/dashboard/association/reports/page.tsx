import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { listReports } from "@/lib/data/reports";

export const metadata = { title: "工装报备审批 · 协会工作台" };

const TYPE_TONE: Record<string, "decor" | "build" | "design" | "tea"> = { 家装: "decor", 工装: "build", 公装: "design", 市政: "tea" };
const STATUS_LABEL: Record<string, string> = { pending: "待审核", approved: "已通过", rejected: "已驳回" };

export default function ReportsAdmin() {
  const all = listReports();
  const pending = all.filter((r) => r.status === "pending");

  return (
    <AssociationShell
      title="工装报备审批"
      subtitle={`${pending.length} 项待审 · 累计 ${all.length} 项`}
      actions={
        <Link href="#" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 批量预审
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "待审", v: pending.length, c: "text-cat-decor" },
          { l: "已通过", v: all.filter((r) => r.status === "approved").length, c: "text-accent-tea" },
          { l: "已驳回", v: all.filter((r) => r.status === "rejected").length, c: "text-cat-design" },
          { l: "累计报备", v: all.length, c: "text-cat-build" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold">工装报备 · 点击查看并审批</div>
        {all.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无报备。企业在 /projects/new 提交后会出现在这里。</div>
        ) : (
          <ul className="divide-y divide-border">
            {all.map((r) => (
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
