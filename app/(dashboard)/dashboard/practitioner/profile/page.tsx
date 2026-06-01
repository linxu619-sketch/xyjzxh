import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck, Star, BadgeCheck, Sparkles, ChevronRight, Pencil, LogOut, Bell, Settings, MapPin,
} from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { logoutAction } from "@/app/(main)/login/actions";
import { getSession } from "@/lib/auth/session";
import { getPractitionerByPhone } from "@/lib/data/practitioners-source";

export const metadata = { title: "我的 · 从业者门户" };

export default async function PractitionerProfile() {
  const session = await getSession();
  if (!session || session.role !== "practitioner") {
    redirect("/login?role=practitioner");
  }
  const me = getPractitionerByPhone(session.phone);
  const name = me?.name ?? session.name;
  const kind = me?.kind ?? "从业者";
  const years = me?.years ?? 0;
  const city = me?.city ?? "信阳";
  const pid = me?.id ?? session.uid;
  const rating = me?.rating ?? 5;
  const jobsDone = me?.jobs ?? 0;
  const insured = me?.insured ?? false;

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
          <span className="h-16 w-16 rounded-full bg-cat-design text-white inline-flex items-center justify-center text-[24px] font-semibold">{name.slice(0, 1)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{name}</div>
            <div className="text-[11px] text-background/70 mt-0.5">{kind}{years ? ` · ${years} 年` : ""} · <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" />{city}</span></div>
            <div className="text-[11px] text-background/70 mt-0.5">ID: {pid}</div>
          </div>
          <Link href="/dashboard/practitioner/settings" className="h-9 w-9 rounded-full bg-white/10 inline-flex items-center justify-center"><Pencil className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Mini label="评分" value={rating.toFixed(1)} sub={`${jobsDone} 单`} />
          <Mini label="累计接单" value={`${jobsDone}`} sub="单" />
          <Mini label="工伤险" value={insured ? "在保" : "未保"} sub={insured ? "协会承保" : "去投保"} />
        </div>
      </div>

      {/* 认证状态 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-accent-tea" />
          <div className="text-[14px] font-semibold">协会实名认证从业者</div>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground leading-5">
          您的{kind}身份已通过协会审核入册，展示在 <Link href="/practitioners" className="text-brand">从业者名录</Link>。完善简介与证书有助于获得更多接单机会。
        </p>
      </section>

      {/* 资质证书 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold tracking-tight">资质 · 证书</h3>
          <Link href="/dashboard/practitioner/training" className="text-[11px] text-brand">上传 →</Link>
        </div>
        <div className="rounded-2xl bg-surface p-5 text-center text-[12px] text-muted-foreground">
          暂未上传证书。去「培训 · 证书」上传二建 / 设计师证 / 安全员等，认证后展示在名录。
        </div>
      </section>

      {/* 历史项目 */}
      <section className="rounded-3xl bg-background border border-border p-5 mb-4">
        <h3 className="text-[14px] font-semibold tracking-tight mb-3">历史项目</h3>
        <div className="rounded-2xl bg-surface p-5 text-center text-[12px] text-muted-foreground">
          暂无项目记录。接单并完成后，企业评价会聚合到这里。
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3 fill-[#FFB400] text-[#FFB400]" /> 当前评分 {rating.toFixed(1)} · 累计 {jobsDone} 单
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

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-2.5">
      <div className="text-[9px] text-background/60">{label}</div>
      <div className="text-[18px] font-semibold mt-0.5">{value}</div>
      {sub && <div className="text-[9px] text-background/60">{sub}</div>}
    </div>
  );
}
