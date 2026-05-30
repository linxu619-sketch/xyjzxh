import Link from "next/link";
import {
  Wallet, Download, ChevronRight, ShieldCheck, Sparkles,
  TrendingUp, Building2, BarChart3,
} from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { INCOME_RECORDS } from "@/lib/data/practitioners";

export const metadata = { title: "钱包 / 收入流水 · 从业者门户" };

export default function PractitionerIncome() {
  const total12 = INCOME_RECORDS.reduce((a, r) => a + r.net, 0);
  const avg = total12 / INCOME_RECORDS.length;
  const last = INCOME_RECORDS[0];
  const prev = INCOME_RECORDS[1];
  const trendPct = prev ? Math.round(((last.net - prev.net) / prev.net) * 100) : 0;
  const maxMonth = Math.max(...INCOME_RECORDS.map((r) => r.net));

  return (
    <PractitionerShell
      title="钱包 · 收入流水"
      subtitle={`近 ${INCOME_RECORDS.length} 月累计 ¥${total12.toLocaleString()} · 月均 ¥${Math.round(avg).toLocaleString()}`}
    >
      {/* 总览卡 */}
      <div className="rounded-3xl bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-5 mb-4 relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-yellow/15 blur-2xl" />
        <Wallet className="relative h-7 w-7 text-accent-yellow" />
        <div className="relative mt-3 text-[11px] text-white/80 tracking-wider uppercase">近 12 月累计</div>
        <div className="relative mt-1 text-[40px] font-semibold tracking-tight leading-none tabular-nums">
          ¥{total12.toLocaleString()}
        </div>
        <div className="relative mt-2 flex items-center gap-3 text-[11px] text-white/85">
          <span>月均 ¥{Math.round(avg).toLocaleString()}</span>
          <span>·</span>
          <span>{INCOME_RECORDS.reduce((a, r) => a + r.projects.length, 0)} 项</span>
        </div>

        {/* mini trend bars */}
        <div className="relative mt-4 flex items-end gap-1 h-12">
          {[...INCOME_RECORDS].reverse().map((r, i) => (
            <div key={r.month} className="flex-1 flex flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-t-md bg-accent-yellow/80"
                style={{ height: `${(r.net / maxMonth) * 100}%` }}
                title={`${r.month}: ¥${r.net.toLocaleString()}`}
              />
              {i === INCOME_RECORDS.length - 1 && (
                <span className="text-[8px] text-accent-yellow font-semibold">本月</span>
              )}
            </div>
          ))}
        </div>

        <button className="relative mt-4 w-full h-12 rounded-full bg-accent-yellow text-foreground text-[13px] font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.99] transition-transform">
          <Download className="h-4 w-4" /> 下载 12 个月收入证明 (PDF)
        </button>
      </div>

      {/* 本月小卡 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-2xl border border-border bg-background p-3 text-center">
          <div className="text-[9px] text-muted-foreground tracking-wider uppercase">本月</div>
          <div className="mt-1 text-[18px] font-semibold tracking-tight text-cat-decor tabular-nums">¥{(last.net / 1000).toFixed(1)}k</div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-3 text-center">
          <div className="text-[9px] text-muted-foreground tracking-wider uppercase">环比</div>
          <div className={`mt-1 text-[18px] font-semibold tracking-tight tabular-nums inline-flex items-center gap-0.5 ${trendPct >= 0 ? "text-accent-tea" : "text-cat-decor"}`}>
            <TrendingUp className={`h-3.5 w-3.5 ${trendPct < 0 ? "rotate-180" : ""}`} />
            {trendPct > 0 ? "+" : ""}{trendPct}%
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-3 text-center">
          <div className="text-[9px] text-muted-foreground tracking-wider uppercase">出勤</div>
          <div className="mt-1 text-[18px] font-semibold tracking-tight tabular-nums">{last.days}<span className="text-[10px] text-muted-foreground ml-0.5">工</span></div>
        </div>
      </div>

      {/* 证明用途 */}
      <div className="rounded-2xl bg-[#e6f7f1] p-4 mb-4 flex items-start gap-2.5 text-[12px] text-accent-tea">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="leading-5">
          收入证明由协会盖章，<b>河南省工行 / 建行 / 信阳农商行</b> 与
          <b>市政务大厅</b> 均认可，可用于贷款 / 落户 / 子女入学。
        </div>
      </div>

      {/* 月度流水 */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-[14px] font-semibold tracking-tight inline-flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" /> 月度流水
        </h2>
        <span className="text-[10px] text-muted-foreground">{INCOME_RECORDS.length} 月</span>
      </div>
      <div className="space-y-3">
        {INCOME_RECORDS.map((r, i) => (
          <div key={r.month} className="rounded-3xl border border-border bg-background p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[14px] font-semibold">{r.month}</div>
                {i === 0 && <Badge>本月</Badge>}
              </div>
              <div className="text-right">
                <div className="text-[22px] font-semibold text-cat-decor tabular-nums">¥{r.net.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">{r.days} 工 · 日均 ¥{Math.round(r.net / r.days)}</div>
              </div>
            </div>
            <ul className="space-y-0">
              {r.projects.map((pr, j) => (
                <li key={j} className="flex items-center gap-3 py-2.5 border-t border-border first:border-0 first:pt-0">
                  <span className="h-8 w-8 rounded-lg bg-surface inline-flex items-center justify-center shrink-0">
                    <Building2 className="h-3.5 w-3.5 text-cat-build" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{pr.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{pr.enterprise}</div>
                  </div>
                  <div className="font-semibold text-[14px] tabular-nums shrink-0">¥{pr.amount.toLocaleString()}</div>
                </li>
              ))}
            </ul>
            <button className="mt-3 w-full h-10 rounded-full bg-surface text-[11px] text-muted-foreground inline-flex items-center justify-center gap-1.5 active:bg-surface-2 transition-colors">
              <Download className="h-3 w-3" /> 下载本月证明 PDF
            </button>
          </div>
        ))}
      </div>

      <Link href="/ai/hr" className="mt-4 block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent-yellow shrink-0" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">AI 小才 · 收入证明咨询</div>
            <div className="text-[11px] text-background/70 mt-0.5">&ldquo;贷 30 万要补几张项目记录？&rdquo;</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </PractitionerShell>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-cat-decor text-white px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase">
      {children}
    </span>
  );
}
