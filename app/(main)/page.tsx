import Link from "next/link";
import {
  ArrowRight, Sparkles, Star, ShieldCheck, ChevronRight, ArrowUpRight,
  HardHat, MessagesSquare, MessageSquareHeart, Search,
} from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listLeadsForCustomer } from "@/lib/data/leads";
import { listReviewsByUid, listReviews } from "@/lib/data/reviews";
import { listGalleryCases, listCaseTags, countCases } from "@/lib/data/cases";
import { cn } from "@/lib/cn";

function maskName(n: string) {
  if (!n) return "业主";
  return n.length <= 1 ? n : n.slice(0, 1) + "**";
}

export const metadata = {
  title: "你想把家装成什么样 · 信阳建装 · 看真实案例找装修",
  description:
    "看信阳本地真实业主家的装修实景，按户型挑灵感，看中了直接约这家。协会认证企业 · 实名口碑 · 14 天调解 · 跑路有保险赔付。",
};

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
};

export default async function ConsumerHome({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams;
  const session = await getSession();

  // 案例灵感流（真实企业案例，带图）
  const tags = listCaseTags();
  const activeTag = tag && tags.some((t) => t.tag === tag) ? tag : undefined;
  const cases = listGalleryCases({ tag: activeTag, limit: 24 });
  const totalCases = countCases();

  // 口碑（真实评价）
  const rvStat = listReviews(500);
  const rvCount = rvStat.length;
  const rvAvg = rvStat.length ? rvStat.reduce((a, r) => a + r.rating, 0) / rvStat.length : 5;
  const homeReviews = [...rvStat]
    .filter((r) => r.content && r.content.length > 8)
    .sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt)
    .slice(0, 3);

  // 口碑企业（真实，少量）
  const featured = (await getEnterprises()).filter((e) => e.featured).slice(0, 4);

  // 登录业主个性化
  const customer = session?.role === "customer" ? session : null;
  const myRequests = customer ? listLeadsForCustomer(customer.uid, customer.phone) : [];
  const myReviews = customer ? listReviewsByUid(customer.uid) : [];
  const signedCount = myRequests.filter((l) => l.status === "signed").length;

  return (
    <>
      {/* 登录业主个性化条 */}
      {customer && (
        <section className="border-b border-border bg-surface/60">
          <Container className="py-3.5">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="text-[14px] font-semibold tracking-tight">欢迎回来，{customer.name}</div>
              <Link href="/dashboard/customer" className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 shrink-0">
                进入我的 <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {signedCount > 0
                ? <PersonalTile icon={HardHat} title="我的装修项目" sub={`${signedCount} 个已签约`} href="/dashboard/customer/projects" />
                : <PersonalTile icon={HardHat} title="开始装修" sub="AI 估价 · 找企业" href="/ai/decor" />}
              <PersonalTile icon={MessagesSquare} title="我的需求" sub={myRequests.length > 0 ? `${myRequests.length} 条跟踪中` : "发需求"} href="/dashboard/customer/requests" />
              <PersonalTile icon={MessageSquareHeart} title="我的评价" sub={myReviews.length > 0 ? `${myReviews.length} 条已发布` : "完工来打分"} href="/dashboard/customer/review" />
              <PersonalTile icon={Sparkles} title="AI 装修顾问" sub="小装在线" href="/ai/decor" />
            </div>
          </Container>
        </section>
      )}

      {/* HERO —— 克制、留白、以「你」为主语 */}
      <section>
        <Container className="pt-14 md:pt-24 pb-8 md:pb-12">
          <div className="max-w-3xl">
            <div className="text-[12px] tracking-[0.2em] text-muted-foreground uppercase mb-5">信阳本地 · 协会认证的装修</div>
            <h1 className="text-[40px] sm:text-[56px] md:text-[72px] font-semibold tracking-tight leading-[1.04]">
              你想把家，<br className="sm:hidden" />装成什么样？
            </h1>
            <p className="mt-6 text-[15px] md:text-[17px] leading-7 md:leading-8 text-muted-foreground max-w-xl">
              {totalCases} 套信阳本地真实业主家的装修实景，按你的户型挑灵感，看中了——直接约这家做。
            </p>

            {/* 户型筛选 chips */}
            <div className="mt-8 flex flex-wrap gap-2">
              <TagChip label="全部" href="/" active={!activeTag} />
              {tags.slice(0, 8).map((t) => (
                <TagChip key={t.tag} label={t.tag} href={`/?tag=${encodeURIComponent(t.tag)}#cases`} active={activeTag === t.tag} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 案例灵感瀑布流 —— 页面主角 */}
      <section id="cases" className="pb-10 md:pb-16">
        <Container>
          {cases.length === 0 ? (
            <div className="rounded-3xl border border-border bg-surface/40 py-16 text-center text-muted-foreground text-[14px]">
              该户型暂无案例，<Link href="/" className="text-foreground underline underline-offset-2">看看全部</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={c.enterpriseSlug ? `/biz/${c.enterpriseSlug}/cases/${c.id}` : "/members"}
                  className="block group"
                >
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.cover}
                      alt={c.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-2.5 px-0.5">
                    <div className="text-[13.5px] font-medium tracking-tight line-clamp-1 group-hover:text-brand transition-colors">{c.title}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                      {c.area && <span>{c.area}㎡</span>}
                      {c.tag && <><span className="text-border">·</span><span>{c.tag}</span></>}
                      {c.enterpriseName && <><span className="text-border">·</span><span className="truncate">{c.enterpriseName}</span></>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/members" className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full border border-border text-[14px] font-medium hover:bg-surface transition-colors">
              浏览全部装修企业 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* 协会背书 —— 一行细带，克制 */}
      <section className="border-y border-border bg-surface/40">
        <Container>
          <div className="py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 协会认证企业</span>
            <span className="text-border">·</span><span>实名口碑 · 发布后不可删</span>
            <span className="text-border">·</span><span>14 天纠纷调解兜底</span>
            <span className="text-border">·</span><span>家装保险 · 跑路也能赔</span>
          </div>
        </Container>
      </section>

      {/* AI 估价 —— 次级，克制一条 */}
      <section className="py-12 md:py-16">
        <Container>
          <Link href="/ai/decor" className="group flex items-center justify-between gap-4 rounded-3xl border border-border bg-background p-6 md:p-9 hover:border-foreground/20 hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.18)] transition-all">
            <div className="min-w-0">
              <div className="text-[12px] tracking-[0.15em] uppercase text-muted-foreground inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-cat-decor" /> AI 估价</div>
              <div className="mt-2 text-[20px] md:text-[28px] font-semibold tracking-tight leading-snug">不确定预算？30 秒算出来，免费匹配 3 家</div>
              <div className="mt-1.5 text-[12px] text-muted-foreground">100% 免费 · 不卖电话 · 协会留痕</div>
            </div>
            <span className="h-12 w-12 shrink-0 rounded-full bg-foreground text-background inline-flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowRight className="h-5 w-5" />
            </span>
          </Link>
        </Container>
      </section>

      {/* 真实口碑 —— 极简 */}
      {homeReviews.length > 0 && (
        <section className="pb-12 md:pb-16">
          <Container>
            <div className="flex items-end justify-between mb-6 gap-4">
              <h2 className="text-[22px] md:text-[32px] font-semibold tracking-tight">
                {rvCount} 条真实评价 · 平均 <span className="text-cat-decor">{rvAvg.toFixed(1)}</span> 分
              </h2>
              <Link href="/review" className="text-[13px] text-muted-foreground hover:text-foreground shrink-0">全部 →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {homeReviews.map((r) => (
                <Link key={r.id} href="/review" className="block rounded-2xl border border-border bg-background p-5 hover:bg-surface/50 transition-colors">
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }, (_, j) => (
                      <Star key={j} className={cn("h-3.5 w-3.5", j < r.rating ? "fill-[#FFB400] text-[#FFB400]" : "text-border")} />
                    ))}
                  </div>
                  <p className="text-[13px] leading-6 text-foreground line-clamp-4">&ldquo;{r.content}&rdquo;</p>
                  <div className="mt-3 text-[11px] text-muted-foreground">{maskName(r.user)} · {r.enterprise}</div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 口碑企业 —— 少量，次级 */}
      {featured.length > 0 && (
        <section className="pb-12 md:pb-16">
          <Container>
            <div className="flex items-end justify-between mb-6 gap-4">
              <h2 className="text-[22px] md:text-[32px] font-semibold tracking-tight">口碑好的装修企业</h2>
              <Link href="/members" className="text-[13px] text-muted-foreground hover:text-foreground shrink-0">全部 →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {featured.map((e) => (
                <Link key={e.id} href={`/biz/${e.slug}`} className="group rounded-2xl border border-border bg-background p-4 hover:bg-surface/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("h-10 w-10 rounded-xl text-white inline-flex items-center justify-center font-semibold shrink-0", BG[e.color] ?? "bg-foreground")}>
                      {e.hero.brand.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold truncate">{e.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{e.district}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#FFB400] text-[#FFB400]" /><span className="font-semibold">{e.rating.toFixed(1)}</span></span>
                    <span className="text-muted-foreground">{e.cases} 案例</span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="pb-12 md:pb-16">
        <Container>
          <div className="rounded-[28px] md:rounded-[36px] bg-foreground text-background p-8 md:p-14 text-center">
            <h2 className="text-[28px] md:text-[44px] font-semibold tracking-tight leading-tight">开始你的装修</h2>
            <p className="mt-3 text-[14px] text-background/70 max-w-md mx-auto leading-7">看中案例直接约这家，或让 AI 小装按你的预算挑 3 家 · 全程协会监管 · 不满意可调解</p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/ai/decor" className="h-12 px-6 rounded-full bg-accent-yellow text-foreground text-[14px] font-medium inline-flex items-center justify-center gap-2 hover:bg-white transition-colors">
                AI 免费估价 <Sparkles className="h-4 w-4" />
              </Link>
              <Link href="/members" className="h-12 px-6 rounded-full border border-white/25 text-background text-[14px] font-medium inline-flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                浏览企业 <Search className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 另一个门面 */}
      <section className="pb-14 md:pb-20">
        <Container>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[13px] text-muted-foreground">
            <div>您是装修企业 / 从业者？协会门户 <code className="font-mono text-foreground">xh.xyjzxh.com</code> 提供入会、工装报备、子站、招工、培训等服务。</div>
            <Link href="/xh" className="inline-flex items-center gap-1.5 text-foreground hover:gap-2 transition-all shrink-0">进入协会门户 <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function TagChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "h-9 px-4 rounded-full text-[13px] font-medium inline-flex items-center transition-colors",
        active ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
      )}
    >
      {label}
    </Link>
  );
}

function PersonalTile({ icon: Icon, title, sub, href }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; sub: string; href: string;
}) {
  return (
    <Link href={href} className="group rounded-xl border border-border bg-background p-3 flex items-center gap-2.5 active:scale-[0.98] transition-transform">
      <span className="h-8 w-8 rounded-lg bg-surface text-foreground inline-flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold truncate">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}
