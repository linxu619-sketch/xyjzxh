import Link from "next/link";
import {
  ArrowLeft, UserCircle2, Lock, Bell, MapPin, FileText, HelpCircle,
  ShieldCheck, ChevronRight, LogOut,
} from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Toggle } from "@/components/dashboard/section";
import { logoutAction } from "@/app/(main)/login/actions";

export const metadata = { title: "设置 · 从业者门户" };

export default function PractitionerSettings() {
  return (
    <PractitionerShell title="设置">
      <Group title="账号与安全">
        <Row icon={UserCircle2} label="个人资料" sub="姓名 · 头像 · 工种 · 工龄" href="/dashboard/practitioner/profile" />
        <Row icon={Lock} label="修改密码 / 短信验证" sub="距上次修改 60 天" />
        <Row icon={MapPin} label="常用工地范围" sub="3 个地区" />
      </Group>

      <Group title="通知">
        <RowToggle icon={Bell} label="新岗位推送" defaultChecked />
        <RowToggle icon={Bell} label="工伤险 / 保单到期" defaultChecked />
        <RowToggle icon={Bell} label="协会公告 / 培训开课" defaultChecked />
        <RowToggle icon={Bell} label="同行圈互动" />
        <RowToggle icon={Bell} label="夜间免打扰 22:00-08:00" defaultChecked />
      </Group>

      <Group title="我的">
        <Row icon={FileText} label="我的简历" sub="最近更新 5 月 25 日" />
        <Row icon={FileText} label="我的调解记录" sub="0 起" />
        <Row icon={ShieldCheck} label="实名认证" sub="已通过 · 张建国" />
        <Row icon={HelpCircle} label="帮助中心" sub="常见问题 · 协会热线" href="/about/contact" />
        <Row icon={FileText} label="服务条款" href="/legal/terms" />
        <Row icon={ShieldCheck} label="隐私政策" href="/legal/privacy" />
      </Group>

      <form action={logoutAction}>
        <button type="submit" className="w-full mt-6 h-12 rounded-full border border-cat-decor text-cat-decor font-medium inline-flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> 退出登录
        </button>
      </form>

      <div className="mt-6 mb-2 text-center text-[10px] text-muted-foreground">
        从业者门户 v1.0 · 备案号略
      </div>
    </PractitionerShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] text-muted-foreground tracking-wider uppercase px-1 mb-1.5">{title}</div>
      <div className="rounded-3xl bg-background border border-border divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, sub, href }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; sub?: string; href?: string;
}) {
  const inner = (
    <>
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[14px]">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
      {href && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </>
  );
  if (!href) return <div className="flex items-center gap-3 px-4 py-4">{inner}</div>;
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-4 active:bg-surface">
      {inner}
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
