"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAccountByPhone, setAccountStatus, type AccountStatus } from "@/lib/data/accounts";

export async function setAccountStatusAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可管理账号");
  const phone = String(fd.get("phone") || "").trim();
  const status = String(fd.get("status") || "") as AccountStatus;
  if (phone && getAccountByPhone(phone) && ["active", "rejected", "pending"].includes(status)) {
    setAccountStatus(phone, status);
  }
  revalidatePath("/dashboard/association/users");
  const to = String(fd.get("redirect") || "");
  if (to.startsWith("/dashboard/association/users")) {
    revalidatePath(to);
    redirect(to);
  }
  redirect(`/dashboard/association/users${fd.get("tab") ? `?tab=${fd.get("tab")}` : ""}`);
}
