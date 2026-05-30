import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ShieldCheck, Star, MapPin, Phone, Building2, Calendar, Users } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEnterprise, ENTERPRISES } from "@/lib/data/enterprises";
import { cn } from "@/lib/cn";

const TONE: Record<string, "build" | "decor" | "design"> = {
  build: "build", decor: "decor", design: "design",
};

const BG: Record<string, string> = {
  build: "bg-cat-build", decor: "bg-cat-decor", design: "bg-cat-design",
};

export async function generateStaticParams() {
  return ENTERPRISES.map((e) => ({ id: e.slug }));
}

export default async function EnterpriseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const e = getEnterprise(id);
  if (!e) notFound();

  const related = ENTERPRISES.filter((x) => x.id !== e.id && x.category === e.category).slice(0, 3);

  return (
    <>
      {/* 顶部品牌区 */}
      <section className={cn("relative overflow-hidden text-white", BG[e.color])}>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(at 20% 30%, rgba(255,255,255,0.4) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(0,0,0,0.2) 0px, transparent 50%)",
        }} />
        <Container className="relative py-14 md:py-20">
          <Link
            href="/members"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 返回会员目录
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge tone={TONE[e.category]} className="!bg-white/20 !text-white">
                  {e.category === "build" ? "建筑企业" : e.category === "decor" ? "装修企业" : "设计企业"}
                </Badge>
                {e.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px]">
                    <ShieldCheck className="h-3 w-3" /> 协会认证
                  </span>
                )}
                {e.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-yellow text-foreground px-2.5 py-1 text-[11px] font-medium">
                    ★ 推荐企业
                  </span>
                )}
              </div>
              <h1 className="text-[28px] sm:text-[36px] md:text-[56px] font-semibold tracking-tight leading-[1.1] sm:leading-[1.05]">
                {e.name}
              </h1>
              <p className="mt-3 sm:mt-4 text-[14px] sm:text-[15px] md:text-[17px] leading-6 sm:leading-7 text-white/85 max-w-2xl">
                {e.short}
              </p>
            </div>

            {/* 桌面端 CTA — 移动端用底部 sticky 替代 */}
            <div className="hidden md:flex flex-wrap gap-3">
              <Button href={`/biz/${e.slug}`} variant="primary" className="!bg-white !text-foreground hover:!bg-accent-yellow">
                访问企业子站
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button href="#contact" variant="outline" className="!border-white/40 !text-white hover:!bg-white/10">
                联系企业
              </Button>
            </div>
          </div>

          {/* 数据条 */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-y-6 gap-x-6 pt-8 border-t border-white/15">
            <Stat label="评分" value={
              <span className="inline-flex items-center gap-1">
                <Star className="h-5 w-5 fill-accent-yellow text-accent-yellow" />
                {e.rating.toFixed(1)}
              </span>
            } sub={`${e.reviews} 条评价`} />
            <Stat label="案例数" value={e.cases} sub="近 3 年" />
            <Stat label="成立" value={e.founded} sub={`${new Date().getFullYear() - e.founded} 年企业`} />
            <Stat label="规模" value={e.staff.split(" ")[0]} sub={e.staff.split(" ")[1] || ""} />
            <Stat label="区域" value={e.district} sub="主营地" />
          </div>
        </Container>
      </section>

      {/* 详情主体 */}
      <Container className="py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            {/* 资质 */}
            <Block title="资质与认证">
              <div className="flex flex-wrap gap-2">
                {e.qualification.map((q) => (
                  <span key={q} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-[13px]">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> {q}
                  </span>
                ))}
              </div>
            </Block>

            {/* 案例 · 移动横滑 */}
            <Block title={`代表案例 (${e.cases})`} action={<Link href={`/biz/${e.slug}#cases`} className="text-[13px] text-brand hover:underline">在子站查看全部</Link>}>
              {/* 移动：snap 横滑 */}
              <div className="md:hidden -mx-5 px-5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-3 pb-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="snap-start shrink-0 w-[62vw] max-w-[260px] aspect-[4/3] rounded-2xl bg-surface relative overflow-hidden">
                      <div className={cn("absolute inset-0 opacity-30", BG[e.color])} />
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-foreground/40" />
                      <div className="absolute bottom-3 left-3 right-3 text-white text-[12px]">
                        案例 {String(i + 1).padStart(2, "0")} · {e.tags[i % e.tags.length]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 桌面：网格 */}
              <div className="hidden md:grid grid-cols-2 md:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl bg-surface relative overflow-hidden">
                    <div className={cn("absolute inset-0 opacity-30", BG[e.color])} />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-foreground/40" />
                    <div className="absolute bottom-3 left-3 right-3 text-white text-[12px]">
                      案例 {String(i + 1).padStart(2, "0")} · {e.tags[i % e.tags.length]}
                    </div>
                  </div>
                ))}
              </div>
            </Block>

            {/* 评价（占位） */}
            <Block title={`业主评价 (${e.reviews})`} action={<Link href="#" className="text-[13px] text-brand hover:underline">写评价</Link>}>
              <div className="space-y-3">
                {SAMPLE_REVIEWS.slice(0, 3).map((r, i) => (
                  <div key={i} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-medium">{r.user}</div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={cn(
                            "h-3.5 w-3.5",
                            j < r.rating ? "fill-[#FFB400] text-[#FFB400]" : "text-border",
                          )} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{r.content}</p>
                    <div className="mt-2 text-[11px] text-muted-foreground">{r.date} · 验证业主</div>
                  </div>
                ))}
              </div>
            </Block>
          </div>

          {/* 联系侧栏 */}
          <aside id="contact" className="space-y-4">
            <div className="rounded-3xl border border-border p-6 bg-surface">
              <div className="text-[12px] text-muted-foreground tracking-wider uppercase">联系企业</div>
              <div className="mt-4 space-y-3 text-[14px]">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" /> {e.contact.tel}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand" /> {e.contact.addr}</div>
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-brand" /> {e.staff}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-brand" /> 成立于 {e.founded} 年</div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button href={`/biz/${e.slug}`} size="sm" variant="secondary">访问子站</Button>
                <Button href="/ai/decor" size="sm" variant="outline">AI 咨询</Button>
              </div>
            </div>

            <div className="rounded-3xl border border-border p-6">
              <div className="text-[12px] text-muted-foreground tracking-wider uppercase">同类型推荐</div>
              <ul className="mt-3 divide-y divide-border">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/members/${r.slug}`} className="flex items-center justify-between py-3 group">
                      <div>
                        <div className="text-[13px] font-medium group-hover:text-brand">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          <Users className="h-3 w-3 inline mr-1" />{r.staff} · ★ {r.rating.toFixed(1)}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>

      {/* 移动端 sticky 底部 CTA · 桌面隐藏 */}
      <div className="md:hidden fixed bottom-14 inset-x-0 z-30 px-3 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-md rounded-full bg-foreground text-background shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] flex items-center gap-1.5 p-1.5">
          <a
            href={`tel:${e.contact.tel.replace(/-/g, "")}`}
            className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-accent-tea text-white shrink-0"
            aria-label={`致电 ${e.contact.tel}`}
          >
            <Phone className="h-4 w-4" />
          </a>
          <Link
            href={`/biz/${e.slug}`}
            className={cn(
              "flex-1 h-11 inline-flex items-center justify-center gap-1.5 rounded-full text-[13px] font-medium",
              BG[e.color], "text-white",
            )}
          >
            访问企业子站
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/ai/decor"
            className="h-11 px-3.5 inline-flex items-center justify-center gap-1 rounded-full bg-accent-yellow text-foreground text-[12px] font-semibold shrink-0"
            aria-label="AI 咨询"
          >
            AI
          </Link>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-1 text-[24px] md:text-[28px] font-semibold leading-tight">{value}</div>
      <div className="text-[11px] text-white/70">{sub}</div>
    </div>
  );
}

function Block({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const SAMPLE_REVIEWS = [
  { user: "刘**", rating: 5, content: "项目经理特别负责，水电改造的时候多次主动来工地，质量超预期。", date: "2026-04-12" },
  { user: "陈**", rating: 5, content: "设计师很懂年轻人审美，方案改了两版就定稿，后期施工严格按图。", date: "2026-03-28" },
  { user: "李**", rating: 4, content: "整体满意，唯一一点是材料到场比预计晚了 3 天，沟通后补偿到位。", date: "2026-02-15" },
];
