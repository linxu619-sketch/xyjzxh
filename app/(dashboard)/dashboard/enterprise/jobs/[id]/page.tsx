import Link from "next/link";
import {
  ArrowLeft, Users2, Phone, CheckCircle2, XCircle, RotateCcw, Pause, Play,
} from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getJob, listApplicationsByJob, type AppStatus } from "@/lib/data/jobs";
import { setJobStatusAction, reviewApplicantAction } from "../actions";

export const metadata = { title: "岗位详情 · 企业工作台" };

const APP_LABEL: Record<AppStatus, string> = { pending: "待处理", accepted: "已录用", rejected: "未通过" };
const APP_TONE: Record<AppStatus, "yellow" | "tea" | "neutral"> = { pending: "yellow", accepted: "tea", rejected: "neutral" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const job = getJob(Number(id));
  const owned = job && session?.enterpriseId && job.enterpriseId === session.enterpriseId;

  if (!job || !owned) {
    return (
      <EnterpriseShell title="岗位详情">
        <Link href="/dashboard/enterprise/jobs" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> 返回</Link>
        <div className="mt-6 rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">未找到该岗位，或它不属于本企业。</div>
      </EnterpriseShell>
    );
  }

  const apps = listApplicationsByJob(job.id);
  const isHire = job.type === "hire";
  const backHref = isHire ? "/dashboard/enterprise/recruit" : "/dashboard/enterprise/jobs";
  const backLabel = isHire ? "返回招聘岗位" : "返回用工派单";
  const unit = isHire ? "月" : "天";
  const payText = `¥${job.daily}${job.dailyMax && job.dailyMax > job.daily ? `-${job.dailyMax}` : ""} /${unit}`;
  const reqs = [
    (job.minAge || job.maxAge) ? `年龄 ${job.minAge ?? "不限"}-${job.maxAge ?? "不限"}` : "",
    job.minYears > 0 ? `经验 ≥${job.minYears} 年` : "",
    job.genderReq ? `限${job.genderReq}` : "",
    job.needCert ? "需持证" : "",
    isHire && job.edu ? `学历 ${job.edu}` : "",
  ].filter(Boolean).join(" · ") || "不限";

  return (
    <EnterpriseShell title="岗位详情" subtitle={`${job.title} · ${apps.length} 份投递`}>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> {backLabel}</Link>

      {/* 岗位信息 */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-semibold">{job.title}</span>
            {job.urgent && <Badge tone="decor">急招</Badge>}
            <Badge tone={job.status === "open" ? "tea" : "neutral"}>{job.status === "open" ? "在招" : "已结束"}</Badge>
          </div>
          <form action={setJobStatusAction}>
            <input type="hidden" name="id" value={job.id} />
            <input type="hidden" name="status" value={job.status === "open" ? "closed" : "open"} />
            <button className="h-9 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface">
              {job.status === "open" ? <><Pause className="h-3.5 w-3.5" /> 结束招聘</> : <><Play className="h-3.5 w-3.5" /> 重新开放</>}
            </button>
          </form>
        </div>
        <dl className="divide-y divide-border text-[14px]">
          <Row k={isHire ? "类型 / 职位" : "类型 / 工种"} v={`${isHire ? "招聘岗位（月薪）" : "用工派单（日薪）"} · ${job.kind}`} />
          <Row k={isHire ? "月薪 / 名额" : "日薪 / 名额"} v={`${payText} · ${job.openings} ${isHire ? "人" : "名额"}`} />
          <Row k={isHire ? "区域" : "区域 / 工期"} v={isHire ? (job.district || "—") : `${job.district || "—"} · ${job.duration || "—"}`} />
          <Row k="招工要求" v={reqs} />
          {!isHire && <Row k="工伤保障" v={job.insurance === "company" ? "企业承保 · 含工伤险（协会团险 5 元/天/人）" : "工人自理"} />}
          {isHire && job.benefits.length > 0 && <Row k="福利待遇" v={job.benefits.join(" · ")} />}
          <Row k={isHire ? "岗位职责" : "岗位说明"} v={job.detail || "—"} />
          <Row k="发布时间" v={fmt(job.createdAt)} />
        </dl>
      </div>

      {/* 投递者 */}
      <div className="mt-5 rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border text-[14px] font-semibold inline-flex items-center gap-1.5"><Users2 className="h-4 w-4" /> 投递者（{apps.length}）</div>
        {apps.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">还没有人报名。从业者在「找活」报名后会出现在这里。</div>
        ) : (
          <ul className="divide-y divide-border">
            {apps.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-cat-design-soft text-cat-design inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{a.name.slice(0, 1)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{a.name}</div>
                    <a href={`tel:${a.phone}`} className="text-[12px] text-brand inline-flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</a>
                    <span className="text-[11px] text-muted-foreground ml-2">{fmt(a.createdAt)}</span>
                  </div>
                  <Badge tone={APP_TONE[a.status]} className="shrink-0">{APP_LABEL[a.status]}</Badge>
                </div>
                {a.note && <p className="mt-2 text-[12px] text-muted-foreground leading-5 pl-12">“{a.note}”</p>}
                <div className="mt-3 pl-12 flex items-center gap-2">
                  {a.status !== "accepted" && (
                    <form action={reviewApplicantAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="accepted" />
                      <button className="h-9 px-4 rounded-full bg-accent-tea text-white text-[12px] font-medium inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> 录用</button>
                    </form>
                  )}
                  {a.status !== "rejected" && (
                    <form action={reviewApplicantAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="rejected" />
                      <button className="h-9 px-4 rounded-full border border-cat-decor/40 text-cat-decor text-[12px] font-medium inline-flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" /> 不合适</button>
                    </form>
                  )}
                  {a.status !== "pending" && (
                    <form action={reviewApplicantAction}><input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="pending" />
                      <button className="h-9 px-3 rounded-full text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> 重置</button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </EnterpriseShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-5 py-3 flex justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{k}</dt>
      <dd className="text-right break-all whitespace-pre-wrap">{v || "—"}</dd>
    </div>
  );
}
