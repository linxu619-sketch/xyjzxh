"use server";

import { redirect } from "next/navigation";
import { setSession, clearSession } from "@/lib/auth/session";
import {
  loginWithPassword,
  loginCustomerWithSms,
  loginPractitionerWithSms,
  loginEnterpriseWithPassword,
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

export async function loginCustomerAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const phone = String(formData.get("phone") || "");
  const code = String(formData.get("code") || "");
  const res = await loginCustomerWithSms(phone, code);
  if (!res.ok) return { ok: false, error: res.error };
  await setSession(res.session);
  redirect("/dashboard/customer");
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
