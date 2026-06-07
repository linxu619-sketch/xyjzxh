import { redirect } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopBar } from "./widgets";
import { AccountMenu } from "./account-menu";
import { roleLabel } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";
import { ASSOC_NAV, ENT_NAV } from "@/lib/dashboard/nav";
import { countByStatus } from "@/lib/data/applications";
import { listReports, listReportsByUid } from "@/lib/data/reports";
import { listMediations } from "@/lib/data/mediations";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { isEnterprisePreview, effectiveEnterpriseId } from "@/lib/dashboard/preview";
import Link from "next/link";
import { Eye } from "lucide-react";

type ShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** 套色页头（"brand" 时表头为品牌渐变底，白字）*/
  tone?: "brand";
  /** 页头内合并展示的额外内容（如总览页的待办条），随表头一起套色 */
  headerExtra?: React.ReactNode;
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

export async function AssociationShell({ title, subtitle, actions, tone, headerExtra, children }: ShellProps) {
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
      <div className="no-print contents">
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
      </div>
      <div className="flex-1 bg-surface min-h-screen">
        <div className="px-5 pb-8 pt-[72px] md:p-10 max-w-7xl">
          <div className="no-print">
            <TopBar
              title={title}
              subtitle={subtitle}
              actions={actions}
              tone={tone}
              extra={headerExtra}
              trailing={
                <AccountMenu
                  name={session.name}
                  roleLabel={isSys ? "系统管理员 · 最高权限" : roleLabel(session.staffRole ?? "")}
                  phone={maskPhone(session.phone)}
                  isSys={isSys}
                  onBrand={tone === "brand"}
                  settingsHref="/dashboard/association/settings"
                  usersHref="/dashboard/association/users"
                />
              }
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export async function EnterpriseShell({ title, subtitle, actions, children }: ShellProps) {
  const session = await getSession();
  const preview = isEnterprisePreview(session);
  if (!session || (session.role !== "enterprise" && !preview)) {
    redirect("/login?role=enterprise");
  }
  if (session.role === "enterprise" && session.pending) redirect("/dashboard/pending");
  const eid = effectiveEnterpriseId(session);
  const pendingReports = preview ? 0 : listReportsByUid(session!.uid).filter((r) => r.status === "pending").length;
  const items = withBadges(ENT_NAV, {
    "/dashboard/enterprise/projects": pendingReports,
  });
  // 品牌名按登录企业动态显示（解析 mock 的 e001~ 与入会建档的 app-X 企业）
  const ent = eid ? await getEnterpriseBySlugOrId(eid) : undefined;
  const brand = ent?.hero.brand ?? ent?.name ?? session!.name ?? "企业工作台";
  return (
    <div className="flex">
      <Sidebar
        brand={brand}
        role={ent?.name ?? "Enterprise Console"}
        items={items}
        user={{ name: preview ? "协会预览" : session!.name, meta: preview ? "只读预览样板企业" : `企业管理员 · ${maskPhone(session!.phone)}` }}
        tone="build"
        back={preview ? { href: "/dashboard/association", label: "返回协会工作台" } : { href: ent?.slug ? `/biz/${ent.slug}` : "/", label: "查看我的子站" }}
      />
      <div className="flex-1 bg-surface min-h-screen">
        <div className="px-5 pb-8 pt-[72px] md:p-10 max-w-7xl">
          {preview && <PreviewBanner back="返回协会工作台" portal={`企业工作台预览 · ${ent?.name ?? ""}`} />}
          <TopBar title={title} subtitle={subtitle} actions={actions} />
          {children}
        </div>
      </div>
    </div>
  );
}

function PreviewBanner({ portal, back }: { portal: string; back: string }) {
  return (
    <div className="mb-6 rounded-2xl border border-accent-yellow/40 bg-[#fff6d6] text-[#a37200] px-5 py-3 flex items-center gap-3">
      <Eye className="h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0 text-[13px]"><b>{portal}</b> · 你正以协会身份只读预览该端体验,操作仅用于测试。</div>
      <Link href="/dashboard/association" className="shrink-0 h-8 px-3.5 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center">{back}</Link>
    </div>
  );
}

function maskPhone(p: string) {
  return p.length === 11 ? `${p.slice(0, 3)}***${p.slice(-4)}` : p;
}
