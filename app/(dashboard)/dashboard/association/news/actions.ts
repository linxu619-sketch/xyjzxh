"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import { createNews, setNewsStatus, deleteNews, getNews, type NewsStatus } from "@/lib/data/news-source";

async function requireAssoc() {
  await requireStaffPermission("news");
}

function refresh() {
  revalidatePath("/dashboard/association/news");
  revalidatePath("/news");
  revalidatePath("/xh");
}

export async function createNewsAction(fd: FormData) {
  await requireAssoc();
  const title = String(fd.get("title") || "").trim();
  const category = String(fd.get("category") || "协会公告").trim();
  const excerpt = String(fd.get("excerpt") || "").trim();
  const content = String(fd.get("content") || "").trim();
  if (!title || !content) redirect("/dashboard/association/news?nerr=1");
  createNews({
    title, category, excerpt: excerpt || content.slice(0, 60), content,
    author: String(fd.get("author") || "协会秘书处").trim() || "协会秘书处",
    hot: fd.get("hot") === "on",
    status: fd.get("draft") === "on" ? "draft" : "published",
  });
  refresh();
  redirect("/dashboard/association/news?nok=1");
}

export async function setNewsStatusAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as NewsStatus;
  if (getNews(id) && (status === "published" || status === "draft")) setNewsStatus(id, status);
  refresh();
  redirect(`/dashboard/association/news/${id}`);
}

export async function deleteNewsAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  if (getNews(id)) deleteNews(id);
  refresh();
  redirect("/dashboard/association/news");
}
