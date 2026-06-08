import { SITE } from "@/lib/site";
import type { SupplyOrder } from "@/lib/data/supplies-source";

/* ============================================================
   建材集采购销单（A4 打印，单页）
   ------------------------------------------------------------
   主体＝买卖双方（甲方买方 / 乙方卖方）；协会不是交易主体，
   仅作为「集采平台」做资格审核 + 质量背书 + 争议调解的见证（不盖章，
   仅以 LOGO 水印 + 背书声明体现）。协会自营单时乙方即协会，自然成立。
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

export function SupplyOrderContract({ order, org }: { order: SupplyOrder; org?: { name?: string; tel?: string; address?: string } }) {
  const o = order;
  const docNo = `XYJZ-CG-${String(o.id).padStart(4, "0")}`;
  const assocName = org?.name || SITE.name;
  const assocTel = org?.tel || SITE.tel;
  const isAssocSeller = o.sellerType === "association";
  const settleText = o.settleStatus === "paid" ? "已结清 / 付讫" : `未结清 · 账期至 ${fmtDay(o.dueAt)}（月结 30 天）`;

  const Cell = "border border-black px-3 py-1 align-top";
  const Th = "border border-black bg-[#f2f2f2] px-3 py-1 text-left font-medium align-top whitespace-nowrap";

  // 买卖双方约定条款
  const terms = [
    `商品验收：乙方按本单约定的品名、规格、数量供货；甲方应于收货之日起 3 日内验收，逾期未提书面异议的，视为验收合格。`,
    `质量与售后：乙方对商品质量、规格及合法合规负责，并按国家标准与双方约定提供质保、退换及售后服务。`,
    `结算与付款：按本单结算方式（${o.settleStatus === "paid" ? "已结清" : "账期月结 30 天 / 平台收银台即付"}）执行，甲方应按期足额付款，不得无故拖欠。`,
    `交付与风险：交付方式与时间由双方约定；商品毁损、灭失的风险自交付时起转移给甲方。`,
    `违约责任：任何一方未按约履行的，应承担继续履行、赔偿对方直接损失等违约责任。`,
    `争议解决：因本单产生争议的，双方先行协商；协商不成可申请 ${assocName} 集采平台调解，或依法向有管辖权的机构主张。`,
    `本单一式两份，甲乙双方各执一份，自双方签章之日起生效；未尽事宜双方另行协商补充。`,
  ];

  return (
    <div className="a4-sheet text-black relative overflow-hidden">
      {/* 协会 LOGO 水印（淡，不盖章）*/}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/seal.png" alt="" className="w-[58%] max-w-[360px] opacity-[0.06] -rotate-12 select-none" />
      </div>

      <div className="relative">
        {/* 表头 */}
        <header className="text-center">
          <h1 className="text-[23px] font-bold tracking-[0.3em]">建材集采购销单</h1>
          <div className="mt-0.5 text-[10px] tracking-widest text-gray-500 uppercase">Building-Materials Purchase &amp; Sale Order</div>
          <div className="mt-2.5 border-t-2 border-black" />
        </header>
        <div className="mt-2.5 flex items-center justify-between text-[12px]">
          <span>单据编号：<b className="font-mono">{docNo}</b></span>
          <span>签订日期：{fmtCN(o.createdAt)}</span>
        </div>

        {/* 甲乙双方 */}
        <table className="w-full border-collapse text-[13px] mt-2.5">
          <tbody>
            <tr>
              <th className={`${Th} w-[104px]`}>甲方（买方）</th>
              <td className={Cell}>{o.buyerName || o.enterpriseName || "—"}</td>
              <th className={`${Th} w-[104px]`}>乙方（卖方）</th>
              <td className={Cell}>{o.sellerName || "—"}<span className="text-[11px] text-gray-500 ml-1.5">（{SELLER_KIND[o.sellerType] ?? o.sellerType}）</span></td>
            </tr>
          </tbody>
        </table>

        {/* 一、商品明细 */}
        <div className="mt-3 text-[12px] font-semibold">一、商品明细</div>
        <table className="w-full border-collapse text-[13px] mt-1 text-center">
          <thead>
            <tr>
              <th className={Th}>品名</th><th className={Th}>规格 / 单位</th><th className={Th}>单价</th><th className={Th}>数量</th><th className={Th}>金额</th>
            </tr>
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
              <td className={`${Th} text-left`} colSpan={4}>合计金额（大写）：{amountCN(o.total)}</td>
              <td className={`${Cell} font-bold`}>¥{o.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-1.5 text-[12px]">结算方式：{settleText}</div>

        {/* 二、买卖双方约定 */}
        <div className="mt-3 text-[12px] font-semibold">二、买卖双方约定</div>
        <ol className="mt-1 text-[11px] leading-[1.65] list-decimal pl-5 space-y-0.5">
          {terms.map((t, i) => <li key={i}>{t}</li>)}
        </ol>

        {/* 集采平台背书声明 */}
        <div className="mt-3 rounded border border-[#267c7c]/50 bg-[#267c7c]/[0.06] p-2.5 text-[11px] leading-5 text-[#1c5e5e]">
          <b>集采平台背书</b>：本单商品由 {assocName} 集采平台审核上架（资格核验 · 价格擂台 · 同品牌唯一最低价），平台对本次交易提供质量背书与争议调解。{isAssocSeller ? "本单为协会集采自营。" : "协会不作为本次交易主体，购销关系存在于甲乙双方之间。"}
        </div>

        {/* 落款：仅甲乙双方签章（协会不盖章）*/}
        <div className="mt-6 grid grid-cols-2 gap-x-12 gap-y-2 text-[13px]">
          <div className="flex items-end gap-2"><span className="text-gray-600 whitespace-nowrap">甲方（买方）签章：</span><span className="flex-1 border-b border-black h-7" /></div>
          <div className="flex items-end gap-2"><span className="text-gray-600 whitespace-nowrap">乙方（卖方）签章：</span><span className="flex-1 border-b border-black h-7" /></div>
          <div className="text-[12px] text-gray-500 mt-1">　　　　年　　月　　日</div>
          <div className="text-[12px] text-gray-500 mt-1 text-right">联系电话：{assocTel}</div>
        </div>
      </div>
    </div>
  );
}
