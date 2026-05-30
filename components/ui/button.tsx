import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap " +
  "transition-all duration-200 active:scale-[0.98] focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-brand/30";

const variants: Record<Variant, string> = {
  primary:
    "bg-foreground text-background hover:bg-brand hover:shadow-[0_10px_30px_-10px] hover:shadow-brand/40",
  secondary:
    "bg-brand text-white hover:bg-brand-600 shadow-[0_8px_20px_-8px] shadow-brand/40",
  ghost: "text-foreground hover:bg-surface",
  outline:
    "border border-foreground/15 text-foreground hover:border-foreground hover:bg-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-full",
  md: "h-11 px-5 text-[15px] rounded-full",
  lg: "h-14 px-7 text-base rounded-full",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, "href" | "className">;
type ButtonAsButton = CommonProps & { href?: undefined } & ComponentProps<"button">;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", className, children } = props;
  const cls = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const { href, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    return (
      <Link href={href} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } = props as ButtonAsButton;
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
