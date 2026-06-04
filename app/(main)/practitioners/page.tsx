import Link from "next/link";
import {
  ShieldCheck, Briefcase, GraduationCap, HeartHandshake, Receipt, Users2,
  ArrowRight, Star, Sparkles, BadgeCheck, ArrowUpRight, Phone,
} from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listPractitioners, listPractitionerJobs } from "@/lib/data/practitioners-source";
import { cn } from "@/lib/cn";

export const metadata = { title: "从业者门户 · 信阳市建筑装饰装修协会" };

const SERVICES = [
  { icon: ShieldCheck, t: "实名身份 + 信用画像", d: "协会颁发数字身份证 · 历史项目自动聚合 · 信用分对接住建系统", color: "brand" },
  { icon: Briefcase, t: "找活 / 接单",          d: "协会企业项目直推 · 工长可接散单（小型家装/局装）",          color: "build" },
  { icon: GraduationCap, t: "培训 + 持续教育",   d: "协会发证 · 二建/木工/BIM/AI 装修 · 含金量高于市场培训",     color: "design" },
  { icon: HeartHandshake, t: "保障 · 工伤险 + 防欠薪", d: "5 元/天/人 工伤险 · 防欠薪保函 7 天先垫付 ≤ 5 万", color: "decor" },
  { icon: Receipt, t: "收入流水 · 月度证明",     d: "政府/银行认可 · 用于贷款、子女入学、落户证明",            color: "tea" },
  { icon: Users2, t: "同行圈 + 调解",            d: "本地师傅圈 · 工资工伤纠纷协会调解 · 个人对企业不再吃亏",     color: "yellow" },
];

const STEPS = [
  { n: 1, t: "实名注册", d: "手机号 + 身份证 + 行业身份（工长/师傅/设计师...）" },
  { n: 2, t: "认证审核", d: "证书 / 历史项目 / 推荐企业 提交，3 个工作日反馈" },
  { n: 3, t: "正式上线", d: "进入找活池 · 企业可见 · 享全部保障" },
];

const TONE: Record<string, string> = {
  brand: "bg-brand-50 text-brand",
  build: "bg-cat-build-soft text-cat-build",
  decor: "bg-cat-decor-soft text-cat-decor",
  design: "bg-cat-design-soft text-cat-design",
  tea: "bg-[#e6f7f1] text-accent-tea",
  yellow: "bg-[#fff6d6] text-[#a37200]",
};

export default function PractitionersLanding() {
  const list = listPractitioners();
  const PRACTITIONER_JOBS = listPractitionerJobs();
  return (
    <>
      <PageHeader
        eyebrow="PRACTITIONERS · 行业从业者"
        tone="design"
        title={<>工长 · 师傅 · 设计师<br className="md:hidden" /><span className="text-muted-foreground">协会替你做这些</span></>}
        description="工长、木工、瓦工、水电工、油漆工、独立设计师、监理、注册建造师 — 只要你在信阳建装行业，协会都欢迎你。"
        actions={
          <>
            <Button href="/login?role=practitioner" variant="secondary">立即登录</Button>
            <Button href="/register?role=practitioner" variant="outline">免费注册</Button>
          </>
        }
      />

      <Container className="py-12 md:py-16">
        {/* 6 大服务 */}
        <h2 className="text-[26px] md:text-[32px] font-semibold tracking-tight">协会为你做这些</h2>
        <p className="mt-2 text-[14px] text-muted-foreground max-w-2xl">不是另一个 58 同城 — 是协会牵头的行业身份 + 保障 + 资源网。</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s) => {
            const Ic = s.icon;
            return (
              <div key={s.t} className="rounded-3xl border border-border bg-background p-6">
                <span className={cn("inline-flex h-11 w-11 rounded-2xl items-center justify-center", TONE[s.color])}>
                  <Ic className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-[13px] text-muted-foreground leading-6">{s.d}</p>
              </div>
            );
          })}
        </div>

        {/* 数字墙 */}
        <div className="mt-14 rounded-3xl bg-foreground text-background p-8 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { l: "在册从业者", v: "4,862",  c: "text-accent-yellow" },
            { l: "本月新增", v: "+182",    c: "text-cat-decor" },
            { l: "本月开工伤险", v: "1.2 万人/天", c: "text-cat-design" },
            { l: "调解结案率", v: "96%",    c: "text-accent-tea" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-[10px] tracking-[0.2em] text-background/60 uppercase">{s.l}</div>
              <div className={`mt-1 text-[36px] md:text-[44px] font-semibold tracking-tight leading-none ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* 实时找活 */}
        <div className="mt-14 flex items-end justify-between mb-4">
          <div>
            <div className="text-[12px] tracking-[0.2em] text-cat-build uppercase font-medium">JOBS · 实时找活</div>
            <h2 className="mt-2 text-[26px] md:text-[32px] font-semibold tracking-tight">本周热招</h2>
          </div>
          <Link href="/dashboard/practitioner/jobs" className="text-[13px] text-brand">登录看全部 →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRACTITIONER_JOBS.slice(0, 4).map((j) => (
            <div key={j.id} className="rounded-3xl border border-border bg-background p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge tone="brand">{j.openings} 个名额</Badge>
                {j.urgent && <Badge tone="decor">🔥 急招</Badge>}
                <span className="text-[11px] text-muted-foreground ml-auto">{j.postedAt}</span>
              </div>
              <h3 className="text-[16px] font-semibold tracking-tight">{j.title}</h3>
              <div className="mt-2 text-[12px] text-muted-foreground">{j.enterprise} · {j.area} · {j.duration}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-[14px] font-semibold text-cat-decor">¥{j.daily}<span className="text-[11px] font-normal text-muted-foreground"> /天</span></div>
                <Link href="/login?role=practitioner" className="inline-flex items-center gap-1 h-9 px-3.5 rounded-full bg-foreground text-background text-[12px] font-medium">
                  报名 <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 推荐工长 */}
        <h2 className="mt-14 text-[26px] md:text-[32px] font-semibold tracking-tight">协会认证工长 / 师傅</h2>
        <p className="mt-2 text-[14px] text-muted-foreground">真实评价 · 历史项目可追溯 · 工伤险全员覆盖</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-3xl border border-border bg-background p-5">
              <div className="flex items-center gap-2">
                <span className="h-12 w-12 rounded-full bg-cat-design text-white inline-flex items-center justify-center text-[18px] font-semibold">{p.name.slice(0, 1)}</span>
                <div>
                  <div className="text-[14px] font-semibold">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.kind} · {p.years}年</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px]">
                <Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" />
                <span className="font-semibold">{p.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">· {p.jobs} 单</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">{p.city}</div>
              {p.insured && (
                <Badge tone="tea" className="mt-2 !text-[9px]"><ShieldCheck className="h-2.5 w-2.5 inline mr-0.5" />工伤险</Badge>
              )}
            </div>
          ))}
        </div>

        {/* 流程 */}
        <h2 className="mt-14 text-[26px] md:text-[32px] font-semibold tracking-tight">3 步加入</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-3xl border border-border bg-background p-7">
              <div className="text-[42px] font-semibold tracking-tight text-cat-design leading-none">0{s.n}</div>
              <div className="mt-4 text-[18px] font-semibold">{s.t}</div>
              <div className="mt-2 text-[13px] text-muted-foreground leading-6">{s.d}</div>
            </div>
          ))}
        </div>

        {/* AI 入口 */}
        <div className="mt-14 rounded-[28px] bg-foreground text-background p-7 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <Sparkles className="h-7 w-7 text-accent-yellow" />
            <h2 className="mt-3 text-[28px] md:text-[36px] font-semibold tracking-tight leading-tight">AI 小才 · 找活 / 答疑 / 起诉</h2>
            <p className="mt-2 text-[13px] text-background/70 max-w-md leading-7">
              发简历自动匹配 3 个最合适岗位；想接散单告诉 TA 你的工种和工期；遇到欠薪可让 TA 草拟申诉函。
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2">
              <Link href="/ai/hr" className="inline-flex items-center gap-1.5 h-12 px-5 rounded-full bg-accent-yellow text-foreground text-[13px] font-medium">
                立即问小才 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/ai" className="inline-flex items-center gap-1.5 h-12 px-5 rounded-full border border-white/30 text-[13px]">
                查看全部 AI 员工
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-6">
            <div className="text-[11px] tracking-wider text-background/60 uppercase">本月 AI 服务从业者</div>
            <div className="mt-1 text-[40px] font-semibold tracking-tight text-accent-yellow">2,840 次</div>
            <ul className="mt-3 space-y-1 text-[11px] text-background/70">
              <li>· 找活匹配 1,420 次</li>
              <li>· 简历优化 624 次</li>
              <li>· 欠薪 / 工伤申诉草拟 286 次</li>
            </ul>
          </div>
        </div>

        {/* 最终 CTA */}
        <div className="mt-14 rounded-[28px] bg-mesh border border-border p-7 md:p-12 text-center">
          <BadgeCheck className="h-10 w-10 text-cat-design mx-auto" />
          <h2 className="mt-4 text-[28px] md:text-[40px] font-semibold tracking-tight leading-tight">
            协会替你撑腰<br className="sm:hidden" />
            <span className="text-muted-foreground">从今天开始</span>
          </h2>
          <p className="mt-3 text-[14px] text-muted-foreground max-w-md mx-auto leading-7">
            10 分钟完成注册 · 1-3 日审核 · 通过即享全部保障与服务。
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/register?role=practitioner" size="lg" variant="primary">
              免费注册 · 成为协会从业者 <ArrowRight className="h-4 w-4" />
            </Button>
            <Link href={`tel:0376-000-0000`} className="inline-flex items-center gap-2 h-14 px-7 rounded-full border border-border text-foreground font-medium">
              <Phone className="h-4 w-4" /> 0376-000-0000
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
