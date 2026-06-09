import Link from "next/link";
import { Container } from "./container";
import { SITE, NAV } from "@/lib/site";
import { getPlatformInfo } from "@/lib/runtime-config";
import { Phone, MapPin, Mail, ArrowRight } from "lucide-react";

const ABOUT_GROUP = {
  title: "关于协会",
  links: [
    { label: "协会简介", href: "/about" },
    { label: "组织架构", href: "/about/org" },
    { label: "章程制度", href: "/about/rules" },
    { label: "联系我们", href: "/about/contact" },
  ],
};

// 业主门户页脚：只放与业主相关的入口
const CONSUMER_GROUPS = [
  {
    title: "找装修",
    links: [
      { label: "找装企", href: "/members?cat=decor" },
      { label: "设计 / 案例", href: "/members?cat=design" },
      { label: "AI 估价", href: "/ai/decor" },
      { label: "真实评价", href: "/review" },
    ],
  },
  {
    title: "协会守护",
    links: [
      { label: "消费保险", href: "/insurance" },
      { label: "纠纷调解", href: "/mediate" },
      { label: "装修知识库", href: "/knowledge" },
      { label: "新闻动态", href: "/news" },
    ],
  },
  ABOUT_GROUP,
];

// 协会门户页脚：企业 / 会员相关
const ASSOCIATION_GROUPS = [
  { title: "服务", links: NAV.slice(1, 6) },
  { title: "信息", links: NAV.slice(6) },
  ABOUT_GROUP,
];

export async function SiteFooter({ face = "consumer" }: { face?: "consumer" | "xh" }) {
  const FOOTER_GROUPS = face === "xh" ? ASSOCIATION_GROUPS : CONSUMER_GROUPS;
  const info = await getPlatformInfo(); // 平台名称/电话/地址/邮箱走系统设置（非死数据）
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <Container className="py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* 品牌区 */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/seal.png" alt="信阳市建筑装饰装修协会" className="h-11 w-11 object-contain shrink-0" />
              <div className="leading-tight">
                <div className="text-[15px] font-semibold">{info.name}</div>
                <div className="text-[10px] text-muted-foreground tracking-[0.16em] uppercase">
                  XINYANG BUILDING DECORATION ASSOCIATION
                </div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-6 text-muted-foreground max-w-sm">
              {info.slogan} · 协会认证的本地装修企业平台。
            </p>
            <Link href="/about" className="mt-2 inline-flex items-center gap-1 text-[13px] text-brand hover:gap-1.5 transition-all">
              了解协会 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <ul className="mt-6 space-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {info.tel}</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {info.address}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {info.email}</li>
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
            © {SITE.copyrightFrom}–{new Date().getFullYear()} {info.name} · 保留所有权利
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
