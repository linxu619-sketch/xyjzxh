import "server-only";
import { getSession } from "@/lib/auth/session";
import type { SellerType } from "@/lib/data/supplies-source";

export type Seller = { type: SellerType; id: string; name: string; base: string };

// 从会话解析卖家身份（企业会员 / 个人会员）；返回 null 表示无上架资格
export async function resolveSeller(): Promise<Seller | null> {
  const s = await getSession();
  if (!s || s.pending) return null;
  if (s.role === "enterprise" && s.enterpriseId) {
    return { type: "enterprise", id: s.enterpriseId, name: s.name || "企业会员", base: "/dashboard/enterprise/store" };
  }
  if (s.role === "practitioner") {
    const id = s.uid.replace(/^prac-/, ""); // prac-p-5 → p-5
    if (!id || id.startsWith("pending")) return null;
    return { type: "practitioner", id, name: s.name || "个人会员", base: "/dashboard/practitioner/store" };
  }
  return null;
}
