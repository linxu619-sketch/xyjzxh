import { EnterpriseShell } from "@/components/dashboard/shell";
import { SellerProductDetail } from "@/components/dashboard/seller-product-detail";

export const metadata = { title: "商品详情 · 我的店铺" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <EnterpriseShell title="商品详情" subtitle="上架 / 下架在此操作">
      <SellerProductDetail id={Number(id)} />
    </EnterpriseShell>
  );
}
