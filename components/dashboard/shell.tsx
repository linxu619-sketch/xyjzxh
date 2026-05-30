import { redirect } from "next/navigation";
import { Crown } from "lucide-react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./widgets";
import { Badge } from "@/components/ui/badge";
import { getSession, type Session } from "@/lib/auth/session";
import { ASSOC_NAV, ENT_NAV } from "@/lib/dashboard/nav";

type ShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export async function AssociationShell({ title, subtitle, actions, children }: ShellProps) {
  const session = await getSession();
  if (!session || (session.role !== "association" && session.role !== "system_admin")) {
    redirect("/login?role=association");
  }
  const isSys = session.role === "system_admin";

  return (
    <div className="flex">
      <Sidebar
        brand={isSys ? "平台超管控制台" : "协会工作台"}
        role={isSys ? "Platform Owner" : "Association Console"}
        items={ASSOC_NAV}
        user={{
          name: session.name,
          meta: isSys
            ? "系统管理员 · 最高权限"
            : `${session.staffRole ?? "staff"} · ${maskPhone(session.phone)}`,
        }}
        tone="brand"
      />
      <div className="flex-1 bg-surface min-h-screen">
        <div className="p-6 md:p-10 max-w-7xl">
          {isSys && <SuperAdminBanner session={session} />}
          <TopBar title={title} subtitle={subtitle} actions={actions} />
          {children}
        </div>
      </div>
    </div>
  );
}

export async function EnterpriseShell({ title, subtitle, actions, children }: ShellProps) {
  const session = await getSession();
  if (!session || session.role !== "enterprise") {
    redirect("/login?role=enterprise");
  }
  return (
    <div className="flex">
      <Sidebar
        brand="名家装饰"
        role="Enterprise Console"
        items={ENT_NAV}
        user={{ name: session.name, meta: `owner · ${maskPhone(session.phone)}` }}
        tone="build"
      />
      <div className="flex-1 bg-surface min-h-screen">
        <div className="p-5 md:p-10 max-w-7xl">
          <TopBar title={title} subtitle={subtitle} actions={actions} />
          {children}
        </div>
      </div>
    </div>
  );
}

function SuperAdminBanner({ session }: { session: Session }) {
  return (
    <div className="mb-6 rounded-2xl bg-foreground text-background px-5 py-4 flex items-center gap-3">
      <Crown className="h-5 w-5 text-accent-yellow" />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold">系统管理员视图 · {session.name}</div>
        <div className="text-[11px] text-background/70">此账号永不入库，仅平台运维持有人可登录</div>
      </div>
      <Badge tone="yellow">SUPER ADMIN</Badge>
    </div>
  );
}

function maskPhone(p: string) {
  return p.length === 11 ? `${p.slice(0, 3)}***${p.slice(-4)}` : p;
}
