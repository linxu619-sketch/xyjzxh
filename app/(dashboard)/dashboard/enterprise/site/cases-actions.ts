"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { createCase, getCase, deleteCase } from "@/lib/data/cases";

async function requireEnterprise() {
  const s = await getSession();
  if (!s || s.role !== "enterprise" || !s.enterpriseId) throw new Error("无权限：仅企业账号可管理案例");
  return s;
}

export async function createCaseAction(fd: FormData) {
  const s = await requireEnterprise();
  const title = String(fd.get("title") || "").trim();
  const cover = String(fd.get("cover") || "").trim();
  if (!title || !cover) {
    redirect("/dashboard/enterprise/site?cerr=1");
  }
  createCase({
    enterpriseId: s.enterpriseId!,
    title,
    cover,
    area: String(fd.get("area") || "").trim(),
    tag: String(fd.get("tag") || "").trim(),
    detail: String(fd.get("detail") || "").trim(),
  });

  const ent = await getEnterpriseBySlugOrId(s.enterpriseId!);
  if (ent) revalidatePath(`/biz/${ent.slug}`);
  revalidatePath("/dashboard/enterprise/site");
  redirect("/dashboard/enterprise/site?cok=1");
}

export async function deleteCaseAction(fd: FormData) {
  const s = await requireEnterprise();
  const id = Number(fd.get("id") || 0);
  const c = getCase(id);
  if (!c || c.enterpriseId !== s.enterpriseId) throw new Error("无权删除该案例");
  deleteCase(id);

  const ent = await getEnterpriseBySlugOrId(s.enterpriseId!);
  if (ent) revalidatePath(`/biz/${ent.slug}`);
  revalidatePath("/dashboard/enterprise/site");
  redirect("/dashboard/enterprise/site");
}
