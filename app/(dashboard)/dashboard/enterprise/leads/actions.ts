"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getLead, setLeadStatus, type LeadStatus } from "@/lib/data/leads";

const VALID: LeadStatus[] = ["new", "contacting", "surveying", "signed", "lost"];

export async function updateLeadStatusAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise") throw new Error("无权限：仅企业账号可操作线索");

  const id = Number(fd.get("id") || 0);
  const status = String(fd.get("status") || "") as LeadStatus;
  if (!id || !VALID.includes(status)) return;

  const lead = getLead(id);
  if (!lead) throw new Error("线索不存在");
  if (lead.enterpriseId !== s.enterpriseId) throw new Error("无权操作该线索（不属于本企业）");

  setLeadStatus(id, status);
  revalidatePath("/dashboard/enterprise/leads");
  revalidatePath("/dashboard/enterprise");
  redirect(`/dashboard/enterprise/leads/${id}`);
}
