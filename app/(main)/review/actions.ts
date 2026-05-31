"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReview } from "@/lib/data/reviews";
import { ENTERPRISES } from "@/lib/data/enterprises";

export async function submitReviewAction(fd: FormData) {
  const user = String(fd.get("user") || "").trim() || "匿名业主";
  const enterprise = String(fd.get("enterprise") || "").trim();
  const project = String(fd.get("project") || "").trim();
  const rating = Math.min(5, Math.max(1, Number(fd.get("rating") || 5)));
  const content = String(fd.get("content") || "").trim();

  if (enterprise && content) {
    const ent = ENTERPRISES.find((e) => e.name === enterprise || e.hero.brand === enterprise);
    createReview({ user, enterprise, project, rating, content, category: ent?.category ?? "decor" });
    revalidatePath("/review");
  }
  redirect("/review?posted=1");
}
