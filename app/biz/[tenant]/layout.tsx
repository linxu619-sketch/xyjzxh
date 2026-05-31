import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, ArrowUpRight, ShieldCheck } from "lucide-react";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { Container } from "@/components/container";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
};

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const e = await getEnterpriseBySlugOrId(tenant);
  if (!e) notFound();

  const NAV = [
    { href: `/biz/${tenant}`, label: "首页" },
    { href: `/biz/${tenant}#cases`, label: "案例" },
    { href: `/biz/${tenant}#team`, label: "团队" },
    { href: `/biz/${tenant}#service`, label: "服务" },
    { href: `/biz/${tenant}#contact`, label: "联系" },
    { href: `/biz/${tenant}/order`, label: "在线下单" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* 企业子站独立顶部导航 */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href={`/biz/${tenant}`} className="flex items-center gap-2.5">
              <span className={cn(
                "h-9 w-9 rounded-xl text-white font-semibold flex items-center justify-center",
                BG[e.color],
              )}>
                {e.hero.brand.slice(0, 1)}
              </span>
              <div className="leading-tight">
                <div className="text-[15px] font-semibold tracking-tight">{e.hero.brand}</div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
                  {e.category === "build" ? "Construction" : e.category === "decor" ? "Decoration" : "Design"}
                </div>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground rounded-full hover:bg-surface"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${e.contact.tel.replace(/-/g, "")}`}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface text-[13px] hover:bg-surface-2"
              >
                <Phone className="h-3.5 w-3.5" /> {e.contact.tel}
              </a>
              <Link
                href={`/biz/${tenant}/order`}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-white text-[13px] font-medium hover:opacity-90",
                  BG[e.color],
                )}
              >
                在线下单
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* 子站头部协会标识条 */}
      <div className="bg-foreground text-background">
        <Container>
          <div className="flex items-center justify-between gap-3 py-2 text-[11px]">
            <div className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" />
              本站为 {SITE.name} 认证企业 · 资质实时同步
            </div>
            <Link href="/" className="text-background/70 hover:text-background">
              返回协会主站 →
            </Link>
          </div>
        </Container>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 bg-surface border-t border-border">
        <Container className="py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-[15px] font-semibold">{e.name}</div>
              <p className="mt-2 text-[12px] text-muted-foreground leading-6">{e.short}</p>
            </div>
            <div className="text-[12px] text-muted-foreground space-y-1.5">
              <div>电话：{e.contact.tel}</div>
              <div>地址：{e.contact.addr}</div>
              <div>资质：{e.qualification.join(" · ")}</div>
            </div>
            <div className="text-[12px] text-muted-foreground">
              <Link href="/" className="hover:text-foreground">协会主站</Link>
              <span className="mx-2">·</span>
              <Link href={`/members/${tenant}`} className="hover:text-foreground">协会档案</Link>
              <span className="mx-2">·</span>
              <Link href="/legal/privacy" className="hover:text-foreground">隐私</Link>
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-border text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} {e.name} · 由 {SITE.name} 平台驱动
          </div>
        </Container>
      </footer>
    </div>
  );
}
