import { Plus, Crown, ShieldCheck, Lock, Unlock, Trash2, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { effectiveEnterpriseId, isEnterprisePreview } from "@/lib/dashboard/preview";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { ensureOwner, listStaffByEnterprise, ENT_ASSIGNABLE_ROLES, type EntStaffRole, type EntStaffStatus } from "@/lib/data/enterprise-staff";
import { leadStatsByAssignee } from "@/lib/data/leads";
import { reportStatsByAssignee } from "@/lib/data/reports";
import { addStaffAction, setStaffStatusAction, removeStaffAction } from "./actions";
import { RoleSelect } from "./RoleSelect";

export const metadata = { title: "团队管理 · 企业工作台" };

const ROLE_LABEL: Record<EntStaffRole, string> = {
  owner: "负责人", admin: "管理员", sales: "销售顾问", site_manager: "项目经理",
  designer: "设计师", finance: "财务", viewer: "查看者",
};
const ROLE_TONE: Record<EntStaffRole, "brand" | "build" | "decor" | "design" | "tea" | "yellow" | "neutral"> = {
  owner: "yellow", admin: "brand", sales: "decor", site_manager: "build",
  designer: "design", finance: "tea", viewer: "neutral",
};
const STATUS_LABEL: Record<EntStaffStatus, string> = { active: "在职", locked: "已停用", invited: "待激活" };
const STATUS_TONE: Record<EntStaffStatus, "tea" | "decor" | "yellow"> = { active: "tea", locked: "decor", invited: "yellow" };
const ERR_TEXT: Record<string, string> = { name: "请填写成员姓名。", phone: "手机号格式不正确（11 位）。", dup: "该手机号已在团队中，请勿重复添加。" };

const INPUT = "h-10 rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30 w-full";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ added?: string; err?: string }> }) {
  const { added, err } = await searchParams;
  const session = await getSession();
  const eid = effectiveEnterpriseId(session);
  const preview = isEnterprisePreview(session);
  const ent = eid ? await getEnterpriseBySlugOrId(eid) : undefined;
  // 首访自动建 owner（企业账号本人）
  if (eid && ent) ensureOwner(eid, { name: ent.name, phone: ent.contact.tel });
  const team = eid ? listStaffByEnterprise(eid) : [];
  const active = team.filter((m) => m.status === "active").length;
  const invited = team.filter((m) => m.status === "invited").length;
  const roleOptions = ENT_ASSIGNABLE_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }));
  // 成员业绩（按负责人聚合）：线索 + 报备，让名册「活」起来
  const leadStats = eid ? leadStatsByAssignee(eid) : {};
  const entNames = [ent?.name, ent?.hero.brand].filter(Boolean) as string[];
  const reportStats = entNames.length ? reportStatsByAssignee(entNames) : {};

  return (
    <EnterpriseShell
      title="团队管理"
      subtitle={`公司成员 ${team.length} 人 · 在职 ${active}${invited ? ` · 待激活 ${invited}` : ""}`}
    >
      {/* 添加成员（协会只读预览不显示）。自己公司的员工直接录入即在职，无需邀请/激活。*/}
      {!preview && (
        <form action={addStaffAction} className="mb-5 rounded-2xl border border-border bg-background p-4 md:p-5">
          <div className="text-[13px] font-semibold mb-3 inline-flex items-center gap-1.5"><Plus className="h-4 w-4" /> 添加成员</div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <label className="block">
              <span className="text-[12px] text-muted-foreground">姓名</span>
              <input name="name" required placeholder="成员姓名" className={INPUT} />
            </label>
            <label className="block">
              <span className="text-[12px] text-muted-foreground">手机号 <span className="text-muted-foreground/70">(选填)</span></span>
              <input name="phone" placeholder="联系手机号，可不填" className={INPUT} />
            </label>
            <label className="block">
              <span className="text-[12px] text-muted-foreground">角色</span>
              <select name="role" defaultValue="sales" className={INPUT}>
                {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <button type="submit" className="h-10 px-5 rounded-xl bg-foreground text-background text-[13px] font-medium shrink-0">添加成员</button>
          </div>
          {added && <p className="mt-2.5 text-[11px] text-accent-tea inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> 已添加，成员即为在职。</p>}
          {err && ERR_TEXT[err] && <p className="mt-2.5 text-[11px] text-cat-decor inline-flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {ERR_TEXT[err]}</p>}
          {!added && !err && <p className="mt-2.5 text-[11px] text-muted-foreground">录入你公司的成员并分配角色；添加后即为在职。如需暂停某成员权限可「停用」，离职可「移除」。</p>}
        </form>
      )}

      {/* 成员列表 */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.4fr_1fr_1.1fr_0.8fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
          <span>成员</span><span>手机</span><span>角色</span><span>状态</span><span className="text-right">操作</span>
        </div>
        {team.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">还没有团队成员，用上方「添加成员」录入你公司的员工。</div>
        ) : (
          <ul className="divide-y divide-border">
            {team.map((m) => {
              const isOwner = m.role === "owner";
              const editable = !preview && !isOwner;
              const st = leadStats[m.id];
              const rst = reportStats[m.id];
              return (
                <li key={m.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_1fr_1.1fr_0.8fr_auto] gap-3 items-center px-5 py-3.5 text-[13px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-9 w-9 rounded-full bg-foreground text-background inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{m.name.slice(0, 1)}</span>
                    <span className="min-w-0">
                      <span className="font-medium truncate flex items-center gap-1.5">{m.name}{isOwner && <Crown className="h-3 w-3 text-accent-yellow shrink-0" />}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground">{m.phone ? `${m.phone} · ` : ""}{ROLE_LABEL[m.role]}</span>
                      {st && <span className="block text-[11px] text-muted-foreground">负责 <b className="text-foreground">{st.total}</b> 线索 · 跟进 {st.active} · 签单 <b className="text-accent-tea">{st.signed}</b></span>}
                      {rst && <span className="block text-[11px] text-muted-foreground">负责 <b className="text-foreground">{rst.total}</b> 报备 · 通过 <b className="text-accent-tea">{rst.approved}</b></span>}
                      {!st && !rst && <span className="block text-[11px] text-muted-foreground/60">暂无负责线索 / 报备</span>}
                    </span>
                  </div>
                  <span className="hidden md:block text-muted-foreground tabular-nums">{m.phone || "—"}</span>
                  <span className="hidden md:flex items-center">
                    {editable ? <RoleSelect id={m.id} role={m.role} options={roleOptions} /> : <Badge tone={ROLE_TONE[m.role]}>{ROLE_LABEL[m.role]}</Badge>}
                  </span>
                  <span className="hidden md:block"><Badge tone={STATUS_TONE[m.status]}>{STATUS_LABEL[m.status]}</Badge></span>
                  <span className="flex items-center justify-end gap-1.5 shrink-0">
                    {editable ? (
                      <>
                        {m.status === "invited" && (
                          <form action={setStaffStatusAction}>
                            <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="active" />
                            <button title="激活" className="h-8 px-2.5 rounded-lg text-[12px] text-accent-tea hover:bg-surface inline-flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> 激活</button>
                          </form>
                        )}
                        {m.status === "active" && (
                          <form action={setStaffStatusAction}>
                            <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="locked" />
                            <button title="停用" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-cat-decor hover:bg-surface inline-flex items-center justify-center"><Lock className="h-3.5 w-3.5" /></button>
                          </form>
                        )}
                        {m.status === "locked" && (
                          <form action={setStaffStatusAction}>
                            <input type="hidden" name="id" value={m.id} /><input type="hidden" name="status" value="active" />
                            <button title="恢复在职" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-accent-tea hover:bg-surface inline-flex items-center justify-center"><Unlock className="h-3.5 w-3.5" /></button>
                          </form>
                        )}
                        <form action={removeStaffAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <button title="移除" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-cat-decor hover:bg-surface inline-flex items-center justify-center"><Trash2 className="h-3.5 w-3.5" /></button>
                        </form>
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">{isOwner ? "账号本人" : ""}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-accent-tea mt-0.5 shrink-0" />
        <div className="text-[12px] text-muted-foreground leading-5">
          <b className="text-foreground">权限说明：</b> 负责人(账号本人)拥有全部权限；管理员可添加成员、改子站、看全部数据；销售/项目经理/设计师看自己负责的线索与项目；财务看金额相关；查看者只读。
        </div>
      </div>
    </EnterpriseShell>
  );
}
