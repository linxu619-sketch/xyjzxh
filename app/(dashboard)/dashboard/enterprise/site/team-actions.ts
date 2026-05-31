"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { createMember, getMember, deleteMember } from "@/lib/data/team";

async function requireEnterprise() {
  const s = await getSession();
  if (!s || s.role !== "enterprise" || !s.enterpriseId) throw new Error("无权限：仅企业账号可管理团队");
  return s;
}

export async function createMemberAction(fd: FormData) {
  const s = await requireEnterprise();
  const name = String(fd.get("name") || "").trim();
  const role = String(fd.get("role") || "").trim();
  if (!name || !role) {
    redirect("/dashboard/enterprise/site?terr=1");
  }
  createMember({ enterpriseId: s.enterpriseId!, name, role, exp: String(fd.get("exp") || "").trim() });

  const ent = await getEnterpriseBySlugOrId(s.enterpriseId!);
  if (ent) revalidatePath(`/biz/${ent.slug}`);
  revalidatePath("/dashboard/enterprise/site");
  redirect("/dashboard/enterprise/site?tok=1");
}

export async function deleteMemberAction(fd: FormData) {
  const s = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const m = getMember(id);
  if (!m || m.enterpriseId !== s.enterpriseId) throw new Error("无权删除该成员");
  deleteMember(id);

  const ent = await getEnterpriseBySlugOrId(s.enterpriseId!);
  if (ent) revalidatePath(`/biz/${ent.slug}`);
  revalidatePath("/dashboard/enterprise/site");
  redirect("/dashboard/enterprise/site");
}
