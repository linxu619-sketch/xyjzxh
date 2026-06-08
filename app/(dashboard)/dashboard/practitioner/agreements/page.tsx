import Link from "next/link";
import { Download, ShieldCheck, ChevronRight, Clock, Eye, AlertCircle } from "lucide-react";
import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { Badge } from "@/components/ui/badge";
import { allAgreementsFor, getAgreementTemplate, signaturesByUser } from "@/lib/data/agreements-source";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "我的协议 · 从业者门户" };

export default async function PractitionerAgreements() {
  const session = await getSession();
  const templates = allAgreementsFor("practitioner");
  // 本人真实签署记录（agreement_signatures，按登录账号）
  const sigsAll = session ? signaturesByUser("practitioner", session.uid) : [];

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
      {sigsAll.length === 0 ? (
        <div className="rounded-3xl border border-border bg-background p-6 text-center text-[13px] text-muted-foreground mb-6">
          还没有已签协议。入会或在下方「可选授权」签署后，带哈希/时间戳的存证会出现在这里。
        </div>
      ) : (
      <div className="space-y-3 mb-6">
        {sigsAll.map((s) => {
          const t = getAgreementTemplate(s.templateId);
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
      )}

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

    </PractitionerShell>
  );
}
