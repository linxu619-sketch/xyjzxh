// 协会建材超市 mock 数据
// 会员企业专属采购通道 · 分层定价 · 集采议价 · 信用账期

export type SupplyTier = "市场" | "普通会员" | "高级会员" | "理事单位";

export type SupplyCategory = {
  key: string;
  label: string;
  parent?: string;
  count?: number;
};

export const SUPPLY_CATEGORIES: SupplyCategory[] = [
  // 一级
  { key: "main",   label: "主材",   count: 482 },
  { key: "aux",    label: "辅材",   count: 218 },
  { key: "equip",  label: "设备",   count: 96  },
  { key: "post",   label: "后期",   count: 142 },
  // 二级（主材）
  { key: "tile",     label: "瓷砖 / 石材",   parent: "main",  count: 86 },
  { key: "floor",    label: "地板",          parent: "main",  count: 64 },
  { key: "bath",     label: "卫浴 / 五金",   parent: "main",  count: 92 },
  { key: "cabinet",  label: "橱柜 / 衣柜",   parent: "main",  count: 48 },
  { key: "door",     label: "门窗",          parent: "main",  count: 56 },
  { key: "light",    label: "灯具 / 开关",   parent: "main",  count: 72 },
  { key: "paint",    label: "油漆 / 墙纸",   parent: "main",  count: 64 },
  // 二级（辅材）
  { key: "cement",  label: "水泥 / 砂浆",  parent: "aux", count: 32 },
  { key: "water",   label: "防水",         parent: "aux", count: 48 },
  { key: "wire",    label: "电线 / 水管",  parent: "aux", count: 64 },
  { key: "board",   label: "石膏板 / 龙骨", parent: "aux", count: 38 },
  { key: "wood",    label: "木板",         parent: "aux", count: 36 },
  // 二级（设备）
  { key: "scaffold", label: "脚手架 / 架体", parent: "equip", count: 16 },
  { key: "tool",     label: "电动工具",       parent: "equip", count: 48 },
  { key: "safety",   label: "安全用品",       parent: "equip", count: 32 },
  // 二级（后期）
  { key: "appliance", label: "家电", parent: "post", count: 56 },
  { key: "furniture", label: "家具", parent: "post", count: 48 },
  { key: "softfit",   label: "软装 / 窗帘", parent: "post", count: 38 },
];

export type Supplier = {
  id: string;
  name: string;
  category: string;
  district: string;
  rating: number;
  fulfilmentSLA: string;     // 履约
  monthlyVolume: string;     // 月供货量
  verified: boolean;
  tags: string[];
};

export const SUPPLIERS: Supplier[] = [
  { id: "S001", name: "信阳金象瓷业",     category: "瓷砖 / 石材",     district: "罗山县",  rating: 4.9, fulfilmentSLA: "T+1", monthlyVolume: "1.2 万㎡", verified: true, tags: ["本地产", "OEM"] },
  { id: "S002", name: "豫南环球建材城",   category: "综合 (主材)",     district: "羊山新区", rating: 4.8, fulfilmentSLA: "T+1", monthlyVolume: "—",      verified: true, tags: ["仓配一体", "集采"] },
  { id: "S003", name: "佳和五金 · 卫浴", category: "卫浴 / 五金",     district: "浉河区",  rating: 4.7, fulfilmentSLA: "T+2", monthlyVolume: "8 千件", verified: true, tags: ["进口", "B2B"] },
  { id: "S004", name: "智达智能照明",     category: "灯具 / 开关",     district: "息县",    rating: 4.8, fulfilmentSLA: "T+1", monthlyVolume: "5 万件", verified: true, tags: ["智能家居", "本地"] },
  { id: "S005", name: "信阳水泥总厂",     category: "水泥 / 砂浆",     district: "光山县",  rating: 4.6, fulfilmentSLA: "次日", monthlyVolume: "2 万吨", verified: true, tags: ["散装", "运输代办"] },
  { id: "S006", name: "雨虹防水信阳店",   category: "防水",            district: "浉河区",  rating: 4.9, fulfilmentSLA: "T+1", monthlyVolume: "—",      verified: true, tags: ["全国连锁", "原厂"] },
  { id: "S007", name: "立邦油漆 · 信阳",  category: "油漆 / 墙纸",     district: "羊山新区", rating: 4.8, fulfilmentSLA: "T+1", monthlyVolume: "12 万 L",verified: true, tags: ["环保", "授权"] },
  { id: "S008", name: "信阳塔吊租赁",     category: "脚手架 / 架体",   district: "浉河区",  rating: 4.5, fulfilmentSLA: "次日", monthlyVolume: "—",      verified: true, tags: ["大型", "保险齐全"] },
];

export type Product = {
  id: string;
  name: string;
  brand: string;
  supplierId: string;
  supplierName: string;
  category: string;          // 二级分类 key
  categoryLabel: string;
  spec: string;
  unit: string;              // ㎡ / 桶 / 套 / 件 / 米 / 吨
  marketPrice: number;       // 市场参考价
  prices: Record<SupplyTier, number>;
  stock: number;
  sales30d: number;
  rating: number;
  hot?: boolean;
  badges: string[];
  desc: string;
  thumbColor: "build" | "decor" | "design" | "tea" | "yellow";
};

// 计算分层折扣：普通 -10%，高级 -21%，理事 -28%
function priceTier(market: number) {
  return {
    "市场": market,
    "普通会员": Math.round(market * 0.90),
    "高级会员": Math.round(market * 0.79),
    "理事单位": Math.round(market * 0.72),
  };
}

export const PRODUCTS: Product[] = [
  {
    id: "SP-T001", name: "新中源 鱼肚白哑光通体大理石", brand: "新中源",
    supplierId: "S001", supplierName: "信阳金象瓷业",
    category: "tile", categoryLabel: "瓷砖 / 石材",
    spec: "750×1500mm", unit: "㎡",
    marketPrice: 168, prices: priceTier(168), stock: 12400, sales30d: 8420, rating: 4.9, hot: true,
    badges: ["本地直供", "可调换", "环保 A 级"],
    desc: "适用客厅/卧室/餐厅，本地仓 T+1 送达，破损包换。",
    thumbColor: "build",
  },
  {
    id: "SP-T002", name: "马可波罗 灰色仿水泥大板", brand: "马可波罗",
    supplierId: "S002", supplierName: "豫南环球建材城",
    category: "tile", categoryLabel: "瓷砖 / 石材",
    spec: "900×1800mm", unit: "㎡",
    marketPrice: 248, prices: priceTier(248), stock: 6800, sales30d: 1820, rating: 4.8,
    badges: ["现代极简", "厂家直发"],
    desc: "工业风 / 现代极简首选，背景墙必选。",
    thumbColor: "design",
  },
  {
    id: "SP-F003", name: "圣象 多层实木复合地板 黑胡桃", brand: "圣象",
    supplierId: "S002", supplierName: "豫南环球建材城",
    category: "floor", categoryLabel: "地板",
    spec: "1212×165×15mm", unit: "㎡",
    marketPrice: 268, prices: priceTier(268), stock: 3800, sales30d: 980, rating: 4.7, hot: true,
    badges: ["E0 级", "10 年质保"],
    desc: "全屋整装首选，含安装含踢脚线。",
    thumbColor: "decor",
  },
  {
    id: "SP-B004", name: "九牧 智能马桶 一体式即热", brand: "九牧",
    supplierId: "S003", supplierName: "佳和五金 · 卫浴",
    category: "bath", categoryLabel: "卫浴 / 五金",
    spec: "白色 / 305mm 坑距", unit: "件",
    marketPrice: 4280, prices: priceTier(4280), stock: 280, sales30d: 86, rating: 4.9, hot: true,
    badges: ["即热", "5 年质保", "上门安装"],
    desc: "九牧新一代旗舰款，UV 杀菌 + 自清洁。",
    thumbColor: "tea",
  },
  {
    id: "SP-L005", name: "智达 全屋智能灯控套装 (Zigbee)", brand: "智达",
    supplierId: "S004", supplierName: "智达智能照明",
    category: "light", categoryLabel: "灯具 / 开关",
    spec: "12 路 / 含网关", unit: "套",
    marketPrice: 6800, prices: priceTier(6800), stock: 142, sales30d: 64, rating: 4.8,
    badges: ["接入米家", "本地仓", "免费上门"],
    desc: "适用 100-180㎡ 户型，米家 / 鸿蒙双协议。",
    thumbColor: "yellow",
  },
  {
    id: "SP-P006", name: "立邦 抗甲醛全效内墙乳胶漆 5L", brand: "立邦",
    supplierId: "S007", supplierName: "立邦油漆 · 信阳",
    category: "paint", categoryLabel: "油漆 / 墙纸",
    spec: "5L · 净味抗甲醛", unit: "桶",
    marketPrice: 488, prices: priceTier(488), stock: 980, sales30d: 320, rating: 4.8,
    badges: ["净味", "授权店", "支持调色"],
    desc: "覆盖 30㎡ 双遍，0 添加，孕婴可用。",
    thumbColor: "design",
  },
  {
    id: "SP-W007", name: "雨虹 JS 聚合物水泥防水涂料", brand: "东方雨虹",
    supplierId: "S006", supplierName: "雨虹防水信阳店",
    category: "water", categoryLabel: "防水",
    spec: "20kg · 厨卫专用", unit: "桶",
    marketPrice: 326, prices: priceTier(326), stock: 1280, sales30d: 460, rating: 4.9, hot: true,
    badges: ["原厂直供", "可追溯", "20 年质保"],
    desc: "原厂条码可追溯，覆盖约 6㎡。",
    thumbColor: "brand" as never,
  },
  {
    id: "SP-C008", name: "海螺 PO 42.5 水泥（散装）", brand: "海螺",
    supplierId: "S005", supplierName: "信阳水泥总厂",
    category: "cement", categoryLabel: "水泥 / 砂浆",
    spec: "PO 42.5R · 散装吨", unit: "吨",
    marketPrice: 380, prices: priceTier(380), stock: 18000, sales30d: 4800, rating: 4.7,
    badges: ["量大可议", "本地运输"],
    desc: "工装首选；运费按距离阶梯。",
    thumbColor: "build",
  },
  {
    id: "SP-D009", name: "TATA 静音木门 简约平板款", brand: "TATA",
    supplierId: "S002", supplierName: "豫南环球建材城",
    category: "door", categoryLabel: "门窗",
    spec: "2050×860mm · 7 色可选", unit: "扇",
    marketPrice: 1880, prices: priceTier(1880), stock: 320, sales30d: 124, rating: 4.7,
    badges: ["静音 30dB", "可定制", "10 年质保"],
    desc: "默认含锁具、合页、门吸；30 天到货。",
    thumbColor: "decor",
  },
  {
    id: "SP-K010", name: "欧派 整体橱柜 模压门 (5 米直线)", brand: "欧派",
    supplierId: "S002", supplierName: "豫南环球建材城",
    category: "cabinet", categoryLabel: "橱柜 / 衣柜",
    spec: "5 米 · 含台面 + 5 件电器", unit: "套",
    marketPrice: 19800, prices: priceTier(19800), stock: 48, sales30d: 18, rating: 4.8, hot: true,
    badges: ["环保 E0", "免费量尺", "10 年质保"],
    desc: "含洗碗机、烟灶、消毒柜，免费设计。",
    thumbColor: "decor",
  },
  {
    id: "SP-E011", name: "牧田 锂电冲击钻 18V 套装", brand: "Makita",
    supplierId: "S002", supplierName: "豫南环球建材城",
    category: "tool", categoryLabel: "电动工具",
    spec: "18V · 双电池", unit: "套",
    marketPrice: 1280, prices: priceTier(1280), stock: 86, sales30d: 22, rating: 4.8,
    badges: ["原装进口", "终身保修"],
    desc: "施工标配，含 2 块 5.0Ah 电池。",
    thumbColor: "design",
  },
  {
    id: "SP-S012", name: "信阳塔吊 QTZ80 月租", brand: "—",
    supplierId: "S008", supplierName: "信阳塔吊租赁",
    category: "scaffold", categoryLabel: "脚手架 / 架体",
    spec: "QTZ80 · 含运输 / 拆装 / 司机", unit: "台/月",
    marketPrice: 38000, prices: priceTier(38000), stock: 6, sales30d: 4, rating: 4.5,
    badges: ["保险齐全", "本地"],
    desc: "本地最大塔吊 / 龙门架租赁商，含保险与司机。",
    thumbColor: "build",
  },
];

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function tierLabel(t: SupplyTier): string {
  return t === "市场" ? "市场参考价" : `${t}专享价`;
}

export function tierBadgeColor(t: SupplyTier): "neutral" | "brand" | "design" | "yellow" {
  return t === "市场" ? "neutral" : t === "普通会员" ? "brand" : t === "高级会员" ? "design" : "yellow";
}

// 演示：当前登录企业的会籍等级
export const CURRENT_TIER: SupplyTier = "高级会员";

// 平台总览数据
export const SUPPLIES_STATS = {
  products: PRODUCTS.length + 866,
  suppliers: SUPPLIERS.length + 36,
  enterprisesPurchased: 482,
  monthlyGmv: 386,        // 万元
  avgSavingPct: 21,       // 平均省 %
};

// 集采订单 mock（企业历史采购）
export type SupplyOrder = {
  id: string;
  enterpriseId: string;
  items: number;
  qty: number;
  total: number;
  saved: number;
  status: "已下单" | "已发货" | "已收货" | "已开票" | "退款中";
  placedAt: string;
  productSummary: string;
};

export const ENTERPRISE_SUPPLY_ORDERS: SupplyOrder[] = [
  { id: "SO-2026-0612", enterpriseId: "e002", items: 18, qty: 248, total: 86420, saved: 18450,
    status: "已收货", placedAt: "2026-06-08", productSummary: "圣象地板 × 168㎡，立邦乳胶漆 × 8 桶，TATA 木门 × 3 扇" },
  { id: "SO-2026-0598", enterpriseId: "e002", items: 6,  qty: 32,  total: 18280, saved: 3260,
    status: "已开票", placedAt: "2026-05-26", productSummary: "九牧智能马桶 × 1，智达灯控 × 1 套" },
  { id: "SO-2026-0577", enterpriseId: "e002", items: 4,  qty: 12,  total: 9860,  saved: 1820,
    status: "已开票", placedAt: "2026-05-15", productSummary: "雨虹防水 × 6 桶，水泥 × 2 吨" },
  { id: "SO-2026-0612-B", enterpriseId: "e002", items: 1, qty: 1,   total: 38000, saved: 0,
    status: "已下单", placedAt: "2026-06-10", productSummary: "QTZ80 塔吊月租 × 1" },
];
