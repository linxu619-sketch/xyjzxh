import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Umbrella, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INSURANCE_PRODUCTS } from "@/lib/data/finance";
import { submitInsuranceAction } from "./actions";

const COLOR: Record<string, string> = {
  brand: "from-brand to-brand-600",
  build: "from-cat-build to-brand-600",
  decor: "from-cat-decor to-[#e6531f]",
  design: "from-cat-design to-[#6d3df0]",
  tea: "from-accent-tea to-[#008a63]",
  yellow: "from-[#ffd34d] to-[#ffae00]",
};

export const metadata = { title: "消费保险 · 信阳市建筑装饰装修协会" };

export default async function InsurancePage({ searchParams }: { searchParams: Promise<{ ordered?: string }> }) {
  const { ordered } = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="INSURANCE · 消费保险"
        tone="decor"
        title={<>买保险 <br className="md:hidden" />让装修每一步都安心</>}
        description={<>从家装质保到工程履约、工人意外，协会与人保、平安、国寿、太平洋等合作出单。本月已为 <b>12,640</b> 户业主提供保护。</>}
        actions={<Button href="/ai/ins" variant="secondary">AI 小保推荐</Button>}
      />

      <Container className="py-12 md:py-16">
        {/* 主推：家装质保险 */}
        <div className="rounded-[32px] overflow-hidden bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-8 md:p-12 relative">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="!bg-white/20 !text-white !border-0 mb-4">最受欢迎 · C 端必备</Badge>
              <h2 className="text-[36px] md:text-[52px] font-semibold tracking-tight leading-[1.05]">
                安心家装险<br />
                <span className="text-accent-yellow">协会版</span>
              </h2>
              <p className="mt-4 text-[14px] md:text-[15px] text-white/85 max-w-md">
                10 年质保 · 跑路赔付 · 材料不合规理赔 · AI 自助理赔
              </p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-[56px] md:text-[64px] font-semibold leading-none">¥299</span>
                <span className="text-white/80">起 · 最高 50 万保额</span>
              </div>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button href="#apply" size="lg" variant="primary" className="!bg-white !text-foreground hover:!bg-accent-yellow">
                  立即投保
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button href="/ai/ins" size="lg" variant="outline" className="!border-white/40 !text-white hover:!bg-white/10">
                  问问 AI 小保
                </Button>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { t: "10 年质保", d: "防水、电气、隐蔽工程出问题协会牵头修复" },
                { t: "跑路赔付", d: "装修公司中途消失，余款保险公司先行赔付" },
                { t: "材料不合规", d: "甲醛超标、瓷砖空鼓等可索赔" },
                { t: "AI 自助理赔", d: "拍照上传，48h 内出结论" },
              ].map((b) => (
                <li key={b.t} className="rounded-2xl bg-white/10 backdrop-blur p-4 flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent-yellow shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[14px] font-semibold">{b.t}</div>
                    <div className="text-[12px] text-white/80 mt-0.5">{b.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 在线投保申请 */}
        <div id="apply" className="mt-12 scroll-mt-24 rounded-3xl border border-border bg-background p-6 md:p-8">
          <h2 className="text-[22px] md:text-[28px] font-semibold tracking-tight">在线投保申请</h2>
          <p className="mt-1.5 text-[13px] text-muted-foreground">提交后协会保险顾问会尽快与你联系确认方案与保费。</p>
          {ordered === "1" && (
            <div className="mt-4 rounded-2xl bg-[#e6f7f1] border border-accent-tea/30 px-4 py-3 text-[13px] text-accent-tea inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> 投保申请已提交，顾问会尽快联系你。
            </div>
          )}
          <form action={submitInsuranceAction} className="mt-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select name="product" required defaultValue="" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30">
                <option value="" disabled>选择险种</option>
                <option>安心家装险（协会版）</option>
                {INSURANCE_PRODUCTS.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <input name="applicant" placeholder="你的称呼" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
              <input name="phone" required placeholder="联系电话（必填）" type="tel" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
              <input name="note" placeholder="备注（项目/面积/疑问，可选）" className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
            </div>
            <button type="submit" className="h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> 提交投保申请
            </button>
          </form>
        </div>

        {/* 其他险种 */}
        <div className="mt-12">
          <h2 className="text-[26px] md:text-[32px] font-semibold tracking-tight">其他险种</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INSURANCE_PRODUCTS.filter((p) => p.id !== "I1").map((p) => (
              <div key={p.id} className="rounded-3xl border border-border bg-background overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-2 w-full bg-gradient-to-r ${COLOR[p.color]}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge tone={p.color as "brand"}>{p.type}</Badge>
                    <span className="text-[11px] text-muted-foreground">{p.insurer}</span>
                  </div>
                  <h3 className="text-[18px] font-semibold tracking-tight">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-[20px] font-semibold">{p.priceLabel}</span>
                  </div>
                  <div className="text-[12px] text-muted-foreground">{p.coverLabel}</div>
                  <ul className="mt-4 space-y-1.5 text-[12px] text-muted-foreground">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3 text-accent-tea" /> {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-[11px] text-muted-foreground">适用：{p.forWhom}</div>
                  <Link href="#apply" className="mt-4 inline-flex w-full h-10 items-center justify-center gap-1 rounded-full bg-foreground text-background text-[13px] font-medium hover:bg-brand">
                    投保 / 咨询
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 理赔流程 */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border bg-background p-8">
            <Umbrella className="h-7 w-7 text-cat-decor" />
            <h3 className="mt-4 text-[22px] font-semibold tracking-tight">理赔流程 · 4 步出结论</h3>
            <ol className="mt-6 space-y-4">
              {[
                "在「我的保单」中提交报案，上传照片或视频",
                "AI 小保 30 分钟内初步定责",
                "保险公司 48h 内现场查勘",
                "结案出险，赔款 7 个工作日内到账",
              ].map((s, i) => (
                <li key={s} className="flex gap-3 text-[13px]">
                  <span className="h-6 w-6 rounded-full bg-cat-decor text-white inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-border bg-foreground text-background p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/30 blur-2xl" />
            <AlertCircle className="relative h-7 w-7 text-accent-yellow" />
            <h3 className="relative mt-4 text-[22px] font-semibold tracking-tight">出险了？</h3>
            <p className="relative mt-3 text-[13px] text-background/70 max-w-sm leading-6">
              7×24 协会理赔热线 · 同时支持微信小程序、AI 小保对话报案。
            </p>
            <div className="relative mt-5 flex flex-col sm:flex-row gap-2">
              <a href="tel:0376-9606060" className="inline-flex items-center justify-center gap-1.5 h-12 px-5 rounded-full bg-accent-yellow text-foreground text-[13px] font-medium">
                400 报案 0376-9606060
              </a>
              <Link href="/ai/ins" className="inline-flex items-center justify-center gap-1.5 h-12 px-5 rounded-full border border-white/30 text-[13px]">
                <Sparkles className="h-4 w-4" /> AI 小保
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
