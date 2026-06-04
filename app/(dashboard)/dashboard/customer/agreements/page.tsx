import Link from "next/link";
import { FileText, Download, ShieldCheck, ChevronRight, Clock, Eye } from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { signaturesByUser, getTemplate, allAgreementsFor } from "@/lib/data/agreements";
import { RevokeButton } from "@/components/agreements/revoke-button";

export const metadata = { title: "我的协议 · 信阳市建筑装饰装修协会" };

export default async function CustomerAgreements() {
  const session = await getSession();
  // 仅本人签署记录（按登录账号），不再回退展示他人记录
  const all = session ? signaturesByUser("customer", session.uid) : [];
  const myAuths = allAgreementsFor("customer");

  return (
    <CustomerShell
      title="我的协议"
      subtitle={`${all.length} 份已签 · 全部协会平台留痕 · 可下载 PDF`}
    >
      <div className="rounded-2xl bg-[#e6f7f1] p-4 mb-4 flex items-start gap-2.5 text-[12px] text-accent-tea">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="leading-5">
          签署记录含 <b>内容哈希</b> + <b>时间戳</b> + <b>设备指纹</b>，符合《电子签名法》第 13 条可靠电子签名要件，可作司法举证。
        </div>
      </div>

      <div className="space-y-3">
        {all.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-background p-10 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
            <div className="text-[13px] text-muted-foreground">你还没有签署任何协议。<br />下单、投保或申请调解时签署的协议会在这里留痕，可随时下载 PDF。</div>
          </div>
        )}
        {all.map((s) => {
          const t = getTemplate(s.templateId);
          if (!t) return null;
          return (
            <div key={s.id} className="rounded-3xl border border-border bg-background p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge tone="brand">{t.category}</Badge>
                <Badge tone="tea">v{s.templateVersion}</Badge>
                {t.requiresSeparateConsent && (
                  <Badge tone="decor">PIPL · 单独同意</Badge>
                )}
                <code className="ml-auto text-[10px] font-mono text-muted-foreground">{s.id}</code>
              </div>
              <h3 className="text-[15px] font-semibold leading-5">{t.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">{t.draftedBy}{t.approvedBy && ` · 批准：${t.approvedBy}`}</p>

              <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px]">
                <div className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" /> {s.signedAt}
                </div>
                <div className="inline-flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-2.5 w-2.5" /> 阅读 {s.readSeconds}s · 滚动 {s.scrollCompletionPct}%
                </div>
                <div className="col-span-2 text-[10px] text-muted-foreground font-mono truncate">
                  {s.contentHash} · IP {s.signingIp}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button className="flex-1 h-10 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center justify-center gap-1.5">
                  <Download className="h-3.5 w-3.5" /> 下载签署 PDF
                </button>
                <Link href={`/legal/agreement/${t.code}`} className="h-10 px-4 rounded-full border border-border text-[12px] inline-flex items-center justify-center gap-1">
                  查看原文 <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 我的授权 · PIPL 随时撤回 */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-[14px] font-semibold inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-accent-tea" /> 我的授权 · 可随时撤回</h2>
          <span className="text-[11px] text-muted-foreground">依据 PIPL 第 15 条</span>
        </div>
        <div className="rounded-3xl border border-border bg-background divide-y divide-border overflow-hidden">
          {myAuths.map((t) => (
            <div key={t.id} className="px-4 py-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium flex items-center gap-1.5 flex-wrap">
                  {t.title}
                  {t.requiresSeparateConsent && <Badge tone="decor" className="!text-[9px] !px-1.5">PIPL 单独同意</Badge>}
                  {t.required && <Badge tone="brand" className="!text-[9px] !px-1.5">必签</Badge>}
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{t.category} · v{t.version}</div>
              </div>
              <RevokeButton templateId={t.id} templateTitle={t.title} />
            </div>
          ))}
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted-foreground leading-5">
          撤回后协会将在 7 日内删除非法定保留信息;部分撤回会影响账户继续使用(如撤回「实名授权」将无法继续投保/理赔),请谨慎操作。撤回会实时通知协会。
        </p>
      </div>
    </CustomerShell>
  );
}
