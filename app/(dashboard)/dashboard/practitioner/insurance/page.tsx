import Link from "next/link";
import { ShieldCheck, HeartHandshake, Sparkles, AlertCircle, ChevronRight } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { WORKER_INSURANCE, DEMO_PRACTITIONER } from "@/lib/data/practitioners";

export const metadata = { title: "保障 · 从业者门户" };

export default function PractitionerInsurance() {
  const p = DEMO_PRACTITIONER;
  return (
    <PractitionerShell title="工伤险 + 防欠薪" subtitle={p.insured ? "已加入工伤险 · 在保中" : "建议立即投保"}>
      {/* 现有保单 */}
      {p.insured && (
        <div className="rounded-3xl bg-gradient-to-br from-accent-tea to-[#008a63] text-white p-5 mb-4 relative overflow-hidden shadow-lg">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-yellow/15 blur-2xl" />
          <div className="relative flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-accent-yellow" />
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-2.5 py-1 text-[10px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-yellow animate-pulse" /> 在保中
            </span>
          </div>
          <div className="relative mt-3 text-[11px] text-white/80 tracking-wider uppercase">建筑工人意外险</div>
          <div className="relative mt-1 text-[22px] font-semibold leading-tight">协会团险版</div>
          <div className="relative mt-1 text-[11px] text-white/85">国寿财险 · 保单 POL-WI-2026-008412</div>
          <div className="relative mt-5 grid grid-cols-3 gap-2">
            <Mini label="保额" value="80 万" />
            <Mini label="生效" value="2026-05-01" />
            <Mini label="保至" value="2027-04-30" />
          </div>
          <div className="relative mt-4 flex gap-2">
            <button className="flex-1 h-11 px-4 rounded-full bg-accent-yellow text-foreground text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
              <AlertCircle className="h-4 w-4" /> 立即报案
            </button>
            <button className="h-11 px-4 rounded-full border border-white/30 text-[12px] inline-flex items-center justify-center">
              保单 PDF
            </button>
          </div>

          {/* 保障范围 chips */}
          <div className="relative mt-4 pt-4 border-t border-white/15">
            <div className="text-[10px] text-white/70 mb-2">保障范围</div>
            <div className="flex flex-wrap gap-1.5">
              {["意外身故 80万", "意外医疗 5万", "误工津贴 200元/天", "7×24 报案", "T+1 即生效"].map((c) => (
                <span key={c} className="text-[10px] rounded-full bg-white/15 backdrop-blur px-2.5 py-1">{c}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 险种推荐 */}
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

            <button className="mt-4 w-full h-11 rounded-full bg-foreground text-background text-[13px] font-medium">立即投保</button>
          </div>
        ))}
      </div>

      {/* 提示 */}
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 p-2.5">
      <div className="text-[9px] text-white/70">{label}</div>
      <div className="text-[13px] font-semibold mt-0.5">{value}</div>
    </div>
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
