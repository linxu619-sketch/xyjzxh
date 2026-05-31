import { Plus, Search, MoreHorizontal, Crown, ShieldCheck } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { FilterBar, DataTable } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "团队管理 · 企业工作台" };

type Member = {
  name: string; phone: string; role: "owner" | "admin" | "sales" | "site_manager" | "designer" | "finance" | "viewer";
  status: "active" | "locked" | "invited"; lastLogin: string; deals: number;
};

const ROLE_LABEL: Record<Member["role"], string> = {
  owner: "Owner", admin: "管理员", sales: "销售顾问", site_manager: "项目经理",
  designer: "设计师", finance: "财务", viewer: "查看者",
};

const ROLE_TONE: Record<Member["role"], "brand" | "build" | "decor" | "design" | "tea" | "yellow" | "neutral"> = {
  owner: "yellow", admin: "brand", sales: "decor", site_manager: "build",
  designer: "design", finance: "tea", viewer: "neutral",
};

const TEAM: Member[] = [
  { name: "张经理", phone: "138****1001", role: "owner",        status: "active", lastLogin: "刚刚",       deals: 18 },
  { name: "李顾问", phone: "138****1002", role: "sales",        status: "active", lastLogin: "5 分钟前",   deals: 24 },
  { name: "王经理", phone: "138****1003", role: "site_manager", status: "active", lastLogin: "1 小时前",   deals: 12 },
  { name: "张设计", phone: "138****1004", role: "designer",     status: "active", lastLogin: "20 分钟前",  deals: 16 },
  { name: "刘会计", phone: "138****1005", role: "finance",      status: "active", lastLogin: "今天 09:00",  deals: 0 },
  { name: "陈助理", phone: "138****1006", role: "admin",        status: "active", lastLogin: "今天 08:55",  deals: 0 },
  { name: "孙顾问", phone: "138****1007", role: "sales",        status: "locked", lastLogin: "5 月 12 日",  deals: 6 },
  { name: "周顾问", phone: "138****1008", role: "sales",        status: "invited",lastLogin: "—",         deals: 0 },
];

const STATUS_TONE: Record<Member["status"], "tea" | "decor" | "yellow"> = {
  active: "tea", locked: "decor", invited: "yellow",
};

const STATUS_LABEL: Record<Member["status"], string> = {
  active: "在职", locked: "已锁定", invited: "待激活",
};

export default function TeamPage() {
  return (
    <EnterpriseShell
      title="团队管理"
      subtitle={`成员 ${TEAM.length} 人 · 在职 ${TEAM.filter((m) => m.status === "active").length} · 待激活 ${TEAM.filter((m) => m.status === "invited").length}`}
      actions={
        <button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> 邀请成员
        </button>
      }
    >
      <FilterBar className="mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input placeholder="搜索成员姓名 / 手机号" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
        </div>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>角色：全部</option><option>管理员</option><option>销售</option><option>项目经理</option><option>设计师</option><option>财务</option>
        </select>
        <select className="h-9 rounded-full bg-surface text-[12px] px-3 border border-transparent">
          <option>状态：全部</option><option>在职</option><option>已锁定</option><option>待激活</option>
        </select>
      </FilterBar>

      <DataTable dropActionCol
        head={["成员", "手机", "角色", "签单(本月)", "最后登录", "状态", "操作"]}
        rows={TEAM.map((m) => [
          <div key="n" className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-full bg-foreground text-background inline-flex items-center justify-center text-[12px] font-semibold">{m.name.slice(0, 1)}</span>
            <div>
              <div className="font-medium flex items-center gap-1.5">{m.name}{m.role === "owner" && <Crown className="h-3 w-3 text-accent-yellow" />}</div>
            </div>
          </div>,
          <span key="p" className="text-muted-foreground">{m.phone}</span>,
          <Badge key="r" tone={ROLE_TONE[m.role]}>{ROLE_LABEL[m.role]}</Badge>,
          <span key="d" className="font-medium">{m.deals}</span>,
          <span key="l" className="text-[11px] text-muted-foreground">{m.lastLogin}</span>,
          <Badge key="s" tone={STATUS_TONE[m.status]}>{STATUS_LABEL[m.status]}</Badge>,
          <button key="o" className="h-8 w-8 rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>,
        ])}
      />

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-accent-tea mt-0.5 shrink-0" />
        <div className="text-[12px] text-muted-foreground leading-5">
          <b className="text-foreground">权限说明：</b> Owner 拥有全部权限；管理员可邀请成员、改子站、看全部数据；销售/项目经理/设计师只能看自己负责的线索与项目；财务可看金额相关。详见 协会 → 系统设置。
        </div>
      </div>
    </EnterpriseShell>
  );
}
