import Link from "next/link";
import {
  UserCircle2, Phone, MessageSquareHeart, FileText, HelpCircle, LogOut,
  ChevronRight, ShieldCheck, CheckCircle2, Pencil, AlertTriangle, MessageSquareWarning,
} from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { logoutAction } from "@/app/(main)/login/actions";
import { getSession } from "@/lib/auth/session";
import { listReviewsByUid } from "@/lib/data/reviews";
import { listMediationsByUid } from "@/lib/data/mediations";
import { updateProfileAction, deleteAccountAction, rebindPhoneAction } from "./actions";
import { RebindPhone } from "./RebindPhone";

export const metadata = { title: "账号与安全 · 信阳市建筑装饰装修协会" };

export default async function CustomerSettings({ searchParams }: { searchParams: Promise<{ saved?: string; perr?: string }> }) {
  const { saved, perr } = await searchParams;
  const session = await getSession();
  const name = session?.name || "业主";
  const phone = session?.phone || "";
  const maskedPhone = phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : phone;
  const memberId = phone ? `C${phone.slice(-6)}` : "—";
  const reviewCount = session ? listReviewsByUid(session.uid).length : 0;
  const medCount = session ? listMediationsByUid(session.uid).length : 0;

  return (
    <CustomerShell title="账号与安全">
      {saved === "profile" && <Banner ok>资料已更新</Banner>}
      {saved === "phone" && <Banner ok>手机号已换绑，下次用新号登录</Banner>}
      {perr === "name" && <Banner>请填写称呼</Banner>}
      {perr === "confirm" && <Banner>手机号不匹配，账号未注销</Banner>}
      {perr === "phone_format" && <Banner>请输入正确的 11 位新手机号</Banner>}
      {perr === "phone_code" && <Banner>请输入短信验证码</Banner>}
      {perr === "phone_same" && <Banner>新手机号与当前相同</Banner>}
      {perr === "phone_taken" && <Banner>该手机号已被注册，请更换</Banner>}

      {/* 个人卡片 */}
      <div className="rounded-3xl bg-foreground text-background p-5 mb-4 flex items-center gap-4">
        <span className="h-16 w-16 rounded-full bg-cat-decor inline-flex items-center justify-center text-[24px] font-semibold shrink-0">{name.slice(0, 1)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-semibold truncate">{name}</div>
          <div className="text-[11px] text-background/70 mt-0.5">ID: {memberId}{maskedPhone ? ` · ${maskedPhone}` : ""}</div>
          <div className="text-[11px] text-background/70">协会注册业主</div>
        </div>
      </div>

      {/* 账号与安全 */}
      <Group title="账号与安全">
        {/* 个人资料 —— 改称呼 */}
        <details className="group">
          <summary className="flex items-center gap-3 px-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden active:bg-surface">
            <UserCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px]">个人资料</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">称呼：{name}</div>
            </div>
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </summary>
          <form action={updateProfileAction} className="px-4 pb-4 pt-1 flex gap-2">
            <input name="name" defaultValue={name} maxLength={20} placeholder="你的称呼（如 刘女士）" className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-[14px] outline-none focus:border-foreground/30" />
            <button className="h-10 px-4 rounded-xl bg-foreground text-background text-[13px] font-medium shrink-0">保存</button>
          </form>
        </details>

        {/* 登录手机号 —— 可展开换绑 */}
        <details className="group">
          <summary className="flex items-center gap-3 px-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden active:bg-surface">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px]">登录手机号</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{maskedPhone || "—"} · 短信验证码登录</div>
            </div>
            <span className="text-[12px] text-brand shrink-0">换绑</span>
          </summary>
          <RebindPhone action={rebindPhoneAction} />
        </details>
      </Group>

      {/* 我的 */}
      <Group title="我的">
        <Row icon={MessageSquareHeart} label="我的评价" sub={reviewCount > 0 ? `${reviewCount} 条已发布` : "完工后来打分"} href="/dashboard/customer/review" />
        <Row icon={MessageSquareWarning} label="我的调解记录" sub={medCount > 0 ? `${medCount} 起` : "暂无"} href="/dashboard/customer" />
        <Row icon={HelpCircle} label="帮助中心 / 联系客服" href="/about/contact" />
        <Row icon={ShieldCheck} label="隐私政策" href="/legal/privacy" />
        <Row icon={FileText} label="服务条款" href="/legal/terms" />
      </Group>

      <form action={logoutAction}>
        <button type="submit" className="w-full mt-2 h-12 rounded-full border border-border text-foreground font-medium inline-flex items-center justify-center gap-2 active:bg-surface">
          <LogOut className="h-4 w-4" /> 退出登录
        </button>
      </form>

      {/* 注销账号 —— 危险操作 */}
      <details className="mt-4">
        <summary className="text-center text-[12px] text-muted-foreground cursor-pointer list-none [&::-webkit-details-marker]:hidden py-2">注销账号</summary>
        <div className="mt-2 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft/40 p-4">
          <div className="flex items-start gap-2 text-[12px] text-cat-decor">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>注销后账号与登录身份将被删除且<b>不可恢复</b>（已发布的实名评价仍保留以维护口碑真实性）。如确认，请输入你的手机号 <b>{maskedPhone}</b> 后注销。</span>
          </div>
          <form action={deleteAccountAction} className="mt-3 flex gap-2">
            <input name="confirm" inputMode="numeric" placeholder="输入完整手机号确认" className="flex-1 h-10 rounded-xl border border-cat-decor/40 bg-background px-3 text-[14px] outline-none focus:border-cat-decor" />
            <button className="h-10 px-4 rounded-xl bg-cat-decor text-white text-[13px] font-medium shrink-0">确认注销</button>
          </form>
        </div>
      </details>

      <div className="mt-6 mb-2 text-center text-[10px] text-muted-foreground">
        信阳市建筑装饰装修协会
      </div>
    </CustomerShell>
  );
}

function Banner({ children, ok }: { children: React.ReactNode; ok?: boolean }) {
  return (
    <div className={`mb-4 rounded-2xl px-4 py-3 text-[13px] inline-flex items-center gap-2 ${ok ? "bg-[#e6f7f1] border border-accent-tea/30 text-accent-tea" : "bg-cat-decor-soft border border-cat-decor/30 text-cat-decor"}`}>
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {children}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] text-muted-foreground tracking-wider uppercase px-1 mb-1.5">{title}</div>
      <div className="rounded-3xl bg-background border border-border divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, sub, href }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sub?: string; href: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-4 active:bg-surface">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[14px]">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
