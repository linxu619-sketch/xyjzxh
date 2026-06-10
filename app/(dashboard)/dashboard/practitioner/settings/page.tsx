import Link from "next/link";
import { redirect } from "next/navigation";
import {
  UserCircle2, Bell, FileText, HelpCircle, ShieldCheck, ChevronRight, LogOut,
} from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Toggle } from "@/components/dashboard/section";
import { logoutAction } from "@/app/(main)/login/actions";
import { getSession } from "@/lib/auth/session";
import { isPractitionerPreview } from "@/lib/dashboard/preview";

export const metadata = { title: "设置 · 从业者门户" };

export default async function PractitionerSettings() {
  const session = await getSession();
  if (!session || (session.role !== "practitioner" && !isPractitionerPreview(session))) {
    redirect("/login?role=practitioner");
  }

  return (
    <PractitionerShell title="设置">
      <Group title="账号">
        <Row icon={UserCircle2} label="个人资料 · 荣誉档案" sub="等级 · 工种 · 工龄 · 成就" href="/dashboard/practitioner/profile" />
        <Row icon={ShieldCheck} label="实名认证" sub={`已通过 · ${session.name}`} />
      </Group>

      <Group title="通知">
        <RowToggle icon={Bell} label="新岗位推送" defaultChecked />
        <RowToggle icon={Bell} label="工伤险 / 保单到期" defaultChecked />
        <RowToggle icon={Bell} label="协会公告 / 培训开课" defaultChecked />
        <RowToggle icon={Bell} label="夜间免打扰 22:00-08:00" defaultChecked />
      </Group>

      <Group title="帮助与条款">
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
        信阳市建筑装饰装修协会 · 从业者门户
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
