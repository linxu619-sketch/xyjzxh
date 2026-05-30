import { Container } from "./container";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/cn";

type Tone = "build" | "decor" | "design" | "brand" | "tea" | "yellow";

export function PageHeader({
  eyebrow,
  title,
  description,
  tone = "brand",
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: Tone;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-border", className)}>
      <div className="absolute inset-0 bg-mesh opacity-60" aria-hidden />
      <Container className="relative py-8 md:py-20">
        <div className="flex flex-col gap-5 md:gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow && (
              <Badge tone={tone} className="mb-3 md:mb-4">{eyebrow}</Badge>
            )}
            <h1 className="text-[26px] sm:text-[34px] md:text-[52px] font-semibold tracking-tight leading-[1.1] sm:leading-[1.05]">
              {title}
            </h1>
            {description && (
              <p className="mt-3 md:mt-5 text-[13px] md:text-[16px] leading-6 md:leading-7 text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3 -mt-1">
              {actions}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
