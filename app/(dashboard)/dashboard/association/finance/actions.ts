"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaffPermission } from "@/lib/auth/guard";
import {
  getFinanceApplication, setFinanceAppStatus, type FinAppStatus,
  createFinanceProduct, updateFinanceProduct, setFinanceProductStatus, deleteFinanceProduct,
  getFinanceProduct, type FinanceProductInput,
} from "@/lib/data/finance-source";
import {
  createInsuranceProduct, updateInsuranceProduct, setInsuranceProductStatus, deleteInsuranceProduct,
  getInsuranceProduct, type InsuranceProductInput,
} from "@/lib/data/insurance-products";
import { getClaim, setClaimStatus, type ClaimStatus } from "@/lib/data/insurance-claims";
import { operatorName } from "@/lib/dashboard/operator";

async function requireAssoc() {
  return requireStaffPermission("finance");
}
function refresh(fd?: FormData): never {
  revalidatePath("/dashboard/association/finance");
  revalidatePath("/dashboard/enterprise/finance");
  revalidatePath("/finance");
  revalidatePath("/insurance");
  const to = fd ? String(fd.get("redirect") || "") : "";
  if (to.startsWith("/dashboard/association/finance")) { revalidatePath(to); redirect(to); }
  redirect("/dashboard/association/finance#products");
}
function readProduct(fd: FormData): FinanceProductInput {
  return {
    name: String(fd.get("name") || "").trim(),
    provider: String(fd.get("provider") || "").trim(),
    type: String(fd.get("type") || "信用贷").trim(),
    rateLabel: String(fd.get("rateLabel") || "").trim(),
    amountLabel: String(fd.get("amountLabel") || "").trim(),
    termLabel: String(fd.get("termLabel") || "").trim(),
    forWhom: String(fd.get("forWhom") || "").trim(),
    color: String(fd.get("color") || "brand").trim(),
    highlights: String(fd.get("highlights") || "").split(/[\n,，、]+/).map((x) => x.trim()).filter(Boolean).slice(0, 6),
  };
}

export async function reviewFinanceAppAction(fd: FormData) {
  const s = await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as FinAppStatus;
  if (getFinanceApplication(id) && ["pending", "approved", "rejected", "disbursed"].includes(status)) setFinanceAppStatus(id, status, operatorName(s));
  refresh(fd);
}

export async function createFinanceProductAction(fd: FormData) {
  await requireAssoc();
  const p = readProduct(fd);
  if (p.name && p.provider) createFinanceProduct(p);
  refresh();
}

export async function updateFinanceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const p = readProduct(fd);
  if (getFinanceProduct(id) && p.name && p.provider) updateFinanceProduct(id, p);
  refresh(fd);
}

export async function toggleFinanceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const next = String(fd.get("status") || "") === "active" ? "active" : "off";
  if (getFinanceProduct(id)) setFinanceProductStatus(id, next);
  refresh(fd);
}

export async function deleteFinanceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  if (getFinanceProduct(id)) deleteFinanceProduct(id);
  refresh();
}

/* ---------------- 保险产品 CRUD ---------------- */
function readInsurance(fd: FormData): InsuranceProductInput {
  return {
    name: String(fd.get("name") || "").trim(),
    insurer: String(fd.get("insurer") || "").trim(),
    type: String(fd.get("type") || "其他").trim(),
    priceLabel: String(fd.get("priceLabel") || "").trim(),
    coverLabel: String(fd.get("coverLabel") || "").trim(),
    forWhom: String(fd.get("forWhom") || "").trim(),
    color: String(fd.get("color") || "decor").trim(),
    highlights: String(fd.get("highlights") || "").split(/[\n,，、]+/).map((x) => x.trim()).filter(Boolean).slice(0, 6),
    featured: String(fd.get("featured") || "") === "1",
  };
}
export async function createInsuranceProductAction(fd: FormData) {
  await requireAssoc();
  const p = readInsurance(fd);
  if (p.name && p.insurer) createInsuranceProduct(p);
  refresh();
}
export async function updateInsuranceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const p = readInsurance(fd);
  if (getInsuranceProduct(id) && p.name && p.insurer) updateInsuranceProduct(id, p);
  refresh(fd);
}
export async function toggleInsuranceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const next = String(fd.get("status") || "") === "active" ? "active" : "off";
  if (getInsuranceProduct(id)) setInsuranceProductStatus(id, next);
  refresh(fd);
}
export async function deleteInsuranceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  if (getInsuranceProduct(id)) deleteInsuranceProduct(id);
  refresh();
}

/* ---------------- 保险理赔受理 ---------------- */
export async function reviewClaimAction(fd: FormData) {
  const s = await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as ClaimStatus;
  if (getClaim(id) && ["pending", "reviewing", "settled", "rejected"].includes(status)) setClaimStatus(id, status, operatorName(s));
  revalidatePath("/dashboard/association/finance");
  revalidatePath("/dashboard/customer/insurance");
  const to = String(fd.get("redirect") || "");
  if (to.startsWith("/dashboard/association/finance")) { revalidatePath(to); redirect(to); }
  redirect("/dashboard/association/finance#claims");
}
