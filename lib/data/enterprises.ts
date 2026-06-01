// 会员企业 mock 数据
export type EnterpriseCategory = "build" | "decor" | "design";

export type Enterprise = {
  id: string;
  slug: string;            // 子域名 slug
  name: string;
  category: EnterpriseCategory;
  district: string;        // 区/县
  rating: number;          // 0-5
  reviews: number;
  cases: number;
  founded: number;
  staff: string;           // 规模
  qualification: string[]; // 资质
  tags: string[];
  short: string;           // 一句话简介
  hero: { brand: string; tagline: string }; // 子站 banner
  contact: { tel: string; addr: string };
  verified: boolean;
  featured?: boolean;
  color: "build" | "decor" | "design" | "tea" | "brand";
  template?: string; // 子站模板，默认 standard
};

export const ENTERPRISES: Enterprise[] = [
  {
    id: "e001", slug: "huatai", name: "信阳华泰建工有限公司",
    category: "build", district: "浉河区", rating: 4.9, reviews: 312, cases: 86,
    founded: 2007, staff: "200-500 人",
    qualification: ["市政壹级", "建筑总承包壹级", "机电安装贰级"],
    tags: ["市政", "公共建筑", "EPC"],
    short: "深耕本地市政与公共建筑 18 年，年均交付 30+ 项目。",
    hero: { brand: "华泰建工", tagline: "营造城市的每一寸根基" },
    contact: { tel: "0376-1234567", addr: "浉河区 · 行政中心" },
    verified: true, featured: true, color: "build",
  },
  {
    id: "e002", slug: "mingjia", name: "信阳名家装饰工程有限公司",
    category: "decor", district: "羊山新区", rating: 4.8, reviews: 1284, cases: 542,
    founded: 2012, staff: "100-200 人",
    qualification: ["建筑装修装饰壹级", "ISO9001"],
    tags: ["家装", "整装", "全包"],
    short: "本地 TOP3 整装品牌，699 套餐覆盖 200+ 楼盘。",
    hero: { brand: "名家装饰", tagline: "为家而设计 · 699 元/㎡ 整装" },
    contact: { tel: "0376-2345678", addr: "羊山新区 · 中央公园" },
    verified: true, featured: true, color: "decor",
  },
  {
    id: "e003", slug: "yashe", name: "雅舍设计事务所",
    category: "design", district: "平桥区", rating: 5.0, reviews: 86, cases: 124,
    founded: 2018, staff: "10-30 人",
    qualification: ["室内设计专项乙级"],
    tags: ["软装", "高端住宅", "原木风"],
    short: "8 年获 IFI、IDA 等 14 项国际大奖，专注高端住宅。",
    hero: { brand: "雅舍 YASHE", tagline: "在器与境之间，重塑生活的尺度" },
    contact: { tel: "0376-3456789", addr: "平桥区 · 茶都路" },
    verified: true, featured: true, color: "design",
  },
  {
    id: "e004", slug: "zhongheng", name: "中恒建设集团信阳分公司",
    category: "build", district: "浉河区", rating: 4.7, reviews: 188, cases: 64,
    founded: 1998, staff: "500+ 人",
    qualification: ["建筑总承包特级", "市政壹级", "公路贰级"],
    tags: ["特级总包", "地产", "EPC"],
    short: "央企背景，承建本地多个亿元级地产与公建项目。",
    hero: { brand: "中恒建设", tagline: "国之重器 · 信之所托" },
    contact: { tel: "0376-1110001", addr: "浉河区 · 申城大道" },
    verified: true, color: "build",
  },
  {
    id: "e005", slug: "jiaheyuan", name: "佳和苑装饰",
    category: "decor", district: "息县", rating: 4.6, reviews: 612, cases: 230,
    founded: 2015, staff: "50-100 人",
    qualification: ["建筑装修装饰贰级"],
    tags: ["家装", "半包", "县域"],
    short: "息县家装首选，主打半包 + 透明报价。",
    hero: { brand: "佳和苑", tagline: "县域家装 · 一价全包不增项" },
    contact: { tel: "0376-7770001", addr: "息县 · 谯楼路" },
    verified: true, color: "decor",
  },
  {
    id: "e006", slug: "yuanjing", name: "远景空间设计",
    category: "design", district: "羊山新区", rating: 4.9, reviews: 142, cases: 78,
    founded: 2020, staff: "10-30 人",
    qualification: ["室内设计专项乙级"],
    tags: ["公装", "餐饮", "民宿"],
    short: "餐饮与民宿空间专家，单店爆款超 40 例。",
    hero: { brand: "远景 EnVision", tagline: "用设计为商业引流" },
    contact: { tel: "0376-2220003", addr: "羊山新区 · 创业大道" },
    verified: true, color: "design",
  },
  {
    id: "e007", slug: "jianyu", name: "信阳建宇建筑工程",
    category: "build", district: "罗山县", rating: 4.5, reviews: 96, cases: 41,
    founded: 2010, staff: "100-200 人",
    qualification: ["建筑总承包贰级", "装修贰级"],
    tags: ["县域", "公建", "返乡"],
    short: "扎根罗山，承建乡村振兴与县域公建项目。",
    hero: { brand: "建宇建筑", tagline: "把好工程做到家门口" },
    contact: { tel: "0376-5550001", addr: "罗山县 · 龙池路" },
    verified: true, color: "build",
  },
  {
    id: "e008", slug: "yipin", name: "壹品装饰",
    category: "decor", district: "浉河区", rating: 4.7, reviews: 802, cases: 318,
    founded: 2010, staff: "100-200 人",
    qualification: ["建筑装修装饰壹级"],
    tags: ["家装", "工装", "局装"],
    short: "本地老牌装饰公司，主打中高端家装与商办工装。",
    hero: { brand: "壹品装饰", tagline: "一个家 · 由心而起" },
    contact: { tel: "0376-6660001", addr: "浉河区 · 北京路" },
    verified: true, color: "decor",
  },
  {
    id: "e009", slug: "shanshui", name: "山水景观设计院",
    category: "design", district: "浉河区", rating: 4.8, reviews: 58, cases: 92,
    founded: 2016, staff: "30-50 人",
    qualification: ["风景园林专项乙级"],
    tags: ["景观", "园林", "文旅"],
    short: "文旅与公园景观设计专家，深度结合茶文化。",
    hero: { brand: "山水设计", tagline: "让风景成为城市的语言" },
    contact: { tel: "0376-8880001", addr: "浉河区 · 茶坡路" },
    verified: true, color: "design",
  },
  {
    id: "e010", slug: "wanjia", name: "万家美装饰",
    category: "decor", district: "光山县", rating: 4.4, reviews: 392, cases: 178,
    founded: 2013, staff: "30-50 人",
    qualification: ["建筑装修装饰贰级"],
    tags: ["家装", "县域", "套餐"],
    short: "光山县口碑家装品牌，主推 588 元/㎡ 套餐。",
    hero: { brand: "万家美", tagline: "让万家更美一点" },
    contact: { tel: "0376-9990001", addr: "光山县 · 弦山街" },
    verified: true, color: "decor",
  },
  {
    id: "e011", slug: "tongchuang", name: "同创建工集团",
    category: "build", district: "浉河区", rating: 4.8, reviews: 224, cases: 96,
    founded: 2003, staff: "500+ 人",
    qualification: ["建筑总承包壹级", "市政贰级", "装修壹级"],
    tags: ["民营", "总包", "EPC"],
    short: "本地民营总包标杆，主营商住地产与产业园。",
    hero: { brand: "同创建工", tagline: "同行致远 · 创享城市" },
    contact: { tel: "0376-1110002", addr: "浉河区 · 民权路" },
    verified: true, color: "build",
  },
  {
    id: "e012", slug: "lanse", name: "蓝色空间软装",
    category: "design", district: "羊山新区", rating: 4.9, reviews: 92, cases: 46,
    founded: 2019, staff: "10-30 人",
    qualification: ["室内设计专项乙级"],
    tags: ["软装", "样板房", "高端"],
    short: "样板房与高端别墅软装专家，作品登《INTERIOR》。",
    hero: { brand: "蓝色空间", tagline: "软装 · 居所的灵魂" },
    contact: { tel: "0376-2220004", addr: "羊山新区 · 楚王城路" },
    verified: true, color: "design",
  },
];

export function getEnterprise(id: string) {
  return ENTERPRISES.find((e) => e.id === id || e.slug === id);
}
