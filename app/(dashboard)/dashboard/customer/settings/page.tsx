import Link from "next/link";
import {
  UserCircle2, Lock, Bell, MapPin, FileText, HelpCircle, LogOut, ChevronRight, ShieldCheck,
} from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { logoutAction } from "@/app/(main)/login/actions";
import { Toggle } from "@/components/dashboard/section";

export const metadata = { title: "账号设置 · 信阳市建筑装饰装修协会" };

export default function CustomerSettings() {
  return (
    <CustomerShell title="账号设置">
      {/* 个人卡片 */}
      <div className="rounded-3xl bg-foreground text-background p-5 mb-4 flex items-center gap-4">
        <span className="h-16 w-16 rounded-full bg-cat-decor inline-flex items-center justify-center text-[24px] font-semibold">刘</span>
        <div className="flex-1 min-w-0">
          <div className="text-[16px] font-semibold">刘女士</div>
          <div className="text-[11px] text-background/70 mt-0.5">ID: C00284 · 138****8472</div>
          <div className="text-[11px] text-background/70">浉河区 · 注册于 2025-11-08</div>
        </div>
        <button className="h-9 px-3.5 rounded-full bg-accent-yellow text-foreground text-[11px] font-semibold">编辑</button>
      </div>

      {/* 信用 */}
      <div className="rounded-3xl border border-border bg-background p-5 mb-4 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-accent-tea" />
        <div className="flex-1">
          <div className="text-[12px] text-muted-foreground">业主信用</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[26px] font-semibold leading-none">748</span>
            <span className="text-[11px] text-muted-foreground">/ 850 · 优秀</span>
          </div>
        </div>
        <Link href="#" className="text-[11px] text-brand">详情 →</Link>
      </div>

      {/* 设置组 1 */}
      <Group title="账号与安全">
        <Row icon={UserCircle2} label="个人资料" sub="头像 · 称呼 · 城市" href="#" />
        <Row icon={Lock} label="修改密码 / 短信验证" sub="近 90 天未修改" href="#" />
        <Row icon={MapPin} label="收货地址" sub="3 个地址" href="#" />
      </Group>

      <Group title="通知">
        <RowToggle icon={Bell} label="项目进度提醒" defaultChecked />
        <RowToggle icon={Bell} label="保险到期提醒" defaultChecked />
        <RowToggle icon={Bell} label="协会活动 / 优惠" />
        <RowToggle icon={Bell} label="夜间免打扰 (22:00-08:00)" defaultChecked />
      </Group>

      <Group title="我的">
        <Row icon={FileText} label="我的评价" sub="2 条评价" href="#" />
        <Row icon={FileText} label="我的调解记录" sub="1 起调解中" href="#" />
        <Row icon={HelpCircle} label="帮助中心" sub="常见问题 · 联系客服" href="#" />
        <Row icon={ShieldCheck} label="隐私政策" href="/legal/privacy" />
        <Row icon={FileText} label="服务条款" href="/legal/terms" />
      </Group>

      <form action={logoutAction}>
        <button type="submit" className="w-full mt-6 h-12 rounded-full border border-cat-decor text-cat-decor font-medium inline-flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> 退出登录
        </button>
      </form>

      <div className="mt-6 mb-2 text-center text-[10px] text-muted-foreground">
        信阳市建筑装饰装修协会 · v1.0.0 · 备案号略
      </div>
    </CustomerShell>
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
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function RowToggle({ icon: Icon, label, defaultChecked }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 text-[14px]">{label}</div>
      <Toggle defaultChecked={defaultChecked} />
    </div>
  );
}
