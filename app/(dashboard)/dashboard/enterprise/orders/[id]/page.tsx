import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, ShieldCheck, ExternalLink, Sparkles, FileText, ArrowRight,
  CheckCircle2, AlertCircle, Clock, Camera, ListChecks, BadgeCheck,
  Wallet, Pencil, GitPullRequest, FileSignature, Users2, Calendar,
  Upload, MessageSquareText,
} from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrder, STAGE_META, RESPONSIBILITY_LABEL } from "@/lib/data/orders";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { h: "#overview",   l: "概览",        icon: ListChecks },
  { h: "#parties",    l: "责任人",      icon: Users2 },
  { h: "#contract",   l: "合同 / 报价", icon: FileSignature },
  { h: "#schedule",   l: "进度计划",    icon: Calendar },
  { h: "#progress",   l: "实时跟踪",    icon: Camera },
  { h: "#acceptance", l: "分步验收",    icon: BadgeCheck },
  { h: "#payment",    l: "收款",       icon: Wallet },
  { h: "#changes",    l: "变更记录",    icon: GitPullRequest },
  { h: "#documents",  l: "文档库",     icon: FileText },
];

export default async function OrderWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = getOrder(id);
  if (!o) return <PlaceholderWorkspace id={id} />;

  return (
    <EnterpriseShell
      title={`订单工作台 · ${o.id}`}
      subtitle={`${o.customerName} · ${o.inquiry.address} · ${o.inquiry.area}㎡ · ¥${((o.contract?.amount ?? 0) / 10000).toFixed(1)} 万`}
      actions={
        <>
          <Link href={`/projects/${o.reportId}`} target="_blank" className="h-9 px-4 rounded-full bg-surface text-[13px] font-medium inline-flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> 关联报备
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Badge tone={STAGE_META[o.stage].tone as "brand"}>{STAGE_META[o.stage].label}</Badge>
        </>
      }
    >
      <Link href="/dashboard/enterprise/orders" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回订单列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-6">
        {/* anchor 左栏 */}
        <nav className="sticky top-16 self-start space-y-0.5 text-[13px] hidden lg:block">
          {SECTIONS.map((s) => {
            const Ic = s.icon;
            return (
              <a key={s.h} href={s.h} className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground">
                <Ic className="h-3.5 w-3.5" /> {s.l}
              </a>
            );
          })}
        </nav>

        <div className="space-y-6 min-w-0">
          {/* 概览 */}
          <section id="overview" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Stat label="合同金额" value={`¥${((o.contract?.amount ?? 0) / 10000).toFixed(1)}万`} sub={`${o.inquiry.area}㎡`} />
              <Stat label="施工进度" value={`${calcProgress(o.schedule)}%`} sub={o.schedule.find((t) => t.status === "进行中")?.phase ?? "—"} color="decor" />
              <Stat label="已收款" value={`¥${(o.payments.filter((p) => p.paidAt).reduce((a, p) => a + p.amount, 0) / 10000).toFixed(1)}万`} sub={`${Math.round((o.payments.filter((p) => p.paidAt).reduce((a, p) => a + p.amount, 0) / (o.contract?.amount ?? 1)) * 100)}%`} color="tea" />
              <Stat label="待办" value={String((o.acceptance.filter((a) => a.status === "ready").length) + (o.changeOrders.filter((c) => c.status === "pending").length))} sub="验收 + 变更" color="design" />
            </div>

            {/* 阶段时间轴 */}
            <div className="rounded-2xl bg-surface p-5">
              <div className="text-[12px] text-muted-foreground mb-3 tracking-wider uppercase">订单生命周期</div>
              <ol className="flex items-center gap-1 overflow-x-auto pb-2">
                {(["inquiry","quoted","signed","planning","in-progress","accepted","after-sales"] as const).map((s, i, arr) => {
                  const currentIdx = arr.indexOf(o.stage);
                  const passed = i <= currentIdx;
                  const active = i === currentIdx;
                  return (
                    <li key={s} className="flex items-center gap-1 shrink-0">
                      <span className={cn(
                        "h-7 w-7 rounded-full inline-flex items-center justify-center text-[11px] font-semibold",
                        passed ? "bg-foreground text-background" : "bg-background text-muted-foreground border border-border",
                        active && "ring-4 ring-foreground/15",
                      )}>
                        {passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </span>
                      <span className={cn("text-[11px]", passed ? "font-medium" : "text-muted-foreground")}>
                        {STAGE_META[s].label}
                      </span>
                      {i < arr.length - 1 && <span className={cn("h-px w-4", passed ? "bg-foreground" : "bg-border")} />}
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-5 rounded-2xl bg-foreground text-background p-5 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent-yellow mt-0.5 shrink-0" />
              <div className="text-[12px] leading-5 flex-1">
                <b>AI 小经建议：</b> 1 项验收待业主到场（防水）· 1 单变更待业主审批（CO-002）· 木工阶段距开工还有 3 天，提示采购部下料。
              </div>
              <Link href="/ai/biz" className="text-[11px] underline text-accent-yellow">展开</Link>
            </div>
          </section>

          {/* 客户 + 责任人 */}
          <section id="parties" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <H2 title="客户与责任人" desc="协会要求每个订单 6 个责任人到岗签字，变更时全部责任人同步通知" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 rounded-2xl bg-cat-decor text-white p-5 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/15" />
                <div className="relative text-[11px] tracking-wider uppercase text-white/70">业主</div>
                <div className="relative mt-1 text-[22px] font-semibold">{o.customerName}</div>
                <div className="relative mt-0.5 text-[12px] text-white/80">{o.customerPhone}</div>
                <div className="relative mt-4 text-[11px] text-white/80">
                  {o.inquiry.address} · {o.inquiry.area}㎡<br />
                  期望开工 {o.inquiry.expectedStart}
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                {o.responsibilities.map((r) => (
                  <div key={r.role} className="rounded-2xl border border-border p-4">
                    <div className="text-[11px] text-muted-foreground">{RESPONSIBILITY_LABEL[r.role]}</div>
                    <div className="mt-1 text-[14px] font-semibold flex items-center gap-1.5">
                      {r.name}
                      {r.confirmedAt && <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" />}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{r.phone}</div>
                    {r.confirmedAt ? (
                      <div className="mt-2 text-[10px] text-accent-tea">已确认 · {r.confirmedAt}</div>
                    ) : (
                      <button className="mt-2 inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-cat-decor text-white text-[10px]">指派 · 待确认</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 合同 / 报价 */}
          <section id="contract" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <H2 title="合同与报价" desc={o.contract ? `${o.contract.no} · ${o.contract.eSignProvider} · 已签 ${o.contract.signedAt}` : "尚未签约"} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[14px] font-semibold">合同主体</div>
                  <Badge tone="tea"><ShieldCheck className="h-3 w-3 mr-1 inline" />双方已签</Badge>
                </div>
                <ul className="space-y-2 text-[13px]">
                  <KV k="合同编号" v={o.contract?.no ?? "—"} />
                  <KV k="电子签平台" v={o.contract?.eSignProvider ?? "—"} />
                  <KV k="签订时间" v={o.contract?.signedAt ?? "—"} />
                  <KV k="合同金额" v={`¥${((o.contract?.amount ?? 0) / 10000).toFixed(2)} 万`} />
                  <KV k="工期" v={`${o.schedule[0]?.startDate} → ${o.schedule.at(-1)?.endDate}`} />
                </ul>
                <div className="mt-4 flex gap-2">
                  <button className="h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center gap-1.5">
                    <FileText className="h-3 w-3" /> 查看合同 PDF
                  </button>
                  <button className="h-9 px-4 rounded-full border border-border text-[12px] inline-flex items-center gap-1.5">
                    <Pencil className="h-3 w-3" /> 起草补充协议
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[14px] font-semibold">报价单</div>
                  <button className="text-[12px] text-brand">编辑</button>
                </div>
                <ul className="divide-y divide-border">
                  {o.quote?.items.map((it, i) => (
                    <li key={i} className="py-2 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium">{it.name}</div>
                        <div className="text-[11px] text-muted-foreground">{it.qty} {it.unit} × ¥{it.price.toLocaleString()}</div>
                      </div>
                      <div className="font-semibold text-[13px]">¥{(it.qty * it.price).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-[12px] text-muted-foreground">含税总价</div>
                  <div className="text-[18px] font-semibold">¥{(o.quote?.amount ?? 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>

          {/* 进度计划 */}
          <section id="schedule" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <H2
              title="进度计划"
              desc="按阶段拆分任务 · 责任人 · 工期；可拖拽（demo 暂未启用）"
              action={<Button size="sm" variant="outline">从模板套用</Button>}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-[12px] min-w-[860px]">
                <thead className="text-[11px] text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium w-12">#</th>
                    <th className="text-left px-3 py-2 font-medium">阶段</th>
                    <th className="text-left px-3 py-2 font-medium">任务</th>
                    <th className="text-left px-3 py-2 font-medium">责任人</th>
                    <th className="text-left px-3 py-2 font-medium">工期</th>
                    <th className="text-left px-3 py-2 font-medium w-48">进度</th>
                    <th className="text-left px-3 py-2 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {o.schedule.map((t, i) => (
                    <tr key={t.id}>
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2"><Badge tone={phaseTone(t.phase)}>{t.phase}</Badge></td>
                      <td className="px-3 py-2 font-medium">{t.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{t.responsibleName}</td>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground">{t.startDate}<br />{t.endDate}</td>
                      <td className="px-3 py-2">
                        <div className="h-1.5 rounded-full bg-surface w-full max-w-[160px]">
                          <div className={cn("h-full rounded-full", t.progress === 100 ? "bg-accent-tea" : "bg-cat-decor")} style={{ width: `${t.progress}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-2"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 实时跟踪 */}
          <section id="progress" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <H2
              title="实时跟踪 / 施工日志"
              desc={`${o.dailyLogs.length} 条日志 · ${o.dailyLogs.reduce((a, l) => a + l.photos, 0)} 张现场照`}
              action={<Button size="sm" variant="secondary"><Upload className="h-3 w-3" /> 上传日报</Button>}
            />

            <div className="space-y-3">
              {o.dailyLogs.map((l) => (
                <div key={l.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge tone={phaseTone(l.phase)}>{l.phase}</Badge>
                    <span className="text-[12px] font-medium">{l.date}</span>
                    <span className="text-[11px] text-muted-foreground">天气 {l.weather} · {l.workers} 工 · 记录 {l.loggedBy}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-cat-design">
                      <Camera className="h-3 w-3" /> {l.photos} 张
                    </span>
                  </div>
                  <p className="text-[13px] leading-6 text-foreground">{l.content}</p>
                  {/* 图片 placeholder */}
                  <div className="mt-3 flex gap-1.5 overflow-x-auto">
                    {Array.from({ length: Math.min(6, l.photos) }).map((_, i) => (
                      <div key={i} className="aspect-square w-14 rounded-lg bg-gradient-to-br from-surface to-surface-2 shrink-0" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 分步验收 */}
          <section id="acceptance" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <H2 title="分步验收" desc="每个里程碑业主电子签确认 · 协会监理可一票否决" />

            <div className="space-y-3">
              {o.acceptance.map((a) => (
                <div key={a.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={cn(
                      "h-7 w-7 rounded-full inline-flex items-center justify-center text-white",
                      a.status === "approved" ? "bg-accent-tea" :
                      a.status === "ready" ? "bg-cat-decor" :
                      a.status === "rejected" ? "bg-cat-decor" : "bg-muted/40",
                    )}>
                      {a.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" />
                      : a.status === "ready" ? <AlertCircle className="h-3.5 w-3.5" />
                      : <Clock className="h-3.5 w-3.5" />}
                    </span>
                    <div className="text-[14px] font-semibold flex-1">{a.name}</div>
                    <Badge tone={a.status === "approved" ? "tea" : a.status === "ready" ? "decor" : "neutral"}>
                      {a.status === "approved" ? "已通过" : a.status === "ready" ? "待业主到场" : a.status === "pending" ? "待开始" : "已拒绝"}
                    </Badge>
                  </div>
                  <div className="text-[12px] text-muted-foreground ml-9">
                    {a.acceptedAt ? `${a.acceptedAt} · ${a.acceptedBy}` : `计划于 ${a.scheduledAt}`}
                    {a.customerSignature && <span className="ml-2 text-accent-tea">{a.customerSignature}</span>}
                  </div>
                  {a.notes && <p className="text-[12px] text-muted-foreground mt-1.5 ml-9 italic">"{a.notes}"</p>}
                  {a.status === "ready" && (
                    <div className="mt-3 ml-9 flex gap-2">
                      <button className="h-8 px-3 rounded-full bg-foreground text-background text-[12px]">推送给业主</button>
                      <button className="h-8 px-3 rounded-full border border-border text-[12px]">本企业先签</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 收款 */}
          <section id="payment" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <H2 title="收款确认" desc="按合同分期 · 业主端确认 · 协会监管账户托管（可选）" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {o.payments.map((p) => (
                <div key={p.id} className={cn(
                  "rounded-2xl p-5",
                  p.paidAt ? "bg-[#e6f7f1] border border-accent-tea/30" : "border border-border bg-background",
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px] font-semibold">{p.stage}</div>
                    <Badge tone={p.paidAt ? "tea" : "yellow"}>{p.paidAt ? "已确认" : "待收款"}</Badge>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[28px] font-semibold tracking-tight">¥{p.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground text-[12px]">{p.pct}%</span>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    应收：{p.due}
                    {p.paidAt && (<> · 已收 {p.paidAt} · {p.method}</>)}
                  </div>
                  {!p.paidAt && (
                    <button className="mt-3 h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">
                      生成收款单 → 推业主
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 变更记录 */}
          <section id="changes" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <H2
              title="变更记录"
              desc="任何工艺 / 材料 / 工期变更都留痕 · 多角色审批 · 可作为调解证据"
              action={<Button size="sm" variant="secondary"><Pencil className="h-3 w-3" /> 新建变更</Button>}
            />

            <div className="space-y-3">
              {o.changeOrders.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <code className="text-[11px] font-mono">{c.no}</code>
                    <Badge tone="design">{c.category}</Badge>
                    <Badge tone={c.status === "approved" ? "tea" : c.status === "pending" ? "yellow" : "decor"}>
                      {c.status === "approved" ? "已通过" : c.status === "pending" ? "审批中" : "已驳回"}
                    </Badge>
                    <span className="ml-auto text-[11px] text-muted-foreground">{c.submittedAt} · {c.submittedBy}</span>
                  </div>
                  <p className="text-[13px] leading-6">{c.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-[12px]">
                    <span className={cn("font-medium", c.costDelta > 0 ? "text-cat-decor" : c.costDelta < 0 ? "text-accent-tea" : "text-muted-foreground")}>
                      费用 {c.costDelta >= 0 ? "+" : ""}¥{c.costDelta.toLocaleString()}
                    </span>
                    <span className={cn("font-medium", c.timeDelta > 0 ? "text-cat-decor" : c.timeDelta < 0 ? "text-accent-tea" : "text-muted-foreground")}>
                      工期 {c.timeDelta >= 0 ? "+" : ""}{c.timeDelta} 天
                    </span>
                    <span className="text-muted-foreground">· {c.attachments} 附件</span>
                  </div>
                  {/* 审批链 */}
                  <ol className="mt-3 flex items-center gap-1 flex-wrap">
                    {c.approverChain.map((a, i) => (
                      <li key={i} className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px]">
                        {a.result === "approved" ? <CheckCircle2 className="h-3 w-3 text-accent-tea" /> :
                         a.result === "rejected" ? <AlertCircle className="h-3 w-3 text-cat-decor" /> :
                         <Clock className="h-3 w-3 text-muted-foreground" />}
                        <span>{a.role}</span>
                        <span className="text-muted-foreground">· {a.name}</span>
                        {a.at && <span className="text-muted-foreground">· {a.at}</span>}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          {/* 文档库 */}
          <section id="documents" className="rounded-3xl border border-border bg-background p-6 md:p-8">
            <H2
              title="文档库"
              desc={`${o.documents.length} 份 · 全部加密对象存储 · 协会平台 5 年备查`}
              action={<Button size="sm" variant="secondary"><Upload className="h-3 w-3" /> 上传</Button>}
            />

            <div className="rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {o.documents.map((d) => (
                <div key={d.id} className="px-5 py-3 flex items-center gap-3 hover:bg-surface/60">
                  <span className="h-9 w-9 rounded-lg bg-surface inline-flex items-center justify-center text-cat-build shrink-0">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{d.type} · {d.size} · 上传：{d.uploadedAt} · {d.uploadedBy}</div>
                  </div>
                  <button className="text-[12px] text-brand font-medium">下载</button>
                </div>
              ))}
            </div>
          </section>

          {/* 协作 footer */}
          <div className="rounded-3xl bg-foreground text-background p-6 flex items-center gap-4">
            <MessageSquareText className="h-6 w-6 text-accent-yellow shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold">业主端实时同步</div>
              <div className="text-[11px] text-background/70">同一订单业主可在「我的项目 → {o.id}」看到上述全部内容，关键节点电子签名</div>
            </div>
            <Link href={`/dashboard/customer/projects/${o.id}`} target="_blank" className="inline-flex items-center gap-1 text-[12px] text-accent-yellow">
              业主预览 <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}

function calcProgress(schedule: { progress: number }[]) {
  if (schedule.length === 0) return 0;
  return Math.round(schedule.reduce((a, t) => a + t.progress, 0) / schedule.length);
}

function phaseTone(phase: string): "build" | "decor" | "design" | "tea" | "yellow" | "brand" {
  switch (phase) {
    case "拆改": return "yellow";
    case "水电": return "brand";
    case "泥木": return "decor";
    case "油漆": return "design";
    case "安装": return "tea";
    case "软装":
    case "竣工": return "tea";
    default: return "build";
  }
}

function statusTone(s: string): "tea" | "decor" | "yellow" | "neutral" {
  return s === "已完成" ? "tea" : s === "进行中" ? "decor" : s === "已延期" ? "yellow" : "neutral";
}

function Stat({ label, value, sub, color = "build" }: { label: string; value: string; sub?: string; color?: "build" | "decor" | "design" | "tea" }) {
  const COLOR: Record<string, string> = {
    build: "text-cat-build", decor: "text-cat-decor", design: "text-cat-design", tea: "text-accent-tea",
  };
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{label}</div>
      <div className={`mt-1 text-[24px] font-semibold tracking-tight ${COLOR[color]}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function H2({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-5 flex-col md:flex-row md:items-end">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
        {desc && <div className="mt-1 text-[12px] text-muted-foreground">{desc}</div>}
      </div>
      {action}
    </div>
  );
}

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </li>
  );
}

function PlaceholderWorkspace({ id }: { id: string }) {
  return (
    <EnterpriseShell title={`订单工作台 · ${id}`} subtitle="该订单暂无完整数据，可参考演示订单 ORD-2026-0512">
      <Link href="/dashboard/enterprise/orders" className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回订单列表
      </Link>
      <div className="rounded-3xl border border-dashed border-border bg-background p-16 text-center">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
        <div className="mt-4 text-[14px] font-medium">此订单尚未完整初始化</div>
        <div className="mt-2 text-[12px] text-muted-foreground">演示阶段仅 <code className="font-mono">ORD-2026-0512</code> 有完整工作台数据。</div>
        <Link href="/dashboard/enterprise/orders/ORD-2026-0512" className="mt-6 inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium">
          查看示例订单
        </Link>
      </div>
    </EnterpriseShell>
  );
}
