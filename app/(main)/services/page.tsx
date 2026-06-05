import Link from "next/link";
import {
  ShieldCheck, FileCheck2, GraduationCap, MessageSquareWarning, Stamp,
  Users2, Award, ArrowUpRight, Sparkles, Building2, Crown,
} from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ENTERPRISE_TIERS, PRACTITIONER_TIERS } from "@/lib/data/member-tier";

const SERVICES = [
  { key: "join", title: "入会申请", desc: "建筑 / 装修 / 设计三大类会籍，秘书处 1-3 日审核。", icon: Users2, color: "build" as const, href: "/join" },
  { key: "qual", title: "资质核验", desc: "对接住建系统，自动核查企业资质有效期、变更记录。", icon: ShieldCheck, color: "tea" as const, href: "/about/contact" },
  { key: "train", title: "培训认证", desc: "二建、室内设计师、BIM、安全员等培训与认证。", icon: GraduationCap, color: "design" as const, href: "/talents" },
  { key: "mediate", title: "纠纷调解", desc: "14 天内协会调解委员会中立介入，免诉化解纠纷。", icon: MessageSquareWarning, color: "decor" as const, href: "/ai/mediate" },
  { key: "report", title: "工装报备协助", desc: "一次填报同步省厅，AI 预审查漏补缺、减少退件。", icon: FileCheck2, color: "brand" as const, href: "/projects" },
  { key: "award", title: "荣誉申报", desc: "鲁班奖、中州杯等行业奖项申报代办。", icon: Award, color: "yellow" as const, href: "/about/contact" },
  { key: "stamp", title: "印章 / 签章", desc: "协会指导用印、电子签章、合同存证。", icon: Stamp, color: "brand" as const, href: "/about/contact" },
  { key: "annual", title: "年检 · 年报", desc: "年度数据上报、信用评级更新。", icon: FileCheck2, color: "build" as const, href: "/about/contact" },
];

const TONE: Record<string, string> = {
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
  brand: "bg-brand-50 text-brand",
  tea: "bg-[#e6f7f1] text-accent-tea",
  yellow: "bg-[#fff6d6] text-[#a37200]",
};

export const metadata = { title: "协会服务 · 信阳市建筑装饰装修协会" };

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

        {/* 会籍等级 —— 两套互不相干的梯队 */}
        <div className="mt-16">
          <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium">MEMBERSHIP</div>
          <h2 className="mt-3 text-[30px] md:text-[40px] font-semibold tracking-tight leading-tight">会籍等级</h2>
          <p className="mt-3 text-[14px] text-muted-foreground max-w-2xl leading-7">企业会员与个人(专业)会员是<b className="text-foreground">两套互不相干</b>的等级体系——企业按<b className="text-foreground">治理地位</b>分档,个人按<b className="text-foreground">专业资历</b>分档,各自进阶、各享权益。会费按档核定,详询秘书处。</p>

          {/* 企业会员 · 治理梯队 */}
          <div className="mt-8 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cat-build" />
            <h3 className="text-[16px] font-semibold">企业会员 · 治理梯队</h3>
            <span className="text-[12px] text-muted-foreground">建筑 / 装修 / 设计公司</span>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ENTERPRISE_TIERS.map((m, i) => (
              <div key={m.tier} className={`rounded-2xl border p-4 flex flex-col ${i === ENTERPRISE_TIERS.length - 1 ? "border-foreground bg-foreground text-background" : "border-border bg-background"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] tracking-wider ${i === ENTERPRISE_TIERS.length - 1 ? "text-accent-yellow" : "text-muted-foreground"}`}>L{m.level}</span>
                  <Crown className={`h-4 w-4 ${i === ENTERPRISE_TIERS.length - 1 ? "text-accent-yellow" : "text-cat-build/50"}`} />
                </div>
                <div className="mt-1 text-[15px] font-semibold leading-tight">{m.tier}</div>
                <div className={`mt-0.5 text-[11px] ${i === ENTERPRISE_TIERS.length - 1 ? "text-background/60" : "text-muted-foreground"}`}>商城 {m.quota === Infinity ? "不限" : `${m.quota} 款`}</div>
                <ul className="mt-3 space-y-1.5 text-[12px] leading-5">
                  {m.perks.slice(0, 4).map((b) => (
                    <li key={b} className="flex items-start gap-1.5"><ShieldCheck className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${i === ENTERPRISE_TIERS.length - 1 ? "text-accent-yellow" : "text-accent-tea"}`} />{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 个人(专业)会员 · 专业梯队 */}
          <div className="mt-10 flex items-center gap-2">
            <Award className="h-4 w-4 text-cat-design" />
            <h3 className="text-[16px] font-semibold">个人(专业)会员 · 专业梯队</h3>
            <span className="text-[12px] text-muted-foreground">设计师 / 项目经理 / 监理 / 独立工长</span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRACTITIONER_TIERS.map((m, i) => (
              <div key={m.tier} className={`rounded-2xl border p-5 flex flex-col ${i === PRACTITIONER_TIERS.length - 1 ? "border-foreground bg-foreground text-background" : "border-border bg-background"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] tracking-wider ${i === PRACTITIONER_TIERS.length - 1 ? "text-accent-yellow" : "text-muted-foreground"}`}>专业等级 L{m.level}</span>
                  <Award className={`h-4 w-4 ${i === PRACTITIONER_TIERS.length - 1 ? "text-accent-yellow" : "text-cat-design/50"}`} />
                </div>
                <div className="mt-1 text-[18px] font-semibold leading-tight">{m.tier}</div>
                <div className={`mt-0.5 text-[12px] ${i === PRACTITIONER_TIERS.length - 1 ? "text-background/60" : "text-muted-foreground"}`}>商城 {m.quota === Infinity ? "不限" : `${m.quota} 款`}</div>
                <ul className="mt-4 space-y-2 text-[13px]">
                  {m.perks.map((b) => (
                    <li key={b} className="flex items-start gap-2"><ShieldCheck className={`h-4 w-4 mt-0.5 shrink-0 ${i === PRACTITIONER_TIERS.length - 1 ? "text-accent-yellow" : "text-accent-tea"}`} />{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link href="/join" className="mt-8 inline-flex h-11 px-6 items-center justify-center rounded-full text-[13px] font-medium bg-foreground text-background hover:bg-brand">立即入会 →</Link>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-[26px] md:text-[32px] font-semibold tracking-tight">常见问题</h2>
          <div className="mt-6 rounded-3xl border border-border bg-background divide-y divide-border">
            {[
              { q: "非信阳本地企业可以入会吗？", a: "可以。注册地不在信阳但在信阳有承接项目的企业，可申请「联络会员」。" },
              { q: "调解结果有法律效力吗？", a: "协会调解为非诉调解，双方签字后可向法院申请司法确认获得强制执行力。" },
              { q: "企业会员和个人会员的等级一样吗？", a: "不一样,是两套互不相干的体系:企业按治理地位分「会员单位→理事→常务理事→副会长→会长单位」5 档;个人按专业资历分「注册→资深→专家会员」3 档。各自进阶、各享权益。" },
              { q: "AI 员工是免费的吗？", a: "企业「会员单位」每月 100 次,「理事单位」起每月 1,000 次,超出按 0.1 元/次计费。" },
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
