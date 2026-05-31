"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createLead } from "@/lib/data/leads";

// 子站「提交正式需求」→ 写入 leads 表，归属该企业
export async function submitLeadAction(fd: FormData) {
  const tenant = String(fd.get("tenant") || "").trim();
  const enterpriseId = String(fd.get("enterpriseId") || "").trim();
  const name = String(fd.get("name") || "").trim();
  const phone = String(fd.get("phone") || "").trim();

  // 基础校验：姓名 + 11 位手机号必填
  if (!enterpriseId || !name || !/^1\d{10}$/.test(phone)) {
    redirect(`/biz/${tenant}/order?err=1`);
  }

  createLead({
    enterpriseId,
    name,
    phone,
    type: String(fd.get("type") || ""),
    style: String(fd.get("style") || ""),
    area: String(fd.get("area") || ""),
    budget: String(fd.get("budget") || ""),
    address: String(fd.get("address") || ""),
    note: String(fd.get("note") || ""),
    source: "子站表单",
  });

  revalidatePath("/dashboard/enterprise/leads");
  revalidatePath("/dashboard/enterprise");
  redirect(`/biz/${tenant}/order?ok=1`);
}
