"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { createNews, setNewsStatus, deleteNews, getNews, type NewsStatus } from "@/lib/data/news-source";

// 党建工作台仅管「党建」「理论学习」两类，且由独立权限 party 门控
const PARTY_CATS = ["党建", "理论学习"] as const;
function isPartyCat(c: string): boolean {
  return (PARTY_CATS as readonly string[]).includes(c);
}

async function requireParty() {
  await requireStaffPermission("party");
}

function refresh() {
  revalidatePath("/dashboard/association/cpc");
  revalidatePath("/cpc");
  revalidatePath("/news");
  revalidatePath("/xh");
}

export async function createPartyNewsAction(fd: FormData) {
  await requireParty();
  const title = String(fd.get("title") || "").trim();
  let category = String(fd.get("category") || "党建").trim();
  if (!isPartyCat(category)) category = "党建"; // 防御：党建工作台只能发这两类
  const excerpt = String(fd.get("excerpt") || "").trim();
  const content = String(fd.get("content") || "").trim();
  if (!title || !content) redirect("/dashboard/association/cpc?nerr=1");
  const cover = String(fd.get("cover") || "").trim() || undefined;
  const images = fd.getAll("images").map(String).filter(Boolean);
  createNews({
    title, category, excerpt: excerpt || content.slice(0, 60), content,
    author: String(fd.get("author") || "协会党支部").trim() || "协会党支部",
    hot: fd.get("hot") === "on",
    status: fd.get("draft") === "on" ? "draft" : "published",
    cover, images,
  });
  refresh();
  redirect("/dashboard/association/cpc?nok=1");
}

export async function setPartyNewsStatusAction(fd: FormData) {
  await requireParty();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as NewsStatus;
  const n = getNews(id);
  // 仅允许操作党建 / 理论学习内容，防止越权管理其它新闻
  if (n && isPartyCat(n.category) && (status === "published" || status === "draft")) setNewsStatus(id, status);
  refresh();
  redirect(`/dashboard/association/cpc/${id}`);
}

export async function deletePartyNewsAction(fd: FormData) {
  await requireParty();
  const id = Number(fd.get("id") || 0);
  const n = getNews(id);
  if (n && isPartyCat(n.category)) deleteNews(id);
  refresh();
  redirect("/dashboard/association/cpc");
}
