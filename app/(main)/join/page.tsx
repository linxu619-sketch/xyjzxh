import Link from "next/link";
import {
  ShieldCheck, ArrowRight, ArrowUpRight, Building2, Award, TrendingUp, Sparkles,
  UserRound, Hammer, GraduationCap, Umbrella, IdCard, Briefcase,
} from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const metadata = { title: "申请入会 · 信阳市建筑装饰装修协会" };

type MemberType = "enterprise" | "individual";

const ENTERPRISE = {
  benefits: [
    { icon: Building2, title: "二级域名子站", desc: "yourbrand.xyjzxh.com 独立品牌页 + 在线接单", href: "/tenant" },
    { icon: ShieldCheck, title: "协会认证", desc: "在册即获认证徽章，提升业主信任与转化", href: "/members" },
    { icon: TrendingUp, title: "平台曝光", desc: "首页推荐位、AI 主动匹配、案例与口碑展示", href: "/members" },
    { icon: Award, title: "金融保险优惠", desc: "建装贷专属费率、消费险联合品牌", href: "/finance" },
    { icon: Sparkles, title: "10 位 AI 员工", desc: "客服、估价、报备、调解 24h 在线", href: "/ai" },
    { icon: Building2, title: "工装报备直通", desc: "省厅一网通办、AI 预审、24h 反馈", href: "/projects" },
  ],
  steps: [
    { n: 1, t: "在线提交申请", d: "填写企业基本信息 + 上传资质文件，约 8 分钟。" },
    { n: 2, t: "秘书处材料初审", d: "1-2 个工作日完成材料核查与征信查询。" },
    { n: 3, t: "现场核查", d: "针对申报理事及以上单位安排现场走访。" },
    { n: 4, t: "缴费 + 开通", d: "签订入会协议、缴纳会费、开通子站与账号。" },
  ],
  materials: [
    "营业执照副本扫描件",
    "法人身份证扫描件",
    "建筑业 / 装饰装修 / 设计资质证书",
    "近 2 年代表项目业绩清单",
    "近 1 年缴税或社保证明（建议）",
    "近期 3 个项目现场照片",
    "企业 logo 与品牌简介（用于子站）",
    "其他获奖证书 / 媒体报道（可选）",
  ],
  registerHref: "/register?role=enterprise",
};

const INDIVIDUAL = {
  benefits: [
    { icon: IdCard, title: "个人主页 / 电子名片", desc: "协会认证的专业个人主页，作品与资质一页展示", href: "/talents" },
    { icon: ShieldCheck, title: "专业认证徽章", desc: "经协会认定的设计师 / 监理 / 项目经理身份背书", href: "/talents" },
    { icon: Briefcase, title: "接单与项目对接", desc: "对接会员企业用工与项目，承接设计 / 管理委托", href: "/practitioners" },
    { icon: Umbrella, title: "工伤 / 意外保险", desc: "个人会员专属意外险与工伤保障，费率优惠", href: "/insurance" },
    { icon: GraduationCap, title: "培训与继续教育", desc: "规范、新工艺、资格继续教育，培训报名优先", href: "/talents" },
    { icon: Sparkles, title: "AI 助手", desc: "小知（知识库）、小才（招聘匹配）等 24h 在线", href: "/ai" },
  ],
  steps: [
    { n: 1, t: "在线提交申请", d: "填写实名信息、专业 / 工种、从业年限，约 5 分钟。" },
    { n: 2, t: "上传资格证书", d: "上传身份证与资格证（二建 / 设计师证 / 监理证等）。" },
    { n: 3, t: "专业认定", d: "秘书处与专委会核验专业资质、代表作品。" },
    { n: 4, t: "缴费 + 开通", d: "缴纳个人会费、开通个人主页与会员服务。" },
  ],
  materials: [
    "本人身份证（正反面）",
    "专业资格证书（二建 / 设计师 / 监理 / 造价等）",
    "从业年限与代表项目说明",
    "代表作品集（设计师 / 软装）",
    "近期项目或在职证明（可选）",
    "个人简介与头像（用于个人主页）",
  ],
  registerHref: "/register?role=practitioner",
};

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type: t } = await searchParams;
  const type: MemberType = t === "individual" ? "individual" : "enterprise";
  const data = type === "individual" ? INDIVIDUAL : ENTERPRISE;
  const isEnt = type === "enterprise";

  return (
    <>
      <PageHeader
        eyebrow="JOIN · 申请入会"
        tone="brand"
        title={isEnt
          ? <>加入协会会员企业 <br className="md:hidden" />共建本地行业生态</>
          : <>以专业个人身份 <br className="md:hidden" />加入协会会员</>}
        description={isEnt
          ? "面向本地建筑、装修与设计企业。无论是大型总包、品牌装饰，还是返乡创业的县域企业，都欢迎入会。"
          : "面向独立设计师、项目经理、监理、独立工长等专业个人，以个人身份加入协会、获得认证与服务。"}
        actions={<Button href={data.registerHref} variant="secondary">立即提交申请</Button>}
      />

      <Container className="py-10 md:py-16">
        {/* 会员类型切换 */}
        <div className="flex items-center gap-2 mb-10">
          <Link
            href="/join?type=enterprise"
            className={`inline-flex items-center gap-2 h-11 px-5 rounded-full text-[14px] font-medium transition-colors ${isEnt ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}
          >
            <Building2 className="h-4 w-4" /> 企业会员
          </Link>
          <Link
            href="/join?type=individual"
            className={`inline-flex items-center gap-2 h-11 px-5 rounded-full text-[14px] font-medium transition-colors ${!isEnt ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}
          >
            <UserRound className="h-4 w-4" /> 个人会员
          </Link>
        </div>

        {/* 会员权益 —— 紧凑两列清单 */}
        <section>
          <h2 className="text-[22px] md:text-[28px] font-semibold tracking-tight">
            {isEnt ? "企业会员权益" : "个人会员权益"}
          </h2>
          <div className="mt-5 rounded-3xl border border-border bg-background p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {data.benefits.map((b) => {
              const Icon = b.icon;
              return (
                <Link key={b.title} href={b.href} className="group flex items-start gap-3 rounded-2xl p-2.5 hover:bg-surface/60 transition-colors">
                  <span className="inline-flex h-9 w-9 rounded-xl items-center justify-center bg-brand-50 text-brand shrink-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold tracking-tight inline-flex items-center gap-1 group-hover:text-brand transition-colors">
                      {b.title}
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted-foreground leading-5">{b.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="mt-2 px-1 text-[11px] text-muted-foreground">点任一权益可查看对应功能页。</p>
        </section>

        {/* 申请流程 —— 紧凑两列 */}
        <section className="mt-10 md:mt-12">
          <h2 className="text-[22px] md:text-[28px] font-semibold tracking-tight">申请流程</h2>
          <div className="mt-5 rounded-3xl border border-border bg-background p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {data.steps.map((s) => (
              <div key={s.n} className="flex items-start gap-3 p-2.5">
                <span className="h-8 w-8 rounded-full bg-brand-50 text-brand text-[13px] font-semibold inline-flex items-center justify-center shrink-0 tabular-nums">{s.n}</span>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold">{s.t}</div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground leading-5">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
          <Link href={data.registerHref} className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-brand hover:gap-2 transition-all">现在就提交申请 <ArrowRight className="h-3.5 w-3.5" /></Link>
        </section>

        {/* 所需材料 */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-border bg-background p-7 md:p-10">
            <h3 className="text-[22px] font-semibold tracking-tight">需要准备的材料</h3>
            <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
              {data.materials.map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent-tea mt-1 shrink-0" /> {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-foreground text-background p-7 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/30 blur-2xl" />
            <Sparkles className="relative h-7 w-7 text-accent-yellow" />
            <h3 className="relative mt-4 text-[22px] font-semibold tracking-tight">不确定能不能过审？</h3>
            <p className="relative mt-2 text-[13px] text-background/70 leading-6">
              {isEnt
                ? "把企业基本情况告诉 AI 协会咨询官「小协」，30 秒评估能否申请、推荐合适等级。"
                : "把你的专业、年限、证书告诉 AI 协会咨询官「小协」，30 秒评估能否申请个人会员。"}
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
            在线提交 · 协会秘书处 1-3 日反馈 · 通过后开通{isEnt ? "子站与全部企业服务" : "个人主页与会员服务"}。
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href={data.registerHref} size="lg" variant="primary">
              立即提交申请 <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={isEnt ? "/join?type=individual" : "/join?type=enterprise"} size="lg" variant="outline">
              {isEnt ? "我是个人（设计师等）" : "我代表企业"}
            </Button>
          </div>
        </section>
      </Container>
    </>
  );
}
