import Link from "next/link";
import { Wallet, Landmark, Umbrella, Plus, AlertCircle, ChevronRight } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listAllFinanceProducts, listAllFinanceApps, type FinAppStatus } from "@/lib/data/finance-source";
import { listAllInsuranceProducts } from "@/lib/data/insurance-products";
import { listInsuranceOrders } from "@/lib/data/insurance-orders";
import { listAllClaims, type ClaimStatus } from "@/lib/data/insurance-claims";
import { createFinanceProductAction, createInsuranceProductAction } from "./actions";

const CLAIM_LABEL: Record<ClaimStatus, string> = { pending: "待受理", reviewing: "定损中", settled: "已赔付", rejected: "已驳回" };
const CLAIM_TONE: Record<ClaimStatus, "yellow" | "brand" | "tea" | "decor"> = { pending: "yellow", reviewing: "brand", settled: "tea", rejected: "decor" };

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
  const claims = listAllClaims();
  const allApps = listAllFinanceApps();
  const insurance = listInsuranceOrders();
  const FILTERABLE: FinAppStatus[] = ["pending", "approved", "rejected", "disbursed"];
  // 默认落在「待审」；显式 ?f=all 才看全部
  const active = f === "all" ? undefined : f && FILTERABLE.includes(f as FinAppStatus) ? (f as FinAppStatus) : "pending";
  const apps = active ? allApps.filter((a) => a.status === active) : allApps;
  const base = "/dashboard/association/finance";
  const href = (st: FinAppStatus) => `${base}?f=${st}`;
  const pending = allApps.filter((a) => a.status === "pending").length;

  return (
    <AssociationShell title="金融保险合作" subtitle={`合作产品 ${products.length} · 金融申请 ${allApps.length} · 待审 ${pending}`}>
      <StatFilters
        items={[
          { key: "pending", label: "待审金融", value: pending, color: "text-accent-yellow", href: href("pending"), active: active === "pending" },
          { key: "disbursed", label: "已放款/出函", value: allApps.filter((a) => a.status === "disbursed").length, color: "text-accent-tea", href: href("disbursed"), active: active === "disbursed" },
          { key: "ins", label: "保险投保单", value: insurance.length, color: "text-cat-decor" },
          { key: "all", label: "全部金融申请", value: allApps.length, color: "text-cat-build", href: `${base}?f=all`, active: !active },
        ]}
      />

      {/* 金融申请审批 */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Landmark className="h-4 w-4" /> 企业金融申请 · 点击查看并审批</div>
        {apps.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">{active ? "没有该状态的申请。" : "暂无金融申请。企业在「金融保险」申请后会出现在这里。"}</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.8fr_1.2fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>产品 / 额度</span><span>企业</span><span>申请时间</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {apps.map((a) => (
                <li key={a.id}>
                  <Link href={`${base}/app/${a.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.8fr_1.2fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{a.productName} · {a.amount}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">{a.enterpriseName} · {fmt(a.createdAt)}</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{a.enterpriseName}</span>
                    <span className="hidden md:block text-muted-foreground tabular-nums">{fmt(a.createdAt)}</span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0"><Badge tone={FIN_TONE[a.status]}>{FIN_LABEL[a.status]}</Badge><ChevronRight className="h-4 w-4 text-muted-foreground" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* 保险投保单（只读） */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Umbrella className="h-4 w-4" /> 保险投保单</div>
        {insurance.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">暂无投保单。</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.8fr_1.4fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>产品</span><span>投保人</span><span>时间</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {insurance.slice(0, 12).map((o) => (
                <li key={o.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.8fr_1.4fr_1fr_auto] gap-3 items-center px-5 py-3 text-[13px]">
                  <span className="min-w-0">
                    <span className="font-medium truncate block">{o.product}</span>
                    <span className="md:hidden text-[11px] text-muted-foreground truncate block">{o.applicant} · {o.phone}</span>
                  </span>
                  <span className="hidden md:block text-muted-foreground truncate">{o.applicant} · {o.phone}</span>
                  <span className="hidden md:block text-muted-foreground tabular-nums">{fmt(o.createdAt)}</span>
                  <span className="text-right"><Badge tone={o.status === "done" ? "tea" : "yellow"}>{INS_LABEL[o.status] ?? o.status}</Badge></span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* 保险理赔受理 */}
      <div id="claims" className="rounded-2xl border border-border bg-background overflow-hidden mb-6 scroll-mt-20">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> 保险理赔受理 <span className="text-[12px] text-muted-foreground font-normal">· 点击处理 · 待受理 {claims.filter((c) => c.status === "pending").length}</span></div>
        {claims.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">暂无理赔申请。业主在「我的保单」报案后会出现在这里。</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.8fr_1.2fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
              <span>报案事由</span><span>报案人 / 保单</span><span>报案时间</span><span className="text-right">状态</span>
            </div>
            <ul className="divide-y divide-border">
              {claims.map((c) => (
                <li key={c.id}>
                  <Link href={`${base}/claim/${c.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.8fr_1.2fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{c.subject}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground truncate block">{c.applicant} · {c.policy || c.product}</span>
                    </span>
                    <span className="hidden md:block text-muted-foreground truncate">{c.applicant} · {c.policy || c.product}</span>
                    <span className="hidden md:block text-muted-foreground tabular-nums">{fmt(c.createdAt)}</span>
                    <span className="inline-flex items-center gap-2 justify-end shrink-0"><Badge tone={CLAIM_TONE[c.status]}>{CLAIM_LABEL[c.status]}</Badge><ChevronRight className="h-4 w-4 text-muted-foreground" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* 合作金融产品 · 管理 */}
      <div id="products" className="scroll-mt-20" />
      <h2 className="text-[16px] font-semibold mb-1 inline-flex items-center gap-1.5"><Wallet className="h-4 w-4" /> 合作金融产品 · 管理</h2>
      <p className="text-[12px] text-muted-foreground mb-3">新增后点任一产品进入详情页编辑 / 上下架 / 删除；保存后企业端与消费者金融页立即同步。</p>

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
        <input name="highlights" placeholder="特性亮点(逗号/换行分隔,最多6条)" className={`${FIN_INPUT} mt-2.5`} />
        <button className="mt-3 h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> 添加产品</button>
      </form>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-[13px] text-muted-foreground">还没有合作金融产品,用上面的表单添加第一个。</div>
      ) : (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.6fr_1.2fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
            <span>产品</span><span>合作机构</span><span>类型</span><span>利率 / 额度</span><span className="text-right">状态</span>
          </div>
          <ul className="divide-y divide-border">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`${base}/fin-product/${p.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.6fr_1.2fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                  <span className="min-w-0">
                    <span className="font-medium truncate block">{p.name}</span>
                    <span className="md:hidden text-[11px] text-muted-foreground truncate block">{p.provider} · {p.type} · {p.rateLabel}</span>
                  </span>
                  <span className="hidden md:block text-muted-foreground truncate">{p.provider}</span>
                  <span className="hidden md:block text-muted-foreground truncate">{p.type}</span>
                  <span className="hidden md:block text-muted-foreground truncate">{p.rateLabel || "—"}{p.amountLabel ? ` · ${p.amountLabel}` : ""}</span>
                  <span className="inline-flex items-center gap-2 justify-end shrink-0"><Badge tone={p.status === "active" ? "tea" : "neutral"}>{p.status === "active" ? "在架" : "已下架"}</Badge><ChevronRight className="h-4 w-4 text-muted-foreground" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 合作保险产品 · 管理 */}
      <div id="insurance" className="scroll-mt-20" />
      <h2 className="text-[16px] font-semibold mt-8 mb-1 inline-flex items-center gap-1.5"><Umbrella className="h-4 w-4" /> 合作保险产品 · 管理</h2>
      <p className="text-[12px] text-muted-foreground mb-3">新增后点任一产品进入详情页编辑 / 上下架 / 删除 / 设主推；保存后消费者「消费保险」页立即同步。</p>

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
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="hidden md:grid grid-cols-[1.6fr_1.2fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
            <span>产品</span><span>承保机构</span><span>类型</span><span>价格 / 保额</span><span className="text-right">状态</span>
          </div>
          <ul className="divide-y divide-border">
            {insProducts.map((p) => (
              <li key={p.id}>
                <Link href={`${base}/ins-product/${p.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.6fr_1.2fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                  <span className="min-w-0">
                    <span className="font-medium truncate flex items-center gap-1.5">{p.name}{p.featured && <Badge tone="decor" className="!px-1.5 !py-0">主推</Badge>}</span>
                    <span className="md:hidden text-[11px] text-muted-foreground truncate block">{p.insurer} · {p.type} · {p.priceLabel}</span>
                  </span>
                  <span className="hidden md:block text-muted-foreground truncate">{p.insurer}</span>
                  <span className="hidden md:block text-muted-foreground truncate">{p.type}</span>
                  <span className="hidden md:block text-muted-foreground truncate">{p.priceLabel || "—"}{p.coverLabel ? ` · ${p.coverLabel}` : ""}</span>
                  <span className="inline-flex items-center gap-2 justify-end shrink-0"><Badge tone={p.status === "active" ? "tea" : "neutral"}>{p.status === "active" ? "在架" : "已下架"}</Badge><ChevronRight className="h-4 w-4 text-muted-foreground" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AssociationShell>
  );
}
