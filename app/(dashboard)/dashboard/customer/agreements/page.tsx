import Link from "next/link";
import { FileText, Download, ShieldCheck, ChevronRight, Clock, Eye, AlertCircle } from "lucide-react";
import { CustomerShell } from "@/components/dashboard/customer-shell";
import { Badge } from "@/components/ui/badge";
import { signaturesByUser, getTemplate, AGREEMENT_SIGNATURES } from "@/lib/data/agreements";
import { RevokeButton } from "@/components/agreements/revoke-button";

export const metadata = { title: "我的协议 · 信阳市建筑装饰装修协会" };

export default function CustomerAgreements() {
  // 演示：使用刘女士的 C00284 签署记录
  const sigs = signaturesByUser("customer", "C00284");
  const all = sigs.length ? sigs : AGREEMENT_SIGNATURES.filter((s) => s.signerType === "customer");

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

      {/* 撤回授权说明 */}
      <div className="mt-6 rounded-2xl bg-foreground text-background p-5">
        <FileText className="h-5 w-5 text-accent-yellow" />
        <div className="mt-2 text-[13px] font-semibold">想撤回某项授权？</div>
        <p className="mt-1 text-[11px] text-background/70 leading-5">
          PIPL 赋予您"随时撤回同意"的权利。撤回后协会将在 7 日内删除非法定保留信息。
          有些撤回会影响账户继续使用（如撤回"实名授权"将无法继续投保），请谨慎操作。
        </p>
        <Link href="#" className="mt-3 inline-flex items-center gap-1 h-9 px-4 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium">
          管理授权
        </Link>
      </div>
    </CustomerShell>
  );
}
