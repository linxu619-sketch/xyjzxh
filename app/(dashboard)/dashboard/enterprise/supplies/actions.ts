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
  if (product.sellerType === "enterprise" && product.sellerId === s.enterpriseId) {
    redirect("/dashboard/enterprise/supplies?serr=self"); // 不能买自己上架的商品
  }
  createSupplyOrder({
    buyer: { type: "enterprise", id: s.enterpriseId, name: ent?.hero.brand ?? ent?.name ?? s.name ?? "本企业" },
    product,
    qty,
  });
  revalidatePath("/dashboard/enterprise/supplies");
  revalidatePath("/dashboard/association/supplies");
  revalidatePath(product.sellerType === "enterprise" ? "/dashboard/enterprise/store" : "/dashboard/practitioner/store");
  redirect("/dashboard/enterprise/supplies?sok=1");
}
