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

export async function loginAssociationAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const phone = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");
  const res = await loginWithPassword(phone, password);
  if (!res.ok) return { ok: false, error: res.error };
  await setSession(res.session);
  redirect("/dashboard/association");
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
  redirect(res.pending ? "/dashboard/pending" : "/dashboard/enterprise");
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
  redirect(res.pending ? "/dashboard/pending" : "/dashboard/enterprise");
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
  // 业主是 C 端消费者：登录后回到消费者门户首页继续浏览（个人中心在底栏「我的」/dashboard/customer）
  redirect("/");
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
  redirect(res.pending ? "/dashboard/pending" : "/dashboard/practitioner");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
