import Link from "next/link";
import { ArrowLeft, ShieldCheck, Phone, MapPin, Wallet, Save } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getOrder, type OrderStage } from "@/lib/data/orders-source";
import { updateOrderAction } from "../actions";

export const metadata = { title: "订单详情 · 企业工作台" };

const STAGE_LABEL: Record<OrderStage, string> = { signed: "已签约", planning: "排期中", "in-progress": "施工中", accepted: "已竣工" };
const STAGE_TONE: Record<OrderStage, "brand" | "design" | "decor" | "tea"> = { signed: "brand", planning: "design", "in-progress": "decor", accepted: "tea" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const o = getOrder(Number(id));
  const owned = o && session?.enterpriseId && o.enterpriseId === session.enterpriseId;

  if (!o || !owned) {
    return (
      <EnterpriseShell title="订单详情">
        <Link href="/dashboard/enterprise/orders" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回施工订单</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该订单，或它不属于本企业。</div>
      </EnterpriseShell>
    );
  }

  return (
    <EnterpriseShell title="订单详情" subtitle={`${o.code} · ${o.scope}`}>
      <Link href="/dashboard/enterprise/orders" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回施工订单</Link>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="text-[12px] font-mono text-muted-foreground">{o.code}</code>
            <span className="text-[16px] font-semibold">{o.scope}</span>
          </div>
          <Badge tone={STAGE_TONE[o.stage]}>{STAGE_LABEL[o.stage]}</Badge>
        </div>
        <dl className="divide-y divide-border text-[14px]">
          <Row k="客户" v={<span className="inline-flex items-center gap-2">{o.customerName}{o.customerPhone && <a href={`tel:${o.customerPhone}`} className="text-brand inline-flex items-center gap-0.5"><Phone className="h-3.5 w-3.5" />{o.customerPhone}</a>}</span>} />
          <Row k="类型 / 面积" v={`${o.type} · ${o.area || "—"} ㎡`} />
          <Row k="区域" v={o.district ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{o.district}</span> : "—"} />
          <Row k="合同金额" v={<span className="font-semibold text-cat-decor inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />¥{o.amount.toLocaleString()}</span>} />
          <Row k="创建时间" v={fmt(o.createdAt)} />
        </dl>
        {/* 进度条 */}
        <div className="px-5 py-4 border-t border-border space-y-3">
          <ProgressBar label="施工进度" pct={o.progress} color="bg-cat-decor" />
          <ProgressBar label="收款进度" pct={o.receivedPct} color="bg-accent-tea" />
        </div>
      </div>

      {/* 更新订单 */}
      <form action={updateOrderAction} className="mt-5 rounded-2xl border border-border bg-background p-5">
        <div className="text-[14px] font-semibold mb-3">更新阶段与进度</div>
        <input type="hidden" name="id" value={o.id} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-[12px] font-medium">阶段</span>
            <select name="stage" defaultValue={o.stage} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30">
              {(["signed", "planning", "in-progress", "accepted"] as OrderStage[]).map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-medium">施工进度 %</span>
            <input name="progress" type="number" min="0" max="100" defaultValue={o.progress} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium">收款进度 %</span>
            <input name="receivedPct" type="number" min="0" max="100" defaultValue={o.receivedPct} className="mt-1.5 w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
          </label>
        </div>
        <button className="mt-4 h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> 保存</button>
      </form>

      <div className="mt-4 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 施工排期甘特图、施工日志、分阶段验收与变更/收款明细等功能逐步开放。
      </div>
    </EnterpriseShell>
  );
}

function ProgressBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12px] mb-1"><span className="text-muted-foreground">{label}</span><span className="font-semibold tabular-nums">{pct}%</span></div>
      <div className="h-2 rounded-full bg-surface overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
