import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { listMediations } from "@/lib/data/mediations";

export const metadata = { title: "调解纠纷 · 协会工作台" };

const STATUS_LABEL: Record<string, string> = { pending: "待受理", accepted: "受理中", closed: "已结案", rejected: "已驳回" };
const STATUS_TONE: Record<string, "yellow" | "brand" | "tea" | "decor"> = { pending: "yellow", accepted: "brand", closed: "tea", rejected: "decor" };

export default function MediationsAdmin() {
  const all = listMediations();
  const pending = all.filter((m) => m.status === "pending");

  return (
    <AssociationShell
      title="调解纠纷"
      subtitle={`${pending.length} 起待受理 · 累计 ${all.length} 起`}
      actions={
        <Link href="/ai/mediate" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 小和
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "待受理", v: pending.length, c: "text-cat-decor" },
          { l: "受理中", v: all.filter((m) => m.status === "accepted").length, c: "text-brand" },
          { l: "已结案", v: all.filter((m) => m.status === "closed").length, c: "text-accent-tea" },
          { l: "累计", v: all.length, c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold">调解申请 · 点击查看并处理</div>
        {all.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">暂无调解申请。用户在 /mediate 提交后会出现在这里。</div>
        ) : (
          <ul className="divide-y divide-border">
            {all.map((m) => (
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
