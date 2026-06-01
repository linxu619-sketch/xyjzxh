"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getFinanceProduct, createFinanceApplication } from "@/lib/data/finance-source";
import { createInsuranceOrder } from "@/lib/data/insurance-orders";

async function entCtx() {
  const s = await getSession();
  if (!s || s.role !== "enterprise" || !s.enterpriseId) throw new Error("无权限：仅企业账号可申请");
  const ent = await getEnterpriseBySlugOrId(s.enterpriseId);
  return { s, name: ent?.hero.brand ?? ent?.name ?? "本企业" };
}

export async function applyFinanceAction(fd: FormData) {
  const { s, name } = await entCtx();
  const productId = Number(fd.get("productId") || 0);
  const amount = String(fd.get("amount") || "").trim();
  const product = getFinanceProduct(productId);
  if (!product || !amount) redirect("/dashboard/enterprise/finance?ferr=1");
  createFinanceApplication({ enterpriseId: s.enterpriseId!, enterpriseName: name, product, amount, note: String(fd.get("note") || "").trim() });
  revalidatePath("/dashboard/enterprise/finance");
  revalidatePath("/dashboard/association/finance");
  redirect("/dashboard/enterprise/finance?fok=1");
}

export async function applyEnterpriseInsuranceAction(fd: FormData) {
  const { s, name } = await entCtx();
  const product = String(fd.get("product") || "工程履约保证保险").trim();
  createInsuranceOrder({ uid: s.enterpriseId!, product, applicant: name, phone: s.phone, note: "企业投保申请" });
  revalidatePath("/dashboard/enterprise/finance");
  revalidatePath("/dashboard/association/finance");
  redirect("/dashboard/enterprise/finance?iok=1");
}
