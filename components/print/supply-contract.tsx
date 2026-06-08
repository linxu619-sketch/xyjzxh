import { SITE } from "@/lib/site";
import type { SupplyOrder } from "@/lib/data/supplies-source";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";

/* ============================================================
   建材集采购销单（A4 打印，单页）
   ------------------------------------------------------------
   主体＝买卖双方（甲方买方 / 乙方卖方）；协会不是交易主体，仅作为集采
   平台做资格审核 + 质量背书 + 争议调解的见证（不盖章，LOGO 水印 + 背书声明）。
   交货期 / 交货地址 / 付款方式 / 含税与否 / 双方联系人电话等以下划线留白，
   由买卖双方签订时自行填写。协会自营单时乙方即协会，声明自动切换。
   ============================================================ */

const SELLER_KIND: Record<string, string> = { association: "协会自营", enterprise: "企业会员", practitioner: "个人会员" };

function fmtCN(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()} 年 ${p(d.getMonth() + 1)} 月 ${p(d.getDate())} 日`; }
function fmtDay(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }

// 金额转人民币大写（整数元）
function amountCN(n: number): string {
  const v = Math.max(0, Math.floor(n));
  if (v === 0) return "零元整";
  const digits = "零壹贰叁肆伍陆柒捌玖";
  const units = ["", "拾", "佰", "仟"];
  const bigUnits = ["", "万", "亿", "兆"];
  const groups: string[] = [];
  let s = String(v);
  while (s.length) { groups.unshift(s.slice(-4)); s = s.slice(0, -4); }
  let result = "";
  groups.forEach((g, gi) => {
    let gStr = "";
    let zero = false;
    for (let i = 0; i < g.length; i++) {
      const d = Number(g[i]);
      const pos = g.length - 1 - i;
      if (d === 0) zero = true;
      else { if (zero) gStr += "零"; zero = false; gStr += digits[d] + units[pos]; }
    }
    if (gStr) result += gStr + bigUnits[groups.length - 1 - gi];
  });
  return result + "元整";
}

// 待填留白（下划线）
function Blank({ w = 90 }: { w?: number }) {
  return <span className="inline-block border-b border-black align-bottom mx-1" style={{ minWidth: `${w}px`, height: "1.05em" }}>&nbsp;</span>;
}
// 有值则印出，无值留下划线（合同字段优先从甲乙双方数据库自动调取）
function Fill({ value, w = 90 }: { value?: string; w?: number }) {
  return value ? <span className="font-medium">{value}</span> : <Blank w={w} />;
}

export async function SupplyOrderContract({ order, org }: { order: SupplyOrder; org?: { name?: string; tel?: string; address?: string } }) {
  const o = order;
  const docNo = `XYJZ-CG-${String(o.id).padStart(4, "0")}`;
  const assocName = org?.name || SITE.name;
  const assocTel0 = org?.tel || SITE.tel;
  const isAssocSeller = o.sellerType === "association";
  const settleText = o.settleStatus === "paid" ? "已结清 / 付讫" : `账期月结 30 天 · 至 ${fmtDay(o.dueAt)}`;

  // 自动调取甲乙双方联系信息（联系人无独立字段，留白手填）
  const buyerEnt = o.buyerId ? await getEnterpriseBySlugOrId(o.buyerId) : undefined;
  const sellerEnt = o.sellerType !== "association" && o.sellerId ? await getEnterpriseBySlugOrId(o.sellerId) : undefined;
  const buyerTel = buyerEnt?.contact?.tel || "";
  const buyerAddr = buyerEnt?.contact?.addr || buyerEnt?.district || "";
  const sellerTel = isAssocSeller ? assocTel0 : (sellerEnt?.contact?.tel || "");

  const Cell = "border border-black px-2.5 py-1 align-top";
  const Th = "border border-black bg-[#f2f2f2] px-2.5 py-1 text-left font-medium align-top whitespace-nowrap";

  const terms = [
    `商品验收：乙方按本单约定的品名、规格、数量供货；甲方应于收货之日起 3 日内验收，逾期未提书面异议的视为验收合格。`,
    `质量与售后：乙方对商品质量、规格及合法合规负责，并按国家标准及双方约定提供质保、退换与售后服务。`,
    `违约责任：任何一方未按约履行的，应承担继续履行、采取补救措施或赔偿对方直接损失等违约责任。`,
    `争议解决：因本单产生争议的，双方先行协商；协商不成可申请 ${assocName} 集采平台调解，或依法向有管辖权的机构主张。`,
    `本单一式两份，甲乙双方各执一份，自双方签章之日起生效；未尽事宜由双方另行签订补充协议。`,
  ];

  return (
    <div className="a4-sheet text-black relative overflow-hidden">
      {/* 协会 LOGO 水印（淡，不盖章）*/}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/seal.png" alt="" className="w-[56%] max-w-[350px] opacity-[0.06] -rotate-12 select-none" />
      </div>

      <div className="relative">
        {/* 表头 */}
        <header className="text-center">
          <h1 className="text-[22px] font-bold tracking-[0.3em]">建材集采购销单</h1>
          <div className="mt-0.5 text-[10px] tracking-widest text-gray-500 uppercase">Building-Materials Purchase &amp; Sale Order</div>
          <div className="mt-2 border-t-2 border-black" />
        </header>
        <div className="mt-2 flex items-center justify-between text-[12px]">
          <span>单据编号：<b className="font-mono">{docNo}</b></span>
          <span>签订日期：{fmtCN(o.createdAt)}</span>
        </div>

        {/* 甲乙双方（含联系人 / 电话留白）*/}
        <table className="w-full border-collapse text-[12px] mt-2">
          <tbody>
            <tr>
              <th className={`${Th} w-[88px]`}>甲方（买方）</th>
              <td className={Cell}>{o.buyerName || o.enterpriseName || "—"}</td>
              <th className={`${Th} w-[88px]`}>乙方（卖方）</th>
              <td className={Cell}>{o.sellerName || "—"}<span className="text-[10px] text-gray-500 ml-1">（{SELLER_KIND[o.sellerType] ?? o.sellerType}）</span></td>
            </tr>
            <tr>
              <th className={Th}>联系人 / 电话</th>
              <td className={Cell}><Blank w={56} />/<Fill value={buyerTel} w={84} /></td>
              <th className={Th}>联系人 / 电话</th>
              <td className={Cell}><Blank w={56} />/<Fill value={sellerTel} w={84} /></td>
            </tr>
          </tbody>
        </table>

        {/* 一、商品明细 */}
        <div className="mt-2.5 text-[12px] font-semibold">一、商品明细</div>
        <table className="w-full border-collapse text-[12px] mt-1 text-center">
          <thead>
            <tr><th className={Th}>品名</th><th className={Th}>规格 / 单位</th><th className={Th}>单价</th><th className={Th}>数量</th><th className={Th}>金额</th></tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${Cell} text-left`}>{o.productName}</td>
              <td className={Cell}>{o.unit}</td>
              <td className={Cell}>¥{o.unitPrice.toLocaleString()}</td>
              <td className={Cell}>{o.qty} {o.unit}</td>
              <td className={`${Cell} font-semibold`}>¥{o.total.toLocaleString()}</td>
            </tr>
            <tr>
              <td className={`${Th} text-left`} colSpan={4}>合计金额（大写）：{amountCN(o.total)}　｜　价格：☐ 含税　☐ 不含税</td>
              <td className={`${Cell} font-bold`}>¥{o.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        {/* 二、交货与结算（留白填写）*/}
        <div className="mt-2.5 text-[12px] font-semibold">二、交货与结算</div>
        <table className="w-full border-collapse text-[12px] mt-1">
          <tbody>
            <tr>
              <th className={`${Th} w-[88px]`}>交货期</th><td className={Cell} colSpan={3}><Blank w={140} />（如：现货当天 / 7 个工作日）</td>
            </tr>
            <tr>
              <th className={Th}>付款方式</th><td className={Cell} colSpan={3}>☐ 支付宝　☐ 微信支付　☐ 银行转账(对公)　☐ 银行转账(对私)　☐ 承兑汇票　☐ 现金</td>
            </tr>
            <tr>
              <th className={Th}>交货地址</th><td className={Cell} colSpan={3}><Fill value={buyerAddr} w={420} /></td>
            </tr>
            <tr>
              <th className={Th}>账期 / 结算</th><td className={Cell} colSpan={3}>{settleText}（具体付款节点由双方约定）</td>
            </tr>
          </tbody>
        </table>

        {/* 三、其他约定 */}
        <div className="mt-2.5 text-[12px] font-semibold">三、其他约定</div>
        <ol className="mt-0.5 text-[11px] leading-[1.55] list-decimal pl-5 space-y-0">
          {terms.map((t, i) => <li key={i}>{t}</li>)}
        </ol>

        {/* 集采平台背书声明 */}
        <div className="mt-2.5 rounded border border-[#267c7c]/50 bg-[#267c7c]/[0.06] p-2 text-[10.5px] leading-[1.5] text-[#1c5e5e]">
          <b>集采平台背书</b>：本单商品由 {assocName} 集采平台审核上架（资格核验 · 价格擂台 · 同品牌唯一最低价），平台提供质量背书与争议调解。{isAssocSeller ? "本单为协会集采自营。" : "协会不作为本次交易主体，购销关系存在于甲乙双方之间。"}
        </div>

        {/* 落款：仅甲乙双方签章（协会不盖章）*/}
        <div className="mt-5 grid grid-cols-2 gap-x-12 gap-y-1 text-[12px]">
          <div className="flex items-end gap-2"><span className="text-gray-600 whitespace-nowrap">甲方（买方）签章：</span><span className="flex-1 border-b border-black h-6" /></div>
          <div className="flex items-end gap-2"><span className="text-gray-600 whitespace-nowrap">乙方（卖方）签章：</span><span className="flex-1 border-b border-black h-6" /></div>
          <div className="text-[11px] text-gray-500 mt-0.5">　　　　年　　月　　日</div>
          <div className="text-[11px] text-gray-500 mt-0.5 text-right">　　　　年　　月　　日</div>
        </div>
      </div>
    </div>
  );
}
