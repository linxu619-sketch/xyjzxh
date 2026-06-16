import Link from "next/link";
import {
  ArrowLeft, Users2, Phone, CheckCircle2, XCircle, RotateCcw, Pause, Play,
  HardHat, Flag, CalendarDays, Star, BadgeCheck, AlertTriangle, Check, X as XIcon,
} from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getJob, listApplicationsByJob, countHired, SETTLE_LABEL, SETTLE_HINT, ESCROW_LABEL, type AppStatus, type Job, type JobApplication, type SettleMode } from "@/lib/data/jobs";
import { getPractitionerByPhone, type Practitioner } from "@/lib/data/practitioners-source";
import { getPractitionerIdentity } from "@/lib/data/applications";
import { listCertsByPhone, type PractitionerCert } from "@/lib/data/practitioner-certs";
import { listAttendanceByApplication, type WorkAttendance } from "@/lib/data/attendance";
import { setJobStatusAction, reviewApplicantAction, confirmAttendanceAction, rejectAttendanceAction, addAttendanceDayAction } from "../actions";
import { ConfirmForm } from "../ConfirmForm";

export const metadata = { title: "岗位详情 · 企业工作台" };

const APP_LABEL: Record<AppStatus, string> = { pending: "待处理", accepted: "已录用", working: "施工中", done: "已完工", rejected: "未通过" };
const APP_TONE: Record<AppStatus, "yellow" | "tea" | "build" | "neutral"> = { pending: "yellow", accepted: "tea", working: "build", done: "neutral", rejected: "neutral" };

function fmt(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function JobDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ aok?: string; aerr?: string }> }) {
  const { id } = await params;
  const { aok, aerr } = await searchParams;
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

  // 名额管控：已用名额（录用/施工/完工都占）vs 总名额
  const hired = countHired(job.id);
  const full = hired >= job.openings;
  // 投递者画像（按手机号回查从业者档案）
  const profiles = new Map<string, Practitioner | undefined>();
  // 证照调阅：实名核验状态 + 证书（不含身份证原件，隐私）
  const certsBy = new Map<string, PractitionerCert[]>();
  const verifiedBy = new Map<string, boolean>();
  for (const a of apps) if (!profiles.has(a.phone)) {
    profiles.set(a.phone, getPractitionerByPhone(a.phone));
    certsBy.set(a.phone, listCertsByPhone(a.phone));
    verifiedBy.set(a.phone, getPractitionerIdentity(a.phone)?.verified ?? false);
  }
  // 考勤(E2)：在岗/完工的工人才有考勤；按 application 取
  const attendanceBy = new Map<number, WorkAttendance[]>();
  for (const a of apps) if (a.status === "working" || a.status === "done") attendanceBy.set(a.id, listAttendanceByApplication(a.id));

  const okText = aok === "accepted" ? "已录用，名额已占用。" : aok === "working" ? "已标记到岗，进入施工中。" : aok === "done" ? "已完工，该派工单已闭环。" : aok === "rejected" ? "已更新为未通过 / 已取消。" : aok === "pending" ? "已重新置为待处理。" : "";
  const errText = aerr === "full" ? "名额已满，无法再录用。请先「结束招聘」或取消他人录用。" : aerr === "flow" ? "该操作不符合流程（如已完工不可再改）。" : "";

  return (
    <EnterpriseShell title="岗位详情" subtitle={`${job.title} · ${apps.length} 份投递 · 已录用 ${hired}/${job.openings}`}>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-3.5 w-3.5" /> {backLabel}</Link>

      {/* 工资托管(发布即托管)状态 */}
      {!isHire && job.escrowStatus === "unfunded" && (
        <div className="mb-4 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft/40 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-cat-decor shrink-0" />
          <div className="flex-1 min-w-0 text-[13px]">
            <b>待托管工资保证金 ¥{job.escrowAmount.toLocaleString()}</b> · 未托管前该岗位<b>不会向工人放出</b>。
          </div>
          <Link href={`/dashboard/pay/${job.escrowPayId}`} className="h-9 px-4 rounded-full bg-cat-decor text-white text-[12px] font-medium inline-flex items-center gap-1.5 shrink-0">去支付保证金</Link>
        </div>
      )}
      {!isHire && job.escrowStatus === "funded" && (
        <div className="mb-4 rounded-xl border border-accent-tea/30 bg-accent-tea/10 px-4 py-2.5 text-[13px] text-accent-tea inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 工资已托管 ¥{job.escrowAmount.toLocaleString()} 在协会监管账户 · 按考勤自动结算给工人,结余完工后退回。</div>
      )}
      {okText && <div className="mb-4 rounded-xl border border-accent-tea/30 bg-accent-tea/10 px-4 py-2.5 text-[13px] text-accent-tea inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {okText}</div>}
      {errText && <div className="mb-4 rounded-xl border border-cat-decor/30 bg-cat-decor-soft/40 px-4 py-2.5 text-[13px] text-cat-decor inline-flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> {errText}</div>}

      {/* 岗位信息 */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-semibold">{job.title}</span>
            {job.urgent && <Badge tone="decor">急招</Badge>}
            <Badge tone={job.status === "open" ? "tea" : "neutral"}>{job.status === "open" ? "在招" : "已结束"}</Badge>
            {full && <Badge tone="build">名额已满</Badge>}
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
          <Row k={isHire ? "月薪 / 名额" : "日薪 / 名额"} v={`${payText} · ${job.openings} ${isHire ? "人" : "名额"}（已录用 ${hired}）`} />
          <Row k={isHire ? "区域" : "区域 / 工期"} v={isHire ? (job.district || "—") : `${job.district || "—"} · ${job.duration || "—"}`} />
          <Row k={isHire ? "可入职日期" : "进场 / 开工日期"} v={job.startDate || "待定（与录用者商定）"} />
          {!isHire && <Row k="工资结算" v={`${SETTLE_LABEL[(job.settleMode || "on_complete") as SettleMode]} · ${SETTLE_HINT[(job.settleMode || "on_complete") as SettleMode]}`} />}
          {!isHire && job.escrowStatus !== "none" && <Row k="工资托管" v={`${ESCROW_LABEL[job.escrowStatus]}${job.escrowAmount ? ` · ¥${job.escrowAmount.toLocaleString()}` : ""}${job.expectedDays ? ` · 预估 ${job.expectedDays} 天` : ""}`} />}
          <Row k="招工要求" v={reqs} />
          {!isHire && <Row k="工伤保障" v={job.insurance === "company" ? "企业承保 · 含工伤险（协会团险 5 元/天/人）" : "工人自理"} />}
          {isHire && job.benefits.length > 0 && <Row k="福利待遇" v={job.benefits.join(" · ")} />}
          <Row k={isHire ? "岗位职责" : "岗位说明"} v={job.detail || "—"} />
          <Row k="发布时间" v={fmt(job.createdAt)} />
        </dl>
      </div>

      {/* 投递者 */}
      <div className="mt-5 rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
          <span className="text-[14px] font-semibold inline-flex items-center gap-1.5"><Users2 className="h-4 w-4" /> 投递者（{apps.length}）</span>
          <span className="text-[12px] text-muted-foreground">已录用 {hired} / {job.openings} {full && "· 名额已满"}</span>
        </div>
        {apps.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">还没有人报名。从业者在「找活」报名后会出现在这里。</div>
        ) : (
          <ul className="divide-y divide-border">
            {apps.map((a) => (
              <ApplicantRow key={a.id} a={a} job={job} profile={profiles.get(a.phone)} full={full} certs={certsBy.get(a.phone) ?? []} verified={verifiedBy.get(a.phone) ?? false} attendance={attendanceBy.get(a.id) ?? []} />
            ))}
          </ul>
        )}
      </div>
    </EnterpriseShell>
  );
}

function ApplicantRow({ a, job, profile, full, certs, verified, attendance }: { a: JobApplication; job: Job; profile: Practitioner | undefined; full: boolean; certs: PractitionerCert[]; verified: boolean; attendance: WorkAttendance[] }) {
  const confirmedDays = attendance.filter((x) => x.status === "confirmed").length;
  const pendingDays = attendance.filter((x) => x.status === "checked").length;
  const age = profile?.birthYear ? new Date().getFullYear() - profile.birthYear : null;
  const isHire = job.type === "hire";
  const expect = isHire
    ? (profile?.expectMonthMin ? `期望 ¥${profile.expectMonthMin}${profile.expectMonthMax ? `-${profile.expectMonthMax}` : "+"}/月` : "")
    : (profile?.expectDaily ? `期望 ¥${profile.expectDaily}${profile.expectDailyMax ? `-${profile.expectDailyMax}` : "+"}/天` : "");
  // 与岗位要求的匹配项（数据齐时给 ✓/✗，缺失则不展示该项）
  const matches: { label: string; ok: boolean }[] = [];
  if ((job.minAge || job.maxAge) && age != null) {
    const ok = (!job.minAge || age >= job.minAge) && (!job.maxAge || age <= job.maxAge);
    matches.push({ label: `年龄${age}`, ok });
  }
  if (job.minYears > 0 && profile) matches.push({ label: `${profile.years}年经验`, ok: profile.years >= job.minYears });
  if (job.genderReq && profile?.gender) matches.push({ label: profile.gender, ok: profile.gender === job.genderReq });
  if (job.needCert && profile) matches.push({ label: profile.hasCert ? "持证" : "无证", ok: !!profile.hasCert });

  return (
    <li className="px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="h-9 w-9 rounded-full bg-cat-design-soft text-cat-design inline-flex items-center justify-center text-[12px] font-semibold shrink-0">{a.name.slice(0, 1)}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium inline-flex items-center gap-1.5">
            {profile ? (
              <Link href={`/practitioners/${profile.id}`} target="_blank" className="hover:text-brand transition-colors">{a.name}</Link>
            ) : a.name}
            {profile && <Badge tone="design" className="!px-1.5 !py-0">{profile.tier}</Badge>}
            {profile?.available === false && <span className="text-[11px] text-muted-foreground">· 暂不接单</span>}
          </div>
          <div className="text-[12px] flex items-center gap-2 flex-wrap mt-0.5">
            <a href={`tel:${a.phone}`} className="text-brand inline-flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</a>
            <span className="text-muted-foreground">{fmt(a.createdAt)}</span>
          </div>
        </div>
        <Badge tone={APP_TONE[a.status]} className="shrink-0">{APP_LABEL[a.status]}</Badge>
      </div>

      {/* 投递者画像（回查从业者档案）*/}
      {profile ? (
        <div className="mt-2 pl-12 flex items-center gap-x-3 gap-y-1 flex-wrap text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-foreground"><HardHat className="h-3.5 w-3.5 text-cat-build" />{profile.canKinds.join("/") || profile.kind}</span>
          <span>{profile.years} 年经验</span>
          {age != null && <span>{age} 岁</span>}
          {profile.gender && <span>{profile.gender}</span>}
          <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 text-accent-yellow" />{profile.rating.toFixed(1)}</span>
          <span>接单 {profile.jobs}</span>
          {profile.hasCert && <span className="inline-flex items-center gap-0.5 text-accent-tea"><BadgeCheck className="h-3.5 w-3.5" />持证</span>}
          {profile.canDistricts.length > 0 && <span>可接 {profile.canDistricts.join("/")}</span>}
          {expect && <span className="text-cat-decor">{expect}</span>}
        </div>
      ) : (
        <div className="mt-2 pl-12 text-[12px] text-muted-foreground/70">该投递者暂未在从业者名录建档，仅有报名联系方式。</div>
      )}

      {/* 匹配项 */}
      {matches.length > 0 && (
        <div className="mt-2 pl-12 flex items-center gap-1.5 flex-wrap">
          {matches.map((m, i) => (
            <span key={i} className={`text-[11px] inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 border ${m.ok ? "border-accent-tea/40 text-accent-tea bg-accent-tea/5" : "border-cat-decor/40 text-cat-decor bg-cat-decor-soft/30"}`}>
              {m.ok ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}{m.label}
            </span>
          ))}
        </div>
      )}

      {a.note && <p className="mt-2 text-[12px] text-muted-foreground leading-5 pl-12">“{a.note}”</p>}

      {/* 证照调阅：实名核验状态 + 证书（不含身份证原件）*/}
      <div className="mt-2.5 pl-12">
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-muted-foreground">证照</span>
          {verified
            ? <span className="inline-flex items-center gap-0.5 text-accent-tea"><BadgeCheck className="h-3.5 w-3.5" />实名已核验</span>
            : <span className="text-muted-foreground">实名核验中</span>}
          {certs.length > 0 && <span className="text-muted-foreground">· {certs.length} 张证书</span>}
        </div>
        {certs.length > 0 && (
          <div className="mt-1.5 flex gap-2 flex-wrap">
            {certs.map((c) => (
              <a key={c.id} href={c.imageUrl} target="_blank" rel="noreferrer" title={`${c.title}${c.verifyStatus === "verified" ? " · 协会已核验" : " · 待核验"}`} className="relative block h-12 w-16 rounded-md border border-border overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrl} alt={c.title} className="h-full w-full object-cover" />
                {c.verifyStatus === "verified" && <BadgeCheck className="absolute -top-1 -right-1 h-3.5 w-3.5 text-accent-tea bg-background rounded-full" />}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 施工进度（录用→到岗→完工）*/}
      {(a.status === "working" || a.status === "done") && (
        <div className="mt-2.5 pl-12 flex items-center gap-2 text-[11px] text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {a.onboardAt > 0 && <span>到岗 {fmt(a.onboardAt)}</span>}
          {a.doneAt > 0 && <span>· 完工 {fmt(a.doneAt)}</span>}
        </div>
      )}

      {/* 考勤(E2)：工人打卡 → 企业确认；确认出勤=自动结算依据 */}
      {(a.status === "working" || a.status === "done") && (
        <div className="mt-3 pl-12">
          <div className="text-[12px] font-medium mb-1.5 inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-cat-build" /> 考勤 · 已确认 <b className="text-accent-tea">{confirmedDays}</b> 天{pendingDays > 0 && <span className="text-accent-yellow font-normal"> · {pendingDays} 天待确认</span>}
          </div>
          {attendance.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">工人每日打卡后在此确认；也可「补登」未打卡的出勤。确认出勤将作为工资自动结算依据。</p>
          ) : (
            <ul className="space-y-1 mb-1.5">
              {attendance.map((at) => (
                <li key={at.id} className="flex items-center gap-2 text-[12px]">
                  <span className="tabular-nums text-muted-foreground w-[88px]">{at.workDate}</span>
                  {at.status === "confirmed" ? <span className="inline-flex items-center gap-0.5 text-accent-tea"><CheckCircle2 className="h-3.5 w-3.5" />已确认</span>
                    : at.status === "rejected" ? <span className="text-muted-foreground">缺勤</span>
                    : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-accent-yellow">待确认</span>
                        {a.status !== "done" && (
                          <>
                            <form action={confirmAttendanceAction}><input type="hidden" name="id" value={at.id} /><button className="h-6 px-2 rounded-full bg-accent-tea text-white text-[11px]">确认</button></form>
                            <form action={rejectAttendanceAction}><input type="hidden" name="id" value={at.id} /><button className="h-6 px-2 rounded-full border border-border text-[11px] text-muted-foreground">缺勤</button></form>
                          </>
                        )}
                      </span>
                    )}
                </li>
              ))}
            </ul>
          )}
          {a.status !== "done" && (
            <form action={addAttendanceDayAction} className="flex items-center gap-1.5">
              <input type="hidden" name="applicationId" value={a.id} />
              <input type="date" name="date" required className="h-8 rounded-lg border border-border bg-background px-2 text-[12px]" />
              <button className="h-8 px-3 rounded-full border border-border text-[12px] hover:bg-surface">补登出勤</button>
            </form>
          )}
        </div>
      )}

      {/* 前向闭环操作：按当前状态只给合法的下一步 */}
      <div className="mt-3 pl-12 flex items-center gap-2 flex-wrap">
        {a.status === "pending" && (
          <>
            {full ? (
              <span className="h-9 px-4 rounded-full border border-border text-[12px] text-muted-foreground inline-flex items-center gap-1.5 cursor-not-allowed" title="名额已满">名额已满，不可录用</span>
            ) : (
              <FormBtn status="accepted" id={a.id} cls="bg-accent-tea text-white"><CheckCircle2 className="h-3.5 w-3.5" /> 录用</FormBtn>
            )}
            <FormBtn status="rejected" id={a.id} cls="border border-cat-decor/40 text-cat-decor"><XCircle className="h-3.5 w-3.5" /> 不合适</FormBtn>
          </>
        )}
        {a.status === "accepted" && (
          <>
            <FormBtn status="working" id={a.id} cls="bg-cat-build text-white"><HardHat className="h-3.5 w-3.5" /> 标记已到岗</FormBtn>
            <ConfirmForm action={reviewApplicantAction} message={`确认取消录用「${a.name}」？取消后名额将释放。`}>
              <input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="rejected" />
              <button className="h-9 px-4 rounded-full text-[12px] text-muted-foreground hover:text-cat-decor inline-flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> 取消录用</button>
            </ConfirmForm>
          </>
        )}
        {a.status === "working" && (
          <>
            <FormBtn status="done" id={a.id} cls="bg-foreground text-background"><Flag className="h-3.5 w-3.5" /> 标记已完工</FormBtn>
            <ConfirmForm action={reviewApplicantAction} message={`确认中止「${a.name}」的施工？中止后名额将释放。`}>
              <input type="hidden" name="id" value={a.id} /><input type="hidden" name="status" value="rejected" />
              <button className="h-9 px-4 rounded-full text-[12px] text-muted-foreground hover:text-cat-decor inline-flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5" /> 中止</button>
            </ConfirmForm>
          </>
        )}
        {a.status === "done" && (
          <span className="text-[12px] text-accent-tea inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> 已完工 · 该派工单已闭环</span>
        )}
        {a.status === "rejected" && (
          <FormBtn status="pending" id={a.id} cls="border border-border text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" /> 重新考虑</FormBtn>
        )}
      </div>
    </li>
  );
}

function FormBtn({ status, id, cls, children }: { status: AppStatus; id: number; cls: string; children: React.ReactNode }) {
  return (
    <form action={reviewApplicantAction}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} />
      <button className={`h-9 px-4 rounded-full text-[12px] font-medium inline-flex items-center gap-1.5 ${cls}`}>{children}</button>
    </form>
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
