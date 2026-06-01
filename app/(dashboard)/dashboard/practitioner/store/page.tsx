import { PractitionerShell } from "@/components/dashboard/practitioner-shell";
import { SellerPanel } from "@/components/dashboard/seller-panel";

export const metadata = { title: "我的店铺 · 个人工作台" };

export default async function PractitionerStorePage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  return (
    <PractitionerShell title="我的店铺 · 卖货" subtitle="凭独家代理 / 自产自销 / 厂家直供资格，向会员批发销售（需协会审核）">
      <SellerPanel sp={sp} />
    </PractitionerShell>
  );
}
