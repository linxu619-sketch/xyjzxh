"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, clearSession } from "@/lib/auth/session";
import { updateAccountProfile, deleteAccount } from "@/lib/data/accounts";

async function requireCustomer() {
  const s = await getSession();
  if (!s || s.role !== "customer") redirect("/login?role=customer");
  return s!;
}

// 修改称呼（业主可改的个人资料）
export async function updateProfileAction(fd: FormData) {
  const s = await requireCustomer();
  const name = String(fd.get("name") || "").trim().slice(0, 20);
  if (!name) redirect("/dashboard/customer/settings?perr=name");
  updateAccountProfile(s.phone, name);
  revalidatePath("/dashboard/customer/settings");
  revalidatePath("/dashboard/customer");
  redirect("/dashboard/customer/settings?saved=profile");
}

// 注销账号（不可恢复）——删账号后清会话回首页
export async function deleteAccountAction(fd: FormData) {
  const s = await requireCustomer();
  const confirm = String(fd.get("confirm") || "").trim();
  if (confirm !== s.phone) {
    redirect("/dashboard/customer/settings?perr=confirm");
  }
  deleteAccount(s.phone);
  await clearSession();
  redirect("/?bye=1");
}
