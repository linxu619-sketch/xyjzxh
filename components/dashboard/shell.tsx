import { redirect } from "next/navigation";
import { Crown } from "lucide-react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./widgets";
import { Badge } from "@/components/ui/badge";
import { getSession, type Session } from "@/lib/auth/session";
import { ASSOC_NAV, ENT_NAV } from "@/lib/dashboard/nav";
import { countByStatus } from "@/lib/data/applications";
import { listReports, listReportsByUid } from "@/lib/data/reports";
import { listMediations } from "@/lib/data/mediations";

type ShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: string };

// 用真实待审数覆盖导航角标；为 0 则不显示（避免写死的假数字与列表对不上）
function withBadges(nav: readonly NavItem[], counts: Record<string, number>): NavItem[] {
  return nav.map((it) => {
    const n = counts[it.href];
    return n && n > 0 ? { ...it, badge: String(n) } : { ...it, badge: undefined };
  });
}

export async function AssociationShell({ title, subtitle, actions, children }: ShellProps) {
  const session = await getSession();
  if (!session || (session.role !== "association" && session.role !== "system_admin")) {
    redirect("/login?role=association");
  }
  const isSys = session.role === "system_admin";

  const items = withBadges(ASSOC_NAV, {
    "/dashboard/association/members": countByStatus().pending,
    "/dashboard/association/reports": listReports("pending").length,
    "/dashboard/association/mediations": listMediations("pending").length,
  });

  return (
    <div className="flex">
      <Sidebar
        brand={isSys ? "平台超管控制台" : "协会工作台"}
        role={isSys ? "Platform Owner" : "Association Console"}
        items={items}
        user={{
          name: session.name,
          meta: isSys
            ? "系统管理员 · 最高权限"
            : `${session.staffRole ?? "staff"} · ${maskPhone(session.phone)}`,
        }}
        tone="brand"
      />
      <div className="flex-1 bg-surface min-h-screen">
        <div className="px-5 pb-8 pt-[72px] md:p-10 max-w-7xl">
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
  const pendingReports = listReportsByUid(session.uid).filter((r) => r.status === "pending").length;
  const items = withBadges(ENT_NAV, {
    "/dashboard/enterprise/projects": pendingReports,
  });
  return (
    <div className="flex">
      <Sidebar
        brand="名家装饰"
        role="Enterprise Console"
        items={items}
        user={{ name: session.name, meta: `owner · ${maskPhone(session.phone)}` }}
        tone="build"
      />
      <div className="flex-1 bg-surface min-h-screen">
        <div className="px-5 pb-8 pt-[72px] md:p-10 max-w-7xl">
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
