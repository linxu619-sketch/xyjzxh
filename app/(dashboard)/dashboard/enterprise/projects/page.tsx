import Link from "next/link";
import { Plus } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { effectiveEnterpriseId } from "@/lib/dashboard/preview";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listReportsByEnterprise } from "@/lib/data/reports";

export const metadata = { title: "项目与报备 · 企业工作台" };

const TYPE_TONE: Record<string, "decor" | "build" | "design" | "tea"> = { 家装: "decor", 工装: "build", 公装: "design", 市政: "tea" };
const RPT_STATUS: Record<string, string> = { pending: "待审", approved: "已通过", rejected: "已驳回" };

function fmtDate(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function ProjectsPage() {
  const session = await getSession();
  const eid = effectiveEnterpriseId(session);
  const ent = eid ? await getEnterpriseBySlugOrId(eid) : undefined;
  // 按企业名/简称汇总本企业全部报备（不再只看当前登录人；不再混入全平台 mock 项目）
  const names = [ent?.name, ent?.hero.brand].filter(Boolean) as string[];
  const reports = listReportsByEnterprise(names);
  const count = (st: string) => reports.filter((r) => r.status === st).length;

  return (
    <EnterpriseShell
      title="项目与报备"
      subtitle={`${ent?.name ?? "本企业"} · 待审 ${count("pending")} · 已通过 ${count("approved")} · 累计 ${reports.length}`}
      actions={
        <Link href="/projects/new" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 新建报备
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "待审", v: count("pending"), c: "text-cat-decor" },
          { l: "已通过", v: count("approved"), c: "text-accent-tea" },
          { l: "已驳回", v: count("rejected"), c: "text-cat-design" },
          { l: "累计报备", v: reports.length, c: "text-cat-build" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="text-[14px] font-semibold">本企业报备（实时）</div>
          <span className="text-[12px] text-muted-foreground">协会审批后状态即时回显</span>
        </div>
        {reports.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">
            还没有报备。点右上「新建报备」提交工装报备（<Link href="/projects/new" className="text-brand">/projects/new</Link>），协会审批后状态会在这里实时显示。
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[120px_1.6fr_0.8fr_1fr_0.9fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>报备号</span><span>项目</span><span>类型</span><span>面积/预算</span><span>提交日期</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {reports.map((r) => (
                <li key={r.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[120px_1.6fr_0.8fr_1fr_0.9fr_auto] gap-3 items-center px-5 py-3.5 text-[13px]">
                  <code className="hidden md:block text-[12px] font-mono text-muted-foreground truncate">{r.code}</code>
                  <span className="min-w-0">
                    <span className="font-medium truncate block">{r.project}</span>
                    <span className="md:hidden text-[11px] text-muted-foreground truncate block">{r.code} · {r.area || "—"}㎡ · {r.budget || "—"}万</span>
                  </span>
                  <span className="hidden md:block">{r.type && <Badge tone={TYPE_TONE[r.type] ?? "build"}>{r.type}</Badge>}</span>
                  <span className="hidden md:block text-muted-foreground">{r.area || "—"}㎡ · {r.budget || "—"}万</span>
                  <span className="hidden md:block text-muted-foreground text-[12px]">{fmtDate(r.createdAt)}</span>
                  <span className="text-right shrink-0">
                    <Badge tone={r.status === "approved" ? "tea" : r.status === "rejected" ? "decor" : "yellow"}>{RPT_STATUS[r.status] ?? r.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </EnterpriseShell>
  );
}
