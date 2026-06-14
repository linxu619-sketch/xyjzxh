import "server-only";
import { getDb } from "@/lib/db/sqlite";
import { listPublished, type News } from "@/lib/data/news-source";
import {
  SEED_COMMITTEE, SEED_MEMBERS, SEED_MEETINGS, SEED_TOPICS,
  type PartyCommittee, type PartyMember, type PartyMeeting, type PartyTopic,
} from "@/lib/data/party";

/* 党的建设数据源：本地 SQLite（查询失败回退种子，保证 UI 不崩）。 */

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
function parseArr(s: string | null): string[] {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
}

/* ---------- 支部班子 ---------- */
type CRow = { id: string; name: string | null; post: string | null; duty: string | null; sort: number | null };
export function listCommittee(): PartyCommittee[] {
  try {
    const rows = getDb().prepare("SELECT * FROM party_committee ORDER BY sort ASC, created_at ASC").all() as CRow[];
    return rows.map((r) => ({ id: r.id, name: r.name ?? "", post: r.post ?? "委员", duty: r.duty ?? "", sort: r.sort ?? 0 }));
  } catch { return SEED_COMMITTEE; }
}
export function addCommittee(input: { name: string; post: string; duty: string; sort?: number }): string {
  const id = newId("pc");
  getDb().prepare("INSERT INTO party_committee (id,name,post,duty,sort,created_at) VALUES (?,?,?,?,?,?)")
    .run(id, input.name, input.post, input.duty, input.sort ?? 0, Date.now());
  return id;
}
export function deleteCommittee(id: string): void {
  getDb().prepare("DELETE FROM party_committee WHERE id=?").run(id);
}

/* ---------- 党员名册 / 风采 ---------- */
type MRow = { id: string; name: string | null; kind: string | null; org: string | null; role: string | null; highlight: string | null; photo: string | null; joined: string | null; sort: number | null };
export function listMembers(): PartyMember[] {
  try {
    const rows = getDb().prepare("SELECT * FROM party_members ORDER BY sort ASC, created_at ASC").all() as MRow[];
    return rows.map((r) => ({ id: r.id, name: r.name ?? "", kind: r.kind ?? "党员", org: r.org ?? "", role: r.role ?? "", highlight: r.highlight ?? "", photo: r.photo ?? undefined, joined: r.joined ?? undefined, sort: r.sort ?? 0 }));
  } catch { return SEED_MEMBERS; }
}
export function addMember(input: { name: string; kind: string; org: string; role: string; highlight: string; photo?: string; joined?: string; sort?: number }): string {
  const id = newId("pm");
  getDb().prepare("INSERT INTO party_members (id,name,kind,org,role,highlight,photo,joined,sort,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .run(id, input.name, input.kind, input.org, input.role, input.highlight, input.photo ?? null, input.joined ?? null, input.sort ?? 0, Date.now());
  return id;
}
export function deleteMember(id: string): void {
  getDb().prepare("DELETE FROM party_members WHERE id=?").run(id);
}

/* ---------- 三会一课 / 主题党日 台账 ---------- */
type MtRow = { id: string; type: string | null; title: string | null; date: string | null; location: string | null; host: string | null; attend: string | null; summary: string | null; images: string | null };
function mtTo(r: MtRow): PartyMeeting {
  return { id: r.id, type: r.type ?? "主题党日", title: r.title ?? "", date: r.date ?? "", location: r.location ?? "", host: r.host ?? "", attend: r.attend ?? "", summary: r.summary ?? "", images: parseArr(r.images) };
}
export function listMeetings(): PartyMeeting[] {
  try {
    const rows = getDb().prepare("SELECT * FROM party_meetings ORDER BY date DESC, created_at DESC").all() as MtRow[];
    return rows.map(mtTo);
  } catch { return SEED_MEETINGS; }
}
export function getMeeting(id: string): PartyMeeting | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM party_meetings WHERE id=?").get(id) as MtRow | undefined;
    return r ? mtTo(r) : SEED_MEETINGS.find((m) => m.id === id);
  } catch { return SEED_MEETINGS.find((m) => m.id === id); }
}
export function addMeeting(input: { type: string; title: string; date: string; location?: string; host?: string; attend?: string; summary?: string; images?: string[] }): string {
  const id = newId("mt");
  getDb().prepare("INSERT INTO party_meetings (id,type,title,date,location,host,attend,summary,images,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .run(id, input.type, input.title, input.date, input.location ?? "", input.host ?? "", input.attend ?? "", input.summary ?? "", input.images && input.images.length ? JSON.stringify(input.images) : null, Date.now());
  return id;
}
export function deleteMeeting(id: string): void {
  getDb().prepare("DELETE FROM party_meetings WHERE id=?").run(id);
}

/* ---------- 党建专题 ---------- */
type TRow = { id: string; title: string | null; summary: string | null; cover: string | null; keywords: string | null };
function tTo(r: TRow): PartyTopic {
  return { id: r.id, title: r.title ?? "", summary: r.summary ?? "", cover: r.cover ?? undefined, keywords: parseArr(r.keywords) };
}
export function listTopics(): PartyTopic[] {
  try {
    const rows = getDb().prepare("SELECT * FROM party_topics ORDER BY created_at DESC").all() as TRow[];
    return rows.map(tTo);
  } catch { return SEED_TOPICS; }
}
export function getTopic(id: string): PartyTopic | undefined {
  try {
    const r = getDb().prepare("SELECT * FROM party_topics WHERE id=?").get(id) as TRow | undefined;
    return r ? tTo(r) : SEED_TOPICS.find((t) => t.id === id);
  } catch { return SEED_TOPICS.find((t) => t.id === id); }
}
export function addTopic(input: { title: string; summary: string; cover?: string; keywords: string[] }): string {
  const id = newId("tp");
  getDb().prepare("INSERT INTO party_topics (id,title,summary,cover,keywords,created_at) VALUES (?,?,?,?,?,?)")
    .run(id, input.title, input.summary, input.cover ?? null, JSON.stringify(input.keywords), Date.now());
  return id;
}
export function deleteTopic(id: string): void {
  getDb().prepare("DELETE FROM party_topics WHERE id=?").run(id);
}

/** 专题聚合：返回标题/摘要/正文命中任一关键词的已发布党建/理论学习新闻 */
export function newsForTopic(topic: PartyTopic, limit = 20): News[] {
  const kws = topic.keywords.map((k) => k.trim()).filter(Boolean);
  if (!kws.length) return [];
  const pool = [...listPublished("党建"), ...listPublished("理论学习")];
  const seen = new Set<number>();
  const hit = pool.filter((n) => {
    if (seen.has(n.id)) return false;
    const hay = `${n.title} ${n.excerpt} ${n.content}`;
    if (kws.some((k) => hay.includes(k))) { seen.add(n.id); return true; }
    return false;
  });
  return hit.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}
