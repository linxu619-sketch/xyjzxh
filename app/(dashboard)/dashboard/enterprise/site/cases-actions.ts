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
  let images: string[] = [];
  try {
    const arr = JSON.parse(String(fd.get("images") || "[]"));
    if (Array.isArray(arr)) images = arr.filter((x): x is string => typeof x === "string" && !!x).slice(0, 10);
  } catch { /* ignore */ }
  if (!title || images.length === 0) {
    redirect("/dashboard/enterprise/site?cerr=1");
  }
  createCase({
    enterpriseId: s.enterpriseId!,
    title,
    cover: images[0],
    images,
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
