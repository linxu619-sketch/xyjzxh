"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getFinanceApplication, setFinanceAppStatus, type FinAppStatus } from "@/lib/data/finance-source";

export async function reviewFinanceAppAction(fd: FormData) {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限");
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as FinAppStatus;
  if (getFinanceApplication(id) && ["pending", "approved", "rejected", "disbursed"].includes(status)) setFinanceAppStatus(id, status);
  revalidatePath("/dashboard/association/finance");
  revalidatePath("/dashboard/enterprise/finance");
  redirect("/dashboard/association/finance");
}
