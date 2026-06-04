import Link from "next/link";
import { ChevronRight, GraduationCap, Users2, CheckCircle2, AlertCircle } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listTrainings, countEnrolled, type TrainingStatus } from "@/lib/data/training";
import { PublishTraining } from "./PublishTraining";

export const metadata = { title: "培训管理 · 协会工作台" };

const FILTERABLE: TrainingStatus[] = ["open", "closed"];

export default async function TrainingAdmin({ searchParams }: { searchParams: Promise<{ f?: string; tok?: string; terr?: string }> }) {
  const { f, tok, terr } = await searchParams;
  const all = listTrainings();
  const active = f && FILTERABLE.includes(f as TrainingStatus) ? (f as TrainingStatus) : undefined;
  const list = active ? all.filter((t) => t.status === active) : all;
  const openCount = all.filter((t) => t.status === "open").length;
  const closedCount = all.filter((t) => t.status === "closed").length;
  const totalEnroll = all.reduce((a, t) => a + countEnrolled(t.id), 0);
  const base = "/dashboard/association/training";
  const href = (st: TrainingStatus) => (active === st ? base : `${base}?f=${st}`);

  return (
    <AssociationShell title="培训管理" subtitle={`在招 ${openCount} 门 · 累计报名 ${totalEnroll}`} actions={<PublishTraining />}>
      {tok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>已发布！</b>从业者可在「培训」报名。</div></div>}
      {terr && <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3"><AlertCircle className="h-5 w-5 shrink-0" /><div className="text-[13px]">发布失败：请填写课程标题。</div></div>}

      <StatFilters
        items={[
          { key: "open", label: "在招课程", value: openCount, color: "text-cat-design", href: href("open"), active: active === "open" },
          { key: "closed", label: "已结束", value: closedCount, color: "text-muted-foreground", href: href("closed"), active: active === "closed" },
          { key: "enroll", label: "累计报名", value: totalEnroll, color: "text-accent-tea" },
          { key: "all", label: "全部", value: all.length, color: "text-cat-build", href: base, active: !active },
        ]}
      />

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold flex items-center justify-between">
          <span>培训课程 · 点击查看报名</span>
          {active && <Link href={base} className="text-[12px] text-brand font-normal">清除筛选 ✕</Link>}
        </div>
        {list.length === 0 ? (
          <div className="px-5 py-16 text-center text-[13px] text-muted-foreground">{active ? "没有该状态的课程。" : "还没有培训课程。点右上「发布培训」发布第一门。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.8fr_1fr_1.2fr_0.8fr_0.7fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>课程</span><span>讲师</span><span>时间</span><span>费用</span><span>报名</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {list.map((t) => {
                const n = countEnrolled(t.id);
                return (
                  <li key={t.id}>
                    <Link href={`/dashboard/association/training/${t.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.8fr_1fr_1.2fr_0.8fr_0.7fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                      <span className="min-w-0 inline-flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-cat-design-soft text-cat-design inline-flex items-center justify-center shrink-0 md:hidden"><GraduationCap className="h-4 w-4" /></span>
                        <span className="min-w-0">
                          <span className="font-medium truncate flex items-center gap-1.5"><Badge tone="design" className="!px-1.5 !py-0">{t.category}</Badge>{t.title}</span>
                          <span className="md:hidden text-[11px] text-muted-foreground">{t.instructor} · {t.schedule || "待定"} · {t.fee}</span>
                        </span>
                      </span>
                      <span className="hidden md:block text-muted-foreground truncate">{t.instructor}</span>
                      <span className="hidden md:block text-muted-foreground truncate">{t.schedule || "待定"}</span>
                      <span className="hidden md:block text-muted-foreground">{t.fee}</span>
                      <span className="hidden md:inline-flex items-center gap-1 text-accent-tea"><Users2 className="h-3.5 w-3.5" />{n}{t.capacity > 0 ? `/${t.capacity}` : ""}</span>
                      <span className="inline-flex items-center gap-2 justify-end shrink-0">
                        <Badge tone={t.status === "open" ? "tea" : "neutral"}>{t.status === "open" ? "在招" : "已结束"}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </AssociationShell>
  );
}
