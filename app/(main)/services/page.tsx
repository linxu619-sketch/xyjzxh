import Link from "next/link";
import {
  ShieldCheck, FileCheck2, GraduationCap, MessageSquareWarning, Stamp,
  Users2, Award, ArrowUpRight, Sparkles,
} from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

const SERVICES = [
  { key: "join", title: "入会申请", desc: "建筑 / 装修 / 设计三大类会籍，秘书处 1-3 日审核。", icon: Users2, color: "build" as const, href: "/join" },
  { key: "qual", title: "资质核验", desc: "对接住建系统，自动核查企业资质有效期、变更记录。", icon: ShieldCheck, color: "tea" as const, href: "#" },
  { key: "train", title: "培训认证", desc: "二建、室内设计师、BIM、安全员等培训与认证。", icon: GraduationCap, color: "design" as const, href: "/talents" },
  { key: "mediate", title: "纠纷调解", desc: "14 天内协会调解委员会介入，结案率 94%。", icon: MessageSquareWarning, color: "decor" as const, href: "/ai/mediate" },
  { key: "report", title: "工装报备协助", desc: "一次填报同步省厅，AI 预审一次通过率 +35%。", icon: FileCheck2, color: "brand" as const, href: "/projects" },
  { key: "award", title: "荣誉申报", desc: "鲁班奖、中州杯等行业奖项申报代办。", icon: Award, color: "yellow" as const, href: "#" },
  { key: "stamp", title: "印章 / 签章", desc: "协会指导用印、电子签章、合同存证。", icon: Stamp, color: "brand" as const, href: "#" },
  { key: "annual", title: "年检 · 年报", desc: "年度数据上报、信用评级更新。", icon: FileCheck2, color: "build" as const, href: "#" },
];

const TONE: Record<string, string> = {
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
  brand: "bg-brand-50 text-brand",
  tea: "bg-[#e6f7f1] text-accent-tea",
  yellow: "bg-[#fff6d6] text-[#a37200]",
};

export const metadata = { title: "协会服务 · 信阳市建筑装修协会" };

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="ASSOCIATION · 协会服务"
        tone="brand"
        title={<>从入会到经营 <br className="md:hidden" />一站式协会服务</>}
        description="覆盖会籍、资质、培训、调解、报备、荣誉、签章、年检等全场景，会员企业全部免费或大幅优惠。"
        actions={<Button href="/join" variant="secondary">立即入会</Button>}
      />

      <Container className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.key}
                href={s.href}
                className="group rounded-3xl border border-border bg-background p-6 hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <span className={`inline-flex h-11 w-11 rounded-2xl items-center justify-center ${TONE[s.color]}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[18px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[13px] text-muted-foreground leading-6">{s.desc}</p>
                <ArrowUpRight className="mt-5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* 会籍等级 */}
        <div className="mt-16">
          <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium">MEMBERSHIP</div>
          <h2 className="mt-3 text-[30px] md:text-[40px] font-semibold tracking-tight leading-tight">会籍等级</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { tier: "普通会员", price: "1,200", suffix: "/年", color: "build", benefits: ["会员目录展示", "工装报备直通", "知识库基础权限", "AI 助手 100 次/月"] },
              { tier: "高级会员", price: "4,800", suffix: "/年", color: "design", featured: true, benefits: ["以上全部", "首页推荐位", "金融保险优惠", "AI 助手 1,000 次/月", "调解优先受理"] },
              { tier: "理事单位", price: "面议", suffix: "", color: "brand", benefits: ["以上全部", "参与协会决策", "联合品牌活动", "定制 AI 员工"] },
            ].map((m) => (
              <div key={m.tier} className={`rounded-3xl border p-7 ${m.featured ? "border-foreground bg-foreground text-background" : "border-border bg-background"}`}>
                <div className={`text-[12px] tracking-wider uppercase ${m.featured ? "text-background/60" : "text-muted-foreground"}`}>{m.tier}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[42px] font-semibold tracking-tight">¥{m.price}</span>
                  <span className={m.featured ? "text-background/60" : "text-muted-foreground"}>{m.suffix}</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-[13px]">
                  {m.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <ShieldCheck className={`h-4 w-4 mt-0.5 ${m.featured ? "text-accent-yellow" : "text-accent-tea"}`} /> {b}
                    </li>
                  ))}
                </ul>
                <Link href="/join" className={`mt-6 inline-flex w-full h-11 items-center justify-center rounded-full text-[13px] font-medium ${m.featured ? "bg-accent-yellow text-foreground" : "bg-foreground text-background hover:bg-brand"}`}>
                  {m.tier === "理事单位" ? "联系秘书处" : "立即申请"}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-[26px] md:text-[32px] font-semibold tracking-tight">常见问题</h2>
          <div className="mt-6 rounded-3xl border border-border bg-background divide-y divide-border">
            {[
              { q: "非信阳本地企业可以入会吗？", a: "可以。注册地不在信阳但在信阳有承接项目的企业，可申请「联络会员」。" },
              { q: "调解结果有法律效力吗？", a: "协会调解为非诉调解，双方签字后可向法院申请司法确认获得强制执行力。" },
              { q: "AI 员工是免费的吗？", a: "普通会员每月 100 次，高级会员每月 1,000 次，超出按 0.1 元/次计费。" },
              { q: "可以转让会籍吗？", a: "不可以。如发生公司合并、收购，请联系秘书处办理变更。" },
            ].map((f, i) => (
              <details key={i} className="group">
                <summary className="px-6 py-5 cursor-pointer flex items-center justify-between text-[15px] font-medium list-none">
                  {f.q}
                  <span className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-[14px] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5 text-[13px] text-muted-foreground leading-6">{f.a}</div>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-[28px] bg-brand-50 p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-7 w-7 text-brand mt-0.5" />
            <div>
              <div className="text-[18px] md:text-[22px] font-semibold">不确定该选哪个会籍？</div>
              <div className="text-[13px] text-muted-foreground mt-1">让 AI 协会咨询官「小协」根据企业情况推荐方案。</div>
            </div>
          </div>
          <Button href="/ai/advisor" variant="primary">
            问问小协 <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </>
  );
}
