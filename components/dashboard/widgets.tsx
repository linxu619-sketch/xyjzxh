import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatCard({
  label, value, sub, trend, color = "brand", href,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  trend?: { dir: "up" | "down"; value: string };
  color?: "brand" | "build" | "decor" | "design" | "tea" | "yellow";
  href?: string;
}) {
  const COLOR: Record<string, string> = {
    brand: "text-brand", build: "text-cat-build", decor: "text-cat-decor",
    design: "text-cat-design", tea: "text-accent-tea", yellow: "text-[#a37200]",
  };
  const inner = (
    <>
      <div className="text-[12px] text-muted-foreground flex items-center justify-between">
        <span>{label}</span>
        {href && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <div className={cn("text-[28px] md:text-[32px] font-semibold tracking-tight leading-none", COLOR[color])}>
          {value}
        </div>
        {trend && (
          <span className={cn(
            "text-[11px] font-medium rounded-full px-1.5 py-0.5",
            trend.dir === "up" ? "bg-[#e6f7f1] text-accent-tea" : "bg-cat-decor-soft text-cat-decor",
          )}>
            {trend.dir === "up" ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="rounded-2xl border border-border bg-background p-5 block transition-all hover:border-foreground/30 hover:shadow-sm active:scale-[0.99]">
        {inner}
      </Link>
    );
  }
  return <div className="rounded-2xl border border-border bg-background p-5">{inner}</div>;
}

export function Panel({
  title, action, children, className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-background p-5 md:p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function TopBar({ title, subtitle, actions, trailing, tone, extra }: { title: string; subtitle?: string; actions?: React.ReactNode; trailing?: React.ReactNode; tone?: "brand"; extra?: React.ReactNode }) {
  // 套色页头：品牌渐变底、白字；可在分隔线下合并展示额外内容（如待办条）
  if (tone === "brand") {
    return (
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-brand to-brand-600 text-white p-5 shadow-md">
        <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
          <div className="min-w-0">
            <h1 className="text-[22px] md:text-[26px] font-semibold tracking-tight">{title}</h1>
            {subtitle && <div className="text-[12px] text-white/80 mt-1">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">{actions}{trailing}</div>
        </div>
        {extra && <div className="mt-4 pt-4 border-t border-white/15">{extra}</div>}
      </div>
    );
  }
  return (
    <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row mb-6">
      <div className="min-w-0">
        <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <div className="text-[13px] text-muted-foreground mt-1">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">{actions}{trailing}</div>
    </div>
  );
}
