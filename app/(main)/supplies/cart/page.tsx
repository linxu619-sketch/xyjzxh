import { redirect } from "next/navigation";

// 多商品采购车暂未上线：前台为单品直接下单。
// 旧 mock 购物车已下线，统一重定向回建材超市，避免展示过期演示数据。
export default function SupplyCartPage() {
  redirect("/supplies");
}
