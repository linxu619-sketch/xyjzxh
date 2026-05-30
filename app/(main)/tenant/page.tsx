import Link from "next/link";
import { Globe2, Palette, Code2, MessageSquareHeart, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "企业子站 · 信阳市建筑装饰装修协会" };

const FEATURES = [
  { icon: Globe2, t: "独立子域名", d: "yourbrand.xyjzxh.com，5 分钟开通，自动 SSL，支持 CNAME 自定义" },
  { icon: Palette, t: "独立品牌皮肤", d: "Logo、主色、字体、hero 图自定义，与协会主站视觉解耦" },
  { icon: Code2, t: "全栈托管", d: "无需买服务器、配 CDN、申请 ICP，协会平台全部代办" },
  { icon: Sparkles, t: "嵌入 AI 员工", d: "可克隆 4 位 AI（小装 / 小设 / 小经 / 小保），换成贵企业品牌" },
  { icon: MessageSquareHeart, t: "在线接单", d: "标准下单表单 / 设计师量房 / 报价 / 合同电子签" },
  { icon: ShieldCheck, t: "协会信任", d: "顶部协会标识条、底部认证编号，业主一眼信任" },
];

export default function TenantPage() {
  return (
    <>
      <PageHeader
        eyebrow="ENTERPRISE SITE · 企业子站"
        tone="brand"
        title={<>每家会员企业<br className="md:hidden" /> 都有自己的站</>}
        description="子站不是迷你版协会主站，而是企业的「品牌官网 + 在线营业厅」。基于协会底座 + 企业自定义。"
        actions={<Button href="/register?role=enterprise" variant="secondary">立即开通子站</Button>}
      />

      <Container className="py-12 md:py-16">
        {/* 子站 example */}
        <div className="rounded-[28px] border border-border overflow-hidden bg-background mb-12">
          <div className="bg-surface px-5 py-3 flex items-center gap-2 border-b border-border">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-cat-decor" />
              <span className="h-3 w-3 rounded-full bg-accent-yellow" />
              <span className="h-3 w-3 rounded-full bg-accent-tea" />
            </div>
            <code className="text-[12px] text-muted-foreground ml-2">mingjia.xyjzxh.com</code>
          </div>
          <div className="aspect-video relative bg-gradient-to-br from-cat-decor to-[#e6531f]">
            <div className="absolute inset-0 p-8 text-white flex flex-col justify-between">
              <div className="text-[10px] tracking-widest opacity-80">DECORATION</div>
              <div>
                <div className="text-[36px] md:text-[56px] font-semibold tracking-tight leading-tight max-w-lg">为家而设计<br />699 元/㎡ 整装</div>
                <div className="mt-4 flex gap-2 text-[12px]">
                  <span className="rounded-full bg-white/20 px-3 py-1">立即下单</span>
                  <span className="rounded-full border border-white/30 px-3 py-1">0376-2345678</span>
                </div>
              </div>
              <div className="text-[10px] opacity-80">由 协会平台 驱动 · ICP 备案略</div>
            </div>
          </div>
        </div>

        {/* features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {FEATURES.map((f) => {
            const Ic = f.icon;
            return (
              <div key={f.t} className="rounded-3xl border border-border bg-background p-6">
                <span className="inline-flex h-11 w-11 rounded-2xl items-center justify-center bg-brand-50 text-brand">
                  <Ic className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{f.t}</h3>
                <p className="mt-2 text-[13px] text-muted-foreground leading-6">{f.d}</p>
              </div>
            );
          })}
        </div>

        {/* steps */}
        <div className="rounded-[28px] bg-foreground text-background p-8 md:p-12 mb-12">
          <div className="text-[12px] tracking-[0.2em] text-accent-yellow uppercase font-medium">HOW IT WORKS</div>
          <h2 className="mt-3 text-[28px] md:text-[40px] font-semibold tracking-tight leading-tight">5 分钟开通子站</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { n: 1, t: "选子域名", d: "yourbrand.xyjzxh.com" },
              { n: 2, t: "上传 logo", d: "PNG / SVG 自动适配" },
              { n: 3, t: "选品牌色", d: "5 套预设 + 自定义" },
              { n: 4, t: "导入案例", d: "Excel 一键上传" },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
                <div className="text-[36px] font-semibold tracking-tight text-accent-yellow leading-none">0{s.n}</div>
                <div className="mt-3 text-[15px] font-semibold">{s.t}</div>
                <div className="mt-1 text-[12px] text-background/70">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* sample sites */}
        <h2 className="text-[26px] md:text-[32px] font-semibold tracking-tight mb-6">已开通的子站</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { slug: "huatai", brand: "华泰建工", color: "bg-cat-build" },
            { slug: "mingjia", brand: "名家装饰", color: "bg-cat-decor" },
            { slug: "yashe", brand: "雅舍设计", color: "bg-cat-design" },
          ].map((b) => (
            <Link key={b.slug} href={`/biz/${b.slug}`} className="group rounded-3xl border border-border bg-background overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`aspect-video ${b.color} relative`}>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white text-[15px] font-semibold">{b.brand}</div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <code className="text-[12px] text-muted-foreground">{b.slug}.xyjzxh.com</code>
                <span className="inline-flex items-center gap-1 text-[12px] text-brand font-medium">
                  访问 <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-[28px] bg-mesh border border-border p-7 md:p-10 text-center">
          <h2 className="text-[26px] md:text-[36px] font-semibold tracking-tight">想给您的企业开一个？</h2>
          <p className="mt-3 text-[13px] text-muted-foreground max-w-md mx-auto">高级会员开通免费 · 普通会员 ¥1,200/年（含 SSL + CDN + AI）</p>
          <div className="mt-6">
            <Button href="/register?role=enterprise" variant="primary" size="lg">立即开通 <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </Container>
    </>
  );
}
