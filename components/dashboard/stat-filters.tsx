import Link from "next/link";
import { cn } from "@/lib/cn";

export type StatFilter = {
  key: string;
  label: string;
  value: React.ReactNode;
  color: string;        // 文字色，如 "text-cat-decor"
  href?: string;        // 有则可点（筛选 / 跳转）；无则静态展示
  active?: boolean;     // 当前选中（高亮）
};

/**
 * 后台列表页顶部「可点统计筛选」卡片组。
 * - 有 href 的卡片可点击：作为状态筛选（点选中项可再次点击取消），或跳转到其它页。
 * - 无 href 的卡片为静态指标（如签单率）。
 */
export function StatFilters({ items }: { items: StatFilter[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      {items.map((s) => {
        const inner = (
          <>
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase flex items-center justify-between">
              {s.label}
              {s.active && <span className="h-1.5 w-1.5 rounded-full bg-foreground" />}
            </div>
            <div className={cn("mt-1 text-[28px] font-semibold tracking-tight", s.color)}>{s.value}</div>
          </>
        );
        if (!s.href) {
          return (
            <div key={s.key} className="rounded-2xl border border-border bg-background p-5">
              {inner}
            </div>
          );
        }
        return (
          <Link
            key={s.key}
            href={s.href}
            className={cn(
              "rounded-2xl border bg-background p-5 transition-colors hover:border-foreground/30",
              s.active ? "border-foreground ring-1 ring-foreground/10" : "border-border",
            )}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
