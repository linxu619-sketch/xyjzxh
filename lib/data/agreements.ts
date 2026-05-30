// 协议模板 / 签署记录 mock 数据
// 落地 Supabase 时迁移到 agreement_templates / agreement_signatures 表

export type AgreementTarget =
  | "enterprise"        // 企业会员
  | "enterprise_staff"  // 企业员工
  | "practitioner"      // 从业者
  | "customer"          // C 端业主
  | "association_staff" // 协会工作人员
  | "public";           // 全用户

export type AgreementCategory =
  | "membership"          // 入会 / 服务
  | "privacy"             // 隐私
  | "data_processing"     // 数据处理 (DPA)
  | "consent_sensitive"   // 敏感信息单独同意 (PIPL)
  | "consent_cross_border" // 跨境传输授权
  | "insurance"           // 保险投保授权
  | "supervisor"          // 监管 / 数据共享
  | "ndma"                // 保密 / 反舞弊
  | "compliance";         // 反不正当竞争 / 行规

export type AgreementTemplate = {
  id: string;
  code: string;                   // 业务编号，如 ENT-MEMBERSHIP
  title: string;
  category: AgreementCategory;
  target: AgreementTarget;
  version: string;                // semver
  status: "draft" | "published" | "archived";
  required: boolean;              // 是否必签
  requiresSeparateConsent: boolean; // PIPL 单独同意条款
  requiresResignOnChange: boolean;  // 变更后必须重新签
  minReadSeconds: number;         // 防"秒签" 最少阅读秒数
  effectiveAt: string;            // 生效
  expiresAt?: string;             // 失效（可空）
  draftedBy: string;
  reviewedBy?: string;            // 法务核验人
  approvedBy?: string;            // 秘书长批准
  approvedAt?: string;
  content: string;                // markdown
  highlights: string[];           // 重点条款（必须单独勾选）
  changelog?: string;             // 与上一版差异
};

export type SignerType = AgreementTarget;

export type AgreementSignature = {
  id: string;                     // SIG-...
  templateId: string;
  templateCode: string;
  templateVersion: string;
  contentHash: string;            // sha256 协议正文
  signerType: SignerType;
  signerId: string;
  signerRealName: string;
  signerIdCardHash?: string;      // 身份证哈希（非明文）
  signerPhone: string;
  signedAt: string;
  signingIp: string;
  signingUa: string;
  deviceFingerprintHash: string;
  readSeconds: number;
  scrollCompletionPct: number;
  highlightsAcknowledged: number[]; // 已勾选的重点条款 index
  esignProvider: "e_qianbao" | "shangshangqian" | "native" | "demo";
  esignSerialNo?: string;
  pdfArchiveUrl?: string;
  blockchainTxId?: string;
  status: "active" | "revoked" | "superseded" | "expired";
  revokedAt?: string;
  revokeReason?: string;
};

/* ============================================================
   种子协议模板 — 实际接入时由秘书处 + 法务起草
   ============================================================ */
export const AGREEMENT_TEMPLATES: AgreementTemplate[] = [
  // —— 企业会员 ——
  {
    id: "tpl-ent-membership",
    code: "ENT-MEMBERSHIP",
    title: "信阳市建筑装饰装修协会 · 入会协议",
    category: "membership",
    target: "enterprise",
    version: "1.2.0",
    status: "published",
    required: true,
    requiresSeparateConsent: false,
    requiresResignOnChange: true,
    minReadSeconds: 60,
    effectiveAt: "2026-04-01",
    draftedBy: "陈秘书",
    reviewedBy: "王律师事务所",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 入会协议\n\n甲方：信阳市建筑装饰装修协会\n乙方：本企业\n\n## 第一条 入会条件\n…\n\n## 第二条 权利与义务\n（重点条款 ①）乙方须确保所提供的资质材料真实有效…\n…\n\n## 第十条 违约与解除\n（重点条款 ②）乙方有挂证、虚假宣传、欺诈业主等行为的，协会有权立即解除…\n\n## 第十二条 争议解决\n（重点条款 ③）因本协议产生的争议，双方应优先通过协会调解委员会调解；调解不成的，由信阳市浉河区人民法院管辖。`,
    highlights: [
      "我已仔细阅读「资质材料真实性」条款并承诺真实",
      "我已知悉「挂证 / 虚假宣传 / 欺诈」将立即解除会籍",
      "我同意将争议提交协会调解委员会 + 信阳市浉河区法院管辖",
    ],
    changelog: "1.2.0：增加 AI 用量计费条款 + 调解前置条款",
  },
  {
    id: "tpl-ent-service",
    code: "ENT-PLATFORM-SERVICE",
    title: "平台服务协议（含二级子站托管）",
    category: "membership",
    target: "enterprise",
    version: "1.1.0",
    status: "published",
    required: true,
    requiresSeparateConsent: false,
    requiresResignOnChange: true,
    minReadSeconds: 45,
    effectiveAt: "2026-04-01",
    draftedBy: "技术委员会",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 平台服务协议\n\n## 第一条 服务范围\n…包括子站托管、报备直通、AI 员工调用、知识库等…\n\n## 第五条 服务水平 (SLA)\n（重点）平台年可用率 99.5%。低于此线协会按月费日均退还…\n\n## 第八条 数据归属\n（重点）业务数据归乙方所有；协会仅在受托范围内处理。\n\n## 第十条 服务终止与数据迁移\n（重点）解除会籍后 90 天内协会协助乙方导出全部数据，逾期不可恢复。`,
    highlights: [
      "我知悉 SLA 99.5% + 违约日均退费规则",
      "我知悉业务数据归本企业所有",
      "我知悉解约后 90 天内必须自助导出",
    ],
  },
  {
    id: "tpl-ent-dpa",
    code: "ENT-DPA",
    title: "数据处理协议（DPA · PIPL 合规）",
    category: "data_processing",
    target: "enterprise",
    version: "1.0.0",
    status: "published",
    required: true,
    requiresSeparateConsent: true,
    requiresResignOnChange: true,
    minReadSeconds: 90,
    effectiveAt: "2026-04-01",
    draftedBy: "技术委员会 + 法务",
    reviewedBy: "王律师事务所",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 数据处理协议 (DPA)\n\n依据《中华人民共和国个人信息保护法》制定。\n\n## 第一条 处理者关系\n协会作为受托处理者；企业作为个人信息处理者…\n\n## 第三条 跨境传输\n（重点）AI 助手调用境外 API 时，仅传输已脱敏的对话内容…\n\n## 第六条 删除与销毁\n（重点）合同解除后 30 日内删除全部用户个人信息…\n\n## 第八条 安全事件通知\n（重点）发现泄露后 24 小时内通知乙方 + 业主，并向网信办报告。`,
    highlights: [
      "我同意 DPA 中关于 AI 跨境调用的脱敏处理方案",
      "我知悉解除后 30 日内删除规则",
      "我知悉 24 小时安全事件通报机制",
    ],
  },
  {
    id: "tpl-ent-report-share",
    code: "ENT-REPORT-SHARE",
    title: "工装报备数据共享授权（与河南省建设行业监管平台）",
    category: "supervisor",
    target: "enterprise",
    version: "1.0.0",
    status: "published",
    required: true,
    requiresSeparateConsent: false,
    requiresResignOnChange: false,
    minReadSeconds: 30,
    effectiveAt: "2026-04-01",
    draftedBy: "秘书处",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 数据共享授权\n\n乙方授权协会将工装报备字段（项目名、面积、合同价款、企业资质、安全员证号、保险信息）同步至河南省建设行业监管平台…\n\n（重点）共享后数据由省建设厅按其规定处理，不再受本协议约束。`,
    highlights: [
      "我同意共享工装报备字段至省厅监管平台",
    ],
  },

  // —— 个人会员 / 从业者 ——
  {
    id: "tpl-prac-membership",
    code: "PRAC-MEMBERSHIP",
    title: "从业者入会协议",
    category: "membership",
    target: "practitioner",
    version: "1.0.0",
    status: "published",
    required: true,
    requiresSeparateConsent: false,
    requiresResignOnChange: true,
    minReadSeconds: 40,
    effectiveAt: "2026-04-01",
    draftedBy: "秘书处",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 从业者入会协议\n\n## 第二条 实名认证\n（重点）入会须提供身份证 / 行业证书，认证后纳入协会信用体系。\n\n## 第五条 行为规范\n（重点）严禁挂证、虚假履历、串通报价等行为。\n\n## 第八条 退会\n书面提出，30 日内办理，已生效的工伤险继续有效至到期日。`,
    highlights: [
      "我承诺所提供的身份证 / 证书真实",
      "我承诺不挂证、不虚假履历",
    ],
  },
  {
    id: "tpl-prac-realname",
    code: "PRAC-REALNAME-CONSENT",
    title: "实名信息使用授权（PIPL · 单独同意）",
    category: "consent_sensitive",
    target: "practitioner",
    version: "1.0.0",
    status: "published",
    required: true,
    requiresSeparateConsent: true,
    requiresResignOnChange: false,
    minReadSeconds: 60,
    effectiveAt: "2026-04-01",
    draftedBy: "秘书处 + 法务",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 实名信息使用授权\n\n本授权依据《个人信息保护法》第 14 条独立签署。\n\n## 一、信息范围\n身份证号、姓名、人脸图像、行业证书号\n\n## 二、使用目的\n仅用于协会实名核验、工伤险投保、信用画像、住建系统证书联网。\n\n## 三、保存期限\n会籍存续期间 + 法定保留期。\n\n（重点）您可随时撤回授权，撤回后协会将在 7 日内删除非法定保留信息。`,
    highlights: [
      "我已单独阅读并同意「身份证号」「人脸图像」的使用范围",
      "我知悉随时可撤回授权",
    ],
  },
  {
    id: "tpl-prac-income-export",
    code: "PRAC-INCOME-EXPORT",
    title: "收入流水生成与对外出具授权",
    category: "consent_sensitive",
    target: "practitioner",
    version: "1.0.0",
    status: "published",
    required: true,
    requiresSeparateConsent: true,
    requiresResignOnChange: false,
    minReadSeconds: 30,
    effectiveAt: "2026-04-01",
    draftedBy: "秘书处",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 收入流水授权\n\n您授权协会基于您在协会企业的接单记录生成月度收入证明，仅在您本人下载或主动提供给银行 / 政务机关时出具。\n\n（重点）协会不主动向第三方推送您的收入数据。`,
    highlights: [
      "我同意协会基于接单记录生成收入证明",
      "我知悉协会不主动向第三方推送",
    ],
  },
  {
    id: "tpl-prac-workinjury",
    code: "PRAC-WORK-INJURY-INSURE",
    title: "工伤险投保授权（团险）",
    category: "insurance",
    target: "practitioner",
    version: "1.0.0",
    status: "published",
    required: false,
    requiresSeparateConsent: true,
    requiresResignOnChange: false,
    minReadSeconds: 45,
    effectiveAt: "2026-04-01",
    draftedBy: "金融保险委员会",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 工伤险投保授权\n\n本人授权协会以「建筑工人意外险 · 协会团险版」名义为本人投保…\n\n（重点）保费由本人承担（5 元/天 或月/年付）；理赔款项直接打入本人账户…`,
    highlights: [
      "我同意以协会团险方式投保 · 保费自付",
      "我知悉理赔款项打入本人账户",
    ],
  },

  // —— C 端业主 ——
  {
    id: "tpl-cust-service",
    code: "CUST-PLATFORM-SERVICE",
    title: "平台服务协议",
    category: "membership",
    target: "customer",
    version: "1.0.0",
    status: "published",
    required: true,
    requiresSeparateConsent: false,
    requiresResignOnChange: true,
    minReadSeconds: 30,
    effectiveAt: "2026-04-01",
    draftedBy: "秘书处",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 平台服务协议\n\n协会作为平台运营方，为您匹配协会认证企业、提供 AI 估价、消费保险、协会调解等服务。\n\n（重点）平台不直接提供装修施工服务；具体合同由您与企业另行签订。\n\n（重点）AI 估价仅供参考，不构成报价承诺。`,
    highlights: [
      "我知悉平台不直接施工 · 合同由我与企业另签",
      "我知悉 AI 估价仅供参考",
    ],
  },
  {
    id: "tpl-cust-privacy",
    code: "CUST-PRIVACY",
    title: "用户隐私政策",
    category: "privacy",
    target: "customer",
    version: "1.1.0",
    status: "published",
    required: true,
    requiresSeparateConsent: false,
    requiresResignOnChange: true,
    minReadSeconds: 60,
    effectiveAt: "2026-05-01",
    draftedBy: "秘书处 + 法务",
    reviewedBy: "王律师事务所",
    approvedBy: "李会长",
    approvedAt: "2026-04-28",
    content: `# 隐私政策\n\n请仔细阅读。本政策按《个人信息保护法》要求告知。\n\n## 一、我们收集的信息\n…\n\n## 二、敏感信息（需单独同意）\n身份证、银行卡、人脸图像、AI 对话内容（涉跨境）将单独申请同意。\n\n## 三、共享对象\n协会认证企业（仅经您下单时）、合作金融保险机构（您单独授权）、监管机构（依法）。\n\n## 四、您的权利\n查询、复制、更正、删除、撤回同意、注销账户、投诉举报。`,
    highlights: [
      "我已阅读隐私政策全文",
      "我知悉敏感信息将另行单独同意",
      "我知悉随时可注销账户",
    ],
  },
  {
    id: "tpl-cust-ai-consent",
    code: "CUST-AI-CONSENT",
    title: "AI 对话数据使用授权（含跨境告知）",
    category: "consent_cross_border",
    target: "customer",
    version: "1.0.0",
    status: "published",
    required: true,
    requiresSeparateConsent: true,
    requiresResignOnChange: false,
    minReadSeconds: 45,
    effectiveAt: "2026-04-01",
    draftedBy: "AI 与数字化办公室 + 法务",
    reviewedBy: "王律师事务所",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# AI 对话授权（含跨境）\n\n协会 AI 助手当前底座可能是 DeepSeek（境内）或 Anthropic Claude（境外·美国）。\n\n## 跨境告知（PIPL 第 38/39 条）\n（重点）若使用 Anthropic Claude，您的对话内容（经脱敏后）将传输至美国服务器。\n\n## 您的选择\n您可在「设置 → 隐私」选择"仅使用境内 AI"或"完全关闭 AI"。\n\n## 我们的保护\n对话不存储身份证、银行卡、地址等敏感信息；脱敏算法不可逆。`,
    highlights: [
      "我已阅读跨境告知并同意脱敏后的对话传输",
      "我知悉可随时切换到仅境内 AI 或关闭 AI",
    ],
  },
  {
    id: "tpl-cust-realname",
    code: "CUST-REALNAME-CONSENT",
    title: "实名信息处理告知书（投保 / 维权专用）",
    category: "consent_sensitive",
    target: "customer",
    version: "1.0.0",
    status: "published",
    required: false,
    requiresSeparateConsent: true,
    requiresResignOnChange: false,
    minReadSeconds: 30,
    effectiveAt: "2026-04-01",
    draftedBy: "秘书处 + 法务",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 实名信息处理告知书\n\n仅当您选择购买消费保险、申请协会调解时需要提供身份证号。\n\n（重点）非必要不收集 · 用完即删的最小化原则。`,
    highlights: ["我同意保险/调解场景下提供身份证号"],
  },

  // —— 协会工作人员 ——
  {
    id: "tpl-staff-ndma",
    code: "STAFF-NDMA",
    title: "协会工作人员保密 · 反舞弊承诺书",
    category: "ndma",
    target: "association_staff",
    version: "1.0.0",
    status: "published",
    required: true,
    requiresSeparateConsent: false,
    requiresResignOnChange: false,
    minReadSeconds: 60,
    effectiveAt: "2026-04-01",
    draftedBy: "秘书处 + 监事会",
    approvedBy: "李会长",
    approvedAt: "2026-03-28",
    content: `# 保密与反舞弊承诺书\n\n## 第一条 保密\n严禁泄露会员企业经营数据、业主个人信息、调解卷宗等。\n\n## 第三条 反舞弊\n严禁收受会员企业财物 · 严禁徇私通过会员审核 / 报备 / 调解。\n\n（重点）违反者立即解聘 + 依法移送。`,
    highlights: [
      "我承诺保密义务",
      "我承诺不收受任何财物 · 不徇私",
    ],
  },
];

/* ============================================================
   签署记录 mock —— 演示数据
   ============================================================ */
export const AGREEMENT_SIGNATURES: AgreementSignature[] = [
  {
    id: "SIG-2026-001142",
    templateId: "tpl-cust-service",
    templateCode: "CUST-PLATFORM-SERVICE",
    templateVersion: "1.0.0",
    contentHash: "sha256:b8f4...",
    signerType: "customer",
    signerId: "C00284",
    signerRealName: "刘女士",
    signerPhone: "138****8472",
    signedAt: "2025-11-08 14:36:22",
    signingIp: "117.158.***.***",
    signingUa: "Mozilla/5.0 (iPhone)",
    deviceFingerprintHash: "fp:e7d2...",
    readSeconds: 38,
    scrollCompletionPct: 100,
    highlightsAcknowledged: [0, 1],
    esignProvider: "demo",
    esignSerialNo: "ESB-2026-001142",
    status: "active",
  },
  {
    id: "SIG-2026-001143",
    templateId: "tpl-cust-privacy",
    templateCode: "CUST-PRIVACY",
    templateVersion: "1.1.0",
    contentHash: "sha256:91ac...",
    signerType: "customer",
    signerId: "C00284",
    signerRealName: "刘女士",
    signerPhone: "138****8472",
    signedAt: "2025-11-08 14:37:08",
    signingIp: "117.158.***.***",
    signingUa: "Mozilla/5.0 (iPhone)",
    deviceFingerprintHash: "fp:e7d2...",
    readSeconds: 72,
    scrollCompletionPct: 100,
    highlightsAcknowledged: [0, 1, 2],
    esignProvider: "demo",
    esignSerialNo: "ESB-2026-001143",
    status: "active",
  },
  {
    id: "SIG-2026-001144",
    templateId: "tpl-cust-ai-consent",
    templateCode: "CUST-AI-CONSENT",
    templateVersion: "1.0.0",
    contentHash: "sha256:42cd...",
    signerType: "customer",
    signerId: "C00284",
    signerRealName: "刘女士",
    signerPhone: "138****8472",
    signedAt: "2025-11-08 14:37:51",
    signingIp: "117.158.***.***",
    signingUa: "Mozilla/5.0 (iPhone)",
    deviceFingerprintHash: "fp:e7d2...",
    readSeconds: 51,
    scrollCompletionPct: 100,
    highlightsAcknowledged: [0, 1],
    esignProvider: "demo",
    esignSerialNo: "ESB-2026-001144",
    status: "active",
  },
];

/* ============================================================
   工具：按角色筛选必签协议
   ============================================================ */
export function requiredAgreementsFor(target: AgreementTarget): AgreementTemplate[] {
  return AGREEMENT_TEMPLATES
    .filter((t) => t.status === "published")
    .filter((t) => t.target === target || t.target === "public")
    .filter((t) => t.required);
}

export function allAgreementsFor(target: AgreementTarget): AgreementTemplate[] {
  return AGREEMENT_TEMPLATES
    .filter((t) => t.status === "published")
    .filter((t) => t.target === target || t.target === "public");
}

export function signaturesByUser(signerType: SignerType, signerId: string): AgreementSignature[] {
  return AGREEMENT_SIGNATURES.filter((s) => s.signerType === signerType && s.signerId === signerId);
}

export function getTemplate(id: string): AgreementTemplate | undefined {
  return AGREEMENT_TEMPLATES.find((t) => t.id === id || t.code === id);
}
