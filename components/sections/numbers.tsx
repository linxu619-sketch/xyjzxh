import { Container } from "../container";
import { STATS } from "@/lib/site";
import { cn } from "@/lib/cn";

const COLOR: Record<string, string> = {
  build: "text-cat-build",
  decor: "text-cat-decor",
  design: "text-cat-design",
  tea: "text-accent-tea",
};

export function Numbers() {
  return (
    <section className="py-10 md:py-20">
      <Container>
        <div className="rounded-3xl border border-border bg-background p-5 md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-8 gap-x-4 md:gap-x-6">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "relative",
                  i < STATS.length - 1 && "md:border-r md:border-border md:pr-6",
                )}
              >
                <div className={cn("text-[28px] md:text-[56px] font-semibold tracking-tight leading-none tabular-nums", COLOR[s.color])}>
                  {s.value}
                  <span className="ml-1 text-[12px] md:text-[16px] font-normal text-muted-foreground align-top">
                    {s.suffix}
                  </span>
                </div>
                <div className="mt-1.5 md:mt-2 text-[11px] md:text-[13px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
