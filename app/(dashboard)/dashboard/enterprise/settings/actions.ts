"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAccountByPhone, setAccountPassword } from "@/lib/data/accounts";
import { hashPassword } from "@/lib/auth/password";

// 企业账号自助改密（真功能）：校验长度 + 哈希入库
export async function setEnterprisePasswordAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise") redirect("/login?role=enterprise");
  const pwd = String(fd.get("password") || "");
  const phone = s!.phone;
  if (pwd.length >= 6 && phone && getAccountByPhone(phone)) {
    setAccountPassword(phone, hashPassword(pwd));
    redirect("/dashboard/enterprise/settings?pwd=1");
  }
  redirect("/dashboard/enterprise/settings?pwderr=1");
}
