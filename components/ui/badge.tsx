import { cn } from "@/lib/cn";

type Tone = "brand" | "build" | "decor" | "design" | "tea" | "yellow" | "neutral";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand",
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
  tea: "bg-[#e6f7f1] text-accent-tea",
  yellow: "bg-[#fff6d6] text-[#a37200]",
  neutral: "bg-surface text-muted-foreground",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
