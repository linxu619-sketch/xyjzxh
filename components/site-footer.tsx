import Link from "next/link";
import { Container } from "./container";
import { SITE, NAV } from "@/lib/site";
import { Phone, MapPin, Mail } from "lucide-react";

const FOOTER_GROUPS = [
  {
    title: "服务",
    links: NAV.slice(1, 6),
  },
  {
    title: "信息",
    links: NAV.slice(6),
  },
  {
    title: "关于协会",
    links: [
      { label: "协会简介", href: "/about" },
      { label: "组织架构", href: "/about/org" },
      { label: "章程制度", href: "/about/rules" },
      { label: "联系我们", href: "/about/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* 品牌区 */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background font-bold">
                信
              </span>
              <div className="leading-tight">
                <div className="text-[15px] font-semibold">{SITE.name}</div>
                <div className="text-[10px] text-muted-foreground tracking-[0.18em] uppercase">
                  {SITE.brand}
                </div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-6 text-muted-foreground max-w-sm">
              {SITE.slogan}。汇聚本地建筑、装修与设计企业，打造透明、可信、高效的行业生态。
            </p>
            <ul className="mt-6 space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {SITE.tel}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {SITE.address}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@{SITE.domain}</li>
            </ul>
          </div>

          {/* 链接区 */}
          {FOOTER_GROUPS.map((g) => (
            <div key={g.title}>
              <h4 className="text-[13px] font-semibold tracking-wide">{g.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[12px] text-muted-foreground">
          <div>
            © {SITE.copyrightFrom}–{new Date().getFullYear()} {SITE.name} · 保留所有权利
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>豫 ICP 备 0000000 号</span>
            <span>豫公网安备 00000000000 号</span>
            <Link href="/legal/privacy" className="hover:text-foreground">隐私政策</Link>
            <Link href="/legal/terms" className="hover:text-foreground">服务条款</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
