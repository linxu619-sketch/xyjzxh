import Link from "next/link";
import { ArrowLeft, CheckCircle2, Users2, IdCard, CalendarCheck, Layers, Trash2, Plus, ExternalLink } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { listCommittee, listMembers, listMeetings, listTopics } from "@/lib/data/party-source";
import { MEETING_TYPES, MEMBER_KINDS, COMMITTEE_POSTS } from "@/lib/data/party";
import {
  addCommitteeAction, deleteCommitteeAction, addMemberAction, deleteMemberAction,
  addMeetingAction, deleteMeetingAction, addTopicAction, deleteTopicAction,
} from "./actions";

export const metadata = { title: "支部建设 · 党的建设 · 协会工作台" };

const INPUT = "h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/40";
const AREA = "w-full rounded-xl border border-border bg-background p-3 text-[13px] leading-6 outline-none focus:border-foreground/40";
const ADDBTN = "h-10 px-4 rounded-full bg-party text-white text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform";

type Tab = "committee" | "members" | "meetings" | "topics";
const TABS: { key: Tab; label: string; icon: typeof Users2 }[] = [
  { key: "committee", label: "支部班子", icon: Users2 },
  { key: "members", label: "党员名册", icon: IdCard },
  { key: "meetings", label: "三会一课台账", icon: CalendarCheck },
  { key: "topics", label: "党建专题", icon: Layers },
];

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-muted-foreground">{label}{required && <span className="text-party ml-0.5">*</span>}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default async function BranchAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; ok?: string }> }) {
  const sp = await searchParams;
  const tab = (TABS.some((t) => t.key === sp.tab) ? sp.tab : "committee") as Tab;
  const ok = sp.ok === "1";
  const base = "/dashboard/association/cpc/branch";

  const committee = listCommittee();
  const members = listMembers();
  const meetings = listMeetings();
  const topics = listTopics();

  return (
    <AssociationShell title="支部建设" subtitle="支部班子 · 党员名册 · 三会一课台账 · 党建专题">
      <Link href="/dashboard/association/cpc" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回党的建设
      </Link>

      {ok && <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-3.5 flex items-center gap-2 text-[13px]"><CheckCircle2 className="h-4 w-4 shrink-0" /> 已保存，党建专栏即时更新。</div>}

      {/* tab 切换 */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = t.key === tab;
          return (
            <Link key={t.key} href={`${base}?tab=${t.key}`} className={`h-9 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors ${on ? "bg-party text-white" : "bg-surface text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </Link>
          );
        })}
        <a href="/cpc" target="_blank" rel="noreferrer" className="ml-auto h-9 px-4 rounded-full border border-party/30 text-party text-[12px] font-medium inline-flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5" /> 查看专栏</a>
      </div>

      {/* ===== 支部班子 ===== */}
      {tab === "committee" && (
        <div className="space-y-5">
          <form action={addCommitteeAction} className="rounded-2xl border border-border bg-background p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <Field label="姓名" required><input name="name" required className={INPUT} placeholder="如 解彦波" /></Field>
            <Field label="职务"><select name="post" defaultValue="委员" className={INPUT}>{COMMITTEE_POSTS.map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="分工"><input name="duty" className={INPUT} placeholder="如 党员发展、组织生活" /></Field>
            <div className="flex gap-2"><input name="sort" type="number" className={`${INPUT} w-20`} placeholder="排序" defaultValue={committee.length + 1} /><button className={ADDBTN}><Plus className="h-4 w-4" /> 添加</button></div>
          </form>
          <ListCard count={committee.length} empty="还没有支部委员，先在上方添加。">
            {committee.map((c) => (
              <Row key={c.id} action={deleteCommitteeAction} id={c.id}>
                <span className="inline-flex items-center gap-2"><b className="text-[14px]">{c.name}</b><span className="rounded-full bg-party-soft text-party px-2 py-0.5 text-[11px]">{c.post}</span></span>
                <span className="text-[12px] text-muted-foreground truncate">{c.duty || "—"}</span>
              </Row>
            ))}
          </ListCard>
        </div>
      )}

      {/* ===== 党员名册 ===== */}
      {tab === "members" && (
        <div className="space-y-5">
          <form action={addMemberAction} className="rounded-2xl border border-border bg-background p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="姓名 / 企业名" required><input name="name" required className={INPUT} placeholder="党员姓名或党员企业全称" /></Field>
            <Field label="类别"><select name="kind" defaultValue="党员" className={INPUT}>{MEMBER_KINDS.map((k) => <option key={k}>{k}</option>)}</select></Field>
            <Field label="所在单位"><input name="org" className={INPUT} placeholder="如 会长单位 / 协会党支部" /></Field>
            <Field label="职务 / 工种"><input name="role" className={INPUT} placeholder="如 支部书记 / 党员示范企业" /></Field>
            <Field label="入党时间（年）"><input name="joined" className={INPUT} placeholder="如 2008（选填）" /></Field>
            <Field label="排序"><input name="sort" type="number" className={INPUT} defaultValue={members.length + 1} /></Field>
            <div className="md:col-span-3">
              <Field label="先锋事迹 / 公开承诺"><input name="highlight" className={INPUT} placeholder="如 设立党员先锋岗，承诺诚信经营、按时支付工资" /></Field>
            </div>
            <div className="md:col-span-3"><button className={ADDBTN}><Plus className="h-4 w-4" /> 添加党员 / 党员企业</button></div>
          </form>
          <ListCard count={members.length} empty="还没有党员记录，先在上方添加。">
            {members.map((m) => (
              <Row key={m.id} action={deleteMemberAction} id={m.id}>
                <span className="inline-flex items-center gap-2 flex-wrap"><b className="text-[14px]">{m.name}</b><span className="rounded-full bg-party-soft text-party px-2 py-0.5 text-[11px]">{m.kind}</span>{m.role && <span className="text-[12px] text-muted-foreground">{m.role}</span>}</span>
                <span className="text-[12px] text-muted-foreground truncate">{m.org}{m.highlight ? ` · ${m.highlight}` : ""}</span>
              </Row>
            ))}
          </ListCard>
        </div>
      )}

      {/* ===== 三会一课台账 ===== */}
      {tab === "meetings" && (
        <div className="space-y-5">
          <form action={addMeetingAction} className="rounded-2xl border border-border bg-background p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="类型"><select name="type" defaultValue="主题党日" className={INPUT}>{MEETING_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="召开日期" required><input name="date" type="date" required className={INPUT} /></Field>
            <Field label="主持 / 主讲"><input name="host" className={INPUT} placeholder="如 解彦波" /></Field>
            <div className="md:col-span-3"><Field label="会议主题 / 标题" required><input name="title" required className={INPUT} placeholder="如 「党建引领行业自律」主题党日" /></Field></div>
            <Field label="地点"><input name="location" className={INPUT} placeholder="如 协会党群活动室" /></Field>
            <Field label="参会情况"><input name="attend" className={INPUT} placeholder="如 应到 12 实到 11" /></Field>
            <div className="md:col-span-3"><Field label="议题 / 内容（支持 Markdown）"><textarea name="summary" rows={4} className={`${AREA} font-mono`} placeholder={"会议议题与主要内容，可用 Markdown：\n- 学习内容\n- 议定事项"} /></Field></div>
            <div className="md:col-span-3"><button className={ADDBTN}><Plus className="h-4 w-4" /> 记入台账</button></div>
          </form>
          <ListCard count={meetings.length} empty="台账还是空的。每次三会一课 / 主题党日后在此登记，形成可查记录。">
            {meetings.map((m) => (
              <Row key={m.id} action={deleteMeetingAction} id={m.id}>
                <span className="inline-flex items-center gap-2 flex-wrap"><span className="rounded-full bg-party-soft text-party px-2 py-0.5 text-[11px]">{m.type}</span><b className="text-[14px]">{m.title}</b></span>
                <span className="text-[12px] text-muted-foreground truncate">{m.date}{m.host ? ` · ${m.host}` : ""}{m.attend ? ` · ${m.attend}` : ""}{m.location ? ` · ${m.location}` : ""}</span>
              </Row>
            ))}
          </ListCard>
        </div>
      )}

      {/* ===== 党建专题 ===== */}
      {tab === "topics" && (
        <div className="space-y-5">
          <form action={addTopicAction} className="rounded-2xl border border-border bg-background p-5 grid grid-cols-1 gap-3">
            <Field label="专题标题" required><input name="title" required className={INPUT} placeholder="如 学习贯彻党的创新理论" /></Field>
            <Field label="专题简介"><input name="summary" className={INPUT} placeholder="一句话说明专题主旨" /></Field>
            <Field label="聚合关键词（逗号/顿号分隔，最多 12 个）"><input name="keywords" className={INPUT} placeholder="如 习近平、新时代、理论学习、二十大" /></Field>
            <p className="text-[11px] text-muted-foreground leading-5">专题页会自动聚合标题/摘要/正文命中任一关键词的「党建」「理论学习」已发布文章——不必手动挑选，发文打到关键词即归入专题。</p>
            <div><button className={ADDBTN}><Plus className="h-4 w-4" /> 创建专题</button></div>
          </form>
          <ListCard count={topics.length} empty="还没有党建专题。">
            {topics.map((t) => (
              <Row key={t.id} action={deleteTopicAction} id={t.id}>
                <span className="inline-flex items-center gap-2 flex-wrap"><b className="text-[14px]">{t.title}</b>{t.keywords.slice(0, 4).map((k) => <span key={k} className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">{k}</span>)}</span>
                <a href={`/cpc/topic/${t.id}`} target="_blank" rel="noreferrer" className="text-[12px] text-party hover:underline inline-flex items-center gap-1">预览专题 <ExternalLink className="h-3 w-3" /></a>
              </Row>
            ))}
          </ListCard>
        </div>
      )}
    </AssociationShell>
  );
}

function ListCard({ count, empty, children }: { count: number; empty: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background overflow-hidden">
      <div className="px-5 py-3 border-b border-border text-[13px] font-semibold">已有 {count} 条</div>
      {count === 0 ? <div className="px-5 py-12 text-center text-[13px] text-muted-foreground">{empty}</div> : <ul className="divide-y divide-border">{children}</ul>}
    </div>
  );
}

function Row({ id, action, children }: { id: string; action: (fd: FormData) => void | Promise<void>; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 px-5 py-3.5">
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">{children}</div>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button className="h-8 w-8 rounded-full text-muted-foreground hover:text-cat-decor hover:bg-cat-decor-soft inline-flex items-center justify-center shrink-0" title="删除"><Trash2 className="h-4 w-4" /></button>
      </form>
    </li>
  );
}
