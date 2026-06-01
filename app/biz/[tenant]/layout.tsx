import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, ArrowUpRight, ShieldCheck, MapPin, BadgeCheck, MessageSquareText, ArrowRight, ChevronLeft } from "lucide-react";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { Container } from "@/components/container";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
  tea: "bg-accent-tea", brand: "bg-brand",
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
              <Link
                href="/"
                className="inline-flex items-center gap-0.5 h-9 pl-2 pr-3 rounded-full bg-surface text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground hover:bg-surface-2 shrink-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> 协会主站
              </Link>
              <a
                href={`tel:${e.contact.tel.replace(/-/g, "")}`}
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-surface text-[13px] hover:bg-surface-2"
              >
                <Phone className="h-3.5 w-3.5" /> {e.contact.tel}
              </a>
              <Link
                href={`/biz/${tenant}/order`}
                className={cn(
                  "hidden md:inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-white text-[13px] font-medium hover:opacity-90",
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

      {/* 企业子站专属底栏（不同于协会主站底栏）*/}
      <footer className="mt-12 md:mt-16 bg-foreground text-background">
        <Container className="py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* 品牌 */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <span className={cn("h-10 w-10 rounded-xl text-white font-semibold flex items-center justify-center", BG[e.color])}>
                  {e.hero.brand.slice(0, 1)}
                </span>
                <div className="leading-tight">
                  <div className="text-[15px] font-semibold">{e.hero.brand}</div>
                  <div className="text-[10px] text-background/50">成立 {e.founded} · {e.district}</div>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-background/60 leading-6 max-w-xs">{e.short}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
                <ShieldCheck className="h-3 w-3 text-accent-tea" /> {SITE.name} 认证企业
              </div>
            </div>

            {/* 快速导航 */}
            <div>
              <div className="text-[12px] font-semibold text-background/90 mb-3">浏览</div>
              <ul className="space-y-2 text-[12px] text-background/60">
                <li><Link href={`/biz/${tenant}`} className="hover:text-background">首页</Link></li>
                <li><Link href={`/biz/${tenant}#cases`} className="hover:text-background">精选案例</Link></li>
                <li><Link href={`/biz/${tenant}#team`} className="hover:text-background">核心团队</Link></li>
                <li><Link href={`/biz/${tenant}#service`} className="hover:text-background">服务范围</Link></li>
                <li><Link href={`/biz/${tenant}/order`} className="hover:text-background">在线下单</Link></li>
              </ul>
            </div>

            {/* 联系 */}
            <div>
              <div className="text-[12px] font-semibold text-background/90 mb-3">联系我们</div>
              <ul className="space-y-2 text-[12px] text-background/60">
                <li className="flex items-start gap-1.5"><Phone className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent-yellow" /><a href={`tel:${e.contact.tel.replace(/-/g, "")}`} className="hover:text-background">{e.contact.tel}</a></li>
                <li className="flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent-yellow" /><span>{e.contact.addr}</span></li>
              </ul>
              <div className="mt-3 flex items-center gap-2">
                <Link href={`/biz/${tenant}/inquiry`} className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-white/10 text-[12px] hover:bg-white/20">在线咨询</Link>
                <Link href={`/biz/${tenant}/order`} className={cn("inline-flex items-center gap-1 h-8 px-3 rounded-full text-white text-[12px]", BG[e.color])}>下单 <ArrowUpRight className="h-3 w-3" /></Link>
              </div>
            </div>

            {/* 资质 / 协会 */}
            <div>
              <div className="text-[12px] font-semibold text-background/90 mb-3">资质 · 协会</div>
              <ul className="space-y-2 text-[12px] text-background/60">
                {e.qualification.slice(0, 3).map((q) => (
                  <li key={q} className="flex items-start gap-1.5"><BadgeCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent-tea" />{q}</li>
                ))}
                <li><Link href={`/members/${tenant}`} className="hover:text-background underline-offset-2 hover:underline">协会档案 →</Link></li>
                <li><Link href="/" className="hover:text-background underline-offset-2 hover:underline">返回协会主站 →</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-9 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-background/45">
            <span>© {new Date().getFullYear()} {e.name} · 版权所有</span>
            <span>由 {SITE.name} 平台驱动 · 资质实时同步</span>
          </div>
        </Container>
      </footer>

      {/* 移动端常驻固定底栏（联系 / 咨询 / 下单）*/}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
          <a href={`tel:${e.contact.tel.replace(/-/g, "")}`} aria-label="致电" className="h-11 w-11 rounded-full border border-border inline-flex items-center justify-center shrink-0 active:scale-95 transition-transform">
            <Phone className="h-4 w-4" />
          </a>
          <Link href={`/biz/${tenant}/inquiry`} className="h-11 px-3.5 rounded-full border border-border text-[13px] inline-flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform">
            <MessageSquareText className="h-4 w-4" /> 咨询
          </Link>
          <Link href={`/biz/${tenant}/order`} className={cn("flex-1 h-11 rounded-full text-white text-[14px] font-medium inline-flex items-center justify-center gap-1.5 active:scale-[0.99] transition-transform", BG[e.color])}>
            立即下单 / 预约 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {/* 占位：避免固定底栏遮住页脚底部 */}
      <div aria-hidden className="md:hidden h-[64px]" />
    </div>
  );
}
