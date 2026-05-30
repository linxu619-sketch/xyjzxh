import Link from "next/link";
import { ShieldCheck, ArrowRight, Building2, Award, TrendingUp, Sparkles } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  { icon: Building2, title: "二级域名子站", desc: "yourbrand.xyzhxh.org 独立品牌页 + 在线接单" },
  { icon: ShieldCheck, title: "协会认证", desc: "在册即获认证徽章，提升业主信任与转化" },
  { icon: TrendingUp, title: "流量分发", desc: "首页推荐、AI 主动匹配、搜索优先排序" },
  { icon: Award, title: "金融保险优惠", desc: "建装贷专属费率、消费险联合品牌" },
  { icon: Sparkles, title: "10 位 AI 员工", desc: "客服、估价、报备、调解 24h 在线" },
  { icon: Building2, title: "工装报备直通", desc: "省厅一网通办、AI 预审、24h 反馈" },
];

const STEPS = [
  { n: 1, t: "在线提交申请", d: "填写企业基本信息 + 上传资质文件，约 8 分钟。" },
  { n: 2, t: "秘书处材料初审", d: "1-2 个工作日完成材料核查与征信查询。" },
  { n: 3, t: "现场核查", d: "针对高级会员/理事单位安排现场走访。" },
  { n: 4, t: "缴费 + 开通", d: "签订入会协议、缴纳会费、开通子站与账号。" },
];

export const metadata = { title: "申请入会 · 信阳市建筑装修协会" };

export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow="JOIN · 申请入会"
        tone="brand"
        title={<>加入 1,052 家会员企业 <br className="md:hidden" />共建本地行业生态</>}
        description="无论你是大型总包、品牌装饰、独立设计师，还是返乡创业的县域企业，都欢迎你成为我们的一员。"
        actions={<Button href="/register?role=enterprise" variant="secondary">立即提交申请</Button>}
      />

      <Container className="py-12 md:py-16">
        {/* 入会权益 */}
        <section>
          <h2 className="text-[26px] md:text-[32px] font-semibold tracking-tight">会员权益</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="rounded-3xl border border-border bg-background p-6 hover:shadow-md transition-shadow">
                  <span className="inline-flex h-11 w-11 rounded-2xl items-center justify-center bg-brand-50 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{b.title}</h3>
                  <p className="mt-2 text-[13px] text-muted-foreground leading-6">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 申请流程 */}
        <section className="mt-16">
          <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium">PROCESS</div>
          <h2 className="mt-3 text-[26px] md:text-[32px] font-semibold tracking-tight">申请流程</h2>
          <div className="mt-8 relative grid grid-cols-1 md:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="rounded-3xl bg-background border border-border p-6 h-full">
                  <div className="text-[42px] font-semibold tracking-tight text-brand leading-none">0{s.n}</div>
                  <div className="mt-4 text-[16px] font-semibold">{s.t}</div>
                  <div className="mt-1.5 text-[13px] text-muted-foreground leading-6">{s.d}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 所需材料 */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-border bg-background p-7 md:p-10">
            <h3 className="text-[22px] font-semibold tracking-tight">需要准备的材料</h3>
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
              {[
                "营业执照副本扫描件",
                "法人身份证扫描件",
                "建筑业 / 装饰装修 / 设计资质证书",
                "近 2 年代表项目业绩清单",
                "近 1 年缴税或社保证明（建议）",
                "近期 3 个项目现场照片",
                "企业 logo 与品牌简介（用于子站）",
                "其他获奖证书 / 媒体报道（可选）",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent-tea mt-1 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-foreground text-background p-7 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/30 blur-2xl" />
            <Sparkles className="relative h-7 w-7 text-accent-yellow" />
            <h3 className="relative mt-4 text-[22px] font-semibold tracking-tight">不确定能不能过审？</h3>
            <p className="relative mt-2 text-[13px] text-background/70 leading-6">
              把企业基本情况告诉 AI 协会咨询官「小协」，30 秒给您评估能否申请、推荐合适等级。
            </p>
            <Link href="/ai/advisor" className="relative mt-5 inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-accent-yellow text-foreground text-[13px] font-medium">
              问问小协 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        <section className="mt-16 rounded-[28px] bg-mesh border border-border p-7 md:p-10 text-center">
          <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium">START NOW</div>
          <h2 className="mt-3 text-[28px] md:text-[40px] font-semibold tracking-tight leading-tight">
            准备好了吗？
          </h2>
          <p className="mt-3 text-[14px] text-muted-foreground max-w-md mx-auto">
            10 分钟在线提交 · 协会秘书处 1-3 日反馈 · 通过后立即开通子站与全部服务。
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/register?role=enterprise" size="lg" variant="primary">
              立即提交申请 <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/services" size="lg" variant="outline">
              先看会籍权益
            </Button>
          </div>
        </section>
      </Container>
    </>
  );
}
