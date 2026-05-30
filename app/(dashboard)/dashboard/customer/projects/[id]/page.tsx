import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, Phone, MessageSquareText, CheckCircle2,
  AlertCircle, Clock, Camera, FileText, GitPullRequest, Wallet, Sparkles,
  ChevronRight,
} from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { getOrder, STAGE_META } from "@/lib/data/orders";
import { cn } from "@/lib/cn";

export default async function CustomerProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = getOrder(id);
  if (!o) notFound();

  const progress = Math.round(o.schedule.reduce((a, t) => a + t.progress, 0) / o.schedule.length);
  const received = o.payments.filter((p) => p.paidAt).reduce((a, p) => a + p.amount, 0);
  const pendingAcc = o.acceptance.filter((a) => a.status === "ready");
  const pendingChg = o.changeOrders.filter((c) => c.status === "pending" && c.approverChain.find((x) => x.role === "业主" && !x.result));
  const pendingPay = o.payments.filter((p) => !p.paidAt && new Date(p.due) <= new Date("2026-06-30"));

  return (
    <CustomerShell showHeader={false}>
      {/* hero */}
      <div className="-mx-5 sm:-mx-8 lg:-mx-12 bg-foreground text-background pt-6 pb-8 px-5 sm:px-8 lg:px-12 mb-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-decor/30 blur-3xl" />
        <Link href="/dashboard/customer/projects" className="inline-flex items-center gap-1.5 text-[12px] text-background/70 hover:text-background">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回我的项目
        </Link>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge tone={STAGE_META[o.stage].tone as "brand"}>{STAGE_META[o.stage].label}</Badge>
          <code className="text-[10px] font-mono text-background/60">{o.id}</code>
          <span className="inline-flex items-center gap-1 text-[10px] text-accent-yellow ml-auto">
            <ShieldCheck className="h-3 w-3" /> 协会保护中
          </span>
        </div>
        <h1 className="mt-3 text-[24px] md:text-[28px] font-semibold tracking-tight leading-tight">
          {o.inquiry.address}
        </h1>
        <div className="mt-1 text-[12px] text-background/70">{o.enterpriseName} · {o.inquiry.area}㎡ · {o.inquiry.style}</div>

        <div className="mt-5 flex items-center justify-between text-[11px]">
          <span className="text-background/70">总进度</span>
          <span className="font-semibold">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-white/15">
          <div className="h-full rounded-full bg-cat-decor" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Mini label="合同" value={`¥${((o.contract?.amount ?? 0) / 10000).toFixed(1)}万`} />
          <Mini label="已付" value={`¥${(received / 10000).toFixed(1)}万`} />
          <Mini label="结余" value={`¥${(((o.contract?.amount ?? 0) - received) / 10000).toFixed(1)}万`} />
        </div>
      </div>

      {/* sticky anchor 导航 */}
      <nav className="sticky top-0 z-30 -mx-5 sm:-mx-8 lg:-mx-12 px-5 sm:px-8 lg:px-12 py-2 bg-surface/90 backdrop-blur-xl border-b border-border mb-4">
        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "schedule",   l: "进度",  count: pendingAcc.length + pendingChg.length + pendingPay.length, hot: true },
            { id: "acceptance", l: "验收",  count: pendingAcc.length },
            { id: "payment",    l: "付款",  count: pendingPay.length },
            { id: "changes",    l: "变更",  count: pendingChg.length },
            { id: "documents",  l: "文档" },
            { id: "team",       l: "团队" },
          ].map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-background border border-border text-[12px] active:bg-surface transition-colors"
            >
              {s.l}
              {s.count && s.count > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-cat-decor text-white text-[9px] font-semibold">{s.count}</span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* 待办横幅 */}
      {(pendingAcc.length + pendingChg.length + pendingPay.length) > 0 && (
        <section className="rounded-3xl border border-cat-decor/30 bg-cat-decor-soft p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-cat-decor" />
            <div className="text-[13px] font-semibold text-cat-decor">您有 {pendingAcc.length + pendingChg.length + pendingPay.length} 项待处理</div>
          </div>
          <ul className="space-y-1.5 text-[12px]">
            {pendingAcc.map((a) => (
              <li key={a.id} className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-cat-decor" />
                <span className="flex-1">验收：{a.name}</span>
                <span className="text-muted-foreground">{a.scheduledAt}</span>
              </li>
            ))}
            {pendingChg.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <GitPullRequest className="h-3 w-3 text-cat-decor" />
                <span className="flex-1">变更：{c.description.slice(0, 24)}…</span>
              </li>
            ))}
            {pendingPay.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <Wallet className="h-3 w-3 text-cat-decor" />
                <span className="flex-1">付款：{p.stage}</span>
                <span className="font-medium">¥{p.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 责任人 */}
      <section id="team" className="scroll-mt-20 rounded-3xl bg-background border border-border p-5 mb-4">
        <div className="text-[12px] text-muted-foreground tracking-wider uppercase mb-3">您的服务团队</div>
        <ul className="space-y-2.5">
          {o.responsibilities.filter((r) => r.confirmedAt).map((r) => (
            <li key={r.role} className="flex items-center gap-3">
              <span className="h-9 w-9 rounded-full bg-surface inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{r.name.slice(0, 1)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">{r.name} <span className="text-muted-foreground font-normal text-[11px]">· {RESPONSIBILITY_LABEL(r.role)}</span></div>
                <div className="text-[11px] text-muted-foreground">{r.phone}</div>
              </div>
              <a href={`tel:${r.phone.replace(/\D/g, "")}`} className="h-8 w-8 rounded-full bg-foreground text-background inline-flex items-center justify-center" title="拨打">
                <Phone className="h-3.5 w-3.5" />
              </a>
              <button className="h-8 w-8 rounded-full bg-surface inline-flex items-center justify-center" title="消息">
                <MessageSquareText className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 阶段进度 */}
      <section id="schedule" className="scroll-mt-20 rounded-3xl bg-background border border-border p-5 mb-4">
        <Header title="阶段进度" />
        <ol className="space-y-3">
          {o.schedule.map((t) => (
            <li key={t.id} className="flex items-start gap-3">
              <span className={cn(
                "h-7 w-7 rounded-full inline-flex items-center justify-center text-[11px] font-semibold shrink-0",
                t.status === "已完成" ? "bg-accent-tea text-white" :
                t.status === "进行中" ? "bg-cat-decor text-white" : "bg-surface text-muted-foreground",
              )}>
                {t.status === "已完成" ? <CheckCircle2 className="h-3.5 w-3.5" /> : t.status === "进行中" ? <Clock className="h-3.5 w-3.5" /> : "○"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">{t.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {t.phase} · {t.responsibleName} · {t.startDate} → {t.endDate}
                </div>
                {t.progress > 0 && t.progress < 100 && (
                  <div className="mt-1.5 h-1 rounded-full bg-surface w-full">
                    <div className="h-full rounded-full bg-cat-decor" style={{ width: `${t.progress}%` }} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 最近现场 */}
      <section id="progress" className="scroll-mt-20 rounded-3xl bg-background border border-border p-5 mb-4">
        <Header title="最近现场" sub={`${o.dailyLogs.length} 篇日志`} />
        <div className="space-y-3">
          {o.dailyLogs.slice(0, 3).map((l) => (
            <div key={l.id} className="rounded-2xl bg-surface p-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge tone="decor">{l.phase}</Badge>
                <span className="text-[11px] font-medium">{l.date}</span>
                <span className="ml-auto text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                  <Camera className="h-3 w-3" /> {l.photos}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground line-clamp-2 leading-5">{l.content}</p>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: Math.min(4, l.photos) }).map((_, i) => (
                  <div key={i} className="aspect-square w-12 rounded-md bg-gradient-to-br from-background to-surface-2" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full h-10 rounded-full bg-surface text-[12px]">查看全部日志</button>
      </section>

      {/* 分步验收 */}
      <section id="acceptance" className="scroll-mt-20 rounded-3xl bg-background border border-border p-5 mb-4">
        <Header title="分步验收" sub="点击「我已确认」即在协会平台留下电子签名" />
        <div className="space-y-2.5">
          {o.acceptance.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "h-6 w-6 rounded-full inline-flex items-center justify-center text-white shrink-0",
                  a.status === "approved" ? "bg-accent-tea" :
                  a.status === "ready" ? "bg-cat-decor" : "bg-muted/40",
                )}>
                  {a.status === "approved" ? <CheckCircle2 className="h-3 w-3" /> :
                   a.status === "ready" ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </span>
                <div className="text-[13px] font-semibold flex-1">{a.name}</div>
                <Badge tone={a.status === "approved" ? "tea" : a.status === "ready" ? "decor" : "neutral"} className="!text-[10px]">
                  {a.status === "approved" ? "已通过" : a.status === "ready" ? "请确认" : "未开始"}
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground ml-8">
                {a.acceptedAt ? `${a.acceptedAt}` : `计划 ${a.scheduledAt}`}
              </div>
              {a.status === "ready" && (
                <div className="mt-3 ml-8 flex gap-2">
                  <button className="flex-1 h-9 rounded-full bg-accent-tea text-white text-[12px] font-medium inline-flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 我已确认通过
                  </button>
                  <button className="h-9 px-3 rounded-full border border-cat-decor text-cat-decor text-[12px] font-medium">
                    问题反馈
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 收款 */}
      <section id="payment" className="scroll-mt-20 rounded-3xl bg-background border border-border p-5 mb-4">
        <Header title="付款进度" sub={`已付 ${o.payments.filter((p) => p.paidAt).length} / ${o.payments.length} 期`} />
        <div className="space-y-2.5">
          {o.payments.map((p) => (
            <div key={p.id} className={cn(
              "rounded-2xl p-4 flex items-center gap-3",
              p.paidAt ? "bg-[#e6f7f1]" : "border border-border",
            )}>
              <div className="flex-1">
                <div className="text-[13px] font-semibold">{p.stage}</div>
                <div className="text-[11px] text-muted-foreground">
                  {p.paidAt ? `${p.paidAt} · ${p.method}` : `${p.due} 到期`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-semibold">¥{p.amount.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">{p.pct}% · {p.paidAt ? <span className="text-accent-tea">已付</span> : <span className="text-cat-decor">未付</span>}</div>
              </div>
            </div>
          ))}
        </div>
        {pendingPay.length > 0 && (
          <button className="mt-3 w-full h-11 rounded-full bg-foreground text-background text-[13px] font-medium">
            一键付款（接收企业账号）
          </button>
        )}
      </section>

      {/* 变更 */}
      <section id="changes" className="scroll-mt-20 rounded-3xl bg-background border border-border p-5 mb-4">
        <Header title="变更与审批" sub={`${o.changeOrders.length} 起变更`} />
        <div className="space-y-2.5">
          {o.changeOrders.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[10px] font-mono">{c.no}</code>
                <Badge tone="design">{c.category}</Badge>
                <Badge tone={c.status === "approved" ? "tea" : c.status === "pending" ? "yellow" : "decor"}>
                  {c.status === "approved" ? "已通过" : c.status === "pending" ? "待我审批" : "已驳回"}
                </Badge>
              </div>
              <p className="text-[12px] leading-5 mt-1">{c.description}</p>
              <div className="mt-2 flex items-center gap-3 text-[11px]">
                <span className={c.costDelta > 0 ? "text-cat-decor font-medium" : "text-accent-tea font-medium"}>
                  费用 {c.costDelta >= 0 ? "+" : ""}¥{c.costDelta.toLocaleString()}
                </span>
                <span className={c.timeDelta > 0 ? "text-cat-decor" : "text-muted-foreground"}>
                  工期 {c.timeDelta >= 0 ? "+" : ""}{c.timeDelta} 天
                </span>
              </div>
              {c.status === "pending" && c.approverChain.find((x) => x.role === "业主" && !x.result) && (
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 h-9 rounded-full bg-accent-tea text-white text-[12px] font-medium">同意</button>
                  <button className="flex-1 h-9 rounded-full border border-cat-decor text-cat-decor text-[12px] font-medium">不同意</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 文档 */}
      <section id="documents" className="scroll-mt-20 rounded-3xl bg-background border border-border p-5 mb-4">
        <Header title="项目文档" sub={`${o.documents.length} 份`} />
        <ul className="divide-y divide-border">
          {o.documents.map((d) => (
            <li key={d.id} className="py-3 flex items-center gap-3">
              <FileText className="h-4 w-4 text-cat-build shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate">{d.name}</div>
                <div className="text-[10px] text-muted-foreground">{d.type} · {d.size}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </section>

      {/* AI 入口 */}
      <Link href="/ai/mediate" className="block rounded-3xl bg-foreground text-background p-5 mb-2 active:scale-[0.99] transition-transform">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-accent-yellow" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">有问题？AI 小和 7×24 在线</div>
            <div className="text-[11px] text-background/70 mt-0.5">问题升级 → 协会调解 14 天内介入</div>
          </div>
          <ChevronRight className="h-4 w-4" />
        </div>
      </Link>
    </CustomerShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-2.5">
      <div className="text-[10px] text-background/60">{label}</div>
      <div className="text-[14px] font-semibold mt-0.5">{value}</div>
    </div>
  );
}

function Header({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function RESPONSIBILITY_LABEL(role: string): string {
  const M: Record<string, string> = {
    owner: "签约负责人", project_manager: "项目经理", designer: "主案设计师",
    site_supervisor: "现场监理", customer_service: "客户经理", after_sales: "维保负责人",
  };
  return M[role] ?? role;
}
