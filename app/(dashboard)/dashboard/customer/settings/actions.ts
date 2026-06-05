"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, clearSession, setSession } from "@/lib/auth/session";
import { updateAccountProfile, deleteAccount, updateAccountPhone, getAccountByPhone } from "@/lib/data/accounts";

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

// 换绑手机号（短信验证码核验后更新登录手机号 + 会话）
// 演示：验证码任意 4-6 位即通过（与登录一致，接入短信网关后替换）；
// 但换绑特有的真校验照常执行：新号格式 / 不同于原号 / 未被占用。
export async function rebindPhoneAction(fd: FormData) {
  const s = await requireCustomer();
  const newPhone = String(fd.get("newPhone") || "").trim();
  const code = String(fd.get("code") || "").trim();
  if (!/^1\d{10}$/.test(newPhone)) redirect("/dashboard/customer/settings?perr=phone_format");
  if (!/^\d{4,6}$/.test(code)) redirect("/dashboard/customer/settings?perr=phone_code");
  if (newPhone === s.phone) redirect("/dashboard/customer/settings?perr=phone_same");
  if (getAccountByPhone(newPhone)) redirect("/dashboard/customer/settings?perr=phone_taken");

  updateAccountPhone(s.phone, newPhone);
  // 更新会话(保留 uid 以延续本次会话数据关联)
  await setSession({ uid: s.uid, role: s.role, name: s.name, phone: newPhone, staffRole: s.staffRole });
  revalidatePath("/dashboard/customer/settings");
  redirect("/dashboard/customer/settings?saved=phone");
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
