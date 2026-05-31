import Link from "next/link";
import {
  ShieldCheck, TrendingUp, Plus, Eye, Settings, Wallet, Sparkles,
  Star, AlertCircle,
} from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { SUPPLIERS, PRODUCTS, SUPPLIES_STATS } from "@/lib/data/supplies";

export const metadata = { title: "供应商管理 · 协会工作台" };

const PENDING_SUPPLIERS = [
  { name: "信阳兴洋家电批发", category: "家电",         district: "羊山新区", submitted: "2026-05-29", status: "等待初审" },
  { name: "鼎丰窗帘布艺",     category: "软装 / 窗帘", district: "浉河区",   submitted: "2026-05-26", status: "现场核查中" },
  { name: "盛达脚手架租赁",   category: "脚手架",      district: "罗山县",   submitted: "2026-05-24", status: "等待复审" },
];

export default function SuppliersAdmin() {
  const totalProducts = PRODUCTS.length + 866;
  const monthlyGmv = SUPPLIES_STATS.monthlyGmv;
  const commissionRate = 1.5; // %
  const monthlyCommission = (monthlyGmv * commissionRate) / 100;

  return (
    <AssociationShell
      title="协会建材超市 · 后台"
      subtitle={`12 家认证供应商 · ${totalProducts} 款商品 · 本月撮合 ¥${monthlyGmv} 万 · 协会服务费 ${commissionRate}%`}
      actions={
        <button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 邀请供应商
        </button>
      }
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-background p-5">
          <ShieldCheck className="h-4 w-4 text-accent-tea" />
          <div className="mt-2 text-[11px] text-muted-foreground tracking-wider uppercase">认证供应商</div>
          <div className="mt-1 text-[28px] font-semibold tracking-tight text-accent-tea">{SUPPLIES_STATS.suppliers}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">待审 {PENDING_SUPPLIERS.length} 家</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <TrendingUp className="h-4 w-4 text-cat-decor" />
          <div className="mt-2 text-[11px] text-muted-foreground tracking-wider uppercase">本月 GMV</div>
          <div className="mt-1 text-[28px] font-semibold tracking-tight text-cat-decor">¥{monthlyGmv} 万</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">同比 +28%</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <Wallet className="h-4 w-4 text-cat-build" />
          <div className="mt-2 text-[11px] text-muted-foreground tracking-wider uppercase">协会服务费</div>
          <div className="mt-1 text-[28px] font-semibold tracking-tight text-cat-build">¥{monthlyCommission.toFixed(1)} 万</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{commissionRate}% · 平台运营反哺</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <Star className="h-4 w-4 text-cat-design" />
          <div className="mt-2 text-[11px] text-muted-foreground tracking-wider uppercase">平均评分</div>
          <div className="mt-1 text-[28px] font-semibold tracking-tight text-cat-design">4.8</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">来自 482 家会员企业</div>
        </div>
      </div>

      {/* 待审核 */}
      {PENDING_SUPPLIERS.length > 0 && (
        <div className="rounded-2xl border border-cat-decor/30 bg-cat-decor-soft p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-cat-decor" />
            <div className="text-[13px] font-semibold text-cat-decor">待审核 {PENDING_SUPPLIERS.length} 家供应商申请</div>
          </div>
          <ul className="space-y-2">
            {PENDING_SUPPLIERS.map((p, i) => (
              <li key={i} className="rounded-xl bg-background p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.category} · {p.district} · {p.submitted}</div>
                </div>
                <Badge tone="yellow">{p.status}</Badge>
                <button className="h-8 px-3 rounded-full bg-foreground text-background text-[11px]">审核</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 供应商列表 */}
      <h2 className="text-[18px] font-semibold mb-3">在册供应商</h2>
      <DataTable dropActionCol
        head={["供应商", "类目", "区域", "评分", "履约 SLA", "月供货量", "标签", "操作"]}
        rows={SUPPLIERS.map((s) => [
          <div key="n">
            <div className="font-medium flex items-center gap-1">
              {s.name}
              {s.verified && <ShieldCheck className="h-3 w-3 text-accent-tea" />}
            </div>
          </div>,
          <span key="c" className="text-[12px] text-muted-foreground">{s.category}</span>,
          s.district,
          <span key="r" className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" />
            <span className="font-semibold">{s.rating.toFixed(1)}</span>
          </span>,
          <Badge key="f" tone="brand">{s.fulfilmentSLA}</Badge>,
          <span key="v" className="text-muted-foreground">{s.monthlyVolume}</span>,
          <div key="t" className="flex flex-wrap gap-1">
            {s.tags.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] rounded-full bg-surface px-2 py-0.5 text-muted-foreground">{t}</span>
            ))}
          </div>,
          <div key="o" className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
            <button className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><Settings className="h-3.5 w-3.5" /></button>
          </div>,
        ])}
      />

      {/* 价格协议 */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-border bg-background p-7">
          <h3 className="text-[18px] font-semibold tracking-tight">分层定价规则</h3>
          <p className="mt-2 text-[12px] text-muted-foreground">协会与所有供应商签署统一价格协议，按会籍自动结算</p>
          <ul className="mt-5 space-y-2.5 text-[13px]">
            {[
              { t: "市场价",   pct: "100%", note: "未登录 / 非会员" },
              { t: "普通会员", pct: "90%",  note: "1,200 元/年" },
              { t: "高级会员", pct: "79%",  note: "4,800 元/年" },
              { t: "理事单位", pct: "72%",  note: "理事身份" },
              { t: "项目集采", pct: "≤67%", note: "≥50 万议价" },
            ].map((r) => (
              <li key={r.t} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
                <div>
                  <div className="font-medium">{r.t}</div>
                  <div className="text-[11px] text-muted-foreground">{r.note}</div>
                </div>
                <div className="text-[15px] font-semibold text-cat-decor">{r.pct}</div>
              </li>
            ))}
          </ul>
          <button className="mt-5 h-10 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">调整规则</button>
        </div>

        <div className="rounded-3xl bg-foreground text-background p-7 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-decor/30 blur-2xl" />
          <Sparkles className="relative h-6 w-6 text-accent-yellow" />
          <h3 className="relative mt-3 text-[18px] font-semibold tracking-tight">AI 小经 · 供应链洞察</h3>
          <ul className="relative mt-4 space-y-2.5 text-[12px] text-background/80 leading-5">
            <li>· 「水泥 / 砂浆」二级类目下单率最高，本月增长 +32%</li>
            <li>· 「九牧智能马桶」连续 3 月好评率 100%，建议给「年度优选」徽章</li>
            <li>· 「信阳塔吊租赁」近 30 天 2 起延迟到货投诉，建议约谈</li>
            <li>· 「门窗」类目集采议价空间 8-12%，可主动撮合 3 家以上买家</li>
          </ul>
          <button className="relative mt-5 h-10 px-5 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium">查看完整报告</button>
        </div>
      </div>
    </AssociationShell>
  );
}
