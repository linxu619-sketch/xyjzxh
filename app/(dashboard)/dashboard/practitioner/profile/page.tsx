import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck, Star, Sparkles, ChevronRight, LogOut, Settings, MapPin, Check, Briefcase, CalendarClock, QrCode, SlidersHorizontal, CheckCircle2,
} from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { TierBadge, GrowthMeter } from "@/components/dashboard/practitioner-tier";
import { logoutAction } from "@/app/(main)/login/actions";
import { getSession } from "@/lib/auth/session";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";
import { practitionerGrowth, practitionerLevel, metaOf } from "@/lib/data/member-tier";
import type { PractitionerTier } from "@/lib/data/member-tier";
import { effectivePractitionerPhone, isPractitionerPreview } from "@/lib/dashboard/preview";

export const metadata = { title: "我的 · 荣誉档案" };

export default async function PractitionerProfile({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await getSession();
  if (!session || (session.role !== "practitioner" && !isPractitionerPreview(session))) {
    redirect("/login?role=practitioner");
  }
  const { saved } = await searchParams;
  const me = getPractitionerByPhone(effectivePractitionerPhone(session));
  const age = me?.birthYear ? new Date().getFullYear() - me.birthYear : null;
  const name = me?.name ?? session.name;
  const kind = me?.kind ?? "从业者";
  const years = me?.years ?? 0;
  const city = me?.city ?? "信阳";
  const pid = me?.id ?? session.uid;
  const rating = me?.rating ?? 5;
  const jobsDone = me?.jobs ?? 0;
  const insured = me?.insured ?? false;

  // 会员等级（协会评定为准）+ 成长进度 + 当前档权益
  const tier: PractitionerTier = me?.tier ?? "注册会员";
  const level = practitionerLevel(tier);
  const isMaxTier = tier === "专家会员";
  const growth = practitionerGrowth(tier, { jobs: jobsDone, rating, years });
  const perks = metaOf(tier)?.perks ?? [];

  return (
    <PractitionerShell title="我的" showHeader={false}>
      {saved && (
        <div className="mb-3 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-3.5 text-[13px] inline-flex items-center gap-2 w-full">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> 找活资料已保存，岗位推荐已按新资料更新。
        </div>
      )}
      {/* 荣誉头卡 */}
      <div className="-mx-5 sm:-mx-8 lg:-mx-12 bg-foreground text-background pt-8 pb-12 px-5 sm:px-8 lg:px-12 mb-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-44 w-44 rounded-full bg-[#f6c915]/25 blur-3xl" />
        <div className="absolute -bottom-12 left-6 h-40 w-40 rounded-full bg-cat-design/25 blur-3xl" />
        <div className="relative flex items-center justify-end mb-4">
          <Link href="/dashboard/practitioner/settings" className="h-9 w-9 rounded-full bg-white/10 inline-flex items-center justify-center hover:bg-white/20 transition-colors" aria-label="设置"><Settings className="h-4 w-4" /></Link>
        </div>
        <div className="relative flex items-start gap-4">
          <span className="h-16 w-16 rounded-full bg-gradient-to-br from-[#f6c915] to-[#e0a900] text-[#5a3e00] inline-flex items-center justify-center text-[24px] font-semibold shadow-lg shrink-0">{name.slice(0, 1)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{name}</div>
            <div className="text-[11px] text-background/70 mt-0.5">{kind}{years ? ` · ${years} 年` : ""} · <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{city}</span></div>
            <div className="mt-2.5"><TierBadge tier={tier} level={level} isMax={isMaxTier} size="lg" track /></div>
          </div>
        </div>
        <div className="relative mt-3 text-[10px] text-background/50">ID {pid}</div>
      </div>

      {/* 等级 · 成长进度 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold tracking-tight">会员等级 · 成长</h3>
          <span className="text-[11px] text-muted-foreground">协会评定 · {isMaxTier ? "已封顶" : `下一档 ${growth.next}`}</span>
        </div>
        <GrowthMeter next={growth.next} percent={growth.percent} criteria={growth.criteria} />
        {!isMaxTier && (
          <p className="mt-2.5 text-[11px] text-muted-foreground leading-5">
            进度为晋级参考；达到参考线后由协会评审授予「{growth.next}」，专业资历越高，名录展示越靠前、权益越多。
          </p>
        )}
        {/* 当前档权益 */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-[11px] text-muted-foreground mb-2">「{tier}」权益</div>
          <ul className="space-y-1.5">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-1.5 text-[12.5px]">
                <Check className="h-3.5 w-3.5 text-accent-tea mt-0.5 shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 电子名片入口 */}
      {me && (
        <Link href={`/practitioners/${pid}`} className="block rounded-3xl bg-gradient-to-br from-[#f6c915] to-[#e0a900] text-[#5a3e00] p-5 mb-4 active:scale-[0.99] transition-transform shadow-sm">
          <div className="flex items-center gap-3">
            <QrCode className="h-6 w-6 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold">我的电子名片 · 资历证书</div>
              <div className="text-[11px] opacity-70 mt-0.5">带等级金徽章 · 可分享给业主 / 企业 / 同行</div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      )}

      {/* 找活资料（驱动岗位匹配）*/}
      {me && (
        <section className="rounded-3xl bg-background border border-border p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold tracking-tight">找活资料</h3>
            <Link href="/dashboard/practitioner/profile/edit" className="text-[11px] text-brand inline-flex items-center gap-1"><SlidersHorizontal className="h-3 w-3" /> 编辑</Link>
          </div>
          <div className="mb-3">
            <div className="text-[11px] text-muted-foreground mb-1.5">我能做的工种</div>
            <div className="flex flex-wrap gap-1.5">
              {me.canKinds.map((k) => <span key={k} className="text-[12px] rounded-full bg-cat-build-soft text-cat-build px-2.5 py-1">{k}</span>)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Mini2 label="年龄" value={age ? `${age}` : "未填"} sub={age ? "岁" : "去完善"} />
            <Mini2 label="期望日薪" value={me.expectDaily ? `¥${me.expectDaily}` : "不限"} sub={me.expectDaily ? "起" : ""} />
            <Mini2 label="从业年限" value={me.years ? `${me.years}` : "未填"} sub={me.years ? "年" : ""} />
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Mini2 label="性别" value={me.gender || "未填"} sub="" />
            <Mini2 label="持证" value={me.hasCert === true ? "持证" : me.hasCert === false ? "无证" : "未填"} sub="" />
            <Mini2 label="接单状态" value={me.available ? "在接单" : "暂歇"} sub="" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground mb-1.5">可接工地区域</div>
            <div className="flex flex-wrap gap-1.5">
              {me.canDistricts.map((d) => <span key={d} className="text-[12px] rounded-full bg-surface text-muted-foreground px-2.5 py-1">{d}</span>)}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground leading-5">这些信息决定<Link href="/dashboard/practitioner/jobs" className="text-brand">找活页</Link>给你推哪些岗位——只推你会做、够格、够价、就近的，双方不做无用功。</p>
        </section>
      )}

      {/* 成就数据 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <h3 className="text-[14px] font-semibold tracking-tight mb-3">我的成就</h3>
        <div className="grid grid-cols-2 gap-3">
          <Achieve icon={Star} iconClass="fill-[#FFB400] text-[#FFB400]" label="协会评分" value={rating.toFixed(1)} sub="企业评价聚合" />
          <Achieve icon={Briefcase} iconClass="text-cat-decor" label="累计接单" value={`${jobsDone}`} sub="单 · 经协会平台" />
          <Achieve icon={CalendarClock} iconClass="text-cat-build" label="从业年限" value={years ? `${years}` : "—"} sub={years ? "年" : "完善资料"} />
          <Achieve icon={ShieldCheck} iconClass={insured ? "text-accent-tea" : "text-muted-foreground"} label="工伤险" value={insured ? "在保" : "未保"} sub={insured ? "协会承保" : "建议投保"} />
        </div>
      </section>

      {/* 资质证书 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold tracking-tight">资质 · 证书</h3>
          <Link href="/dashboard/practitioner/training" className="text-[11px] text-brand">上传 →</Link>
        </div>
        <div className="rounded-2xl bg-surface p-5 text-center text-[12px] text-muted-foreground">
          暂未上传证书。去「培训 · 证书」上传二建 / 设计师证 / 安全员等，认证后展示在名录、并助力晋级评审。
        </div>
      </section>

      {/* 历史项目 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <h3 className="text-[14px] font-semibold tracking-tight mb-3">历史项目</h3>
        <div className="rounded-2xl bg-surface p-5 text-center text-[12px] text-muted-foreground">
          暂无项目记录。接单并完成后，企业评价会聚合到这里，累计接单与好评是晋级的重要依据。
        </div>
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
        信阳市建筑装饰装修协会 · 从业者门户
      </div>
    </PractitionerShell>
  );
}

function Achieve({ icon: Icon, iconClass, label, value, sub }: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} /> {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold tracking-tight leading-none">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function Mini2({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-surface p-3 text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[16px] font-semibold tracking-tight leading-none">{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
