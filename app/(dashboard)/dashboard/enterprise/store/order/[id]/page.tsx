import { EnterpriseShell } from "@/components/dashboard/shell";
import { SellerOrderDetail } from "@/components/dashboard/seller-order-detail";

export const metadata = { title: "采购单详情 · 我的店铺" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <EnterpriseShell title="采购单详情" subtitle="履约状态流转 / 确认收款在此操作">
      <SellerOrderDetail id={Number(id)} />
    </EnterpriseShell>
  );
}
