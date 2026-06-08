import { SITE } from "@/lib/site";
import type { SupplyOrder } from "@/lib/data/supplies-source";

/* ============================================================
   建材集采购销单（A4 打印）
   ------------------------------------------------------------
   主体＝买卖双方（甲方买方 / 乙方卖方）；协会不是交易主体，
   仅作为「集采平台」做资格审核 + 质量背书 + 争议调解的见证盖章。
   协会自营单（sellerType=association）时乙方即协会，自然成立。
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

  const Cell = "border border-black px-3 py-1.5 align-top";
  const Th = "border border-black bg-[#f2f2f2] px-3 py-1.5 text-left font-medium align-top whitespace-nowrap";

  return (
    <div className="a4-sheet text-black">
      {/* 表头：购销单标题（非协会信笺）*/}
      <header className="text-center">
        <h1 className="text-[24px] font-bold tracking-[0.3em]">建材集采购销单</h1>
        <div className="mt-1 text-[10px] tracking-widest text-gray-500 uppercase">Building-Materials Purchase &amp; Sale Order</div>
        <div className="mt-3 border-t-2 border-black" />
      </header>
      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span>单据编号：<b className="font-mono">{docNo}</b></span>
        <span>签订日期：{fmtCN(o.createdAt)}</span>
      </div>

      {/* 甲乙双方 */}
      <table className="w-full border-collapse text-[13px] mt-3">
        <tbody>
          <tr>
            <th className={`${Th} w-[110px]`}>甲方（买方）</th>
            <td className={Cell}>{o.buyerName || o.enterpriseName || "—"}</td>
            <th className={`${Th} w-[110px]`}>乙方（卖方）</th>
            <td className={Cell}>{o.sellerName || "—"}<span className="text-[11px] text-gray-500 ml-1.5">（{SELLER_KIND[o.sellerType] ?? o.sellerType}）</span></td>
          </tr>
        </tbody>
      </table>

      {/* 商品明细 */}
      <div className="mt-4 text-[12px] font-semibold">一、商品明细</div>
      <table className="w-full border-collapse text-[13px] mt-1.5 text-center">
        <thead>
          <tr>
            <th className={Th}>品名</th>
            <th className={Th}>规格 / 单位</th>
            <th className={Th}>单价</th>
            <th className={Th}>数量</th>
            <th className={Th}>金额</th>
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

      {/* 结算与交付 */}
      <div className="mt-4 text-[12px] font-semibold">二、结算与交付</div>
      <table className="w-full border-collapse text-[13px] mt-1.5">
        <tbody>
          <tr><th className={`${Th} w-[110px]`}>结算方式</th><td className={Cell}>{settleText}</td></tr>
          <tr><th className={Th}>履约 / 交付</th><td className={Cell}>由乙方（卖方）负责供货与交付；履约进度以双方确认为准。下单时间 {fmtCN(o.createdAt)}。</td></tr>
          <tr><th className={Th}>质量 / 售后</th><td className={Cell}>商品质量、规格、售后由乙方负责；如生争议，可申请协会集采平台介入调解。</td></tr>
        </tbody>
      </table>

      {/* 协会背书声明 */}
      <div className="mt-4 rounded border border-[#267c7c]/50 bg-[#267c7c]/5 p-3 text-[11px] leading-5 text-[#1c5e5e]">
        <b>集采平台背书</b>：本单商品由 {assocName} 集采平台审核上架（资格核验 · 价格擂台 · 同品牌唯一最低价），
        平台对本次交易提供质量背书与争议调解。{isAssocSeller ? "本单为协会集采自营。" : "协会不作为本次交易主体，购销关系存在于甲乙双方之间。"}
      </div>

      {/* 落款：双方签章 + 协会背书章 */}
      <div className="mt-6 grid grid-cols-2 gap-x-12 gap-y-6 text-[13px]">
        <div className="flex items-end gap-2"><span className="text-gray-600 whitespace-nowrap">甲方（买方）签章：</span><span className="flex-1 border-b border-black h-7" /></div>
        <div className="flex items-end gap-2"><span className="text-gray-600 whitespace-nowrap">乙方（卖方）签章：</span><span className="flex-1 border-b border-black h-7" /></div>
      </div>
      <div className="mt-6 flex items-end justify-between text-[12px]">
        <div className="flex items-end gap-2 w-[60%]"><span className="text-gray-600 whitespace-nowrap">{assocName}（集采平台 · 背书见证）盖章：</span><span className="flex-1 border-b border-black h-7" /></div>
        <span className="text-gray-500">{assocTel}</span>
      </div>
      <div className="mt-4 text-right text-[12px] text-gray-500">出具日期：　　　　年　　月　　日</div>
    </div>
  );
}
