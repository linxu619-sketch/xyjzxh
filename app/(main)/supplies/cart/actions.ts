"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getProduct, addToCart, setCartQty, removeCartItem, listCart, clearCart, createSupplyOrder,
} from "@/lib/data/supplies-source";
import { resolveSeller } from "@/lib/dashboard/seller";

export async function addToCartAction(fd: FormData) {
  const buyer = await resolveSeller();
  const productId = Number(fd.get("productId") || 0);
  const qty = Math.max(1, Number(fd.get("qty") || 1) || 1);
  const back = `/supplies/${productId}`;
  if (!buyer) redirect(`/login?role=association&next=${encodeURIComponent(back)}`);
  const p = getProduct(productId);
  if (!p || p.status !== "active") redirect(`${back}?err=off`);
  if (p!.sellerType === buyer!.type && p!.sellerId === buyer!.id) redirect(`${back}?err=self`);
  addToCart(buyer!.type, buyer!.id, productId, qty);
  revalidatePath("/supplies/cart");
  redirect("/supplies/cart?added=1");
}

export async function updateCartQtyAction(fd: FormData) {
  const buyer = await resolveSeller();
  if (!buyer) redirect("/login?role=association");
  setCartQty(buyer!.type, buyer!.id, Number(fd.get("cartId") || 0), Number(fd.get("qty") || 0));
  revalidatePath("/supplies/cart");
  redirect("/supplies/cart");
}

export async function removeCartAction(fd: FormData) {
  const buyer = await resolveSeller();
  if (!buyer) redirect("/login?role=association");
  removeCartItem(buyer!.type, buyer!.id, Number(fd.get("cartId") || 0));
  revalidatePath("/supplies/cart");
  redirect("/supplies/cart");
}

export async function checkoutCartAction() {
  const buyer = await resolveSeller();
  if (!buyer) redirect("/login?role=association");
  const lines = listCart(buyer!.type, buyer!.id);
  if (lines.length === 0) redirect("/supplies/cart?empty=1");
  for (const line of lines) {
    createSupplyOrder({ buyer: { type: buyer!.type, id: buyer!.id, name: buyer!.name }, product: line.product, qty: line.qty });
  }
  clearCart(buyer!.type, buyer!.id);
  revalidatePath("/dashboard/association/supply-orders");
  revalidatePath(buyer!.base);
  revalidatePath("/supplies/cart");
  redirect(`${buyer!.base}?ok=ordered`);
}
