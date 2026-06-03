import { Wallet, Landmark, Umbrella, CheckCircle2, XCircle, Banknote, Plus, Save, Power, Trash2 } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listAllFinanceProducts, listAllFinanceApps, type FinAppStatus } from "@/lib/data/finance-source";
import { listAllInsuranceProducts } from "@/lib/data/insurance-products";
import { listInsuranceOrders } from "@/lib/data/insurance-orders";
import { reviewFinanceAppAction, createFinanceProductAction, updateFinanceProductAction, toggleFinanceProductAction, deleteFinanceProductAction, createInsuranceProductAction, updateInsuranceProductAction, toggleInsuranceProductAction, deleteInsuranceProductAction } from "./actions";

const FIN_TYPES = ["信用贷", "抵押贷", "经营贷", "保函", "供应链金融", "分期", "票据贴现", "其他"];
const FIN_COLORS = [["brand", "深蓝"], ["build", "蓝"], ["decor", "红橙"], ["design", "紫"], ["tea", "青绿"]];
const INS_TYPES = ["家装质保险", "工程履约险", "工人意外险", "公众责任险", "材料运输险", "其他"];
const FIN_COLORS_INS = [["decor", "红橙"], ["build", "蓝"], ["brand", "深蓝"], ["design", "紫"], ["tea", "青绿"], ["yellow", "黄"]];
const FIN_INPUT = "h-10 rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30 w-full";

export const metadata = { title: "金融保险 · 协会工作台" };

const FIN_LABEL: Record<FinAppStatus, string> = { pending: "待审核", approved: "已批准", rejected: "已驳回", disbursed: "已放款/出函" };
const FIN_TONE: Record<FinAppStatus, "yellow" | "brand" | "decor" | "tea"> = { pending: "yellow", approved: "brand", rejected: "decor", disbursed: "tea" };
const INS_LABEL: Record<string, string> = { pending: "待处理", contacted: "处理中", done: "已承保" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function FinanceAdmin({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const products = listAllFinanceProducts();
  const insProducts = listAllInsuranceProducts();
  const allApps = listAllFinanceApps();
  const insurance = listInsuranceOrders();
  const FILTERABLE: FinAppStatus[] = ["pending", "approved", "rejected", "disbursed"];
  const active = f && FILTERABLE.includes(f as FinAppStatus) ? (f as FinAppStatus) : undefined;
  const apps = active ? allApps.filter((a) => a.status === active) : allApps;
  const base = "/dashboard/association/finance";
  const href = (st: FinAppStatus) => (active === st ? base : `${base}?f=${st}`);
  const pending = allApps.filter((a) => a.status === "pending").length;

  return (
    <AssociationShell title="金融保险合作" subtitle={`合作产品 ${products.length} · 金融申请 ${allApps.length} · 待审 ${pending}`}>
      <StatFilters
        items={[
          { key: "pending", label: "待审金融", value: pending, color: "text-accent-yellow", href: href("pending"), active: active === "pending" },
          { key: "disbursed", label: "已放款/出函", value: allApps.filter((a) => a.status === "disbursed").length, color: "text-accent-tea", href: href("disbursed"), active: active === "disbursed" },
          { key: "ins", label: "保险投保单", value: insurance.length, color: "text-cat-decor" },
          { key: "all", label: "全部金融申请", value: allApps.length, color: "text-cat-build", href: base, active: !active },
        ]}
      />

      {/* 金融申请审批 */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Landmark className="h-4 w-4" /> 企业金融申请</div>
        {apps.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">{active ? "没有该状态的申请。" : "暂无金融申请。企业在「金融保险」申请后会出现在这里。"}</div>
        ) : (
          <ul className="divide-y divide-border">
            {apps.map((a) => (
              <li key={a.id} className="px-5 py-3.5 flex items-center gap-3 text-[13px] flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{a.productName} · {a.amount}</div>
                  <div className="text-[11px] text-muted-foreground">{a.enterpriseName} · {fmt(a.createdAt)}</div>
                </div>
                <Badge tone={FIN_TONE[a.status]} className="shrink-0">{FIN_LABEL[a.status]}</Badge>
                <div className="flex items-center gap-1.5 shrink-0">
                  {a.status === "pending" && (
                    <>
                      <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="approved" /><button className="h-8 px-3 rounded-full bg-accent-tea text-white text-[12px] inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> 批准</button></form>
                      <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="rejected" /><button className="h-8 px-3 rounded-full border border-cat-decor/40 text-cat-decor text-[12px] inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> 驳回</button></form>
                    </>
                  )}
                  {a.status === "approved" && (
                    <form action={reviewFinanceAppAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="disbursed" /><button className="h-8 px-3 rounded-full bg-foreground text-background text-[12px] inline-flex items-center gap-1"><Banknote className="h-3 w-3" /> 标记放款</button></form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 保险投保单（真实） */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Umbrella className="h-4 w-4" /> 保险投保单</div>
        {insurance.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">暂无投保单。</div>
        ) : (
          <ul className="divide-y divide-border">
            {insurance.slice(0, 12).map((o) => (
              <li key={o.id} className="px-5 py-3 flex items-center gap-3 text-[13px]">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{o.product}</div>
                  <div className="text-[11px] text-muted-foreground">{o.applicant} · {o.phone} · {fmt(o.createdAt)}</div>
                </div>
                <Badge tone={o.status === "done" ? "tea" : "yellow"} className="shrink-0">{INS_LABEL[o.status] ?? o.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 合作金融产品 · 管理 */}
      <div id="products" className="scroll-mt-20" />
      <h2 className="text-[16px] font-semibold mb-1 inline-flex items-center gap-1.5"><Wallet className="h-4 w-4" /> 合作金融产品 · 管理</h2>
      <p className="text-[12px] text-muted-foreground mb-3">在此维护真实合作金融产品；保存 / 上下架后,企业端「金融保险」与消费者金融页立即同步。</p>

      {/* 新增产品 */}
      <form action={createFinanceProductAction} className="rounded-2xl border border-border bg-background p-4 mb-4">
        <div className="text-[13px] font-semibold mb-3 inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> 新增合作产品</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <input name="name" placeholder="产品名称 *" required className={FIN_INPUT} />
          <input name="provider" placeholder="合作机构 *(如 建设银行)" required className={FIN_INPUT} />
          <select name="type" className={FIN_INPUT}>{FIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <select name="color" className={FIN_INPUT}>{FIN_COLORS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
          <input name="rateLabel" placeholder="利率(如 年化 3.45% 起)" className={FIN_INPUT} />
          <input name="amountLabel" placeholder="额度(如 最高 500 万)" className={FIN_INPUT} />
          <input name="termLabel" placeholder="期限(如 12-36 期)" className={FIN_INPUT} />
          <input name="forWhom" placeholder="适用对象(如 在册企业会员)" className={FIN_INPUT} />
        </div>
        <input name="highlights" placeholder="特性亮点(逗号/换行分隔,最多6条,如 协会会员专属,线上申请,T+1放款)" className={`${FIN_INPUT} mt-2.5`} />
        <button className="mt-3 h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> 添加产品</button>
      </form>

      {/* 产品列表(含已下架,可编辑/上下架/删除) */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">还没有合作金融产品,用上面的表单添加第一个。</div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className={`rounded-2xl border bg-background p-4 ${p.status === "active" ? "border-border" : "border-border/60 opacity-70"}`}>
              <form action={updateFinanceProductAction} className="space-y-2.5">
                <input type="hidden" name="id" value={p.id} />
                <div className="flex items-center gap-2">
                  <Badge tone={p.status === "active" ? "tea" : "neutral"} className="shrink-0">{p.status === "active" ? "在架" : "已下架"}</Badge>
                  <span className="text-[11px] text-muted-foreground">ID {p.id}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <input name="name" defaultValue={p.name} placeholder="产品名称" className={FIN_INPUT} />
                  <input name="provider" defaultValue={p.provider} placeholder="合作机构" className={FIN_INPUT} />
                  <select name="type" defaultValue={FIN_TYPES.includes(p.type) ? p.type : "其他"} className={FIN_INPUT}>{FIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                  <select name="color" defaultValue={p.color} className={FIN_INPUT}>{FIN_COLORS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
                  <input name="rateLabel" defaultValue={p.rateLabel} placeholder="利率" className={FIN_INPUT} />
                  <input name="amountLabel" defaultValue={p.amountLabel} placeholder="额度" className={FIN_INPUT} />
                  <input name="termLabel" defaultValue={p.termLabel} placeholder="期限" className={FIN_INPUT} />
                  <input name="forWhom" defaultValue={p.forWhom} placeholder="适用对象" className={FIN_INPUT} />
                </div>
                <input name="highlights" defaultValue={p.highlights.join("，")} placeholder="特性亮点(逗号/换行分隔)" className={FIN_INPUT} />
                <button className="h-8 px-3.5 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> 保存修改</button>
              </form>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <form action={toggleFinanceProductAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value={p.status === "active" ? "off" : "active"} />
                  <button className="h-8 px-3 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5 hover:bg-surface-2"><Power className="h-3.5 w-3.5" /> {p.status === "active" ? "下架" : "上架"}</button>
                </form>
                <form action={deleteFinanceProductAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="h-8 px-3 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-3.5 w-3.5" /> 删除</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 合作保险产品 · 管理 */}
      <div id="insurance" className="scroll-mt-20" />
      <h2 className="text-[16px] font-semibold mt-8 mb-1 inline-flex items-center gap-1.5"><Umbrella className="h-4 w-4" /> 合作保险产品 · 管理</h2>
      <p className="text-[12px] text-muted-foreground mb-3">维护真实合作保险产品；保存 / 上下架后,消费者「消费保险」页立即同步。勾选「主推」的产品作为保险页顶部主打。</p>

      <form action={createInsuranceProductAction} className="rounded-2xl border border-border bg-background p-4 mb-4">
        <div className="text-[13px] font-semibold mb-3 inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> 新增保险产品</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <input name="name" placeholder="产品名称 *" required className={FIN_INPUT} />
          <input name="insurer" placeholder="承保机构 *(如 人保财险)" required className={FIN_INPUT} />
          <select name="type" className={FIN_INPUT}>{INS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <select name="color" className={FIN_INPUT}>{FIN_COLORS_INS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
          <input name="priceLabel" placeholder="价格(如 299 元/套起)" className={FIN_INPUT} />
          <input name="coverLabel" placeholder="保额(如 保额 50 万)" className={FIN_INPUT} />
          <input name="forWhom" placeholder="适用对象(如 C 端业主)" className={FIN_INPUT} />
          <label className="inline-flex items-center gap-2 text-[12px] px-1"><input type="checkbox" name="featured" value="1" className="accent-brand" /> 设为主推</label>
        </div>
        <input name="highlights" placeholder="特性亮点(逗号/换行分隔,最多6条)" className={`${FIN_INPUT} mt-2.5`} />
        <button className="mt-3 h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> 添加产品</button>
      </form>

      {insProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">还没有合作保险产品,用上面的表单添加第一个。</div>
      ) : (
        <div className="space-y-3">
          {insProducts.map((p) => (
            <div key={p.id} className={`rounded-2xl border bg-background p-4 ${p.status === "active" ? "border-border" : "border-border/60 opacity-70"}`}>
              <form action={updateInsuranceProductAction} className="space-y-2.5">
                <input type="hidden" name="id" value={p.id} />
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge tone={p.status === "active" ? "tea" : "neutral"} className="shrink-0">{p.status === "active" ? "在架" : "已下架"}</Badge>
                  {p.featured && <Badge tone="decor" className="shrink-0">主推</Badge>}
                  <span className="text-[11px] text-muted-foreground">ID {p.id}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  <input name="name" defaultValue={p.name} placeholder="产品名称" className={FIN_INPUT} />
                  <input name="insurer" defaultValue={p.insurer} placeholder="承保机构" className={FIN_INPUT} />
                  <select name="type" defaultValue={INS_TYPES.includes(p.type) ? p.type : "其他"} className={FIN_INPUT}>{INS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select>
                  <select name="color" defaultValue={p.color} className={FIN_INPUT}>{FIN_COLORS_INS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
                  <input name="priceLabel" defaultValue={p.priceLabel} placeholder="价格" className={FIN_INPUT} />
                  <input name="coverLabel" defaultValue={p.coverLabel} placeholder="保额" className={FIN_INPUT} />
                  <input name="forWhom" defaultValue={p.forWhom} placeholder="适用对象" className={FIN_INPUT} />
                  <label className="inline-flex items-center gap-2 text-[12px] px-1"><input type="checkbox" name="featured" value="1" defaultChecked={p.featured} className="accent-brand" /> 主推</label>
                </div>
                <input name="highlights" defaultValue={p.highlights.join("，")} placeholder="特性亮点(逗号/换行分隔)" className={FIN_INPUT} />
                <button className="h-8 px-3.5 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> 保存修改</button>
              </form>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <form action={toggleInsuranceProductAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value={p.status === "active" ? "off" : "active"} />
                  <button className="h-8 px-3 rounded-full bg-surface text-[12px] inline-flex items-center gap-1.5 hover:bg-surface-2"><Power className="h-3.5 w-3.5" /> {p.status === "active" ? "下架" : "上架"}</button>
                </form>
                <form action={deleteInsuranceProductAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="h-8 px-3 rounded-full text-cat-decor text-[12px] inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-3.5 w-3.5" /> 删除</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </AssociationShell>
  );
}
