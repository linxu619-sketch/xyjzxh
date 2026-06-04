import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Crown, Power, ShieldCheck, Lock } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getStaff } from "@/lib/data/staff-source";
import { setStaffStatusAction } from "../../actions";

export const metadata = { title: "工作人员详情 · 协会工作台" };

const STAFF_ROLE: Record<string, string> = { super_admin: "超级管理员", secretary: "秘书长", reviewer: "审核员", finance: "金融保险专员", content: "内容编辑", support: "客服支持" };
function mask(p: string) { return p && p.length === 11 ? `${p.slice(0, 3)}****${p.slice(-4)}` : p; }

export default async function StaffDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = getStaff(id);
  if (!s) notFound();
  const isSuper = s.staffRole === "super_admin";

  return (
    <AssociationShell title="工作人员详情" subtitle={`${s.name} · ${STAFF_ROLE[s.staffRole] ?? s.staffRole}`}>
      <Link href="/dashboard/association/users?tab=staff" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回工作人员列表
      </Link>

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <span className="h-14 w-14 rounded-2xl bg-brand-50 text-brand inline-flex items-center justify-center text-[20px] font-semibold">{s.name.slice(0, 1)}</span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold inline-flex items-center gap-2">{s.name}{isSuper && <Crown className="h-4 w-4 text-accent-yellow" />}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{STAFF_ROLE[s.staffRole] ?? s.staffRole} · {mask(s.phone)}</div>
          </div>
          <Badge tone={s.status === "active" ? "tea" : "decor"}>{s.status === "active" ? "正常" : "已停用"}</Badge>
        </div>

        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="姓名" v={s.name} />
          <Row k="角色" v={STAFF_ROLE[s.staffRole] ?? s.staffRole} />
          <Row k="登录手机号" v={mask(s.phone)} />
          {s.email && <Row k="邮箱" v={s.email} />}
          <Row k="账号状态" v={s.status === "active" ? "正常" : "已停用"} />
          <Row k="登录密码" v="手机号后 6 位（演示）" />
        </dl>

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
          <p className="mt-3 text-[11px] text-muted-foreground">停用后该工作人员无法登录协会工作台。平台超级管理员账号写死源码、不在此处管理。</p>
        </div>
      </div>
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="text-muted-foreground w-24 shrink-0">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
