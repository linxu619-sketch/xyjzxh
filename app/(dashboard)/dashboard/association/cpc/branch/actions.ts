"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import {
  addCommittee, updateCommittee, deleteCommittee,
  addMember, updateMember, deleteMember,
  addMeeting, updateMeeting, deleteMeeting,
  addTopic, updateTopic, deleteTopic,
} from "@/lib/data/party-source";

function readImages(fd: FormData): string[] {
  return fd.getAll("images").map(String).map((s) => s.trim()).filter(Boolean).slice(0, 12);
}

async function requireParty() {
  await requireStaffPermission("party");
}
function refresh() {
  revalidatePath("/dashboard/association/cpc/branch");
  revalidatePath("/cpc");
}
const BASE = "/dashboard/association/cpc/branch";

/* ---------- 支部班子 ---------- */
export async function addCommitteeAction(fd: FormData) {
  await requireParty();
  const name = String(fd.get("name") || "").trim();
  const post = String(fd.get("post") || "委员").trim() || "委员";
  const duty = String(fd.get("duty") || "").trim();
  const sort = Number(fd.get("sort") || 0) || 0;
  if (name) addCommittee({ name, post, duty, sort });
  refresh();
  redirect(`${BASE}?tab=committee&ok=1`);
}
export async function updateCommitteeAction(fd: FormData) {
  await requireParty();
  const id = String(fd.get("id") || "").trim();
  const name = String(fd.get("name") || "").trim();
  const post = String(fd.get("post") || "委员").trim() || "委员";
  const duty = String(fd.get("duty") || "").trim();
  const sort = Number(fd.get("sort") || 0) || 0;
  if (id && name) updateCommittee(id, { name, post, duty, sort });
  refresh();
  redirect(`${BASE}?tab=committee&ok=1`);
}
export async function deleteCommitteeAction(fd: FormData) {
  await requireParty();
  const id = String(fd.get("id") || "").trim();
  if (id) deleteCommittee(id);
  refresh();
  redirect(`${BASE}?tab=committee`);
}

/* ---------- 党员名册 ---------- */
export async function addMemberAction(fd: FormData) {
  await requireParty();
  const name = String(fd.get("name") || "").trim();
  const kind = String(fd.get("kind") || "党员").trim() || "党员";
  const org = String(fd.get("org") || "").trim();
  const role = String(fd.get("role") || "").trim();
  const highlight = String(fd.get("highlight") || "").trim();
  const joined = String(fd.get("joined") || "").trim() || undefined;
  const sort = Number(fd.get("sort") || 0) || 0;
  if (name) addMember({ name, kind, org, role, highlight, joined, sort });
  refresh();
  redirect(`${BASE}?tab=members&ok=1`);
}
export async function updateMemberAction(fd: FormData) {
  await requireParty();
  const id = String(fd.get("id") || "").trim();
  const name = String(fd.get("name") || "").trim();
  const kind = String(fd.get("kind") || "党员").trim() || "党员";
  const org = String(fd.get("org") || "").trim();
  const role = String(fd.get("role") || "").trim();
  const highlight = String(fd.get("highlight") || "").trim();
  const joined = String(fd.get("joined") || "").trim() || undefined;
  const sort = Number(fd.get("sort") || 0) || 0;
  if (id && name) updateMember(id, { name, kind, org, role, highlight, joined, sort });
  refresh();
  redirect(`${BASE}?tab=members&ok=1`);
}
export async function deleteMemberAction(fd: FormData) {
  await requireParty();
  const id = String(fd.get("id") || "").trim();
  if (id) deleteMember(id);
  refresh();
  redirect(`${BASE}?tab=members`);
}

/* ---------- 三会一课台账 ---------- */
export async function addMeetingAction(fd: FormData) {
  await requireParty();
  const type = String(fd.get("type") || "主题党日").trim() || "主题党日";
  const title = String(fd.get("title") || "").trim();
  const date = String(fd.get("date") || "").trim();
  const location = String(fd.get("location") || "").trim();
  const host = String(fd.get("host") || "").trim();
  const attend = String(fd.get("attend") || "").trim();
  const summary = String(fd.get("summary") || "").trim();
  const images = readImages(fd);
  if (title && date) addMeeting({ type, title, date, location, host, attend, summary, images });
  refresh();
  redirect(`${BASE}?tab=meetings&ok=1`);
}
export async function updateMeetingAction(fd: FormData) {
  await requireParty();
  const id = String(fd.get("id") || "").trim();
  const type = String(fd.get("type") || "主题党日").trim() || "主题党日";
  const title = String(fd.get("title") || "").trim();
  const date = String(fd.get("date") || "").trim();
  const location = String(fd.get("location") || "").trim();
  const host = String(fd.get("host") || "").trim();
  const attend = String(fd.get("attend") || "").trim();
  const summary = String(fd.get("summary") || "").trim();
  const images = readImages(fd);
  if (id && title && date) updateMeeting(id, { type, title, date, location, host, attend, summary, images });
  refresh();
  redirect(`${BASE}?tab=meetings&ok=1`);
}
export async function deleteMeetingAction(fd: FormData) {
  await requireParty();
  const id = String(fd.get("id") || "").trim();
  if (id) deleteMeeting(id);
  refresh();
  redirect(`${BASE}?tab=meetings`);
}

/* ---------- 党建专题 ---------- */
export async function addTopicAction(fd: FormData) {
  await requireParty();
  const title = String(fd.get("title") || "").trim();
  const summary = String(fd.get("summary") || "").trim();
  const keywords = String(fd.get("keywords") || "").split(/[\n,，、]+/).map((x) => x.trim()).filter(Boolean).slice(0, 12);
  if (title) addTopic({ title, summary, keywords });
  refresh();
  redirect(`${BASE}?tab=topics&ok=1`);
}
export async function updateTopicAction(fd: FormData) {
  await requireParty();
  const id = String(fd.get("id") || "").trim();
  const title = String(fd.get("title") || "").trim();
  const summary = String(fd.get("summary") || "").trim();
  const keywords = String(fd.get("keywords") || "").split(/[\n,，、]+/).map((x) => x.trim()).filter(Boolean).slice(0, 12);
  if (id && title) updateTopic(id, { title, summary, keywords });
  refresh();
  redirect(`${BASE}?tab=topics&ok=1`);
}
export async function deleteTopicAction(fd: FormData) {
  await requireParty();
  const id = String(fd.get("id") || "").trim();
  if (id) deleteTopic(id);
  refresh();
  redirect(`${BASE}?tab=topics`);
}
