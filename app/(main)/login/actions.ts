"use server";

import { redirect } from "next/navigation";
import { setSession, clearSession } from "@/lib/auth/session";
import {
  loginWithPassword,
  loginCustomerWithSms,
  loginPractitionerWithSms,
  loginEnterpriseWithPassword,
  loginEnterpriseWithSms,
} from "@/lib/auth/login";

export type ActionResult = { ok: boolean; error?: string };

// 登录后回跳目标：仅允许站内相对路径（防开放重定向）；无效则用各身份默认页。
function nextOr(formData: FormData, fallback: string): string {
  const n = String(formData.get("next") || "");
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

export async function loginAssociationAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const phone = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");
  const res = await loginWithPassword(phone, password);
  if (!res.ok) return { ok: false, error: res.error };
  await setSession(res.session);
  redirect(nextOr(formData, "/dashboard/association"));
}

export async function loginEnterpriseAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const phone = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");
  const res = await loginEnterpriseWithPassword(phone, password);
  if (!res.ok) return { ok: false, error: res.error };
  await setSession(res.session);
  redirect(res.pending ? "/dashboard/pending" : nextOr(formData, "/dashboard/enterprise"));
}

export async function loginEnterpriseSmsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const phone = String(formData.get("phone") || "");
  const code = String(formData.get("code") || "");
  const res = await loginEnterpriseWithSms(phone, code);
  if (!res.ok) return { ok: false, error: res.error };
  await setSession(res.session);
  redirect(res.pending ? "/dashboard/pending" : nextOr(formData, "/dashboard/enterprise"));
}

export async function loginCustomerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const phone = String(formData.get("phone") || "");
  const code = String(formData.get("code") || "");
  const res = await loginCustomerWithSms(phone, code);
  if (!res.ok) return { ok: false, error: res.error };
  await setSession(res.session);
  // 业主是 C 端消费者：登录后回到 next（如刚要办的事）或消费者门户首页继续浏览
  redirect(nextOr(formData, "/"));
}

export async function loginPractitionerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const phone = String(formData.get("phone") || "");
  const code = String(formData.get("code") || "");
  const res = await loginPractitionerWithSms(phone, code);
  if (!res.ok) return { ok: false, error: res.error };
  await setSession(res.session);
  redirect(res.pending ? "/dashboard/pending" : nextOr(formData, "/dashboard/practitioner"));
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
