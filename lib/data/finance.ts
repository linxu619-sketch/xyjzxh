// 金融 / 保险 mock 数据
export type FinanceProduct = {
  id: string;
  name: string;
  bank: string;
  type: "信用贷" | "经营贷" | "保函" | "保理" | "设备分期";
  rateLabel: string;     // 年化范围
  amountLabel: string;   // 额度
  termLabel: string;     // 期限
  highlights: string[];
  forWhom: string;       // 适用人群
  color: "build" | "decor" | "design" | "brand" | "tea";
};

export const FINANCE_PRODUCTS: FinanceProduct[] = [
  { id: "F1", name: "建装贷", bank: "中原银行信阳分行", type: "经营贷",
    rateLabel: "年化 3.45% 起", amountLabel: "≤ 500 万", termLabel: "12-36 个月",
    highlights: ["协会会员专属", "线上申请", "T+1 放款"],
    forWhom: "在册装修/建筑企业", color: "brand" },
  { id: "F2", name: "工程保函", bank: "中国建设银行", type: "保函",
    rateLabel: "费率 0.8% 起", amountLabel: "≤ 2000 万", termLabel: "按工期",
    highlights: ["投标/履约/预付款", "电子保函", "工装报备直接出函"],
    forWhom: "总包/分包企业", color: "build" },
  { id: "F3", name: "装修分期", bank: "招商银行", type: "信用贷",
    rateLabel: "年化 4.0% 起", amountLabel: "≤ 50 万", termLabel: "6-36 期",
    highlights: ["业主端", "0 抵押", "分次放款至企业账户"],
    forWhom: "C 端业主", color: "decor" },
  { id: "F4", name: "工程款保理", bank: "信阳农商行", type: "保理",
    rateLabel: "年化 5.5% 起", amountLabel: "≤ 1000 万", termLabel: "≤ 180 天",
    highlights: ["凭报备应收账款融资", "无追索可选"],
    forWhom: "上游承包企业", color: "tea" },
  { id: "F5", name: "施工设备分期", bank: "工银租赁", type: "设备分期",
    rateLabel: "年化 4.8% 起", amountLabel: "≤ 800 万", termLabel: "12-60 期",
    highlights: ["塔吊/泵车/装载", "厂家直贴"],
    forWhom: "建筑企业", color: "design" },
];

export type InsuranceProduct = {
  id: string;
  name: string;
  insurer: string;
  type: "家装质保险" | "工程履约险" | "工人意外险" | "公众责任险" | "材料运输险";
  priceLabel: string;
  coverLabel: string;
  highlights: string[];
  forWhom: string;
  color: "build" | "decor" | "design" | "brand" | "tea" | "yellow";
};

export const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  { id: "I1", name: "安心家装险 · 协会版", insurer: "人保财险", type: "家装质保险",
    priceLabel: "299 元/套起", coverLabel: "保额 50 万", forWhom: "C 端业主",
    highlights: ["10 年质保", "跑路赔付", "材料合规理赔", "AI 自助理赔"],
    color: "decor" },
  { id: "I2", name: "工程履约保证保险", insurer: "平安产险", type: "工程履约险",
    priceLabel: "费率 0.7%", coverLabel: "保额 ≤ 工程价款 10%", forWhom: "总包/分包",
    highlights: ["替代保证金", "工装报备一键出单"],
    color: "build" },
  { id: "I3", name: "建筑工人团意险", insurer: "国寿财险", type: "工人意外险",
    priceLabel: "120 元/人/年", coverLabel: "意外身故 80 万 + 医疗 5 万", forWhom: "建筑/装修企业",
    highlights: ["按项目投保", "工装报备同步"],
    color: "tea" },
  { id: "I4", name: "施工现场公众责任险", insurer: "太平洋产险", type: "公众责任险",
    priceLabel: "0.4‰ 起", coverLabel: "保额 ≤ 500 万", forWhom: "施工方",
    highlights: ["第三者人身/财产", "脚手架/吊装高发场景"],
    color: "yellow" },
  { id: "I5", name: "材料运输一切险", insurer: "中华联合", type: "材料运输险",
    priceLabel: "0.6‰ 起", coverLabel: "按货值", forWhom: "材料供应商",
    highlights: ["陆运/水运", "破损/灭失全保"],
    color: "design" },
];
