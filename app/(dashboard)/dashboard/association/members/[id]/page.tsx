import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, BadgeCheck, ShieldAlert, Clock } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getApplication } from "@/lib/data/applications";
import { reviewApplicationAction, verifyIdentityAction } from "../actions";
import { Materials } from "./materials";
import { PrintBar, Letterhead, DocTable, SealFooter } from "@/components/print/print-doc";

export const metadata = { title: "入会申请审批 · 协会工作台" };

const TYPE_LABEL: Record<string, string> = { enterprise: "企业会员", individual: "个人会员", customer: "业主" };
const FIELD_LABEL: Record<string, string> = {
  entName: "企业全称", creditCode: "统一社会信用代码", entType: "企业类型", subdomain: "期望子域名",
  legalName: "法定代表人", legalIdcard: "法人身份证号",
  contactName: "联系人", contactPhone: "联系电话", region: "主营地区", entIntro: "公司简介",
  realName: "姓名", profession: "专业 / 工种", phone: "手机号", idcard: "身份证号", years: "从业年限", kind: "工种", bio: "个人简介",
  nickname: "称呼", city: "城市", intents: "意向",
};
const HIDE = new Set(["smsCode", "password"]);
// 已知的"上传材料"键（其值为文件名/URL，用图册展示）
const MATERIAL_KEYS = new Set(["营业执照", "身份证人像面", "身份证国徽面", "资质证书", "项目业绩", "资格证书", "代表作品"]);
// 各类型的实名关键信息字段 + 实名照片
const REALNAME_FIELDS: Record<string, string[]> = {
  enterprise: ["entName", "creditCode", "legalName", "legalIdcard"],
  individual: ["realName", "idcard"],
  customer: [],
};
const REALNAME_PHOTOS: Record<string, string[]> = {
  enterprise: ["营业执照", "身份证人像面", "身份证国徽面"],
  individual: ["身份证人像面", "身份证国徽面"],
  customer: [],
};

const VERIFY_META = {
  verified: { label: "已实名核验", tone: "tea" as const, icon: BadgeCheck },
  failed: { label: "实名核验未通过", tone: "decor" as const, icon: ShieldAlert },
  unverified: { label: "待实名核验", tone: "yellow" as const, icon: Clock },
};

function fmtTime(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fmtDay(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()} 年 ${p(d.getMonth() + 1)} 月 ${p(d.getDate())} 日`;
}

export default async function ApplicationDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const app = getApplication(Number(id));

  if (!app) {
    return (
      <AssociationShell title="入会申请详情">
        <Link href="/dashboard/association/members" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该申请（可能已处理）。</div>
      </AssociationShell>
    );
  }

  const payload = app.payload as Record<string, unknown>;
  const val = (k: string) => String(payload[k] ?? "").trim();
  const realnameKeys = REALNAME_FIELDS[app.type] ?? [];
  const realnamePhotoKeys = REALNAME_PHOTOS[app.type] ?? [];

  // 实名信息（关键字段）
  const realnameRows = realnameKeys.map((k) => [FIELD_LABEL[k] ?? k, val(k)] as const).filter(([, v]) => v);
  const realnamePhotos = realnamePhotoKeys
    .map((k) => ({ label: k, files: val(k).split(/[；;]/).map((f) => f.trim()).filter(Boolean) }))
    .filter((g) => g.files.length);

  // 基础资料：所有文本字段（排除实名字段、材料、隐藏项）；未知键也展示（key 作标签），确保信息完整
  const basicRows = Object.entries(payload)
    .filter(([k, v]) => !MATERIAL_KEYS.has(k) && !realnameKeys.includes(k) && !HIDE.has(k) && String(v).trim())
    .map(([k, v]) => [FIELD_LABEL[k] ?? k, String(v)] as const);

  // 其他材料（非实名照片的上传件）
  const otherMaterials = Object.entries(payload)
    .filter(([k, v]) => MATERIAL_KEYS.has(k) && !realnamePhotoKeys.includes(k) && String(v).trim())
    .map(([k, v]) => ({ label: k, files: String(v).split(/[；;]/).map((f) => f.trim()).filter(Boolean) }));

  const statusTone = app.status === "approved" ? "tea" : app.status === "rejected" ? "decor" : "yellow";
  const statusLabel = app.status === "approved" ? "已通过" : app.status === "rejected" ? "已驳回" : "待审核";
  const vm = VERIFY_META[app.idVerifyStatus] ?? VERIFY_META.unverified;
  const VIcon = vm.icon;

  // 业主(customer)无需实名核验；企业 / 个人会员必须「实名核验通过」后才能入册
  const needVerify = app.type !== "customer";
  const canApprove = !needVerify || app.idVerifyStatus === "verified";

  return (
    <AssociationShell title="入会申请审批" subtitle={`${app.applicant} · ${TYPE_LABEL[app.type] ?? app.type}`}>
      {/* 屏幕交互工作台（打印时隐藏） */}
      <div className="no-print">
      <Link href="/dashboard/association/members" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> 返回列表</Link>
      {app.type !== "customer" && <PrintBar hint="打印『入会申请审批表』A4，可直接打印或另存 PDF 存档。" />}

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-semibold">{app.applicant}</span>
            <Badge tone={app.type === "enterprise" ? "build" : app.type === "individual" ? "design" : "decor"}>{TYPE_LABEL[app.type] ?? app.type}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={vm.tone} className="inline-flex items-center gap-1"><VIcon className="h-3 w-3" />{vm.label}</Badge>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>
        </div>

        <dl className="divide-y divide-border">
          <Row k="申请编号" v={`#${app.id}`} />
          <Row k="申请时间" v={fmtTime(app.createdAt)} />
          <Row k="联系电话" v={app.phone} />
          {basicRows.map(([k, v]) => <Row key={k} k={k} v={v} />)}
        </dl>
      </div>

      {/* 实名信息（关键身份信息 + 证照 + 人工核验）*/}
      {app.type !== "customer" && (
        <div className="mt-5 rounded-2xl border border-brand/30 bg-brand-50/30 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/60 text-[14px] font-semibold inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand" /> 实名信息</div>
          {realnameRows.length > 0 ? (
            <dl className="divide-y divide-border/60">
              {realnameRows.map(([k, v]) => <Row key={k} k={k} v={v} />)}
            </dl>
          ) : (
            <div className="px-5 py-4 text-[13px] text-cat-decor">⚠ 该申请缺少实名关键字段（可能为旧数据），请联系申请人补充后再核验。</div>
          )}
          {realnamePhotos.length > 0 && <Materials groups={realnamePhotos} />}

          {/* 实名核验留痕 + 操作 */}
          <div className="px-5 py-4 border-t border-border/60">
            {app.idVerifyStatus !== "unverified" ? (
              <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5">
                <VIcon className={`h-3.5 w-3.5 ${app.idVerifyStatus === "verified" ? "text-accent-tea" : "text-cat-decor"}`} />
                {vm.label} · 核验人 {app.idVerifyBy || "—"} · {fmtTime(app.idVerifyAt)}
              </div>
            ) : (
              <div className="text-[12px] text-muted-foreground mb-3">请比对姓名 / 证件号与上传证照一致后核验。实名核验通过后再做入会审批。</div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <form action={verifyIdentityAction}>
                <input type="hidden" name="id" value={app.id} />
                <input type="hidden" name="status" value="verified" />
                <button className="h-10 px-5 rounded-full bg-brand text-white text-[13px] font-medium inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4" /> 实名核验通过</button>
              </form>
              <form action={verifyIdentityAction}>
                <input type="hidden" name="id" value={app.id} />
                <input type="hidden" name="status" value="failed" />
                <button className="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5"><ShieldAlert className="h-4 w-4" /> 核验不通过</button>
              </form>
              {app.idVerifyStatus !== "unverified" && (
                <form action={verifyIdentityAction}>
                  <input type="hidden" name="id" value={app.id} />
                  <input type="hidden" name="status" value="unverified" />
                  <button className="h-10 px-4 rounded-full text-[13px] text-muted-foreground hover:text-foreground">撤销核验</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 其他上传材料 */}
      {otherMaterials.length > 0 && (
        <div className="mt-5 rounded-2xl border border-border bg-background overflow-hidden">
          <Materials groups={otherMaterials} />
        </div>
      )}

      {/* 入会审批 */}
      {app.status === "pending" ? (
        <div className="mt-5">
          {!canApprove && (
            <div className="mb-3 text-[12px] text-cat-decor inline-flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              {app.idVerifyStatus === "failed"
                ? "实名核验未通过，不能通过并入册——请核实证照后改判「实名核验通过」，或驳回该申请。"
                : "请先完成「实名核验通过」，才能通过并入册。"}
            </div>
          )}
          {err === "verify" && (
            <div className="mb-3 text-[12px] text-cat-decor inline-flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 shrink-0" /> 该申请尚未实名核验通过，已拦截入册操作。</div>
          )}
          <div className="flex items-center gap-3">
            {canApprove ? (
              <form action={reviewApplicationAction}>
                <input type="hidden" name="id" value={app.id} />
                <input type="hidden" name="act" value="approve" />
                <button className="h-11 px-6 rounded-full bg-accent-tea text-white text-[14px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 通过并入册</button>
              </form>
            ) : (
              <button
                type="button"
                disabled
                title="实名核验通过后才能入册"
                className="h-11 px-6 rounded-full bg-accent-tea/40 text-white/80 text-[14px] font-medium inline-flex items-center gap-1.5 cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4" /> 通过并入册
              </button>
            )}
            <form action={reviewApplicationAction}>
              <input type="hidden" name="id" value={app.id} />
              <input type="hidden" name="act" value="reject" />
              <button className="h-11 px-6 rounded-full border border-cat-decor/40 text-cat-decor text-[14px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-4 w-4" /> 驳回</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground"><ShieldCheck className="h-4 w-4 text-accent-tea" /> 该申请已{statusLabel}。</div>
      )}
      </div>

      {/* A4 入会申请审批表（仅打印 / 另存 PDF） */}
      {app.type !== "customer" && (
        <div className="print-area print-only">
          <div className="a4-sheet">
            <Letterhead title="入会申请审批表" docNo={`XYJZ-RH-${String(app.id).padStart(4, "0")}`} date={fmtDay(app.createdAt)} />
            <DocTable
              rows={[
                { k: "会员类型", v: TYPE_LABEL[app.type] ?? app.type },
                { k: "申请人", v: app.applicant },
                { k: "联系电话", v: app.phone },
                ...realnameRows.map(([k, v]) => ({ k, v })),
                ...basicRows.filter(([k]) => k !== "申请编号" && k !== "申请时间").map(([k, v]) => ({ k, v })),
                { k: "实名核验", v: `${vm.label}${app.idVerifyBy ? ` · 核验人 ${app.idVerifyBy} · ${fmtTime(app.idVerifyAt)}` : ""}` },
                { k: "受理状态", v: statusLabel },
                { k: "申请时间", v: fmtTime(app.createdAt) },
              ]}
            />
            <div className="mt-4">
              <div className="text-[13px] font-medium mb-1.5">审批意见</div>
              <div className="border border-[#ccc] min-h-[64px] p-3 text-[13px] leading-7 text-muted-foreground">
                {app.status === "approved" ? "（材料齐全、实名核验通过，准予入会，已入册。）" : app.status === "rejected" ? "（不符合入会条件 / 材料不齐，未予通过，已告知申请人。）" : ""}
              </div>
            </div>
            <SealFooter
              date={app.reviewedAt ? fmtDay(app.reviewedAt) : undefined}
              lines={[
                { label: "实名核验", value: app.idVerifyBy ? `${app.idVerifyBy} · ${fmtDay(app.idVerifyAt)}` : undefined },
                { label: "审批经办", value: app.reviewedBy ? `${app.reviewedBy} · ${fmtDay(app.reviewedAt)}` : undefined },
                { label: "秘书长（签字）" },
                { label: "协会（盖章）" },
              ]}
            />
          </div>
        </div>
      )}
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4 text-[14px]">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right break-all">{v || "—"}</dd>
    </div>
  );
}
