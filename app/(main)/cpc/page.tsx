import Link from "next/link";
import {
  Flag, BookOpen, Users2, ShieldCheck, Sparkles, ArrowUpRight, ChevronRight,
  Calendar, Eye, Target, HeartHandshake, Landmark, Megaphone, GraduationCap, Quote,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { listPublished } from "@/lib/data/news-source";
import { listCommittee, listMembers, listMeetings, listTopics } from "@/lib/data/party-source";
import { SITE } from "@/lib/site";

export const metadata = {
  title: "党的建设 · 中国共产党信阳市建筑装饰装修协会支部委员会",
  description:
    "中国共产党信阳市建筑装饰装修协会支部委员会 — 高举中国特色社会主义伟大旗帜，以习近平新时代中国特色社会主义思想为指导，党建引领行业高质量发展。支部概况、党建动态、理论学习、三会一课与主题党日。",
};

// 党支部规范全称
const BRANCH = "中国共产党信阳市建筑装饰装修协会支部委员会";

function fmtDate(ms: number) {
  if (!ms) return "";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// —— 党建引领行业（理念亮点）——
// 党建引领理念（说明卡，非导航——不可点）
const LEAD = [
  { icon: Target, t: "政治引领", d: "坚持以习近平新时代中国特色社会主义思想为指导，把党的方针政策融入协会决策与行业自律。" },
  { icon: HeartHandshake, t: "党建+服务", d: "把党建工作融入入会、报备、集采、调解、培训等会员服务全流程，党建优势转化为发展优势。" },
  { icon: ShieldCheck, t: "先锋示范", d: "发挥党员企业、党员骨干的先锋模范作用，亮身份、作表率，树立诚信经营标杆。" },
  { icon: Users2, t: "凝聚行业", d: "以党组织为纽带团结引领企业会员与个人会员，听党话、感党恩、跟党走。" },
];

// —— 三会一课 / 主题党日 ——
const ROUTINE = [
  { t: "支部党员大会", d: "定期召开，讨论决定支部重要事项。" },
  { t: "支部委员会", d: "研究部署支部日常工作。" },
  { t: "党小组会", d: "组织党员开展学习与讨论。" },
  { t: "党课", d: "支部书记或骨干讲党课，提升党性修养。" },
  { t: "主题党日", d: "每月固定开展，重温入党誓词、集中学习与志愿服务。" },
];

const OATH =
  "我志愿加入中国共产党，拥护党的纲领，遵守党的章程，履行党员义务，执行党的决定，严守党的纪律，保守党的秘密，对党忠诚，积极工作，为共产主义奋斗终身，随时准备为党和人民牺牲一切，永不叛党。";

export default async function PartyPage() {
  const dynamics = listPublished("党建").slice(0, 6);
  const study = listPublished("理论学习").slice(0, 5);
  const committee = listCommittee();
  const members = listMembers();
  const meetings = listMeetings().slice(0, 6);
  const topics = listTopics();

  return (
    <>
      {/* HERO — 党旗红渐变 + 党徽 + 国旗党旗 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-party via-[#b1000a] to-party-dark text-white">
        {/* 党徽水印 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/party-emblem.svg" alt="" aria-hidden className="pointer-events-none absolute -right-10 -top-6 w-72 md:w-96 opacity-[0.10] rotate-6" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-black/15 blur-3xl" aria-hidden />
        <Container className="relative py-12 md:py-20">
          <div className="max-w-3xl">
            {/* 国徽 · 国旗 · 党旗（官方图）*/}
            <div className="flex items-center gap-3 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/national-emblem.svg" alt="中华人民共和国国徽" className="h-9 md:h-11 w-auto" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/china-flag.svg" alt="中华人民共和国国旗" className="h-7 md:h-9 w-auto rounded-[2px] shadow ring-1 ring-white/30" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/party-flag.svg" alt="中国共产党党旗" className="h-7 md:h-9 w-auto rounded-[2px] shadow ring-1 ring-white/30" />
              <span className="text-[11px] tracking-[0.18em] uppercase text-white/80 ml-1">中国共产党 · 党的建设 · CPC</span>
            </div>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/party-emblem.svg" alt="中国共产党党徽" className="h-14 w-14 md:h-20 md:w-20 shrink-0" />
              <h1 className="text-[30px] sm:text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.08]">
                党建引领<br className="sm:hidden" />行业高质量发展
              </h1>
            </div>
            <div className="mt-5 text-[15px] md:text-[18px] font-medium text-white/95">{BRANCH}</div>
            <p className="mt-3 text-[13px] md:text-[16px] leading-7 md:leading-8 text-white/85 max-w-2xl">
              高举中国特色社会主义伟大旗帜，以习近平新时代中国特色社会主义思想为指导，发挥党支部政治引领与战斗堡垒作用，坚持把党建工作融入协会运行与会员服务全过程，团结引领企业会员与个人会员听党话、感党恩、跟党走。
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {["不忘初心", "牢记使命", "永远跟党走"].map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium">
                  <Flag className="h-3 w-3" /> {s}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 入党誓词 */}
      <section className="bg-party-dark text-white">
        <Container className="py-8 md:py-10">
          <div className="flex items-start gap-4 max-w-4xl">
            <Quote className="h-7 w-7 md:h-9 md:w-9 text-[#f6c915] shrink-0" />
            <div>
              <div className="text-[12px] tracking-[0.2em] uppercase text-[#f6c915] font-medium">入党誓词</div>
              <p className="mt-2 text-[14px] md:text-[17px] leading-7 md:leading-9 font-medium">{OATH}</p>
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
              <h2 className="mt-3 text-[24px] md:text-[32px] font-semibold tracking-tight">{BRANCH}</h2>
              <p className="mt-4 text-[14px] md:text-[15px] leading-7 text-muted-foreground">
                协会党支部是协会的政治核心，在「党组织 — 权力机构（会员大会）— 执行机构（理事会）— 监督机构（监事会）」结构中居于引领地位。支部坚持以习近平新时代中国特色社会主义思想为指导，坚定不移听党话、跟党走，把组织生活与协会业务同部署、同推进，「围绕发展抓党建、抓好党建促发展」，引导会员单位依法依规、诚信经营，推动信阳建筑装饰装修行业高质量发展。
              </p>
              <Link href="/about/org" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-party">
                查看协会组织机构 <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-party to-party-dark text-white p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/party-emblem.svg" alt="" aria-hidden className="absolute -right-6 -bottom-6 w-40 opacity-15" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/party-emblem.svg" alt="中国共产党党徽" className="relative h-12 w-12" />
              <div className="relative mt-4 text-[16px] font-semibold leading-relaxed">
                坚持党建引领<br />融入协会运行
              </div>
              <p className="relative mt-3 text-[12px] leading-6 text-white/85">
                发挥政治引领、思想引领、组织引领作用，让党旗在行业一线高高飘扬。
              </p>
            </div>
          </div>

          {/* 支部班子 / 组织架构 */}
          {committee.length > 0 && (
            <div className="mt-5 md:mt-6 rounded-3xl border border-border bg-background p-6 md:p-8">
              <div className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] text-party uppercase font-medium">
                <Users2 className="h-3.5 w-3.5" /> COMMITTEE · 支部班子
              </div>
              <h3 className="mt-2 text-[20px] md:text-[26px] font-semibold tracking-tight">支部委员会</h3>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {committee.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-border bg-surface/40 p-5">
                    <span className="inline-flex items-center rounded-full bg-party-soft text-party px-2.5 py-0.5 text-[11px] font-medium">{c.post}</span>
                    <div className="mt-3 text-[16px] font-semibold tracking-tight">{c.name}</div>
                    {c.duty && <p className="mt-1.5 text-[12px] text-muted-foreground leading-5">{c.duty}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  <span className="h-11 w-16 rounded-lg overflow-hidden border border-border bg-party-soft shrink-0 inline-flex items-center justify-center">
                    {n.cover
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={n.cover} alt="" className="h-full w-full object-cover" />
                      : <Flag className="h-4 w-4 text-party/50" />}
                  </span>
                  <Badge tone="party" className="!px-2 !py-0.5 shrink-0 hidden sm:inline-flex">{n.category}</Badge>
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
            {/* 学习园地 —— 真实「理论学习」文章（接新闻「理论学习」分类）*/}
            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[12px] tracking-[0.2em] text-party uppercase font-medium inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> STUDY · 学习园地
                  </div>
                  <h2 className="mt-2 text-[22px] md:text-[30px] font-semibold tracking-tight">理论学习</h2>
                </div>
                {study.length > 0 && (
                  <Link href="/news?cat=%E7%90%86%E8%AE%BA%E5%AD%A6%E4%B9%A0" className="text-[13px] text-party shrink-0">查看全部 →</Link>
                )}
              </div>
              {study.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-[13px] text-muted-foreground">
                  暂无理论学习文章。支部在后台以「理论学习」分类发布后会在此展示。
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {study.map((n) => (
                    <Link key={n.id} href={`/news/${n.id}`} className="group block rounded-2xl border border-border bg-background p-5 transition-all active:scale-[0.99] md:hover:shadow-md">
                      <div className="flex items-center gap-2.5">
                        <span className="h-7 w-7 rounded-lg bg-party-soft text-party inline-flex items-center justify-center shrink-0"><BookOpen className="h-4 w-4" /></span>
                        <div className="text-[15px] font-semibold tracking-tight flex-1 line-clamp-1 group-hover:text-party transition-colors">{n.title}</div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <p className="mt-2 text-[13px] text-muted-foreground leading-6 line-clamp-2">{n.excerpt}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* 三会一课 */}
            <div>
              <div className="text-[12px] tracking-[0.2em] text-party uppercase font-medium inline-flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> ROUTINE · 三会一课
              </div>
              <h2 className="mt-2 text-[22px] md:text-[30px] font-semibold tracking-tight">三会一课 · 主题党日</h2>
              {/* 制度（5 类）紧凑标签 */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {ROUTINE.map((x) => (
                  <span key={x.t} className="inline-flex items-center rounded-full bg-party-soft text-party px-2.5 py-1 text-[12px] font-medium">{x.t}</span>
                ))}
              </div>
              {/* 真实台账 */}
              {meetings.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-background p-8 text-center text-[13px] text-muted-foreground">
                  暂无会议台账。支部在后台「支部建设 → 三会一课台账」登记后在此展示。
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden">
                  {meetings.map((m) => (
                    <div key={m.id} className="px-5 py-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone="party" className="!px-2 !py-0.5">{m.type}</Badge>
                        <span className="text-[14px] font-semibold tracking-tight flex-1 min-w-0 truncate">{m.title}</span>
                        <span className="text-[12px] text-muted-foreground tabular-nums inline-flex items-center gap-1 shrink-0"><Calendar className="h-3 w-3" />{m.date}</span>
                      </div>
                      <div className="mt-1 text-[12px] text-muted-foreground leading-5">
                        {[m.host && `主讲 ${m.host}`, m.attend, m.location].filter(Boolean).join(" · ")}
                      </div>
                      {m.images.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {m.images.slice(0, 4).map((u) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img key={u} src={u} alt="" className="h-14 w-20 rounded-lg border border-border object-cover" />
                          ))}
                          {m.images.length > 4 && <span className="h-14 w-10 rounded-lg border border-border bg-surface text-[11px] text-muted-foreground inline-flex items-center justify-center shrink-0">+{m.images.length - 4}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 党员风采 / 名册 */}
      {members.length > 0 && (
        <section className="py-8 md:py-12">
          <Container>
            <div className="mb-6 md:mb-8">
              <div className="text-[12px] tracking-[0.2em] text-party uppercase font-medium inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> MEMBERS · 党员风采
              </div>
              <h2 className="mt-2 text-[24px] md:text-[36px] font-semibold tracking-tight">党员先锋 · 亮身份作表率</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {members.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="party" className="!px-2 !py-0.5">{m.kind}</Badge>
                    {m.joined && <span className="text-[11px] text-muted-foreground">{m.joined} 入党</span>}
                  </div>
                  <div className="mt-3 text-[16px] font-semibold tracking-tight">{m.name}</div>
                  <div className="text-[12px] text-muted-foreground">{[m.org, m.role].filter(Boolean).join(" · ")}</div>
                  {m.highlight && <p className="mt-2.5 text-[13px] leading-6 text-foreground/80">{m.highlight}</p>}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 党建专题 */}
      {topics.length > 0 && (
        <section className="py-8 md:py-12 bg-surface">
          <Container>
            <div className="mb-6 md:mb-8">
              <div className="text-[12px] tracking-[0.2em] text-party uppercase font-medium inline-flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> TOPICS · 党建专题
              </div>
              <h2 className="mt-2 text-[24px] md:text-[36px] font-semibold tracking-tight">专题学习</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {topics.map((t) => (
                <Link key={t.id} href={`/cpc/topic/${t.id}`} className="group rounded-2xl border border-border bg-background p-6 hover:shadow-md hover:border-party/30 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[17px] font-semibold tracking-tight group-hover:text-party transition-colors">{t.title}</h3>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  {t.summary && <p className="mt-2 text-[13px] text-muted-foreground leading-6 line-clamp-2">{t.summary}</p>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.keywords.slice(0, 5).map((k) => <span key={k} className="rounded-full bg-party-soft text-party px-2 py-0.5 text-[11px]">{k}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 底部 CTA */}
      <section className="py-10 md:py-14">
        <Container>
          <div className="rounded-[32px] bg-gradient-to-br from-party to-party-dark text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/party-emblem.svg" alt="" aria-hidden className="absolute -right-8 -top-8 w-48 opacity-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/party-emblem.svg" alt="中国共产党党徽" className="relative h-12 w-12 shrink-0" />
            <div className="relative flex-1">
              <div className="text-[20px] md:text-[26px] font-semibold tracking-tight">党员企业 · 党员骨干，亮身份、作表率</div>
              <p className="mt-2 text-[13px] md:text-[14px] text-white/80 leading-6">
                欢迎党员所在会员单位与个人会员关注支部建设、参与组织生活。如需对接党组织关系或开展共建，请联系{SITE.shortName}秘书处。
              </p>
            </div>
            <div className="relative flex flex-wrap gap-3 shrink-0">
              <Link href="/about/contact" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full bg-white text-party text-[13px] font-semibold">
                联系协会 <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/about/org" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full border border-white/40 text-[13px] font-medium">
                组织机构
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
