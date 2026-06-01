"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { getProduct, createSupplyOrder } from "@/lib/data/supplies-source";

export async function placeSupplyOrderAction(fd: FormData) {
  const s = await getSession();
  if (!s || s.role !== "enterprise" || !s.enterpriseId) throw new Error("无权限：仅企业账号可采购");
  const productId = Number(fd.get("productId") || 0);
  const qty = Math.max(1, Number(fd.get("qty") || 1) || 1);
  const product = getProduct(productId);
  if (!product || product.status !== "active") redirect("/dashboard/enterprise/supplies?serr=1");

  const ent = await getEnterpriseBySlugOrId(s.enterpriseId);
  createSupplyOrder({
    enterpriseId: s.enterpriseId,
    enterpriseName: ent?.hero.brand ?? ent?.name ?? "本企业",
    product,
    qty,
  });
  revalidatePath("/dashboard/enterprise/supplies");
  revalidatePath("/dashboard/association/supplies");
  redirect("/dashboard/enterprise/supplies?sok=1");
}
