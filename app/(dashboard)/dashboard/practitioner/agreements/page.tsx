import Link from "next/link";
import { Download, ShieldCheck, ChevronRight, Clock, Eye, AlertCircle } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { allAgreementsFor, AGREEMENT_SIGNATURES, getTemplate } from "@/lib/data/agreements";
import { RevokeButton } from "@/components/agreements/revoke-button";

export const metadata = { title: "我的协议 · 从业者门户" };

export default function PractitionerAgreements() {
  const templates = allAgreementsFor("practitioner");
  // 演示：所有必签认为已签 (P-2024-00284)
  const sigsAll = templates.filter((t) => t.required).map((t, i) => ({
    id: `SIG-DEMO-${i + 1}`,
    templateId: t.id,
    templateCode: t.code,
    templateVersion: t.version,
    contentHash: `sha256:${t.code.toLowerCase()}...`,
    signedAt: "2024-08-12 10:38:42",
    readSeconds: 65,
    scrollCompletionPct: 100,
    signingIp: "117.158.***.***",
  }));

  return (
    <PractitionerShell
      title="我的协议"
      subtitle={`${sigsAll.length} 份已签 · ${templates.length - sigsAll.length} 份可选`}
    >
      <div className="rounded-2xl bg-[#e6f7f1] p-4 mb-4 flex items-start gap-2.5 text-[12px] text-accent-tea">
        <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="leading-5">
          所有协议均含 <b>内容哈希</b> + <b>时间戳</b> + <b>设备指纹</b>，作为司法举证依据。
        </div>
      </div>

      <h2 className="text-[13px] font-semibold tracking-tight mb-2 px-1">已签协议</h2>
      <div className="space-y-3 mb-6">
        {sigsAll.map((s) => {
          const t = getTemplate(s.templateId);
          if (!t) return null;
          return (
            <div key={s.id} className="rounded-3xl border border-border bg-background p-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge tone="design">{t.category}</Badge>
                <Badge tone="tea">v{s.templateVersion}</Badge>
                {t.requiresSeparateConsent && <Badge tone="decor">PIPL 单独同意</Badge>}
                <code className="ml-auto text-[10px] font-mono text-muted-foreground">{s.id}</code>
              </div>
              <h3 className="text-[14px] font-semibold leading-5">{t.title}</h3>
              <div className="mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground grid grid-cols-2 gap-2">
                <div className="inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {s.signedAt}</div>
                <div className="inline-flex items-center gap-1"><Eye className="h-2.5 w-2.5" /> 读 {s.readSeconds}s · 100%</div>
                <div className="col-span-2 font-mono text-[10px] truncate">{s.contentHash}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 h-10 rounded-full bg-foreground text-background text-[12px] font-medium inline-flex items-center justify-center gap-1.5">
                  <Download className="h-3.5 w-3.5" /> 下载 PDF
                </button>
                <Link href={`/legal/agreement/${t.code}`} className="h-10 px-4 rounded-full border border-border text-[12px] inline-flex items-center justify-center gap-1">
                  原文 <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 可选未签 */}
      {templates.filter((t) => !t.required).length > 0 && (
        <>
          <h2 className="text-[13px] font-semibold tracking-tight mb-2 px-1">可选授权</h2>
          <div className="space-y-3">
            {templates.filter((t) => !t.required).map((t) => (
              <div key={t.id} className="rounded-3xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone="design">{t.category}</Badge>
                  <Badge tone="neutral">未签</Badge>
                </div>
                <h3 className="text-[14px] font-semibold leading-5">{t.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-4">
                  {t.highlights[0]}
                </p>
                <button className="mt-3 h-10 px-5 rounded-full bg-foreground text-background text-[12px] font-medium">
                  立即签署
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* AGREEMENT_SIGNATURES unused but imported for type — silence  */}
      {AGREEMENT_SIGNATURES.length === -1 && null}
    </PractitionerShell>
  );
}
