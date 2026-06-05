import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight, ShieldCheck, Search, Sparkles, AlertCircle, Camera, Wallet, ArrowUpRight,
} from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listLeadsForCustomer } from "@/lib/data/leads";
import { ORDER_DEMO } from "@/lib/data/orders";

export const metadata = { title: "我的项目 · 信阳市建筑装饰装修协会" };

type CustomerProject = {
  id: string; name: string; enterprise: string;
  status: "施工中" | "已竣工" | "纠纷处理中" | "签约中";
  progress: number; step: string; insured: boolean;
  color: "decor" | "tea" | "yellow"; total: string; next: string;
  pending?: number; orderId?: string;
};

const PROJECTS: CustomerProject[] = [
  { id: "P-2026-0501", name: "金茂悦府 1602", enterprise: "名家装饰", status: "施工中",
    progress: 42, step: "水电验收通过", insured: true, color: "decor", total: "32 万",
    next: "瓦工进场 · 6 月 2 日", pending: 3, orderId: "ORD-2026-0512" },
  { id: "P-2025-1142", name: "弦山街老房翻新", enterprise: "万家美装饰", status: "已竣工",
    progress: 100, step: "已交付 · 在质保期", insured: true, color: "tea", total: "16 万",
    next: "5 年质保 · 至 2030-12" },
  { id: "P-2025-0782", name: "茶都商务 22F", enterprise: "壹品装饰", status: "纠纷处理中",
    progress: 78, step: "材料争议待调解", insured: true, color: "decor", total: "32 万",
    next: "协会调解 · 6 月 11 日", pending: 1 },
];

const STATUS_TONE = { 施工中: "decor", 已竣工: "tea", "纠纷处理中": "decor", 签约中: "yellow" } as const;

const TABS = [
  { key: "all", label: "全部" },
  { key: "in", label: "施工中" },
  { key: "done", label: "已竣工" },
  { key: "dispute", label: "调解" },
];

export default async function CustomerProjects() {
  const session = await getSession();
  if (!session || session.role !== "customer") redirect("/login?role=customer");
  const hasProject = listLeadsForCustomer(session.uid, session.phone).some((l) => l.status === "signed");

  // 无进行中项目：引导开始装修（不展示不属于本人的项目）
  if (!hasProject) {
    return (
      <CustomerShell title="我的项目" subtitle="还没有进行中的装修项目">
        <div className="rounded-3xl border border-border bg-background p-6 text-center">
          <div className="text-[16px] font-semibold tracking-tight">还没有进行中的装修项目</div>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-6 max-w-sm mx-auto">发布需求或用 AI 估价匹配协会认证企业，签约后这里会显示施工进度、验收与付款。</p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <Link href="/ai/decor" className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-accent-yellow" /> AI 估价</Link>
            <Link href="/members" className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface">找企业</Link>
            <Link href={`/dashboard/customer/projects/${ORDER_DEMO.id}`} className="h-10 px-3 rounded-full text-[12px] text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">查看装修管理演示 <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </CustomerShell>
    );
  }

  const totalPending = PROJECTS.reduce((a, p) => a + (p.pending ?? 0), 0);
  return (
    <CustomerShell title="我的项目" subtitle={`${PROJECTS.length} 个项目 · ${totalPending} 项待办`}>
      {/* 演示数据提示 —— 真实排期系统接入前，以下项目为演示 */}
      <div className="rounded-2xl border border-cat-build/30 bg-cat-build-soft text-cat-build px-4 py-2.5 text-[12px] mb-4 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" /> 以下为施工管理演示数据，真实项目进度同步功能即将接入。
      </div>
      {/* 待办横幅 */}
      {totalPending > 0 && (
        <Link href="/dashboard/customer/projects/ORD-2026-0512" className="block rounded-3xl bg-gradient-to-br from-cat-decor to-[#e6531f] text-white p-4 mb-4 shadow-md active:scale-[0.99] transition-transform">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-white/20 inline-flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold">{totalPending} 项待您处理</div>
              <div className="text-[11px] text-white/80 mt-0.5">验收 / 变更 / 付款 · 实时同步</div>
            </div>
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      )}

      {/* 状态 tab */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t, i) => (
          <button key={t.key} className={`shrink-0 h-8 px-3.5 rounded-full text-[12px] font-medium border ${i === 0 ? "bg-foreground text-background border-foreground" : "bg-background border-border text-muted-foreground"}`}>
            {t.label}
            <span className={`ml-1 text-[10px] ${i === 0 ? "text-background/70" : "text-muted-foreground"}`}>
              {i === 0 ? PROJECTS.length : i === 1 ? 1 : i === 2 ? 1 : 1}
            </span>
          </button>
        ))}
      </div>

      {/* 搜索 */}
      <div className="rounded-2xl bg-background border border-border p-2.5 mb-3 flex items-center gap-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground ml-1.5 shrink-0" />
        <input placeholder="搜索小区 / 楼盘 / 企业" className="flex-1 bg-transparent outline-none text-[13px] py-1" />
      </div>

      {/* 项目卡片 */}
      <div className="space-y-3">
        {PROJECTS.map((p) => (
          <Link
            key={p.id}
            href={p.orderId ? `/dashboard/customer/projects/${p.orderId}` : `/projects/${p.id}`}
            className="block rounded-3xl border border-border bg-background p-5 active:scale-[0.99] transition-transform relative overflow-hidden"
          >
            {/* status accent bar */}
            <span className={`absolute left-0 top-0 h-1 w-full ${
              p.color === "tea" ? "bg-accent-tea" :
              p.color === "yellow" ? "bg-accent-yellow" : "bg-cat-decor"
            }`} />

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
              {p.insured && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-tea">
                  <ShieldCheck className="h-3 w-3" /> 已投保
                </span>
              )}
              {p.pending && p.pending > 0 && (
                <Badge tone="decor" className="!text-[10px]">{p.pending} 待办</Badge>
              )}
              <code className="ml-auto text-[10px] font-mono text-muted-foreground">{p.id}</code>
            </div>

            <div className="text-[16px] font-semibold tracking-tight">{p.name}</div>
            <div className="text-[12px] text-muted-foreground">{p.enterprise} · 合同 {p.total}</div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-muted-foreground line-clamp-1 pr-2">{p.step}</span>
                <span className="font-semibold tabular-nums shrink-0">{p.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${
                  p.color === "tea" ? "bg-accent-tea" :
                  p.color === "yellow" ? "bg-accent-yellow" : "bg-cat-decor"
                }`} style={{ width: `${p.progress}%` }} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground line-clamp-1 pr-2">{p.next}</span>
              <span className="inline-flex items-center gap-1 text-brand font-medium shrink-0">
                详情 <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* 快捷动作（仅施工中项目）*/}
            {p.status === "施工中" && p.orderId && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-[10px]">
                  <Camera className="h-2.5 w-2.5 text-cat-build" /> 现场 14
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-cat-decor-soft text-cat-decor px-2 py-1 text-[10px]">
                  <AlertCircle className="h-2.5 w-2.5" /> 防水验收待签
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#e6f7f1] text-accent-tea px-2 py-1 text-[10px]">
                  <Wallet className="h-2.5 w-2.5" /> 下期 ¥79,650
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <Link href="/ai/decor" className="mt-6 block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent-yellow" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">未签约？AI 小装根据预算挑 3 家</div>
            <div className="text-[11px] text-background/70 mt-0.5">30 秒生成方案 + 估价</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </CustomerShell>
  );
}
