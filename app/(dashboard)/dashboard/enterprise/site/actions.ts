"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId, updateEnterpriseProfile } from "@/lib/data/enterprises-source";

// 保存子站资料 → 写回 enterprises 表，并刷新子站
export async function saveSiteAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise" || !s.enterpriseId) throw new Error("无权限：仅企业账号可编辑子站");

  const ent = await getEnterpriseBySlugOrId(s.enterpriseId);
  if (!ent) redirect("/dashboard/enterprise/site?err=1");

  const name = String(fd.get("name") || "").trim() || ent.name;
  const brand = String(fd.get("brand") || "").trim() || ent.hero.brand;
  const tagline = String(fd.get("tagline") || "").trim();
  const short = String(fd.get("short") || "").trim();
  const tel = String(fd.get("tel") || "").trim();
  const addr = String(fd.get("addr") || "").trim();
  const tags = String(fd.get("tags") || "")
    .split(/[,，、\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);

  const theme = String(fd.get("theme") || "").trim();
  updateEnterpriseProfile(s.enterpriseId, { name, brand, tagline, short, tel, addr, tags, theme });

  revalidatePath(`/biz/${ent.slug}`);
  revalidatePath("/dashboard/enterprise/site");
  revalidatePath("/dashboard/enterprise");
  redirect("/dashboard/enterprise/site?ok=1");
}
