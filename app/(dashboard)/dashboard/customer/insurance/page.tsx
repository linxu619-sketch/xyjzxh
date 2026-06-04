import Link from "next/link";
import { ShieldCheck, AlertCircle, FileText, ChevronRight, Clock } from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listInsuranceByUid } from "@/lib/data/insurance-orders";
import { listClaimsByUid, type ClaimStatus } from "@/lib/data/insurance-claims";
import { submitClaimAction } from "./actions";

const CLAIM_LABEL: Record<ClaimStatus, string> = { pending: "待协会受理", reviewing: "定损中", settled: "已赔付", rejected: "已驳回" };
const CLAIM_TONE: Record<ClaimStatus, "yellow" | "brand" | "tea" | "decor"> = { pending: "yellow", reviewing: "brand", settled: "tea", rejected: "decor" };
const CLAIM_PROGRESS: Record<ClaimStatus, number> = { pending: 20, reviewing: 60, settled: 100, rejected: 100 };

export const metadata = { title: "我的保单 · 信阳市建筑装饰装修协会" };

function fmt(ts: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const POLICIES = [
  { id: "POL-2026-1138", product: "安心家装险 · 协会版", insurer: "人保财险",
    amount: "50 万", premium: "¥299", start: "2026-05-20", end: "2036-05-20",
    project: "金茂悦府 1602 整装", status: "生效中", color: "tea" as const },
  { id: "POL-2025-9842", product: "建筑工人团意险", insurer: "国寿财险",
    amount: "80 万", premium: "¥120", start: "2025-11-01", end: "2026-11-01",
    project: "弦山街老房 · 翻新工人 4 人", status: "生效中", color: "tea" as const },
  { id: "POL-2025-6644", product: "工程履约保证保险", insurer: "平安产险",
    amount: "32 万", premium: "¥2,240", start: "2025-08-12", end: "2026-08-12",
    project: "茶都商务 22F", status: "理赔申请中", color: "decor" as const },
];

export default async function CustomerInsurance({ searchParams }: { searchParams: Promise<{ claimed?: string; cerr?: string }> }) {
  const { claimed, cerr } = await searchParams;
  const session = await getSession();
  const mine = session ? listInsuranceByUid(session.uid) : [];
  const claims = session ? listClaimsByUid(session.uid) : [];
  return (
    <CustomerShell title="我的保单" subtitle={`${mine.length} 笔投保申请 · ${claims.length} 笔理赔 · ${POLICIES.length} 份示例保单`}>
      {/* 我提交的投保申请（实时，按登录账号） */}
      <div className="rounded-3xl border border-border bg-background p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-semibold">我提交的投保申请</div>
          <Badge tone={mine.length ? "tea" : "yellow"}>{mine.length} 笔</Badge>
        </div>
        {mine.length === 0 ? (
          <div className="text-center py-6 text-[13px] text-muted-foreground">
            还没有投保申请。去 <Link href="/insurance" className="text-brand">消费保险</Link> 在线投保，提交后会出现在这里。
          </div>
        ) : (
          <div className="space-y-2.5">
            {mine.map((o) => (
              <div key={o.id} className="rounded-2xl bg-surface p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] font-semibold truncate">{o.product}</div>
                  <Badge tone={o.status === "done" ? "tea" : "yellow"} className="shrink-0">
                    {o.status === "done" ? "已出单" : o.status === "contacted" ? "顾问跟进中" : "待协会联系"}
                  </Badge>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {fmt(o.createdAt)} · 联系电话 {o.phone}{o.note ? ` · ${o.note}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-5 mb-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <ShieldCheck className="relative h-7 w-7 text-accent-yellow" />
        <div className="relative mt-2 text-[12px] text-white/80 tracking-wider uppercase">在保保额</div>
        <div className="relative mt-1 text-[36px] font-semibold leading-none">¥162 万</div>
        <div className="relative mt-2 text-[12px] text-white/80">三份保单覆盖装修 · 工人 · 履约</div>
      </div>

      {/* 我的理赔（真实，按登录账号） */}
      <div id="claims" className="mb-4 rounded-3xl border border-border bg-background p-5 scroll-mt-20">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-semibold inline-flex items-center gap-1.5"><AlertCircle className="h-4 w-4 text-cat-decor" /> 我的理赔申请</div>
          <Badge tone={claims.length ? "decor" : "yellow"}>{claims.length} 笔</Badge>
        </div>
        {claimed === "1" && <div className="mb-3 rounded-xl bg-[#e6f7f1] text-accent-tea text-[12px] px-3 py-2">报案已提交,协会保险顾问会尽快受理并与你联系。</div>}
        {claims.length === 0 ? (
          <div className="text-center py-4 text-[13px] text-muted-foreground">还没有理赔申请。保单出险时在下方「报案」即可提交。</div>
        ) : (
          <div className="space-y-2.5">
            {claims.map((c) => (
              <div key={c.id} className="rounded-2xl bg-surface p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-[14px] font-semibold truncate">{c.subject}</div>
                  <Badge tone={CLAIM_TONE[c.status]} className="shrink-0">{CLAIM_LABEL[c.status]}</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground">CL-{String(c.id).padStart(4, "0")} · {c.policy || c.product}</div>
                <div className="mt-3 h-1.5 rounded-full bg-background overflow-hidden">
                  <div className={`h-full rounded-full ${c.status === "rejected" ? "bg-muted-foreground/40" : "bg-cat-decor"}`} style={{ width: `${CLAIM_PROGRESS[c.status]}%` }} />
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {fmt(c.createdAt)}{c.detail ? ` · ${c.detail}` : ""}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 报案 / 理赔申请表单 */}
      <div className="mb-4 rounded-3xl border border-border bg-background p-5">
        <div className="text-[14px] font-semibold mb-1 inline-flex items-center gap-1.5"><FileText className="h-4 w-4" /> 报案 / 理赔申请</div>
        <p className="text-[12px] text-muted-foreground mb-3">出险后在此报案,协会保险顾问受理后联系定损。</p>
        {cerr === "1" && <div className="mb-3 rounded-xl bg-cat-decor-soft text-cat-decor text-[12px] px-3 py-2">请填写出险事由与联系电话。</div>}
        <form action={submitClaimAction} className="space-y-2.5">
          <select name="policy" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" defaultValue="">
            <option value="" disabled>选择出险保单 / 险种</option>
            {POLICIES.map((p) => <option key={p.id} value={`${p.id} · ${p.product}`}>{p.product} · {p.id}</option>)}
          </select>
          <input name="subject" required placeholder="出险事由(如 防水渗漏 / 材料不合规)" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
          <input name="phone" required defaultValue={session?.phone ?? ""} placeholder="联系电话" type="tel" className="w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30" />
          <textarea name="detail" rows={2} placeholder="情况说明(可选,便于协会快速定损)" className="w-full rounded-xl border border-border bg-background p-3.5 text-[13px] leading-6 outline-none focus:border-foreground/30" />
          <button type="submit" className="h-11 px-6 rounded-full bg-cat-decor text-white text-[14px] font-medium inline-flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> 提交报案</button>
        </form>
      </div>

      {/* 保单列表 */}
      <div className="space-y-3">
        <h2 className="text-[14px] font-semibold mt-2 mb-1 px-1">全部保单</h2>
        {POLICIES.map((p) => (
          <div key={p.id} className="rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-2">
              <Badge tone={p.color}>{p.status}</Badge>
              <code className="text-[10px] font-mono text-muted-foreground">{p.id}</code>
            </div>
            <div className="text-[15px] font-semibold tracking-tight">{p.product}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">承保：{p.insurer} · 关联：{p.project}</div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-surface p-2.5">
                <div className="text-[10px] text-muted-foreground">保额</div>
                <div className="text-[15px] font-semibold mt-0.5">{p.amount}</div>
              </div>
              <div className="rounded-xl bg-surface p-2.5">
                <div className="text-[10px] text-muted-foreground">保费</div>
                <div className="text-[15px] font-semibold mt-0.5">{p.premium}</div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-muted-foreground">
              生效：{p.start} → {p.end}
            </div>

            <div className="mt-4 flex gap-2">
              <Link href="#claims" className="flex-1 h-10 rounded-full border border-cat-decor/40 text-cat-decor text-[12px] font-medium inline-flex items-center justify-center gap-1 hover:bg-cat-decor-soft">
                <AlertCircle className="h-3.5 w-3.5" /> 出险报案
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Link href="/insurance" className="mt-4 block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-accent-yellow" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">需要更多保障？</div>
            <div className="text-[11px] text-background/70 mt-0.5">浏览协会平台的全部 5 款险种</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </CustomerShell>
  );
}
