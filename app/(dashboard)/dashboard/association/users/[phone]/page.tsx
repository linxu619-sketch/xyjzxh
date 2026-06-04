import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Power, ShieldCheck, Building2, UserRound, Users2 } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getAccountByPhone, type AccountStatus } from "@/lib/data/accounts";
import { getMemberTier } from "@/lib/data/member-tier";
import { setAccountStatusAction } from "../actions";

const ST_LABEL: Record<AccountStatus, string> = { active: "正常", pending: "审核中", rejected: "已停用" };
const ST_TONE: Record<AccountStatus, "tea" | "yellow" | "decor"> = { active: "tea", pending: "yellow", rejected: "decor" };
const ROLE_LABEL: Record<string, string> = { enterprise: "企业会员", individual: "个人会员", customer: "业主" };
const ROLE_ICON: Record<string, React.ComponentType<{ className?: string }>> = { enterprise: Building2, individual: UserRound, customer: Users2 };
function mask(p: string) { return p && p.length === 11 ? `${p.slice(0, 3)}****${p.slice(-4)}` : p; }
function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

export const metadata = { title: "用户详情 · 协会工作台" };

export default async function UserDetail({ params }: { params: Promise<{ phone: string }> }) {
  const { phone } = await params;
  const a = getAccountByPhone(decodeURIComponent(phone));
  if (!a) notFound();
  const Icon = ROLE_ICON[a.role] ?? UserRound;
  const tier = (a.role === "enterprise" || a.role === "individual") && a.memberRef
    ? getMemberTier(a.role === "enterprise" ? "enterprise" : "practitioner", a.memberRef)
    : null;

  return (
    <AssociationShell title="用户详情" subtitle={`${ROLE_LABEL[a.role] ?? a.role} · ${a.name || "(未填名称)"}`}>
      <Link href={`/dashboard/association/users?tab=${a.role}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回用户列表
      </Link>

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <span className="h-14 w-14 rounded-2xl bg-surface inline-flex items-center justify-center"><Icon className="h-6 w-6 text-muted-foreground" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{a.name || "(未填名称)"}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{ROLE_LABEL[a.role] ?? a.role} · {mask(a.phone)}</div>
          </div>
          <Badge tone={ST_TONE[a.status]}>{ST_LABEL[a.status]}</Badge>
        </div>

        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="账号手机号" v={mask(a.phone)} />
          <Row k="用户类型" v={ROLE_LABEL[a.role] ?? a.role} />
          <Row k="账号状态" v={ST_LABEL[a.status]} />
          {a.memberRef && <Row k="会员档案" v={a.memberRef} />}
          {tier && <Row k="会员等级" v={tier} />}
          <Row k="注册时间" v={fmt(a.createdAt)} />
        </dl>

        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> 账号操作</div>
          <div className="flex flex-wrap gap-2">
            {a.status === "active" ? (
              <form action={setAccountStatusAction}>
                <input type="hidden" name="phone" value={a.phone} />
                <input type="hidden" name="status" value="rejected" />
                <input type="hidden" name="redirect" value={`/dashboard/association/users/${encodeURIComponent(a.phone)}`} />
                <button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"><Power className="h-4 w-4" /> 停用该账号</button>
              </form>
            ) : (
              <form action={setAccountStatusAction}>
                <input type="hidden" name="phone" value={a.phone} />
                <input type="hidden" name="status" value="active" />
                <input type="hidden" name="redirect" value={`/dashboard/association/users/${encodeURIComponent(a.phone)}`} />
                <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Power className="h-4 w-4" /> 启用该账号</button>
              </form>
            )}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">停用后该账号无法登录使用;入会申请的审核请到「会员审核」。</p>
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
