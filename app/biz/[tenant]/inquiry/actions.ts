"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createLead } from "@/lib/data/leads";
import { getSession } from "@/lib/auth/session";

// 在线咨询页「留电话回电」→ 生成线索（来源：在线咨询）
export async function submitInquiryLeadAction(fd: FormData) {
  const tenant = String(fd.get("tenant") || "").trim();
  const enterpriseId = String(fd.get("enterpriseId") || "").trim();
  const name = String(fd.get("name") || "").trim();
  const phone = String(fd.get("phone") || "").trim();
  const note = String(fd.get("note") || "").trim();

  if (!enterpriseId || !name || !/^1\d{10}$/.test(phone)) {
    redirect(`/biz/${tenant}/inquiry?err=1`);
  }

  const s = await getSession();
  const uid = s?.role === "customer" ? s.uid : undefined;
  createLead({ enterpriseId, uid, name, phone, note, source: "在线咨询" });

  revalidatePath("/dashboard/enterprise/leads");
  revalidatePath("/dashboard/enterprise");
  revalidatePath("/dashboard/customer/requests");
  redirect(`/biz/${tenant}/inquiry?ok=1`);
}
