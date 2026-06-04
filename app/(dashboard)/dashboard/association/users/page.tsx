import Link from "next/link";
import { Crown, Building2, UserRound, Users2, ShieldCheck, ChevronRight } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { StatFilters } from "@/components/dashboard/stat-filters";
import { Badge } from "@/components/ui/badge";
import { listAccounts, countAccountsByRole, type AccountStatus } from "@/lib/data/accounts";
import { listStaff } from "@/lib/data/staff-source";

export const metadata = { title: "用户管理 · 协会工作台" };

const ST_LABEL: Record<AccountStatus, string> = { active: "正常", pending: "审核中", rejected: "已停用" };
const ST_TONE: Record<AccountStatus, "tea" | "yellow" | "decor"> = { active: "tea", pending: "yellow", rejected: "decor" };
const STAFF_ROLE: Record<string, string> = { super_admin: "超级管理员", secretary: "秘书长", reviewer: "审核员", finance: "金融保险专员", content: "内容编辑", support: "客服支持", admin: "管理员", staff: "工作人员", mediator: "调解员" };
const STAFF_TONE: Record<string, "brand" | "build" | "design" | "decor" | "tea" | "yellow" | "neutral"> = { super_admin: "brand", secretary: "build", reviewer: "design", finance: "tea", content: "yellow", support: "neutral" };

function mask(p: string) { return p && p.length === 11 ? `${p.slice(0, 3)}****${p.slice(-4)}` : p; }
function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }

const TABS = [
  { key: "staff", label: "协会工作人员", icon: Crown },
  { key: "enterprise", label: "企业会员", icon: Building2 },
  { key: "individual", label: "个人会员", icon: UserRound },
  { key: "customer", label: "业主", icon: Users2 },
] as const;

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; st?: string }> }) {
  const { tab, q, st } = await searchParams;
  const active = TABS.some((t) => t.key === tab) ? tab! : "staff";
  const counts = countAccountsByRole();
  const staffList = listStaff();
  const base = "/dashboard/association/users";
  const kw = (q ?? "").trim();
  const stFilter = (["active", "pending", "rejected"] as const).find((s) => s === st);

  return (
    <AssociationShell title="用户管理" subtitle="平台四类用户的账号总览与启用/停用">
      <StatFilters
        items={TABS.map((t) => ({
          key: t.key,
          label: t.label,
          value: t.key === "staff" ? staffList.length : (counts[t.key] ?? 0),
          color: t.key === "staff" ? "text-brand" : t.key === "enterprise" ? "text-cat-build" : t.key === "individual" ? "text-cat-design" : "text-cat-decor",
          href: `${base}?tab=${t.key}`,
          active: active === t.key,
        }))}
      />

      {active === "staff" ? (
        <div className="rounded-2xl border border-border bg-background overflow-hidden">
          <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Crown className="h-4 w-4" /> 协会工作人员 · {staffList.length} 人 <span className="text-[12px] text-muted-foreground font-normal">· 入库可管理</span></div>
          <div className="hidden md:grid grid-cols-[1.3fr_1.1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
            <span>姓名</span><span>角色</span><span>手机号</span><span className="text-right">状态</span>
          </div>
          <ul className="divide-y divide-border">
            {staffList.map((s) => (
              <li key={s.id}>
                <Link href={`${base}/staff/${s.id}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.3fr_1.1fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                  <span className="min-w-0 inline-flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-brand-50 text-brand inline-flex items-center justify-center shrink-0 font-semibold">{s.name.slice(0, 1)}</span>
                    <span className="min-w-0">
                      <span className="font-medium truncate block">{s.name}</span>
                      <span className="md:hidden text-[11px] text-muted-foreground">{STAFF_ROLE[s.staffRole] ?? s.staffRole} · {mask(s.phone)}</span>
                    </span>
                  </span>
                  <span className="hidden md:block"><Badge tone={STAFF_TONE[s.staffRole] ?? "neutral"}>{STAFF_ROLE[s.staffRole] ?? s.staffRole}</Badge></span>
                  <span className="hidden md:block text-muted-foreground tabular-nums">{mask(s.phone)}</span>
                  <span className="inline-flex items-center gap-2 justify-end shrink-0">
                    <Badge tone={s.status === "active" ? "tea" : "decor"}>{s.status === "active" ? "正常" : "已停用"}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一行进入详情启用 / 停用;登录密码为各自手机号后 6 位。平台超级管理员账号写死源码、不在此处管理。</div>
        </div>
      ) : (
        (() => {
          const allList = listAccounts(active as "enterprise" | "individual" | "customer");
          const list = allList.filter((a) =>
            (!kw || (a.name || "").includes(kw) || a.phone.includes(kw))
            && (!stFilter || a.status === stFilter));
          const stChips: { k: string; label: string }[] = [
            { k: "", label: "全部" }, { k: "active", label: "正常" }, { k: "pending", label: "审核中" }, { k: "rejected", label: "已停用" },
          ];
          const qs = (extra: Record<string, string>) => {
            const p = new URLSearchParams({ tab: active, ...(kw ? { q: kw } : {}), ...(stFilter ? { st: stFilter } : {}), ...extra });
            for (const [k, v] of [...p.entries()]) if (!v) p.delete(k);
            return `${base}?${p.toString()}`;
          };
          return (
            <div className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                <div className="text-[14px] font-semibold inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> {TABS.find((t) => t.key === active)!.label} · {list.length}{kw || stFilter ? ` / ${allList.length}` : ""} 个账号</div>
                <form action={base} className="flex items-center gap-2">
                  <input type="hidden" name="tab" value={active} />
                  {stFilter && <input type="hidden" name="st" value={stFilter} />}
                  <input name="q" defaultValue={kw} placeholder="搜姓名 / 手机号" className="h-8 w-40 rounded-full border border-border bg-background px-3 text-[12px] outline-none focus:border-foreground/30" />
                  <button className="h-8 px-3 rounded-full bg-foreground text-background text-[12px]">搜索</button>
                </form>
              </div>
              <div className="px-5 py-2.5 border-b border-border flex items-center gap-1.5 flex-wrap">
                {stChips.map((c) => (
                  <a key={c.k} href={qs({ st: c.k })} className={`h-7 px-3 rounded-full text-[12px] inline-flex items-center border ${((stFilter ?? "") === c.k) ? "bg-foreground text-background border-foreground" : "bg-background text-muted-foreground border-border hover:bg-surface"}`}>{c.label}</a>
                ))}
              </div>
              {list.length === 0 ? (
                <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">
                  {(kw || stFilter) ? "没有匹配的账号,换个搜索词或筛选条件试试。" : active === "customer" ? "业主为 C 端短信验证码登录,登录后在此显示;入会/下单也会绑定账号。" : "暂无账号。会员入会审核通过后在此显示。"}
                </div>
              ) : (
                <>
                  <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-border text-[11px] text-muted-foreground tracking-wider">
                    <span>姓名</span><span>手机号</span><span>会员档案</span><span>注册时间</span><span className="text-right">状态</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {list.map((a) => (
                      <li key={a.phone}>
                        <Link href={`/dashboard/association/users/${encodeURIComponent(a.phone)}`} className="grid grid-cols-[1fr_auto] md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 text-[13px] hover:bg-surface transition-colors active:scale-[0.99]">
                          <span className="font-medium truncate inline-flex items-center gap-2 min-w-0">
                            <span className="h-8 w-8 rounded-lg bg-surface inline-flex items-center justify-center shrink-0 font-semibold md:hidden">{(a.name || "?").slice(0, 1)}</span>
                            <span className="truncate">{a.name || "(未填名称)"}</span>
                          </span>
                          <span className="hidden md:block text-muted-foreground tabular-nums">{mask(a.phone)}</span>
                          <span className="hidden md:block text-muted-foreground truncate">{a.memberRef || "—"}</span>
                          <span className="hidden md:block text-muted-foreground">{fmt(a.createdAt)}</span>
                          <span className="inline-flex items-center gap-2 justify-end shrink-0">
                            <Badge tone={ST_TONE[a.status]}>{ST_LABEL[a.status]}</Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="px-5 py-3 text-[12px] text-muted-foreground border-t border-border">点击任一行进入详情页进行启用 / 停用等操作;入会申请的审核在「会员审核」处理。</div>
            </div>
          );
        })()
      )}
    </AssociationShell>
  );
}
