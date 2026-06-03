"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  getFinanceApplication, setFinanceAppStatus, type FinAppStatus,
  createFinanceProduct, updateFinanceProduct, setFinanceProductStatus, deleteFinanceProduct,
  getFinanceProduct, type FinanceProductInput,
} from "@/lib/data/finance-source";
import {
  createInsuranceProduct, updateInsuranceProduct, setInsuranceProductStatus, deleteInsuranceProduct,
  getInsuranceProduct, type InsuranceProductInput,
} from "@/lib/data/insurance-products";

async function requireAssoc() {
  const s = await getSession();
  if (!s || (s.role !== "association" && s.role !== "system_admin")) throw new Error("无权限：仅协会工作人员可管理金融合作");
}
function refresh(): never {
  revalidatePath("/dashboard/association/finance");
  revalidatePath("/dashboard/enterprise/finance");
  revalidatePath("/finance");
  revalidatePath("/insurance");
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
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as FinAppStatus;
  if (getFinanceApplication(id) && ["pending", "approved", "rejected", "disbursed"].includes(status)) setFinanceAppStatus(id, status);
  refresh();
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
  refresh();
}

export async function toggleFinanceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const next = String(fd.get("status") || "") === "active" ? "active" : "off";
  if (getFinanceProduct(id)) setFinanceProductStatus(id, next);
  refresh();
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
  refresh();
}
export async function toggleInsuranceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  const next = String(fd.get("status") || "") === "active" ? "active" : "off";
  if (getInsuranceProduct(id)) setInsuranceProductStatus(id, next);
  refresh();
}
export async function deleteInsuranceProductAction(fd: FormData) {
  await requireAssoc();
  const id = Number(fd.get("id") || 0);
  if (getInsuranceProduct(id)) deleteInsuranceProduct(id);
  refresh();
}
