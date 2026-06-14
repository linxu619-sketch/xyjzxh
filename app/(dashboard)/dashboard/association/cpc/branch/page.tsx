import Link from "next/link";
import { ArrowLeft, CheckCircle2, Users2, IdCard, CalendarCheck, Layers, Trash2, Plus, Save, X, Pencil, ExternalLink, ImageIcon } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { listCommittee, listMembers, listMeetings, listTopics } from "@/lib/data/party-source";
import { MEMBER_KINDS, COMMITTEE_POSTS } from "@/lib/data/party";
import { MeetingForm } from "./MeetingForm";
import {
  addCommitteeAction, updateCommitteeAction, deleteCommitteeAction,
  addMemberAction, updateMemberAction, deleteMemberAction,
  deleteMeetingAction,
  addTopicAction, updateTopicAction, deleteTopicAction,
} from "./actions";

export const metadata = { title: "支部建设 · 党的建设 · 协会工作台" };

const INPUT = "h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/40";
const ADDBTN = "h-10 px-4 rounded-full bg-party text-white text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform";
const SAVEBTN = "h-10 px-4 rounded-full bg-party text-white text-[13px] font-medium inline-flex items-center gap-1.5";
const EDITWRAP = "rounded-2xl border border-party/40 ring-1 ring-party/20 bg-background p-5 grid grid-cols-1 md:grid-cols-3 gap-3";

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

export default async function BranchAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; ok?: string; edit?: string }> }) {
  const sp = await searchParams;
  const tab = (TABS.some((t) => t.key === sp.tab) ? sp.tab : "committee") as Tab;
  const ok = sp.ok === "1";
  const editId = sp.edit?.trim() || "";
  const base = "/dashboard/association/cpc/branch";
  const editHref = (id: string) => `${base}?tab=${tab}&edit=${id}`;
  const cancelHref = `${base}?tab=${tab}`;

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
            {committee.map((c) => (editId === c.id ? (
              <li key={c.id} className="p-4 bg-surface/40">
                <form action={updateCommitteeAction} className={EDITWRAP}>
                  <input type="hidden" name="id" value={c.id} />
                  <div className="md:col-span-4 text-[13px] font-semibold text-party">编辑支部委员</div>
                  <Field label="姓名" required><input name="name" required defaultValue={c.name} className={INPUT} /></Field>
                  <Field label="职务"><select name="post" defaultValue={c.post} className={INPUT}>{COMMITTEE_POSTS.map((p) => <option key={p}>{p}</option>)}</select></Field>
                  <Field label="分工"><input name="duty" defaultValue={c.duty} className={INPUT} /></Field>
                  <div className="flex items-end gap-2"><input name="sort" type="number" defaultValue={c.sort} className={`${INPUT} w-20`} /><button className={SAVEBTN}><Save className="h-4 w-4" /> 保存</button><CancelLink href={cancelHref} /></div>
                </form>
              </li>
            ) : (
              <Row key={c.id} delAction={deleteCommitteeAction} id={c.id} editHref={editHref(c.id)}>
                <span className="inline-flex items-center gap-2"><b className="text-[14px]">{c.name}</b><span className="rounded-full bg-party-soft text-party px-2 py-0.5 text-[11px]">{c.post}</span></span>
                <span className="text-[12px] text-muted-foreground truncate">{c.duty || "—"}</span>
              </Row>
            )))}
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
            <div className="md:col-span-3"><Field label="先锋事迹 / 公开承诺"><input name="highlight" className={INPUT} placeholder="如 设立党员先锋岗，承诺诚信经营、按时支付工资" /></Field></div>
            <div className="md:col-span-3"><button className={ADDBTN}><Plus className="h-4 w-4" /> 添加党员 / 党员企业</button></div>
          </form>
          <ListCard count={members.length} empty="还没有党员记录，先在上方添加。">
            {members.map((m) => (editId === m.id ? (
              <li key={m.id} className="p-4 bg-surface/40">
                <form action={updateMemberAction} className={EDITWRAP}>
                  <input type="hidden" name="id" value={m.id} />
                  <div className="md:col-span-3 text-[13px] font-semibold text-party">编辑党员 / 党员企业</div>
                  <Field label="姓名 / 企业名" required><input name="name" required defaultValue={m.name} className={INPUT} /></Field>
                  <Field label="类别"><select name="kind" defaultValue={m.kind} className={INPUT}>{MEMBER_KINDS.map((k) => <option key={k}>{k}</option>)}</select></Field>
                  <Field label="所在单位"><input name="org" defaultValue={m.org} className={INPUT} /></Field>
                  <Field label="职务 / 工种"><input name="role" defaultValue={m.role} className={INPUT} /></Field>
                  <Field label="入党时间（年）"><input name="joined" defaultValue={m.joined} className={INPUT} /></Field>
                  <Field label="排序"><input name="sort" type="number" defaultValue={m.sort} className={INPUT} /></Field>
                  <div className="md:col-span-3"><Field label="先锋事迹 / 公开承诺"><input name="highlight" defaultValue={m.highlight} className={INPUT} /></Field></div>
                  <div className="md:col-span-3 flex items-center gap-2"><button className={SAVEBTN}><Save className="h-4 w-4" /> 保存修改</button><CancelLink href={cancelHref} /></div>
                </form>
              </li>
            ) : (
              <Row key={m.id} delAction={deleteMemberAction} id={m.id} editHref={editHref(m.id)}>
                <span className="inline-flex items-center gap-2 flex-wrap"><b className="text-[14px]">{m.name}</b><span className="rounded-full bg-party-soft text-party px-2 py-0.5 text-[11px]">{m.kind}</span>{m.role && <span className="text-[12px] text-muted-foreground">{m.role}</span>}</span>
                <span className="text-[12px] text-muted-foreground truncate">{m.org}{m.highlight ? ` · ${m.highlight}` : ""}</span>
              </Row>
            )))}
          </ListCard>
        </div>
      )}

      {/* ===== 三会一课台账 ===== */}
      {tab === "meetings" && (
        <div className="space-y-5">
          <MeetingForm />
          <ListCard count={meetings.length} empty="台账还是空的。每次三会一课 / 主题党日后在此登记，形成可查记录。">
            {meetings.map((m) => (editId === m.id ? (
              <li key={m.id} className="p-4 bg-surface/40"><MeetingForm meeting={m} /></li>
            ) : (
              <Row key={m.id} delAction={deleteMeetingAction} id={m.id} editHref={editHref(m.id)}>
                <span className="inline-flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-party-soft text-party px-2 py-0.5 text-[11px]">{m.type}</span>
                  <b className="text-[14px]">{m.title}</b>
                  {m.images.length > 0 && <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground"><ImageIcon className="h-3 w-3" />{m.images.length}</span>}
                </span>
                <span className="text-[12px] text-muted-foreground truncate">{[m.date, m.host && `主讲 ${m.host}`, m.attend, m.location].filter(Boolean).join(" · ")}</span>
              </Row>
            )))}
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
            {topics.map((t) => (editId === t.id ? (
              <li key={t.id} className="p-4 bg-surface/40">
                <form action={updateTopicAction} className="rounded-2xl border border-party/40 ring-1 ring-party/20 bg-background p-5 grid grid-cols-1 gap-3">
                  <input type="hidden" name="id" value={t.id} />
                  <div className="text-[13px] font-semibold text-party">编辑党建专题</div>
                  <Field label="专题标题" required><input name="title" required defaultValue={t.title} className={INPUT} /></Field>
                  <Field label="专题简介"><input name="summary" defaultValue={t.summary} className={INPUT} /></Field>
                  <Field label="聚合关键词（逗号/顿号分隔）"><input name="keywords" defaultValue={t.keywords.join("、")} className={INPUT} /></Field>
                  <div className="flex items-center gap-2"><button className={SAVEBTN}><Save className="h-4 w-4" /> 保存修改</button><CancelLink href={cancelHref} /></div>
                </form>
              </li>
            ) : (
              <Row key={t.id} delAction={deleteTopicAction} id={t.id} editHref={editHref(t.id)}>
                <span className="inline-flex items-center gap-2 flex-wrap"><b className="text-[14px]">{t.title}</b>{t.keywords.slice(0, 4).map((k) => <span key={k} className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">{k}</span>)}</span>
                <a href={`/cpc/topic/${t.id}`} target="_blank" rel="noreferrer" className="text-[12px] text-party hover:underline inline-flex items-center gap-1">预览专题 <ExternalLink className="h-3 w-3" /></a>
              </Row>
            )))}
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

function Row({ id, delAction, editHref, children }: { id: string; delAction: (fd: FormData) => void | Promise<void>; editHref: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 px-5 py-3.5">
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">{children}</div>
      <Link href={editHref} className="h-8 w-8 rounded-full text-muted-foreground hover:text-party hover:bg-party-soft inline-flex items-center justify-center shrink-0" title="编辑"><Pencil className="h-4 w-4" /></Link>
      <form action={delAction}>
        <input type="hidden" name="id" value={id} />
        <button className="h-8 w-8 rounded-full text-muted-foreground hover:text-cat-decor hover:bg-cat-decor-soft inline-flex items-center justify-center shrink-0" title="删除"><Trash2 className="h-4 w-4" /></button>
      </form>
    </li>
  );
}

function CancelLink({ href }: { href: string }) {
  return <Link href={href} className="h-10 px-3 rounded-full text-[13px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><X className="h-3.5 w-3.5" /> 取消</Link>;
}
