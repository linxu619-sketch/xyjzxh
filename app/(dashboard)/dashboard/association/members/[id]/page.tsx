import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, FileImage } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getApplication } from "@/lib/data/applications";
import { reviewApplicationAction } from "../actions";

export const metadata = { title: "入会申请详情 · 协会工作台" };

const TYPE_LABEL: Record<string, string> = { enterprise: "企业会员", individual: "个人会员", customer: "业主" };
const FIELD_LABEL: Record<string, string> = {
  entName: "企业全称", creditCode: "统一社会信用代码", entType: "企业类型", subdomain: "期望子域名",
  contactName: "联系人", contactPhone: "联系电话", region: "主营地区",
  realName: "姓名", profession: "专业 / 工种", phone: "手机号", idcard: "身份证号", years: "从业年限",
  nickname: "称呼", city: "城市", intents: "意向",
};
const HIDE = new Set(["smsCode"]);

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = getApplication(Number(id));

  if (!app) {
    return (
      <AssociationShell title="入会申请详情">
        <Link href="/dashboard/association/members" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该申请（可能已处理）。</div>
      </AssociationShell>
    );
  }

  // 基本信息（已知字段）与上传材料（其余键＝向导上传的文件名）分开展示
  const basic = Object.entries(app.payload).filter(([k, v]) => k in FIELD_LABEL && !HIDE.has(k) && String(v).trim());
  const materials = Object.entries(app.payload).filter(([k, v]) => !(k in FIELD_LABEL) && !HIDE.has(k) && String(v).trim());
  const statusTone = app.status === "approved" ? "tea" : app.status === "rejected" ? "decor" : "yellow";
  const statusLabel = app.status === "approved" ? "已通过" : app.status === "rejected" ? "已驳回" : "待审核";

  return (
    <AssociationShell title="入会申请详情" subtitle={`${app.applicant} · ${TYPE_LABEL[app.type] ?? app.type}`}>
      <Link href="/dashboard/association/members" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-semibold">{app.applicant}</span>
            <Badge tone={app.type === "enterprise" ? "build" : app.type === "individual" ? "design" : "decor"}>{TYPE_LABEL[app.type] ?? app.type}</Badge>
          </div>
          <Badge tone={statusTone}>{statusLabel}</Badge>
        </div>

        <dl className="divide-y divide-border">
          <Row k="申请编号" v={`#${app.id}`} />
          <Row k="申请时间" v={fmtTime(app.createdAt)} />
          <Row k="联系电话" v={app.phone} />
          {basic.map(([k, v]) => <Row key={k} k={FIELD_LABEL[k] ?? k} v={String(v)} />)}
        </dl>

        {materials.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="text-[13px] font-semibold text-muted-foreground mb-3">上传材料</div>
            <div className="space-y-3">
              {materials.map(([k, v]) => (
                <div key={k}>
                  <div className="text-[12px] text-muted-foreground mb-1.5">{k}</div>
                  <div className="flex flex-wrap gap-2">
                    {String(v).split(/[；;]/).map((f) => f.trim()).filter(Boolean).map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-border text-[12px]">
                        <FileImage className="h-3.5 w-3.5 text-cat-design shrink-0" />{f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {app.status === "pending" ? (
        <div className="mt-5 flex items-center gap-3">
          <form action={reviewApplicationAction}>
            <input type="hidden" name="id" value={app.id} />
            <input type="hidden" name="act" value="approve" />
            <button className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 通过并入册</button>
          </form>
          <form action={reviewApplicationAction}>
            <input type="hidden" name="id" value={app.id} />
            <input type="hidden" name="act" value="reject" />
            <button className="h-11 px-6 rounded-full border border-cat-decor/40 text-cat-decor text-[14px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button>
          </form>
        </div>
      ) : (
        <div className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent-tea" /> 该申请已{statusLabel}。</div>
      )}
    </AssociationShell>
  );
}

function fmtTime(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4 text-[14px]">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right break-all">{v || "—"}</dd>
    </div>
  );
}
