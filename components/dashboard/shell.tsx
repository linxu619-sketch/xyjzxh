import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "./sidebar";
import { TopBar } from "./widgets";
import { AccountMenu } from "./account-menu";
import { roleLabel, PERMISSIONS, type Permission } from "@/lib/auth/roles";
import { getSession } from "@/lib/auth/session";
import { ASSOC_NAV, ENT_NAV } from "@/lib/dashboard/nav";
import { countByStatus } from "@/lib/data/applications";
import { listReports, listReportsByUid } from "@/lib/data/reports";
import { listMediations } from "@/lib/data/mediations";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getStaff } from "@/lib/data/staff-source";
import { getEffectivePermissionsForRoles } from "@/lib/runtime-config";
import { isEnterprisePreview, effectiveEnterpriseId } from "@/lib/dashboard/preview";
import Link from "next/link";
import { Eye, Lock } from "lucide-react";

type ShellProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** 套色页头（"brand" 时表头为品牌渐变底，白字）*/
  tone?: "brand";
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

export async function AssociationShell({ title, subtitle, actions, tone = "brand", children }: ShellProps) {
  const session = await getSession();
  if (!session || (session.role !== "association" && session.role !== "system_admin")) {
    redirect("/login?role=association");
  }
  const isSys = session.role === "system_admin";

  // 员工有效权限（系统超管恒全权 = null）；同时用于侧栏过滤与页面级强拦截。
  let perms: Set<Permission> | null = null;
  if (!isSys) {
    const staff = getStaff(session.uid);
    const roles = staff?.roles?.length ? staff.roles : (session.staffRole ? [session.staffRole] : []);
    perms = await getEffectivePermissionsForRoles(roles);
  }

  // 页面级强拦截：当前路径所属模块所需权限（最长前缀匹配 ASSOC_NAV）；无权限 → 渲染「无权限」页。
  const path = (await headers()).get("x-pathname") ?? "";
  let need: Permission | undefined;
  let bestLen = -1;
  for (const it of ASSOC_NAV) {
    if (it.perm && (path === it.href || path.startsWith(it.href + "/")) && it.href.length > bestLen) {
      need = it.perm; bestLen = it.href.length;
    }
  }
  const denied = !!perms && !!need && !perms.has(need);

  const nav = perms ? ASSOC_NAV.filter((it) => !it.perm || perms!.has(it.perm)) : ASSOC_NAV;
  const items = withBadges(nav, {
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
        <div className="px-5 md:px-10 pb-8 md:pb-10 pt-[72px] md:pt-10 max-w-7xl">
          <div className="no-print">
            <TopBar
              title={title}
              subtitle={subtitle}
              actions={actions}
              tone={tone}
              trailing={
                <AccountMenu
                  name={session.name}
                  roleLabel={isSys ? "系统管理员 · 最高权限" : roleLabel(session.staffRole ?? "")}
                  phone={maskPhone(session.phone)}
                  isSys={isSys}
                  settingsHref="/dashboard/association/settings"
                  usersHref="/dashboard/association/users"
                />
              }
            />
          </div>
          {denied && need ? <NoAccess need={need} /> : children}
        </div>
      </div>
    </div>
  );
}

function NoAccess({ need }: { need: Permission }) {
  return (
    <div className="no-print rounded-2xl border border-border bg-background p-10 md:p-14 text-center max-w-2xl">
      <span className="inline-flex h-12 w-12 rounded-2xl bg-cat-decor-soft text-cat-decor items-center justify-center mb-4">
        <Lock className="h-6 w-6" />
      </span>
      <div className="text-[16px] font-semibold">无访问权限</div>
      <p className="text-[13px] text-muted-foreground mt-2 leading-6">
        你的角色没有「<b className="text-foreground">{PERMISSIONS[need]}</b>」模块的权限。<br />
        如需开通，请联系协会超级管理员在「系统设置 → 角色权限」中调整。
      </p>
      <Link href="/dashboard/association" className="mt-5 inline-flex h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium items-center gap-1.5">
        返回总览
      </Link>
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
        <div className="px-5 md:px-10 pb-8 md:pb-10 pt-[72px] md:pt-10 max-w-7xl">
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
