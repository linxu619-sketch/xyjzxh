"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isPractitionerPreview } from "@/lib/dashboard/preview";
import { setPayoutAccount } from "@/lib/data/practitioners-source";
import { releaseHoldingPayouts } from "@/lib/data/wage-payouts";

// 绑定/更新收款账户 → 自动补发挂账工资
export async function bindPayoutAccountAction(fd: FormData) {
  const s = await getSession();
  if (isPractitionerPreview(s)) redirect("/dashboard/practitioner/income?pv=1"); // 预览态只读
  if (!s || s.role !== "practitioner") throw new Error("无权限：仅从业者可绑定收款账户");
  const method = String(fd.get("method") || "").trim();
  const account = String(fd.get("account") || "").trim();
  const name = String(fd.get("name") || "").trim();
  if (!["wechat", "alipay", "bank"].includes(method) || !account || !name) {
    redirect("/dashboard/practitioner/income?bankerr=1");
  }
  setPayoutAccount(s.phone, { method, account, name });
  const released = releaseHoldingPayouts(s.phone); // 绑后自动把挂账工资补发为到账
  revalidatePath("/dashboard/practitioner/income");
  revalidatePath("/dashboard/practitioner/jobs");
  redirect(`/dashboard/practitioner/income?bankok=1${released > 0 ? `&released=${released}` : ""}`);
}
