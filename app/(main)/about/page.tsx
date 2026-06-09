import Link from "next/link";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Building2, Users2, Award, Sparkles, Phone, Mail, MapPin, HelpCircle, Flag, ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { getPlatformInfo } from "@/lib/runtime-config";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listReviews } from "@/lib/data/reviews";

const TIMELINE = [
  { year: "2005", t: "信阳市建筑装饰装修协会成立", d: "由 28 家本地建筑装修企业联合发起" },
  { year: "2008", t: "首届信阳建博会", d: "走向年度行业盛会，规模 200+ 家" },
  { year: "2015", t: "推出工装报备数字化系统", d: "本地首套数字化报备解决方案" },
  { year: "2020", t: "上线消费保险联合品牌", d: "与人保、平安联合推出安心家装险" },
  { year: "2024", t: "AI 助手矩阵上线", d: "10 位 AI 员工覆盖全场景" },
  { year: "2026", t: "省厅一网通办试点城市", d: "信阳工装报备数据双向同步" },
];

const LEADERSHIP = [
  { name: "陈 X X", role: "会长", from: "信阳同创建工集团" },
  { name: "李 X X", role: "执行副会长", from: "信阳名家装饰" },
  { name: "王 X X", role: "秘书长", from: "协会秘书处" },
  { name: "赵 X X", role: "技术委员会主任", from: "中恒建设集团" },
  { name: "张 X X", role: "调解委员会主任", from: "雅舍设计事务所" },
  { name: "刘 X X", role: "金融保险委员会主任", from: "中原银行信阳分行" },
];

export const metadata = { title: `关于协会 · ${SITE.name}` };

export default async function AboutPage() {
  const total = (await getEnterprises()).length;
  const rvCount = listReviews(1000).length;
  const info = await getPlatformInfo(); // 电话/邮箱/地址走系统设置
  return (
    <>
      <PageHeader
        eyebrow="ABOUT · 关于协会"
        tone="brand"
        title={<>{SITE.name} <br className="md:hidden" /><span className="text-muted-foreground">扎根本地 · 服务行业</span></>}
        description="自 2005 年成立至今，协会始终坚持「营造 · 守护 · 共生」的初心，服务本地建筑装修与设计企业。"
      />

      <Container className="py-12 md:py-16">
        {/* 数字 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { l: "成立年份", v: "2005", c: "text-brand" },
            { l: "认证企业", v: `${total}`, c: "text-cat-build" },
            { l: "真实评价", v: `${rvCount}`, c: "text-cat-decor" },
            { l: "AI 员工", v: "10", c: "text-cat-design" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
              <div className="text-[11px] tracking-wider uppercase text-muted-foreground">{s.l}</div>
              <div className={`mt-1 text-[40px] md:text-[56px] font-semibold leading-none tracking-tight ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* 协会简介 */}
        <section className="mt-16 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="text-[12px] tracking-[0.2em] text-brand uppercase font-medium">OUR MISSION</div>
            <h2 className="mt-3 text-[30px] md:text-[40px] font-semibold tracking-tight leading-tight">
              营造 · 守护 · 共生
            </h2>
          </div>
          <div className="lg:col-span-3 text-[15px] leading-8 text-muted-foreground">
            <p>
              {SITE.name}成立于 2005 年，是经信阳市民政局批准、住建局指导，由本地建筑、装修与设计行业企业自愿组成的非营利性行业组织。协会下设秘书处、技术委员会、调解委员会、金融保险委员会等机构。
            </p>
            <p className="mt-4">
              协会从最初的 28 家发起单位发展至今，覆盖建筑总承包、装饰装修、室内设计、景观园林、机电安装等多个细分领域，并扩展至光山、罗山、息县等县域。
            </p>
            <p className="mt-4">
              2024 年起，协会启动数字化与 AI 化升级，自主开发本平台与 10 位 AI 员工，让每一家会员企业、每一位本地业主，都能享受到透明、高效、可信的协会服务。
            </p>
          </div>
        </section>

        {/* 历程 */}
        <section className="mt-20">
          <div className="text-[12px] tracking-[0.2em] text-cat-decor uppercase font-medium">TIMELINE</div>
          <h2 className="mt-3 text-[26px] md:text-[34px] font-semibold tracking-tight">协会大事记</h2>
          <ol className="mt-8 relative grid grid-cols-1 md:grid-cols-3 gap-5">
            {TIMELINE.map((t) => (
              <li key={t.year} className="rounded-3xl border border-border bg-background p-6 relative">
                <div className="text-[42px] font-semibold tracking-tight text-brand leading-none">{t.year}</div>
                <div className="mt-3 text-[15px] font-semibold">{t.t}</div>
                <div className="mt-1.5 text-[12px] text-muted-foreground leading-5">{t.d}</div>
              </li>
            ))}
          </ol>
        </section>

        {/* 党的建设 */}
        <section className="mt-20">
          <div className="rounded-[32px] bg-party text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <Flag className="h-10 w-10 shrink-0 relative" />
            <div className="flex-1 relative">
              <div className="text-[12px] tracking-[0.2em] text-white/80 uppercase font-medium">PARTY BUILDING · 党的建设</div>
              <h2 className="mt-2 text-[26px] md:text-[34px] font-semibold tracking-tight">党建引领行业高质量发展</h2>
              <p className="mt-3 text-[13px] md:text-[14px] text-white/85 leading-6 max-w-2xl">
                协会党支部发挥政治引领与战斗堡垒作用，把党建工作融入协会运行与会员服务全过程。了解支部概况、党建动态、理论学习与三会一课。
              </p>
            </div>
            <Link href="/party" className="relative shrink-0 inline-flex items-center gap-1.5 h-12 px-7 rounded-full bg-white text-party text-[14px] font-semibold">
              进入党建专栏 <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* 领导班子 */}
        <section className="mt-20">
          <div className="text-[12px] tracking-[0.2em] text-cat-design uppercase font-medium">LEADERSHIP</div>
          <h2 className="mt-3 text-[26px] md:text-[34px] font-semibold tracking-tight">协会领导班子</h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {LEADERSHIP.map((l) => (
              <div key={l.role} className="rounded-3xl border border-border bg-background p-5 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-foreground text-background flex items-center justify-center text-[18px] font-semibold">
                  {l.name.slice(0, 1)}
                </div>
                <div className="mt-3 text-[14px] font-semibold">{l.name}</div>
                <div className="text-[11px] text-muted-foreground">{l.role}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{l.from}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 下设机构 */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users2, t: "秘书处", d: "日常运营、会员服务、活动组织" },
            { icon: Award, t: "技术委员会", d: "标准规范制定、案例评审" },
            { icon: Building2, t: "调解委员会", d: "纠纷调解、消费者保护" },
            { icon: Sparkles, t: "AI 与数字化办公室", d: "AI 员工训练、平台运营" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.t} className="rounded-3xl border border-border bg-background p-6">
                <Icon className="h-6 w-6 text-brand" />
                <div className="mt-4 text-[16px] font-semibold">{c.t}</div>
                <div className="mt-1.5 text-[12px] text-muted-foreground leading-5">{c.d}</div>
              </div>
            );
          })}
        </section>

        {/* 常见问题 */}
        <section className="mt-20">
          <div className="text-[12px] tracking-[0.2em] text-accent-tea uppercase font-medium">FAQ</div>
          <h2 className="mt-3 text-[26px] md:text-[34px] font-semibold tracking-tight">常见问题</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: "协会是政府机构吗？", a: "不是。协会是经信阳市民政局批准、住建局指导的非营利性行业组织，由本地建筑装修与设计企业自愿组成。" },
              { q: "如何加入协会？", a: "企业以单位、专业个人以个人身份在线申请，秘书处 1-3 个工作日审核，通过后即开通会员工作台与子站。" },
              { q: "业主能从协会得到什么？", a: "实名评价、消费保险、协会担保与 14 天纠纷调解先行赔付，找企业到验收全程留痕。" },
              { q: "会员有哪些权益？", a: "认证背书、流量分发、工装报备直连、建材集采、金融保险优惠、培训认证与 AI 助手等一站式服务。" },
            ].map((f) => (
              <div key={f.q} className="rounded-3xl border border-border bg-background p-6">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="h-5 w-5 text-accent-tea mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[15px] font-semibold">{f.q}</div>
                    <p className="mt-2 text-[13px] text-muted-foreground leading-6">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 联系我们 */}
        <section className="mt-20 rounded-[32px] bg-foreground text-background p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="text-[12px] tracking-[0.2em] text-accent-yellow uppercase font-medium">CONTACT</div>
            <h2 className="mt-3 text-[30px] md:text-[40px] font-semibold tracking-tight leading-tight">联系我们</h2>
            <p className="mt-3 text-[14px] text-background/70 max-w-md leading-7">
              欢迎企业、业主、媒体、学术机构与我们建立联系。秘书处工作日 9:00-17:30 在岗。
            </p>
            <div className="mt-7 flex gap-3">
              <Button href="/ai/advisor" size="lg" variant="primary" className="!bg-accent-yellow !text-foreground hover:!bg-white">
                问问 AI 小协
              </Button>
              <Link href={`tel:${info.tel.replace(/-/g, "")}`} className="inline-flex items-center gap-1.5 h-14 px-7 rounded-full border border-white/30 text-[14px]">
                <Phone className="h-4 w-4" /> {info.tel}
              </Link>
            </div>
          </div>
          <ul className="space-y-3 text-[14px]">
            <li className="flex items-start gap-3"><Phone className="h-5 w-5 text-accent-yellow mt-0.5 shrink-0" /> 总机：{info.tel}</li>
            <li className="flex items-start gap-3"><Mail className="h-5 w-5 text-accent-yellow mt-0.5 shrink-0" /> 邮箱：{info.email}</li>
            <li className="flex items-start gap-3"><MapPin className="h-5 w-5 text-accent-yellow mt-0.5 shrink-0" /> 地址：{info.address}</li>
            <li className="flex items-start gap-3"><Building2 className="h-5 w-5 text-accent-yellow mt-0.5 shrink-0" /> 营业时间：周一至周五 8:30 - 17:30</li>
          </ul>
        </section>
      </Container>
    </>
  );
}
