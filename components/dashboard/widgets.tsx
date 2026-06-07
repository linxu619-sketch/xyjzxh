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

export function TopBar({ title, subtitle, actions, trailing }: { title: string; subtitle?: string; actions?: React.ReactNode; trailing?: React.ReactNode }) {
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
