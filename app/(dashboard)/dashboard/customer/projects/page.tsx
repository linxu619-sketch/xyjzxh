import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, ShieldCheck, Sparkles, ArrowUpRight, Hammer } from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { listLeadsForCustomer } from "@/lib/data/leads";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { ORDER_DEMO } from "@/lib/data/orders";

export const metadata = { title: "我的项目 · 信阳市建筑装饰装修协会" };

export default async function CustomerProjects() {
  const session = await getSession();
  if (!session || session.role !== "customer") redirect("/login?role=customer");
  const signed = listLeadsForCustomer(session.uid, session.phone).filter((l) => l.status === "signed");

  // 无已签约项目：引导开始装修（不展示不属于本人的项目）
  if (signed.length === 0) {
    return (
      <CustomerShell title="我的项目" subtitle="还没有进行中的装修项目">
        <div className="rounded-3xl border border-border bg-background p-6 text-center">
          <div className="text-[16px] font-semibold tracking-tight">还没有进行中的装修项目</div>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-6 max-w-sm mx-auto">发布需求或用 AI 估价匹配协会认证企业，签约后这里会显示你的项目。</p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <Link href="/ai/decor" className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-accent-yellow" /> AI 估价</Link>
            <Link href="/members" className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface">找企业</Link>
            <Link href={`/dashboard/customer/projects/${ORDER_DEMO.id}`} className="h-10 px-3 rounded-full text-[12px] text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">查看装修管理演示 <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </CustomerShell>
    );
  }

  const ents = await getEnterprises();
  const entName = (id: string) => ents.find((e) => e.id === id || e.slug === id)?.name ?? "协会会员企业";

  return (
    <CustomerShell title="我的项目" subtitle={`${signed.length} 个已签约项目`}>
      <div className="rounded-2xl border border-cat-build/30 bg-cat-build-soft text-cat-build px-4 py-2.5 text-[12px] mb-4 flex items-center gap-2">
        <Hammer className="h-4 w-4 shrink-0" /> 以下是你已签约的项目；施工进度 / 验收 / 付款的实时同步功能即将上线。
      </div>

      <div className="space-y-3">
        {signed.map((l) => (
          <div key={l.id} className="rounded-3xl border border-border bg-background p-5 relative overflow-hidden">
            <span className="absolute left-0 top-0 h-1 w-full bg-accent-tea" />
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge tone="tea">已签约</Badge>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"><ShieldCheck className="h-3 w-3" /> 协会认证企业</span>
              <code className="ml-auto text-[10px] font-mono text-muted-foreground">需求 #{l.id}</code>
            </div>
            <div className="text-[16px] font-semibold tracking-tight">{l.type || "装修项目"}{l.area ? ` · ${l.area}㎡` : ""}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{entName(l.enterpriseId)}{l.budget ? ` · 预算 ${l.budget} 万` : ""}</div>
            {(l.address || l.style) && (
              <div className="text-[11px] text-muted-foreground mt-1.5">{[l.style, l.address].filter(Boolean).join(" · ")}</div>
            )}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">有施工纠纷？可向协会申请调解</span>
              <Link href="/mediate" className="inline-flex items-center gap-1 text-brand font-medium shrink-0">申请调解 <ChevronRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>
        ))}
      </div>

      <Link href="/ai/decor" className="mt-6 block rounded-3xl bg-foreground text-background p-5 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent-yellow" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">还要再装一套？AI 小装根据预算挑 3 家</div>
            <div className="text-[11px] text-background/70 mt-0.5">30 秒生成方案 + 估价</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </CustomerShell>
  );
}
