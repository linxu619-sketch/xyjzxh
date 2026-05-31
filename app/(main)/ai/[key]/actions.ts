"use server";

import { revalidatePath } from "next/cache";
import { createLead } from "@/lib/data/leads";

// AI 估价/咨询后「把需求发给企业」→ 生成线索（来源：AI 估价）。返回结果，不跳转（留在聊天页）。
export async function submitAiLeadAction(input: {
  enterpriseId: string;
  name: string;
  phone: string;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const name = (input.name || "").trim();
  const phone = (input.phone || "").trim();
  if (!input.enterpriseId || !name || !/^1\d{10}$/.test(phone)) {
    return { ok: false, error: "请填写称呼和 11 位手机号" };
  }
  createLead({
    enterpriseId: input.enterpriseId,
    name,
    phone,
    note: (input.note || "").slice(0, 200),
    source: "AI 估价",
  });
  revalidatePath("/dashboard/enterprise/leads");
  revalidatePath("/dashboard/enterprise");
  return { ok: true };
}
