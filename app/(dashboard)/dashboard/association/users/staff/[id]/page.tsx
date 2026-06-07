import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Crown, Power, ShieldCheck, Lock, KeyRound, Trash2, Save, UserCog } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getStaff } from "@/lib/data/staff-source";
import { setStaffStatusAction, setStaffRolesAction, setStaffPasswordAction, deleteStaffAction } from "../../actions";
import { roleLabel, roleTone, PERMISSIONS, ALL_PERMISSIONS, ROLE_KEYS } from "@/lib/auth/roles";
import { getEffectiveRolePermissions } from "@/lib/runtime-config";

export const metadata = { title: "工作人员详情 · 协会工作台" };

function mask(p: string) { return p; }  // 用户管理显示完整手机号

export default async function StaffDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const s = getStaff(id);
  if (!s) notFound();
  const isSuper = s.roles.includes("super_admin");
  const effRole = await getEffectiveRolePermissions();
  const perms = ALL_PERMISSIONS.filter((p) => s.roles.some((r) => effRole[r]?.includes(p)));
  const savedMsg = saved === "roles" ? "角色已更新" : saved === "pwd" ? "登录密码已重置" : saved === "created" ? "工作人员已创建,登录账号已开通" : "";

  return (
    <AssociationShell title="工作人员详情" subtitle={`${s.name} · ${s.roles.map(roleLabel).join(" / ")}`}>
      <Link href="/dashboard/association/users?tab=staff" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回工作人员列表
      </Link>
      {savedMsg && <div className="mb-4 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea px-4 py-2.5 text-[13px] inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {savedMsg}</div>}

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <span className="h-14 w-14 rounded-2xl bg-brand-50 text-brand inline-flex items-center justify-center text-[20px] font-semibold">{s.name.slice(0, 1)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold inline-flex items-center gap-2">{s.name}{isSuper && <Crown className="h-4 w-4 text-accent-yellow" />}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{mask(s.phone)}</div>
          </div>
          <Badge tone={s.status === "active" ? "tea" : "decor"}>{s.status === "active" ? "正常" : "已停用"}</Badge>
        </div>

        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="姓名" v={s.name} />
          <Row k="角色" v={<span className="inline-flex flex-wrap gap-1.5 items-center">{s.roles.map((r) => <Badge key={r} tone={roleTone(r)}>{roleLabel(r)}</Badge>)}<span className="text-[11px] text-muted-foreground">共 {s.roles.length} 个角色</span></span>} />
          <Row k="登录手机号" v={mask(s.phone)} />
          {s.email && <Row k="邮箱" v={s.email} />}
          <Row k="账号状态" v={s.status === "active" ? "正常" : "已停用"} />
          <Row k="登录密码" v="已加密存储,可在下方「重置登录密码」修改" />
        </dl>

        {/* 有效权限（多角色并集）*/}
        <div className="mt-5 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-2.5 inline-flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> 有效权限 · 多角色合并（{isSuper ? "全部" : perms.length} 项）</div>
          <div className="flex flex-wrap gap-1.5">
            {isSuper && <Badge tone="brand">全部权限</Badge>}
            {perms.map((p) => <span key={p} className="inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2.5 py-1 text-[12px]"><ShieldCheck className="h-3 w-3 text-accent-tea" />{PERMISSIONS[p]}</span>)}
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> 账号操作</div>
          {isSuper ? (
            <p className="text-[12px] text-muted-foreground inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> 超级管理员账号不可停用。</p>
          ) : (
            <form action={setStaffStatusAction}>
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="status" value={s.status === "active" ? "locked" : "active"} />
              <button className={`h-10 px-5 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${s.status === "active" ? "border border-cat-decor/40 text-cat-decor hover:bg-cat-decor-soft" : "bg-foreground text-background"}`}>
                <Power className="h-4 w-4" /> {s.status === "active" ? "停用该账号" : "启用该账号"}
              </button>
            </form>
          )}
          <p className="mt-3 text-[11px] text-muted-foreground">停用后该工作人员无法登录协会工作台。角色为多角色制,权限取各角色并集。平台超级管理员账号写死源码、不在此处管理。</p>
        </div>

        {/* 设置角色（多选，超管不可改）*/}
        {!isSuper && (
          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><UserCog className="h-3.5 w-3.5" /> 设置角色 · 可多选</div>
            <form action={setStaffRolesAction}>
              <input type="hidden" name="id" value={s.id} />
              <div className="flex flex-wrap gap-2">
                {ROLE_KEYS.filter((r) => r !== "super_admin").map((r) => {
                  const on = s.roles.includes(r);
                  return (
                    <label key={r} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] border cursor-pointer transition-colors bg-background border-border hover:bg-surface has-[:checked]:bg-foreground has-[:checked]:text-background has-[:checked]:border-foreground">
                      <input type="checkbox" name="role" value={r} defaultChecked={on} className="accent-brand" />{roleLabel(r)}
                    </label>
                  );
                })}
              </div>
              <button className="mt-3 h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> 保存角色</button>
            </form>
          </div>
        )}

        {/* 改密码 */}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> 重置登录密码</div>
          <form action={setStaffPasswordAction} className="flex items-center gap-2 flex-wrap">
            <input type="hidden" name="id" value={s.id} />
            <input name="password" type="text" placeholder="新密码（≥6 位）" className="h-10 w-56 rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30" />
            <button className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface"><KeyRound className="h-4 w-4" /> 重置密码</button>
          </form>
        </div>

        {/* 删除（超管不可删）*/}
        {!isSuper && (
          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-[12px] text-cat-decor mb-3 inline-flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5" /> 高危操作</div>
            <form action={deleteStaffAction}>
              <input type="hidden" name="id" value={s.id} />
              <button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Trash2 className="h-4 w-4" /> 删除该工作人员</button>
            </form>
            <p className="mt-2 text-[11px] text-muted-foreground">删除后该工作人员从数据库移除,不可恢复。</p>
          </div>
        )}
      </div>

      {/* 角色权限对照表 */}
      <div className="mt-5 rounded-2xl border border-border bg-background overflow-hidden max-w-2xl">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><KeyRound className="h-4 w-4" /> 角色权限对照表</div>
        <div className="hidden md:grid grid-cols-[1fr_2.4fr] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider"><span>角色</span><span>可办职能（权限）</span></div>
        <ul className="divide-y divide-border">
          {ROLE_KEYS.map((rk) => (
            <li key={rk} className="grid grid-cols-1 md:grid-cols-[1fr_2.4fr] gap-2 md:gap-3 px-5 py-3 text-[13px]">
              <span><Badge tone={roleTone(rk)}>{roleLabel(rk)}</Badge></span>
              <span className="text-muted-foreground leading-6">{rk === "super_admin" ? "全部权限" : ((effRole[rk] ?? []).map((p) => PERMISSIONS[p]).join("、") || "—")}</span>
            </li>
          ))}
        </ul>
      </div>
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="text-muted-foreground w-24 shrink-0">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
