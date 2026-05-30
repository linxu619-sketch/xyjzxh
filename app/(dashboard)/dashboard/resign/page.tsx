import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, AlertCircle, ShieldCheck, ChevronRight, GitCompare } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { AGREEMENT_TEMPLATES } from "@/lib/data/agreements";

export const metadata = { title: "待重签协议 · 信阳市建筑装修协会" };

// 演示数据：3 份待重签
const DEMO_PENDING = [
  {
    templateCode: "CUST-PRIVACY",
    previousVersion: "1.0.0",
    newVersion: "1.1.0",
    reason: "version_changed" as const,
    daysLeft: 12,
    changelog: "增加跨境传输章节 · 明确 AI 对话脱敏算法 · 缩短数据保留期",
  },
  {
    templateCode: "CUST-AI-CONSENT",
    previousVersion: "0.9.0",
    newVersion: "1.0.0",
    reason: "new_user" as const,
    daysLeft: 30,
    changelog: "全新协议 · 首次明确 Anthropic Claude (美国) 跨境传输方案",
  },
];

export default async function ResignPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = DEMO_PENDING.map((p) => {
    const tpl = AGREEMENT_TEMPLATES.find((t) => t.code === p.templateCode);
    return { ...p, template: tpl };
  }).filter((x) => x.template);

  return (
    <Container className="py-6 md:py-12 max-w-3xl pb-28 md:pb-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回工作台
      </Link>

      <div className="flex items-center gap-2 mb-3">
        <Badge tone="decor"><AlertCircle className="h-3 w-3 mr-1 inline" />重签必须</Badge>
        <Badge tone="brand">PIPL · 法规升级</Badge>
      </div>

      <h1 className="text-[24px] md:text-[40px] font-semibold tracking-tight leading-tight">
        {items.length} 份协议待重签
      </h1>
      <p className="mt-2 text-[13px] md:text-[14px] text-muted-foreground max-w-2xl leading-6">
        协议有重要变更或法规升级，需要您重新阅读并签字。
        未在期限内重签的协议会暂停对应服务；连续 30 天不处理可能导致账号锁定。
      </p>

      {/* 提醒 */}
      <div className="mt-5 rounded-2xl bg-cat-decor-soft p-4 flex items-start gap-3 text-[12px] text-cat-decor">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="leading-5">
          重签符合 PIPL 第 15 条 · 您可在签署前比对新旧版本差异，确认后再签字。
          老版本签署记录将保留为 <b>superseded</b> 状态，供监管 / 司法查证。
        </div>
      </div>

      {/* 待签列表 */}
      <div className="mt-6 space-y-4">
        {items.map((p, i) => {
          const tpl = p.template!;
          const urgent = p.daysLeft <= 7;
          return (
            <div key={i} className="rounded-3xl border border-border bg-background overflow-hidden">
              <div className={`px-5 py-3 flex items-center gap-2 ${urgent ? "bg-cat-decor-soft" : "bg-surface"}`}>
                <FileText className={`h-4 w-4 ${urgent ? "text-cat-decor" : "text-cat-build"}`} />
                <div className="text-[13px] font-semibold flex-1 truncate">{tpl.title}</div>
                <Badge tone={urgent ? "decor" : "yellow"}>
                  {urgent ? "🔥 " : ""}剩 {p.daysLeft} 天
                </Badge>
              </div>

              {/* 版本对比 */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 text-[12px] mb-3">
                  <span className="inline-flex items-center gap-1 line-through text-muted-foreground">
                    <code className="font-mono">v{p.previousVersion}</code>
                    <span>您之前签的</span>
                  </span>
                  <GitCompare className="h-3 w-3 text-muted-foreground" />
                  <span className="inline-flex items-center gap-1">
                    <code className="font-mono text-brand">v{p.newVersion}</code>
                    <span className="text-brand font-semibold">新版本</span>
                  </span>
                </div>

                <div className="rounded-2xl bg-[#fff6d6] p-3 border border-accent-yellow/30">
                  <div className="text-[11px] font-semibold text-[#a37200] mb-1 tracking-wider uppercase">
                    📝 本次变更
                  </div>
                  <div className="text-[13px] leading-6 text-foreground">{p.changelog}</div>
                </div>

                {/* 重点变更条款 */}
                <div className="mt-4">
                  <div className="text-[11px] text-muted-foreground tracking-wider uppercase mb-2">
                    新增 / 修改的重点条款
                  </div>
                  <ul className="space-y-2">
                    {tpl.highlights.map((h, j) => (
                      <li key={j} className="rounded-xl bg-cat-decor-soft/50 p-3 text-[12px] flex gap-2">
                        <span className="text-cat-decor font-semibold tabular-nums shrink-0">{j + 1}.</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/register/agreements?role=${session.role}&resign=${tpl.code}`}
                  className="mt-5 inline-flex w-full items-center justify-center gap-1.5 h-12 rounded-full bg-foreground text-background text-[13px] font-medium active:scale-[0.99] transition-transform"
                >
                  立即阅读并重签 <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 跳过 */}
      <div className="mt-6 text-center">
        <Link href="/dashboard" className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          稍后处理（可能影响服务）
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </Container>
  );
}
