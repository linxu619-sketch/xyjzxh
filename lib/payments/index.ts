/* ============================================================
   资金交易 / 支付框架
   ------------------------------------------------------------
   统一支付单 + 渠道抽象。当前为「框架先行」：4 个渠道（支付宝 / 微信 /
   银行对公 / 银行对私）均为占位实现，返回演示用的收款指引；接入真实渠道时
   只需在对应 provider 的 initiate/query/refund 内填入 SDK/API 调用与密钥，
   上层（支付单、结算、佣金拆分、回调）无需改动。
   真实密钥/账户从平台后台「系统设置」配置，切勿硬编码到代码或提交到仓库。
   ============================================================ */

export type PayMethod = "alipay" | "wechat" | "bank_corp" | "bank_personal";
export type PayStatus = "pending" | "paid" | "failed" | "refunded" | "closed";

export const PAY_METHODS: { method: PayMethod; label: string; icon: string; hint: string }[] = [
  { method: "alipay", label: "支付宝", icon: "🅰️", hint: "扫码支付" },
  { method: "wechat", label: "微信支付", icon: "🟢", hint: "扫码支付" },
  { method: "bank_corp", label: "银行转账 · 对公", icon: "🏦", hint: "企业对公账户" },
  { method: "bank_personal", label: "银行转账 · 对私", icon: "🏧", hint: "个人银行账户" },
];

export type BankAccount = { type: "corporate" | "personal"; accountName: string; accountNo: string; bankName: string };

export type PaymentInit = { outTradeNo: string; amount: number; subject: string; payerName?: string };

// 发起支付后给前端的收款指引（扫码 / 跳转 / 银行转账）
export type PayInstruction =
  | { kind: "qrcode"; method: PayMethod; label: string; qrContent: string; note: string }
  | { kind: "redirect"; method: PayMethod; label: string; url: string; note: string }
  | { kind: "bank_transfer"; method: PayMethod; label: string; bank: BankAccount; memo: string; note: string };

export interface PaymentProvider {
  method: PayMethod;
  label: string;
  /** 发起支付。真实环境：调用渠道下单 API 生成二维码/跳转链接/转账信息。 */
  initiate(init: PaymentInit): Promise<PayInstruction>;
  /** 查询支付状态。真实环境：查询渠道订单。 */
  query(outTradeNo: string): Promise<PayStatus>;
  /** 退款（可选）。 */
  refund?(outTradeNo: string, amount: number): Promise<boolean>;
}

const DEMO = "演示模式：尚未接入真实支付渠道，可在「确认到账」后手动结算。";

// 平台收款账户（占位）：真实环境从平台「系统设置」读取，勿硬编码真实账号
export function collectionAccount(type: "corporate" | "personal"): BankAccount {
  return type === "corporate"
    ? { type: "corporate", accountName: "信阳市建筑装饰装修协会", accountNo: "（对公账户待平台配置）", bankName: "（开户行待配置）" }
    : { type: "personal", accountName: "（收款人待配置）", accountNo: "（账户待配置）", bankName: "（开户行待配置）" };
}

const alipay: PaymentProvider = {
  method: "alipay", label: "支付宝",
  async initiate(init) {
    // TODO 真实接入：alipay.trade.precreate → 返回 qr_code；密钥从平台设置读
    return { kind: "qrcode", method: "alipay", label: "支付宝", qrContent: `alipay:${init.outTradeNo}:${init.amount}`, note: `接入支付宝开放平台后显示真实收款码。${DEMO}` };
  },
  async query() { return "pending"; },
  async refund() { return true; },
};

const wechat: PaymentProvider = {
  method: "wechat", label: "微信支付",
  async initiate(init) {
    // TODO 真实接入：微信 Native 下单(v3) → code_url；商户号/证书从平台设置读
    return { kind: "qrcode", method: "wechat", label: "微信支付", qrContent: `weixin:${init.outTradeNo}:${init.amount}`, note: `接入微信支付商户平台后显示真实收款码。${DEMO}` };
  },
  async query() { return "pending"; },
  async refund() { return true; },
};

function bankProvider(method: "bank_corp" | "bank_personal", type: "corporate" | "personal", label: string): PaymentProvider {
  return {
    method, label,
    async initiate(init) {
      return { kind: "bank_transfer", method, label, bank: collectionAccount(type), memo: init.outTradeNo, note: `请按上述账户转账，并在转账备注填写订单号 ${init.outTradeNo} 以便核销。${DEMO}` };
    },
    async query() { return "pending"; },
  };
}

const PROVIDERS: Record<PayMethod, PaymentProvider> = {
  alipay,
  wechat,
  bank_corp: bankProvider("bank_corp", "corporate", "银行转账 · 对公"),
  bank_personal: bankProvider("bank_personal", "personal", "银行转账 · 对私"),
};

export function getProvider(method: PayMethod): PaymentProvider | undefined {
  return PROVIDERS[method];
}
export function isPayMethod(s: string): s is PayMethod {
  return s === "alipay" || s === "wechat" || s === "bank_corp" || s === "bank_personal";
}
