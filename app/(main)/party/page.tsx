import Link from "next/link";
import {
  Flag, BookOpen, Users2, ShieldCheck, Sparkles, ArrowUpRight, ChevronRight,
  Calendar, Eye, Target, HeartHandshake, Landmark, Megaphone, GraduationCap,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { listPublished } from "@/lib/data/news-source";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "党的建设 · 信阳市建筑装饰装修协会",
  description:
    "信阳市建筑装饰装修协会党支部 — 党建引领行业高质量发展。支部概况、党建动态、理论学习、三会一课与主题党日，把党建工作融入协会运行与会员服务。",
};

function fmtDate(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// —— 党建引领行业（理念亮点）——
const LEAD = [
  { icon: Target, t: "政治引领", d: "把党的方针政策融入协会决策与行业自律，确保协会发展正确方向。" },
  { icon: HeartHandshake, t: "党建+服务", d: "把党建工作融入入会、报备、集采、调解、培训等会员服务全流程。" },
  { icon: ShieldCheck, t: "先锋示范", d: "发挥党员企业、党员骨干的先锋模范作用，树立诚信经营标杆。" },
  { icon: Users2, t: "凝聚行业", d: "以党组织为纽带凝聚企业会员与个人会员，团结引领行业力量。" },
];

// —— 理论学习 · 学习园地（栏目，正文由后台「党建」分类发布）——
const STUDY = [
  { t: "党的创新理论", d: "深入学习习近平新时代中国特色社会主义思想，及时跟进党的重要会议精神。" },
  { t: "党章党规", d: "学习党章、《中国共产党纪律处分条例》等党内法规，知规明矩。" },
  { t: "行业政策", d: "结合住建、市场监管等行业政策，把理论学习落到协会与会员实务。" },
];

// —— 三会一课 / 主题党日（制度）——
const ROUTINE = [
  { t: "支部党员大会", d: "定期召开，讨论决定支部重要事项。" },
  { t: "支部委员会", d: "研究部署支部日常工作。" },
  { t: "党小组会", d: "组织党员开展学习与讨论。" },
  { t: "党课", d: "支部书记或骨干讲党课，提升党性修养。" },
  { t: "主题党日", d: "每月固定开展，重温入党誓词、集中学习与志愿服务。" },
];

export default async function PartyPage() {
  const dynamics = listPublished("党建").slice(0, 6);

  return (
    <>
      {/* HERO — 党建红 */}
      <section className="relative overflow-hidden bg-party text-white">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-black/10 blur-3xl" aria-hidden />
        <Container className="relative py-12 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] tracking-[0.18em] uppercase mb-5">
              <Flag className="h-3.5 w-3.5" /> 党的建设 · Party Building
            </div>
            <h1 className="text-[32px] sm:text-[42px] md:text-[58px] font-semibold tracking-tight leading-[1.08]">
              党建引领<br className="sm:hidden" />行业高质量发展
            </h1>
            <p className="mt-5 md:mt-6 text-[14px] md:text-[18px] leading-7 md:leading-8 text-white/85 max-w-2xl">
              {SITE.name}党支部发挥政治引领与战斗堡垒作用，坚持把党建工作融入协会运行与会员服务全过程，团结引领企业会员与个人会员听党话、跟党走、守诚信、促发展。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/80">
              <span className="inline-flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5" /> 党组织 · 治理体系第一层</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> 党建 + 协会服务融合</span>
            </div>
          </div>
        </Container>
      </section>

      {/* 支部概况 */}
      <section className="py-10 md:py-14">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
            <div className="lg:col-span-2 rounded-3xl border border-border bg-background p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] text-party uppercase font-medium">
                <Flag className="h-3.5 w-3.5" /> OVERVIEW · 支部概况
              </div>
              <h2 className="mt-3 text-[24px] md:text-[32px] font-semibold tracking-tight">协会党支部</h2>
              <p className="mt-4 text-[14px] md:text-[15px] leading-7 text-muted-foreground">
                协会党支部是协会治理体系的政治核心，在「党组织 — 权力机构（会员大会）— 执行机构（理事会）— 监督机构（监事会）」结构中居于引领地位。支部坚持「围绕发展抓党建、抓好党建促发展」，把组织生活与协会业务同部署、同推进，引导会员单位依法依规、诚信经营，推动信阳建筑装饰装修行业高质量发展。
              </p>
              <Link href="/about/org" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-party">
                查看协会组织机构 <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-3xl bg-party text-white p-6 md:p-8 flex flex-col justify-center">
              <Flag className="h-8 w-8" />
              <div className="mt-4 text-[15px] font-semibold leading-relaxed">
                坚持党建引领<br />融入协会运行
              </div>
              <p className="mt-3 text-[12px] leading-6 text-white/80">
                发挥政治引领、思想引领、组织引领作用，让党旗在行业一线高高飘扬。
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 党建引领行业 */}
      <section className="py-8 md:py-12 bg-surface">
        <Container>
          <div className="mb-7 md:mb-10">
            <div className="text-[12px] tracking-[0.2em] text-party uppercase font-medium">VALUE · 党建引领</div>
            <h2 className="mt-2 text-[24px] md:text-[36px] font-semibold tracking-tight">党建引领行业发展</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {LEAD.map((x) => {
              const Icon = x.icon;
              return (
                <div key={x.t} className="rounded-2xl border border-border bg-background p-5 md:p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-party-soft text-party">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="mt-4 text-[15px] font-semibold tracking-tight">{x.t}</div>
                  <p className="mt-1.5 text-[12px] md:text-[13px] text-muted-foreground leading-5 md:leading-6">{x.d}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 党建动态（接新闻「党建」分类）*/}
      <section className="py-8 md:py-12">
        <Container>
          <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
            <div>
              <div className="text-[12px] tracking-[0.2em] text-party uppercase font-medium inline-flex items-center gap-1.5">
                <Megaphone className="h-3.5 w-3.5" /> NEWS · 党建动态
              </div>
              <h2 className="mt-2 text-[24px] md:text-[36px] font-semibold tracking-tight">支部动态与活动</h2>
            </div>
            <Link href="/news?cat=%E5%85%9A%E5%BB%BA" className="text-[13px] text-party shrink-0">查看全部 →</Link>
          </div>
          {dynamics.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-background p-10 text-center text-[13px] text-muted-foreground">
              暂无党建动态。支部在后台以「党建」分类发布后会在此展示。
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-background divide-y divide-border overflow-hidden">
              {dynamics.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`} className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-surface transition-colors group">
                  <Badge tone="party" className="!px-2 !py-0.5 shrink-0">{n.category}</Badge>
                  <span className="flex-1 min-w-0 truncate text-[14px] md:text-[15px] group-hover:text-party transition-colors">{n.title}</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[12px] text-muted-foreground shrink-0"><Eye className="h-3 w-3" />{n.views.toLocaleString()}</span>
                  <span className="text-[12px] text-muted-foreground shrink-0 tabular-nums inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmtDate(n.createdAt)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* 学习园地 + 三会一课 */}
      <section className="py-8 md:py-12 bg-surface">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            {/* 学习园地 */}
            <div>
              <div className="text-[12px] tracking-[0.2em] text-party uppercase font-medium inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> STUDY · 学习园地
              </div>
              <h2 className="mt-2 text-[22px] md:text-[30px] font-semibold tracking-tight">理论学习</h2>
              <div className="mt-5 space-y-3">
                {STUDY.map((x) => (
                  <div key={x.t} className="rounded-2xl border border-border bg-background p-5">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-lg bg-party-soft text-party inline-flex items-center justify-center"><BookOpen className="h-4 w-4" /></span>
                      <div className="text-[15px] font-semibold tracking-tight">{x.t}</div>
                    </div>
                    <p className="mt-2 text-[13px] text-muted-foreground leading-6">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* 三会一课 */}
            <div>
              <div className="text-[12px] tracking-[0.2em] text-party uppercase font-medium inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> ROUTINE · 三会一课
              </div>
              <h2 className="mt-2 text-[22px] md:text-[30px] font-semibold tracking-tight">三会一课 · 主题党日</h2>
              <div className="mt-5 rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden">
                {ROUTINE.map((x, i) => (
                  <div key={x.t} className="flex items-start gap-3 px-5 py-4">
                    <span className="h-6 w-6 shrink-0 rounded-full bg-party text-white text-[12px] font-semibold inline-flex items-center justify-center">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold">{x.t}</div>
                      <div className="text-[12px] text-muted-foreground mt-0.5 leading-5">{x.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 底部 CTA */}
      <section className="py-10 md:py-14">
        <Container>
          <div className="rounded-[32px] bg-foreground text-background p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6">
            <Flag className="h-8 w-8 text-party shrink-0" />
            <div className="flex-1">
              <div className="text-[20px] md:text-[26px] font-semibold tracking-tight">党员企业 · 党员骨干，亮身份、作表率</div>
              <p className="mt-2 text-[13px] md:text-[14px] text-background/70 leading-6">
                欢迎党员所在会员单位与个人会员关注支部建设、参与组织生活。如需对接党组织关系或开展共建，请联系协会秘书处。
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/about/contact" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-party text-white text-[13px] font-medium">
                联系协会 <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/about/org" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full border border-background/30 text-[13px] font-medium">
                组织机构
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
