// 知识库「AI 每日抓取」的数据来源配置（种子源；运行期可在后台增删改）
// kind:
//   sample —— 内置样例来源，返回固定候选，便于离线 / 不调用 AI 时演示整条流水线
//   rss    —— 标准 RSS/Atml feed
//   html   —— 普通网页，按 <a> 链接启发式提取候选条目
export type SourceKind = "sample" | "rss" | "html";

export type KnowledgeSource = {
  id: string;
  name: string;
  url: string;
  kind: SourceKind;
  category: string; // 该来源条目的默认归类（5 类之一）
  enabled: boolean;
  lastRunAt?: number;
};

export const DEFAULT_KNOWLEDGE_SOURCES: Omit<KnowledgeSource, "lastRunAt">[] = [
  // 样例来源：开箱即用、不依赖外网，用于演示「抓取 → 起草 → 待审」闭环
  { id: "SRC-sample", name: "样例来源（演示用）", url: "sample://demo", kind: "sample", category: "地方政策", enabled: true },
  // 真实来源：起步配置，URL 可能随官网改版变化，可在「来源管理」里修正
  { id: "SRC-mohurd", name: "住房和城乡建设部 · 政策发布", url: "https://www.mohurd.gov.cn/gongkai/zhengce/", kind: "html", category: "地方政策", enabled: true },
  { id: "SRC-hnjs", name: "河南省住房和城乡建设厅 · 通知公告", url: "https://hnjs.henan.gov.cn/", kind: "html", category: "地方政策", enabled: true },
  { id: "SRC-xyjs", name: "信阳市住房和城乡建设局", url: "https://zjj.xinyang.gov.cn/", kind: "html", category: "地方政策", enabled: false },
];

// 样例来源返回的固定候选（标题 + 链接 + 摘要片段）
export const SAMPLE_CANDIDATES: { title: string; url: string; snippet: string }[] = [
  {
    title: "信阳市住建局关于进一步规范住宅室内装饰装修管理的通知（2026）",
    url: "sample://demo/xy-zhuangxiu-2026",
    snippet: "为规范我市住宅室内装饰装修活动，保障建筑结构与公共安全，明确装修开工报备、承重结构改动审批、施工时间与垃圾清运、物业查验等要求。",
  },
  {
    title: "河南省住建厅发布绿色建筑与节能装修推广实施意见",
    url: "sample://demo/hn-greenbuilding-2026",
    snippet: "推动绿色建材应用、装配式装修、室内空气质量与能效达标，明确新建住宅交付与既有建筑改造的绿色装修指引及财政奖补方向。",
  },
  {
    title: "住建部修订《建筑装饰装修工程质量验收》配套技术要点解读",
    url: "sample://demo/mohurd-yanshou-2026",
    snippet: "围绕隐蔽工程留痕、防水闭水试验、饰面层空鼓与平整度允许偏差等关键控制点，发布配套技术问答，便于一线施工与监理对照执行。",
  },
];
