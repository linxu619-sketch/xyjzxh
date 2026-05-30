import Link from "next/link";
import {
  ShieldCheck, Star, MapPin, BadgeCheck, FileText, Sparkles,
  ChevronRight, Pencil, Phone, LogOut, Bell, Settings,
} from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/(main)/login/actions";
import { DEMO_PRACTITIONER, PEER_POSTS } from "@/lib/data/practitioners";

export const metadata = { title: "我的 · 从业者门户" };

export default function PractitionerProfile() {
  const p = DEMO_PRACTITIONER;
  return (
    <PractitionerShell title="我的" showHeader={false}>
      {/* 个人卡 */}
      <div className="-mx-5 sm:-mx-8 lg:-mx-12 bg-foreground text-background pt-8 pb-12 px-5 sm:px-8 lg:px-12 mb-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cat-design/30 blur-3xl" />
        <div className="flex items-center justify-between mb-4">
          <Link href="#" className="h-9 w-9 rounded-full bg-white/10 inline-flex items-center justify-center"><Bell className="h-4 w-4" /></Link>
          <Link href="/dashboard/practitioner/settings" className="h-9 w-9 rounded-full bg-white/10 inline-flex items-center justify-center"><Settings className="h-4 w-4" /></Link>
        </div>
        <div className="flex items-start gap-4">
          <span className="h-16 w-16 rounded-full bg-cat-design text-white inline-flex items-center justify-center text-[24px] font-semibold">{p.realName.slice(0, 1)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{p.realName} <span className="text-[12px] text-background/70 font-normal">· {p.nickname}</span></div>
            <div className="text-[11px] text-background/70 mt-0.5">{p.kind} · {p.yearsOfExp} 年 · {p.city}</div>
            <div className="text-[11px] text-background/70 mt-0.5">ID: {p.id}</div>
          </div>
          <button className="h-9 w-9 rounded-full bg-white/10 inline-flex items-center justify-center"><Pencil className="h-3.5 w-3.5" /></button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Mini label="信用" value="748" sub="优秀" />
          <Mini label="评分" value={p.rating.toFixed(1)} sub={`${p.jobsDone} 单`} />
          <Mini label="近 12 月" value={`¥${(p.income12mo / 10000).toFixed(1)}万`} sub="" />
        </div>
      </div>

      {/* 简介 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[14px] font-semibold tracking-tight">个人简介</h3>
          <button className="text-[11px] text-brand">编辑</button>
        </div>
        <p className="text-[13px] leading-6 text-muted-foreground">{p.bio}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.skills.map((s) => (
            <span key={s} className="rounded-full bg-surface px-2.5 py-1 text-[11px] text-foreground">{s}</span>
          ))}
        </div>
      </section>

      {/* 资质证书 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold tracking-tight">资质 · 证书</h3>
          <Link href="/dashboard/practitioner/training" className="text-[11px] text-brand">查看 / 上传 →</Link>
        </div>
        <ul className="space-y-2.5">
          {p.certs.map((c, i) => (
            <li key={i} className="rounded-2xl bg-surface p-3.5 flex items-start gap-3">
              <BadgeCheck className="h-5 w-5 text-accent-tea shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold">{c.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{c.issuer} · {c.issuedAt}{c.expiresAt && ` → ${c.expiresAt}`}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 历史项目 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <h3 className="text-[14px] font-semibold tracking-tight mb-3">历史项目（来自协会企业评价聚合）</h3>
        <ul className="space-y-2.5">
          {p.recentProjects.map((pr, i) => (
            <li key={i} className="border-b border-border pb-2.5 last:border-0 last:pb-0">
              <div className="text-[13px] font-medium">{pr.project}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{pr.enterprise} · {pr.role} · {pr.period}</div>
            </li>
          ))}
        </ul>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" /> 共 {p.jobsDone} 次评价，{p.rating.toFixed(1)} 分
        </div>
      </section>

      {/* 同行圈 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold tracking-tight">同行圈</h3>
          <Link href="#" className="text-[11px] text-brand">全部 →</Link>
        </div>
        <ul className="space-y-3">
          {PEER_POSTS.map((p, i) => (
            <li key={i} className="rounded-2xl bg-surface p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-6 w-6 rounded-full bg-foreground text-background inline-flex items-center justify-center text-[10px] font-semibold">{p.author.slice(0, 1)}</span>
                <span className="text-[12px] font-medium">{p.author}</span>
                <span className="text-[10px] text-muted-foreground">· {p.city} · {p.time}</span>
              </div>
              <p className="text-[12px] leading-5 text-muted-foreground">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* AI + 退出 */}
      <Link href="/ai/hr" className="block rounded-3xl bg-foreground text-background p-5 mb-3 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent-yellow" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">AI 小才 · 找活 / 申诉 / 答疑</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>

      <form action={logoutAction}>
        <button type="submit" className="w-full mt-2 h-12 rounded-full border border-cat-decor text-cat-decor font-medium inline-flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> 退出登录
        </button>
      </form>

      <div className="mt-6 mb-2 text-center text-[10px] text-muted-foreground">
        信阳市建筑装饰装修协会 · 从业者门户 v1.0
      </div>
    </PractitionerShell>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-2.5">
      <div className="text-[9px] text-background/60">{label}</div>
      <div className="text-[18px] font-semibold mt-0.5">{value}</div>
      {sub && <div className="text-[9px] text-background/60">{sub}</div>}
    </div>
  );
}
