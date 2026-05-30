import Link from "next/link";
import {
  GraduationCap, BadgeCheck, Clock, Sparkles, ChevronRight, Upload,
  AlertCircle, ArrowUpRight, Star,
} from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { DEMO_PRACTITIONER, PRACTITIONER_TRAININGS } from "@/lib/data/practitioners";

export const metadata = { title: "培训 · 从业者门户" };

export default function PractitionerTraining() {
  const certs = DEMO_PRACTITIONER.certs;
  const expiringSoon = certs.filter((c) => c.expiresAt && new Date(c.expiresAt) < new Date("2026-09-01"));
  return (
    <PractitionerShell
      title="培训 / 证书"
      subtitle={`${certs.length} 本证书${expiringSoon.length ? ` · ${expiringSoon.length} 本即将到期` : ""}`}
    >
      {/* 到期提醒 */}
      {expiringSoon.length > 0 && (
        <Link
          href="#expiring"
          className="block rounded-3xl bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-4 mb-4 shadow-md active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-white/20 inline-flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold">{expiringSoon[0].name} 即将到期</div>
              <div className="text-[11px] text-white/85 mt-0.5">到期 {expiringSoon[0].expiresAt} · 协会有免费续期培训</div>
            </div>
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      )}

      {/* 我的证书 */}
      <section id="expiring" className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold tracking-tight">我的证书</h2>
          <button className="inline-flex items-center gap-1 text-[11px] text-brand">
            <Upload className="h-3 w-3" /> 上传
          </button>
        </div>
        <ul className="space-y-2.5">
          {certs.map((c, i) => {
            const expiring = c.expiresAt && new Date(c.expiresAt) < new Date("2026-09-01");
            return (
              <li key={i} className={`rounded-2xl p-4 ${expiring ? "bg-cat-decor-soft border border-cat-decor/30" : "bg-surface"}`}>
                <div className="flex items-start gap-3">
                  <BadgeCheck className={`h-5 w-5 mt-0.5 shrink-0 ${expiring ? "text-cat-decor" : "text-accent-tea"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold leading-5">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-4">
                      {c.issuer} · 颁发 {c.issuedAt}{c.expiresAt && ` · 到期 ${c.expiresAt}`}
                    </div>
                  </div>
                  {expiring ? (
                    <Badge tone="decor" className="!text-[9px] shrink-0">3 月内到期</Badge>
                  ) : (
                    <Badge tone="tea" className="!text-[9px] shrink-0">有效</Badge>
                  )}
                </div>
                {expiring && (
                  <button className="mt-3 w-full h-9 rounded-full bg-cat-decor text-white text-[12px] font-medium">
                    报名续期培训（免费）
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* 即将开课 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[14px] font-semibold tracking-tight">即将开课</h2>
          <Link href="/talents#training" className="text-[12px] text-brand">全部 →</Link>
        </div>
        <ul className="space-y-3">
          {PRACTITIONER_TRAININGS.map((t) => {
            const pct = Math.round((t.enrolled / t.seats) * 100);
            const hot = pct > 70;
            return (
              <li key={t.id} className="rounded-2xl border border-border p-4 active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge tone="design">{t.tag}</Badge>
                  {t.urgent && <Badge tone="decor">🔥</Badge>}
                  {hot && <Badge tone="yellow" className="!text-[9px]">报名火热</Badge>}
                  <span className="ml-auto text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" /> {t.startAt}
                  </span>
                </div>
                <div className="text-[14px] font-semibold leading-5">{t.title}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {t.days} 天 · 已报 <b className="text-foreground">{t.enrolled}</b>/{t.seats}
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      hot ? "bg-cat-decor" : "bg-cat-design"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[16px] font-semibold text-cat-decor tabular-nums">
                      {t.fee === 0 ? "免费" : `¥${t.fee}`}
                    </span>
                    {t.fee > 0 && <span className="ml-2 text-[10px] text-muted-foreground line-through">¥{Math.round(t.fee * 1.3)}</span>}
                  </div>
                  <button className="h-10 px-5 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1 active:scale-95 transition-transform">
                    立即报名 <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* AI 推荐 */}
      <Link href="/ai/hr" className="block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cat-design/30 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent-yellow shrink-0" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">AI 小才 · 推荐学习路径</div>
            <div className="text-[11px] text-background/70 mt-0.5">基于你的工种 / 持证 / 收入目标</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>

      {/* 协会发证含金量 */}
      <div className="mt-3 rounded-3xl bg-[#e6f7f1] p-4 flex items-start gap-2.5 text-[12px] text-accent-tea leading-5">
        <Star className="h-4 w-4 mt-0.5 shrink-0 fill-accent-tea" />
        协会颁发的培训认证证书可直接登记到信阳市住建系统，企业招聘时优先认可。
      </div>
    </PractitionerShell>
  );
}
