"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { createReview } from "@/lib/data/reviews";
import { getEnterprises } from "@/lib/data/enterprises-source";

export async function submitReviewAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "customer") throw new Error("无权限：请用业主账号登录后评价");

  const enterprise = String(fd.get("enterprise") || "").trim();
  const project = String(fd.get("project") || "").trim();
  const content = String(fd.get("content") || "").trim();
  const rating = Math.min(5, Math.max(1, Number(fd.get("rating") || 5) || 5));
  if (!enterprise || content.length < 5) {
    redirect("/dashboard/customer/review?err=1");
  }

  // 按所选企业匹配类别（用于评价配色）+ 找到 slug 以刷新其子站
  const ents = await getEnterprises();
  const ent = ents.find((e) => e.hero.brand === enterprise || e.name === enterprise);
  const category = ent?.color ?? "decor";

  createReview({
    user: s.name || "业主",
    enterprise,
    project: project || "装修项目",
    rating,
    content,
    category,
    uid: s.uid,
  });

  revalidatePath("/review");
  revalidatePath("/dashboard/customer/review");
  if (ent) {
    revalidatePath(`/biz/${ent.slug}`);
    revalidatePath(`/biz/${ent.slug}/reviews`);
  }
  redirect("/dashboard/customer/review?ok=1");
}
