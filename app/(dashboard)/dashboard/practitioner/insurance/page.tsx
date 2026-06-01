import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, HeartHandshake, Sparkles, AlertCircle, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { WORKER_INSURANCE } from "@/lib/data/practitioners";
import { getSession } from "@/lib/auth/session";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";
import { listInsuranceByUid } from "@/lib/data/insurance-orders";
import { applyInsuranceAction } from "./actions";

export const metadata = { title: "保障 · 从业者门户" };

const ORDER_STATUS: Record<string, { label: string; tone: "yellow" | "brand" | "tea" }> = {
  pending: { label: "投保申请已提交 · 待协会处理", tone: "yellow" },
  contacted: { label: "协会处理中", tone: "brand" },
  done: { label: "已承保 · 在保中", tone: "tea" },
};

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default async function PractitionerInsurance({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "practitioner") redirect("/login?role=practitioner");
  if (session.pending) redirect("/dashboard/pending");
  const { ok } = await searchParams;

  const me = getPractitionerByPhone(session.phone);
  const orders = listInsuranceByUid(session.uid);
  const active = orders.find((o) => o.status === "done");
  const insured = !!active || (me?.insured ?? false);

  return (
    <PractitionerShell title="工伤险 + 防欠薪" subtitle={insured ? "已加入工伤险 · 在保中" : orders.length ? "投保申请处理中" : "建议立即投保"}>
      {ok && (
        <div className="mb-4 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-3.5 text-[13px] inline-flex items-center gap-2 w-full">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> 投保申请已提交！协会将尽快为你办理，请留意通知。
        </div>
      )}

      {/* 我的投保（真实） */}
      {orders.length > 0 && (
        <div className="space-y-3 mb-4">
          {orders.map((o) => {
            const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending;
            const done = o.status === "done";
            return (
              <div key={o.id} className={done ? "rounded-3xl bg-gradient-to-br from-accent-tea to-[#008a63] text-white p-5 relative overflow-hidden shadow-lg" : "rounded-3xl border border-border bg-background p-5"}>
                {done && <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />}
                <div className="relative flex items-center gap-2 mb-1">
                  <ShieldCheck className={done ? "h-6 w-6 text-accent-yellow" : "h-5 w-5 text-accent-tea"} />
                  <Badge tone={st.tone} className={done ? "!bg-white/20 !text-white !border-0" : ""}>{st.label}</Badge>
                </div>
                <div className={done ? "relative mt-2 text-[18px] font-semibold" : "mt-1 text-[15px] font-semibold"}>{o.product}</div>
                <div className={done ? "relative mt-1 text-[11px] text-white/85" : "mt-1 text-[11px] text-muted-foreground"}>申请人 {o.applicant} · 提交 {fmt(o.createdAt)}</div>
                {done ? (
                  <div className="relative mt-4 flex gap-2">
                    <button className="flex-1 h-11 px-4 rounded-full bg-accent-yellow text-foreground text-[13px] font-semibold inline-flex items-center justify-center gap-1.5"><AlertCircle className="h-4 w-4" /> 立即报案</button>
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1"><Clock className="h-3 w-3" /> 协会受理后会电话联系你确认</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 险种推荐 + 真实投保 */}
      <h2 className="text-[14px] font-semibold tracking-tight px-1 mb-2 mt-4">协会推荐保障</h2>
      <div className="space-y-3">
        {WORKER_INSURANCE.map((w) => (
          <div key={w.id} className="rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center gap-2 mb-2">
              <HeartHandshake className="h-4 w-4 text-cat-decor" />
              <span className="text-[14px] font-semibold flex-1">{w.name}</span>
              <Badge tone="brand">协会团险</Badge>
            </div>
            <div className="text-[11px] text-muted-foreground">{w.insurer}</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {w.priceDaily > 0 && <Pricelet label="日" value={`¥${w.priceDaily}`} />}
              <Pricelet label="月" value={`¥${w.priceMonthly}`} />
              <Pricelet label="年" value={`¥${w.priceYearly}`} hl />
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground leading-5">{w.cover}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {w.badges.map((b) => (
                <li key={b} className="text-[10px] rounded-full bg-surface px-2 py-0.5 text-muted-foreground">{b}</li>
              ))}
            </ul>
            <form action={applyInsuranceAction} className="mt-4">
              <input type="hidden" name="product" value={w.name} />
              <input type="hidden" name="note" value={`${w.insurer} · ${w.cover}`} />
              <button type="submit" className="w-full h-11 rounded-full bg-foreground text-background text-[13px] font-medium active:scale-[0.99] transition-transform">立即投保</button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-cat-decor-soft p-4 text-[12px] text-cat-decor flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
        遇到工资被拖、工伤未赔、合同争议？协会调解 14 天内介入，结案率 96%。
      </div>

      <Link href="/ai/mediate" className="mt-3 block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent-yellow shrink-0" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">AI 小和 · 帮你起草调解 / 申诉</div>
            <div className="text-[11px] text-background/70 mt-0.5">含证据清单 + 文书草稿</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </PractitionerShell>
  );
}

function Pricelet({ label, value, hl }: { label: string; value: string; hl?: boolean }) {
  return (
    <div className={`rounded-xl p-2.5 ${hl ? "bg-foreground text-background" : "bg-surface"}`}>
      <div className={`text-[10px] ${hl ? "text-background/60" : "text-muted-foreground"}`}>{label}</div>
      <div className={`text-[16px] font-semibold mt-0.5 ${hl ? "text-accent-yellow" : "text-cat-decor"}`}>{value}</div>
    </div>
  );
}
