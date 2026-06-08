import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getEnterprises } from "@/lib/data/enterprises-source";
import { listOrdersByCustomer, type OrderStage } from "@/lib/data/orders-source";

export const metadata = { title: "我的项目 · 信阳市建筑装饰装修协会" };

const STAGE_LABEL: Record<OrderStage, string> = {
  signed: "已签约", planning: "施工准备", "in-progress": "施工中", accepted: "已竣工验收",
};
const STAGE_TONE: Record<OrderStage, "yellow" | "brand" | "decor" | "tea"> = {
  signed: "yellow", planning: "brand", "in-progress": "decor", accepted: "tea",
};

export default async function CustomerProjects() {
  const session = await getSession();
  if (!session || session.role !== "customer") redirect("/login?role=customer");
  const orders = listOrdersByCustomer(session.phone);

  if (orders.length === 0) {
    return (
      <CustomerShell title="我的项目" subtitle="还没有进行中的装修项目">
        <div className="rounded-3xl border border-border bg-background p-6 text-center">
          <div className="text-[16px] font-semibold tracking-tight">还没有进行中的装修项目</div>
          <p className="text-[13px] text-muted-foreground mt-1.5 leading-6 max-w-sm mx-auto">发布需求或用 AI 估价匹配协会认证企业，签约建单后这里会显示施工进度、收款与验收。</p>
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            <Link href="/ai/decor" className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-accent-yellow" /> AI 估价</Link>
            <Link href="/members" className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface">找企业</Link>
          </div>
        </div>
      </CustomerShell>
    );
  }

  const ents = await getEnterprises();
  const entName = (id: string) => ents.find((e) => e.id === id || e.slug === id)?.name ?? "协会会员企业";
  const inProgress = orders.filter((o) => o.stage === "in-progress").length;
  const doneCount = orders.filter((o) => o.stage === "accepted").length;

  return (
    <CustomerShell title="我的项目" subtitle={`${orders.length} 个项目 · 施工中 ${inProgress} · 已竣工 ${doneCount}`}>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-3xl border border-border bg-background p-5 relative overflow-hidden">
            <span className={`absolute left-0 top-0 h-1 w-full ${o.stage === "accepted" ? "bg-accent-tea" : o.stage === "in-progress" ? "bg-cat-decor" : "bg-accent-yellow"}`} />
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge tone={STAGE_TONE[o.stage]}>{STAGE_LABEL[o.stage]}</Badge>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"><ShieldCheck className="h-3 w-3" /> 协会认证企业</span>
              <code className="ml-auto text-[10px] font-mono text-muted-foreground">{o.code}</code>
            </div>
            <div className="text-[16px] font-semibold tracking-tight">{o.scope || o.type}{o.area ? ` · ${o.area}` : ""}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{entName(o.enterpriseId)}{o.amount ? ` · 合同 ${(o.amount / 10000).toLocaleString()} 万` : ""}</div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">施工进度</span>
                <span className="font-semibold tabular-nums shrink-0">{o.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${o.stage === "accepted" ? "bg-accent-tea" : "bg-cat-decor"}`} style={{ width: `${o.progress}%` }} />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground inline-flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> 已收款 {o.receivedPct}%</span>
              <Link href="/ai/mediate" className="inline-flex items-center gap-1 text-brand font-medium shrink-0">有纠纷？申请调解 <ChevronRight className="h-3.5 w-3.5" /></Link>
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
