// 施工全过程订单 mock 数据 — 覆盖咨询 / 报价 / 签约 / 计划 / 进度 / 验收 / 收款 / 变更
// 真实落地时拆成多个表：orders / contracts / schedule_tasks / daily_logs / acceptance_milestones / payments / change_orders

export type OrderStage =
  | "inquiry"     // 咨询
  | "quoted"      // 已报价
  | "signed"      // 已签约
  | "planning"    // 排期中
  | "in-progress" // 施工中
  | "accepted"    // 已竣工
  | "after-sales";// 维保中

export const STAGE_META: Record<OrderStage, { label: string; tone: string }> = {
  inquiry:       { label: "咨询",   tone: "neutral" },
  quoted:        { label: "已报价", tone: "yellow" },
  signed:        { label: "已签约", tone: "brand" },
  planning:      { label: "排期中", tone: "design" },
  "in-progress": { label: "施工中", tone: "decor" },
  accepted:      { label: "已竣工", tone: "tea" },
  "after-sales": { label: "维保中", tone: "build" },
};

export type ScheduleTask = {
  id: string;
  phase: string;          // 拆改 / 水电 / 泥木 / 油漆 / 安装 / 软装
  name: string;
  startDate: string;
  endDate: string;
  progress: number;       // 0-100
  responsibleId: string;  // team member id
  responsibleName: string;
  status: "未开始" | "进行中" | "已完成" | "已延期";
  dependsOn?: string[];   // task ids
};

export type DailyLog = {
  id: string;
  date: string;
  phase: string;
  workers: number;
  weather: "晴" | "阴" | "雨" | "雪";
  content: string;
  photos: number;
  loggedBy: string;
};

export type AcceptanceStep = {
  id: string;
  name: string;
  scheduledAt: string;
  acceptedAt?: string;
  acceptedBy?: string;
  status: "pending" | "ready" | "approved" | "rejected" | "rework";
  notes?: string;
  photos: number;
  customerSignature?: string;
};

export type PaymentInstallment = {
  id: string;
  stage: string;
  pct: number;             // 占合同百分比
  amount: number;          // 元
  due: string;
  invoicedAt?: string;
  paidAt?: string;
  confirmedByCustomer?: boolean;
  method?: string;
};

export type ChangeOrder = {
  id: string;
  no: string;
  submittedAt: string;
  submittedBy: string;
  category: "工艺变更" | "材料升级" | "增项" | "减项" | "工期调整";
  description: string;
  costDelta: number;       // 元 ±
  timeDelta: number;       // 天 ±
  status: "pending" | "approved" | "rejected" | "withdrawn";
  approverChain: { role: string; name: string; result?: "approved" | "rejected"; at?: string }[];
  attachments: number;
};

export type ResponsibleRole = "owner" | "project_manager" | "designer" | "site_supervisor" | "customer_service" | "after_sales";
export const RESPONSIBILITY_LABEL: Record<ResponsibleRole, string> = {
  owner: "签约负责人",
  project_manager: "项目经理",
  designer: "主案设计师",
  site_supervisor: "现场监理",
  customer_service: "客服 / 客户经理",
  after_sales: "维保负责人",
};

export type Responsibility = {
  role: ResponsibleRole;
  name: string;
  phone: string;
  confirmedAt?: string;
};

export type Document = {
  id: string;
  name: string;
  type: "合同" | "图纸" | "方案" | "报价单" | "验收单" | "发票" | "其他";
  size: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type Order = {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;

  inquiry: {
    submittedAt: string;
    source: string;
    requirement: string;
    area: number;
    budget: number;
    style: string;
    expectedStart: string;
    district: string;
    address: string;
  };

  quote?: {
    amount: number;       // 元
    sentAt: string;
    items: { name: string; qty: number; unit: string; price: number }[];
    notes: string;
  };

  contract?: {
    no: string;
    amount: number;
    signedAt?: string;
    customerSigned: boolean;
    enterpriseSigned: boolean;
    eSignProvider?: "e签宝" | "上上签" | "线下纸质";
  };

  responsibilities: Responsibility[];
  schedule: ScheduleTask[];
  dailyLogs: DailyLog[];
  acceptance: AcceptanceStep[];
  payments: PaymentInstallment[];
  changeOrders: ChangeOrder[];
  documents: Document[];

  stage: OrderStage;
  reportId?: string;
};

// —— 示例订单：刘女士 · 金茂悦府 1602 ——
export const ORDER_DEMO: Order = {
  id: "ORD-2026-0512",
  enterpriseId: "e002", enterpriseName: "名家装饰",
  customerId: "C00284", customerName: "刘女士", customerPhone: "138****8472",
  inquiry: {
    submittedAt: "2026-04-22 10:36",
    source: "AI 装修顾问 · 小装",
    requirement: "三居改两居 + 整装 · 喜欢现代极简风，重视收纳",
    area: 168, budget: 32, style: "现代极简",
    expectedStart: "2026-05-20",
    district: "浉河区",
    address: "金茂悦府 12 栋 1602",
  },
  quote: {
    amount: 318600, sentAt: "2026-04-28 17:02",
    items: [
      { name: "基础工程 · 拆改/水电/泥木/油漆", qty: 168, unit: "㎡", price: 1080 },
      { name: "主材包 · 瓷砖/地板/橱柜/卫浴/木门", qty: 168, unit: "㎡", price: 680 },
      { name: "智能家居 · 中央空调 + 全屋灯控",     qty: 1,   unit: "套", price: 26800 },
      { name: "软装含家电 · 家居+窗帘+灯具",         qty: 1,   unit: "套", price: 18000 },
    ],
    notes: "含 18 道工序、10 年质保、协会监理；签约赠 5 件套智能家电。",
  },
  contract: {
    no: "MJ-2026-0512", amount: 318600,
    signedAt: "2026-05-12 14:08",
    customerSigned: true, enterpriseSigned: true,
    eSignProvider: "e签宝",
  },
  responsibilities: [
    { role: "owner",            name: "张经理", phone: "138****1001", confirmedAt: "2026-05-12 14:10" },
    { role: "project_manager",  name: "王经理", phone: "138****1003", confirmedAt: "2026-05-13 09:00" },
    { role: "designer",         name: "张设计", phone: "138****1004", confirmedAt: "2026-05-13 09:02" },
    { role: "site_supervisor",  name: "协会监理 · 陈工", phone: "138****0010", confirmedAt: "2026-05-13 11:00" },
    { role: "customer_service", name: "李顾问", phone: "138****1002", confirmedAt: "2026-05-13 09:05" },
    { role: "after_sales",      name: "—",     phone: "—" },
  ],
  schedule: [
    { id: "T01", phase: "拆改", name: "拆墙 · 清运",          startDate: "2026-05-20", endDate: "2026-05-25", progress: 100, responsibleId: "w-1", responsibleName: "王经理",  status: "已完成" },
    { id: "T02", phase: "水电", name: "水电点位 · 开槽布管",   startDate: "2026-05-26", endDate: "2026-06-05", progress: 100, responsibleId: "w-1", responsibleName: "王经理",  status: "已完成", dependsOn: ["T01"] },
    { id: "T03", phase: "水电", name: "水电隐蔽工程验收",      startDate: "2026-06-05", endDate: "2026-06-05", progress: 100, responsibleId: "w-2", responsibleName: "陈监理",  status: "已完成", dependsOn: ["T02"] },
    { id: "T04", phase: "泥木", name: "防水 · 闭水试验",        startDate: "2026-06-06", endDate: "2026-06-10", progress: 70,  responsibleId: "w-1", responsibleName: "王经理",  status: "进行中", dependsOn: ["T03"] },
    { id: "T05", phase: "泥木", name: "瓷砖铺贴",              startDate: "2026-06-11", endDate: "2026-06-22", progress: 0,   responsibleId: "w-1", responsibleName: "王经理",  status: "未开始", dependsOn: ["T04"] },
    { id: "T06", phase: "泥木", name: "木工 · 吊顶 + 柜体",     startDate: "2026-06-15", endDate: "2026-06-30", progress: 0,   responsibleId: "w-1", responsibleName: "王经理",  status: "未开始", dependsOn: ["T04"] },
    { id: "T07", phase: "油漆", name: "墙面找平 + 乳胶漆",      startDate: "2026-07-01", endDate: "2026-07-10", progress: 0,   responsibleId: "w-1", responsibleName: "王经理",  status: "未开始", dependsOn: ["T05", "T06"] },
    { id: "T08", phase: "安装", name: "橱柜 / 木门 / 卫浴 安装", startDate: "2026-07-11", endDate: "2026-07-25", progress: 0,   responsibleId: "w-1", responsibleName: "王经理",  status: "未开始", dependsOn: ["T07"] },
    { id: "T09", phase: "安装", name: "灯具 / 开关 / 智能",     startDate: "2026-07-26", endDate: "2026-08-02", progress: 0,   responsibleId: "w-1", responsibleName: "王经理",  status: "未开始", dependsOn: ["T08"] },
    { id: "T10", phase: "软装", name: "保洁 + 软装陈列",        startDate: "2026-08-03", endDate: "2026-08-10", progress: 0,   responsibleId: "w-3", responsibleName: "张设计",  status: "未开始", dependsOn: ["T09"] },
    { id: "T11", phase: "竣工", name: "竣工验收",              startDate: "2026-08-12", endDate: "2026-08-15", progress: 0,   responsibleId: "w-2", responsibleName: "陈监理",  status: "未开始", dependsOn: ["T10"] },
  ],
  dailyLogs: [
    { id: "L08", date: "2026-06-07", phase: "泥木", workers: 6, weather: "阴", content: "闭水试验持续中，今日加铺二次防水；客厅东南角发现回填层渗漏，已通知设计师调整方案。", photos: 14, loggedBy: "王经理" },
    { id: "L07", date: "2026-06-06", phase: "泥木", workers: 4, weather: "晴", content: "开始 24h 闭水试验；同步主卫管井加固。", photos: 8,  loggedBy: "王经理" },
    { id: "L06", date: "2026-06-05", phase: "水电", workers: 5, weather: "晴", content: "陈监理上门，水电隐蔽工程一次通过验收；上传 32 张点位照存档。", photos: 32, loggedBy: "陈监理" },
    { id: "L05", date: "2026-06-04", phase: "水电", workers: 6, weather: "晴", content: "完成全屋点位通电测试，所有插座、灯具回路无异常。", photos: 12, loggedBy: "王经理" },
    { id: "L04", date: "2026-06-02", phase: "水电", workers: 8, weather: "晴", content: "全屋开槽完成 90%，水管管井已布置至预定位。", photos: 18, loggedBy: "王经理" },
  ],
  acceptance: [
    { id: "AC1", name: "拆改 · 阶段验收",       scheduledAt: "2026-05-25", acceptedAt: "2026-05-25", status: "approved", acceptedBy: "刘女士",  photos: 12, notes: "全部按图施工，无变更。" },
    { id: "AC2", name: "水电隐蔽工程验收",      scheduledAt: "2026-06-05", acceptedAt: "2026-06-05", status: "approved", acceptedBy: "刘女士 + 协会监理", photos: 32, notes: "一次通过，附 12 个回路测试报告。", customerSignature: "✓ 已电子签名" },
    { id: "AC3", name: "防水闭水试验验收",      scheduledAt: "2026-06-11", status: "ready",     photos: 6, notes: "待业主到场确认" },
    { id: "AC4", name: "泥木阶段验收",         scheduledAt: "2026-06-30", status: "pending",   photos: 0 },
    { id: "AC5", name: "竣工 · 终验",          scheduledAt: "2026-08-15", status: "pending",   photos: 0 },
  ],
  payments: [
    { id: "P1", stage: "首期（签约）",  pct: 30, amount: 95580, due: "2026-05-12", paidAt: "2026-05-12 14:30", confirmedByCustomer: true, method: "对公转账" },
    { id: "P2", stage: "水电完工",      pct: 35, amount: 111510, due: "2026-06-05", paidAt: "2026-06-06 09:12", confirmedByCustomer: true, method: "对公转账" },
    { id: "P3", stage: "木工完工",      pct: 25, amount: 79650, due: "2026-07-01" },
    { id: "P4", stage: "竣工尾款",      pct: 10, amount: 31860, due: "2026-08-15" },
  ],
  changeOrders: [
    { id: "CHG1", no: "CO-001", submittedAt: "2026-06-02", submittedBy: "刘女士", category: "材料升级",
      description: "主卧木门由 880 元/扇 升级到 1280 元/扇 进口同款，共 3 扇。", costDelta: +1200, timeDelta: 0, status: "approved",
      approverChain: [
        { role: "项目经理", name: "王经理", result: "approved", at: "2026-06-02" },
        { role: "客户经理", name: "李顾问", result: "approved", at: "2026-06-02" },
        { role: "业主",     name: "刘女士", result: "approved", at: "2026-06-02" },
      ], attachments: 2 },
    { id: "CHG2", no: "CO-002", submittedAt: "2026-06-07", submittedBy: "张设计", category: "工艺变更",
      description: "客厅东南角回填层局部加做找平 + 加固，工期 +1 天。", costDelta: +800, timeDelta: 1, status: "pending",
      approverChain: [
        { role: "项目经理", name: "王经理", result: "approved", at: "2026-06-07" },
        { role: "业主",     name: "刘女士" },
      ], attachments: 4 },
  ],
  documents: [
    { id: "D1", name: "正式施工合同 MJ-2026-0512.pdf", type: "合同",   size: "1.8 MB",  uploadedAt: "2026-05-12 14:08", uploadedBy: "张经理" },
    { id: "D2", name: "户型平面布置图 v3.dwg",        type: "图纸",   size: "642 KB",  uploadedAt: "2026-05-10 11:24", uploadedBy: "张设计" },
    { id: "D3", name: "施工组织方案.pdf",             type: "方案",   size: "2.4 MB",  uploadedAt: "2026-05-11 09:00", uploadedBy: "王经理" },
    { id: "D4", name: "正式报价单 v3.pdf",            type: "报价单", size: "486 KB",  uploadedAt: "2026-04-28 17:02", uploadedBy: "李顾问" },
    { id: "D5", name: "水电隐蔽工程验收单.pdf",        type: "验收单", size: "412 KB",  uploadedAt: "2026-06-05 16:30", uploadedBy: "陈监理" },
  ],
  stage: "in-progress",
  reportId: "P-2026-0501",
};

// 列表用：含 1 个主案 + 若干轻量记录
export type OrderRow = {
  id: string;
  customerName: string;
  customerPhone: string;
  scope: string;        // 简介
  amount: number;       // 元
  area: number;
  district: string;
  stage: OrderStage;
  progress: number;
  receivedPct: number;  // 已收款占比
  signedAt?: string;
  pendingCounts: { acceptance: number; change: number; payment: number };
};

export const ORDERS_LIST: OrderRow[] = [
  {
    id: "ORD-2026-0512", customerName: "刘女士", customerPhone: "138****8472",
    scope: "金茂悦府 12 栋 1602 · 168㎡ 整装",
    amount: 318600, area: 168, district: "浉河区",
    stage: "in-progress", progress: 42, receivedPct: 65, signedAt: "2026-05-12",
    pendingCounts: { acceptance: 1, change: 1, payment: 0 },
  },
  {
    id: "ORD-2026-0498", customerName: "陈先生", customerPhone: "138****6611",
    scope: "茶都商务大厦 22F · 2400㎡ 办公装修",
    amount: 2800000, area: 2400, district: "羊山新区",
    stage: "in-progress", progress: 68, receivedPct: 50, signedAt: "2026-04-08",
    pendingCounts: { acceptance: 2, change: 0, payment: 1 },
  },
  {
    id: "ORD-2026-0524", customerName: "孙总", customerPhone: "138****2008",
    scope: "万象城海底捞 · 860㎡ 餐饮空间",
    amount: 1560000, area: 860, district: "羊山新区",
    stage: "signed", progress: 0, receivedPct: 30, signedAt: "2026-05-22",
    pendingCounts: { acceptance: 0, change: 0, payment: 0 },
  },
  {
    id: "ORD-2026-0531", customerName: "王女士", customerPhone: "138****7720",
    scope: "蓝湾国际 · 98㎡ 三居整装",
    amount: 198600, area: 98, district: "平桥区",
    stage: "quoted", progress: 0, receivedPct: 0,
    pendingCounts: { acceptance: 0, change: 0, payment: 0 },
  },
  {
    id: "ORD-2026-0537", customerName: "赵先生", customerPhone: "138****9112",
    scope: "御景湾 · 140㎡ 半包",
    amount: 78000, area: 140, district: "浉河区",
    stage: "inquiry", progress: 0, receivedPct: 0,
    pendingCounts: { acceptance: 0, change: 0, payment: 0 },
  },
  {
    id: "ORD-2026-0476", customerName: "周先生", customerPhone: "138****3344",
    scope: "御景湾别墅 · 320㎡ 软装升级",
    amount: 860000, area: 320, district: "平桥区",
    stage: "accepted", progress: 100, receivedPct: 100, signedAt: "2026-02-08",
    pendingCounts: { acceptance: 0, change: 0, payment: 0 },
  },
];

export function getOrder(id: string): Order | undefined {
  // 演示：只有 ORDER_DEMO 是完整数据，其余 stub
  if (id === ORDER_DEMO.id) return ORDER_DEMO;
  return undefined;
}
