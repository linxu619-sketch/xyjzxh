import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listFinanceProducts } from "@/lib/data/finance-source";

const TYPE_TONE: Record<string, "build" | "decor" | "design" | "tea" | "brand" | "yellow"> = {
  信用贷: "decor", 经营贷: "brand", 保函: "build", 保理: "tea", 设备分期: "design",
};

const COLOR: Record<string, string> = {
  brand: "from-brand to-brand-600",
  build: "from-cat-build to-brand-600",
  decor: "from-cat-decor to-[#e6531f]",
  design: "from-cat-design to-[#6d3df0]",
  tea: "from-accent-tea to-[#008a63]",
};

export const metadata = { title: "金融服务 · 信阳市建筑装饰装修协会" };

export default async function FinancePage() {
  const FINANCE_PRODUCTS = listFinanceProducts();
  return (
    <>
      <PageHeader
        eyebrow="FINANCE · 金融服务"
        tone="design"
        title={<>协会撮合 <br className="md:hidden" />本地最优金融方案</>}
        description="已对接中原银行、建行、招行、农商行、工银租赁等多家金融机构。协会会员专属费率，最快 T+1 放款。"
        actions={<Button href="/ai/fin" variant="secondary">AI 小金推荐</Button>}
      />

      <Container className="py-12 md:py-16">
        {/* 产品矩阵 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {FINANCE_PRODUCTS.map((p) => (
            <div key={p.id} className="group rounded-3xl border border-border bg-background overflow-hidden hover:shadow-md transition-all">
              <div className={`h-2 w-full bg-gradient-to-r ${COLOR[p.color]}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge tone={TYPE_TONE[p.type] || "brand"}>{p.type}</Badge>
                  <span className="text-[11px] text-muted-foreground">{p.provider}</span>
                </div>
                <h3 className="text-[20px] font-semibold tracking-tight">{p.name}</h3>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Cell label="参考利率" value={p.rateLabel} />
                  <Cell label="额度" value={p.amountLabel} />
                  <Cell label="期限" value={p.termLabel} />
                </div>
                <ul className="mt-5 space-y-1.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      <ShieldCheck className="h-3 w-3 text-accent-tea" /> {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 text-[11px] text-muted-foreground">适用：{p.forWhom}</div>
                <Link href="/dashboard/enterprise/finance" className="mt-5 inline-flex w-full h-10 items-center justify-center gap-1.5 rounded-full bg-foreground text-background text-[13px] font-medium hover:bg-brand">
                  提交意向 <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 流程 */}
        <div className="mt-16">
          <div className="text-[12px] tracking-[0.2em] text-cat-design uppercase font-medium">HOW IT WORKS</div>
          <h2 className="mt-3 text-[30px] md:text-[40px] font-semibold tracking-tight leading-tight">协会撮合 · 三步到位</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { n: 1, t: "线上提交意向", d: "选择产品，填写额度、期限、用途；AI 小金辅助。" },
              { n: 2, t: "协会客户经理对接", d: "24h 内匹配最合适的银行，协会客户经理一对一沟通。" },
              { n: 3, t: "银行审批放款", d: "在线提交银行材料，最快 T+1 放款到账。" },
            ].map((s) => (
              <div key={s.n} className="rounded-3xl border border-border bg-background p-7">
                <div className="text-[44px] font-semibold tracking-tight text-cat-design leading-none">0{s.n}</div>
                <div className="mt-4 text-[18px] font-semibold">{s.t}</div>
                <div className="mt-2 text-[13px] text-muted-foreground leading-6">{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 合作机构 */}
        <div className="mt-16 rounded-3xl bg-surface p-8 md:p-12">
          <div className="text-[12px] tracking-wider text-muted-foreground uppercase">PARTNERS · 合作金融机构</div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-6 text-center">
            {["中原银行", "建设银行", "招商银行", "信阳农商行", "工银租赁", "平安产险"].map((b) => (
              <div key={b} className="text-[13px] font-medium">{b}</div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-[28px] bg-foreground text-background p-7 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-7 w-7 text-accent-yellow mt-0.5" />
            <div>
              <div className="text-[18px] md:text-[22px] font-semibold">看不懂哪款适合？</div>
              <div className="text-[13px] text-background/70 mt-1">告诉 AI 小金您的额度、用途与抵押情况，30 秒给您匹配。</div>
            </div>
          </div>
          <Button href="/ai/fin" variant="primary" className="!bg-accent-yellow !text-foreground hover:!bg-white">
            问问小金 <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-2.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[12px] font-semibold leading-tight">{value}</div>
    </div>
  );
}
