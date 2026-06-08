# 资金交易 / 支付系统 — 架构与对接指南

> 本文档面向后续对接真实支付渠道的开发者。当前为**框架先行**：流程、数据、收银台、回调落点、佣金拆分、结算全部就绪并跑通；真实渠道（支付宝 / 微信 / 银行）只差「填 SDK + 验签 + 配密钥」三步。
>
> 安全底线：**未实现真实验签前，回调一律不放行结算**（防伪造），当前用收银台「确认到账」人工结算。密钥/账户一律走平台「系统设置」，**严禁硬编码或提交到仓库**。

## 1. 全景

```
业务单(supply_order…)
   │  发起收款（选渠道，按商品佣金算分成）
   ▼
统一支付单 payments  ──►  收银台 /dashboard/pay/[id]
   │                         扫码占位 / 银行账户+备注 · 切换渠道
   │
   ├─(真实)渠道异步通知 → POST /api/pay/callback/[channel] → 验签 → 结算
   └─(演示)收银台「确认到账」 → 人工结算
                                   │
                                   ▼
                        settlePayment（幂等）
                          · 支付单 → paid
                          · 业务单结算（如 supply_order → markOrderPaid）
                          · 佣金拆分：平台佣金 / 卖家应结
```

## 2. 数据模型

**`payments` 表**（`lib/db/sqlite.ts`）— 统一支付单，可挂任意业务：

| 字段 | 含义 |
|---|---|
| `out_trade_no` | 商户订单号（唯一，回调按此匹配）|
| `biz_type` / `biz_id` | 关联业务单类型 / id（当前 `supply_order`，可扩展）|
| `method` | `alipay` / `wechat` / `bank_corp` / `bank_personal` |
| `amount` | 金额（元）|
| `commission` / `payee_amount` | 平台佣金 / 卖家应结（= amount − commission）|
| `status` | `pending` / `paid` / `failed` / `refunded` / `closed` |
| `channel_ref` | 渠道流水号（回调写入）|
| `payer_name` / `payee_name` / `subject` | 付款方 / 收款方 / 商品标题 |

商品佣金存 `supply_products.commission_pct`（0–2%），平台后台「商品详情」设置（`setCommission`）。

## 3. 代码结构

| 文件 | 职责 |
|---|---|
| `lib/payments/index.ts` | 渠道抽象：`PaymentProvider` 接口、4 个 provider、`getProvider`、`collectionAccount`（读后台收款账户）、`enabledPayMethods`（按开关过滤）、`PAY_METHODS` |
| `lib/data/payments-source.ts` | 支付单 CRUD：`createPayment`（建单+算佣金）、`getPayment`/`getPaymentByOutTradeNo`、`markPaymentPaid`、`setPaymentMethod`、`listPaymentsByBiz`、`paymentsSummary` |
| `lib/payments/settle.ts` | `settlePayment` / `settleByOutTradeNo`（幂等结算，回调与人工确认共用）|
| `app/(dashboard)/dashboard/pay/[id]/page.tsx` | 收银台（金额 / 佣金拆分 / 渠道指引 / 切换渠道 / 确认到账）|
| `app/(dashboard)/dashboard/pay/actions.ts` | `startPaymentAction`（发起）、`confirmPaymentAction`（人工确认→结算）、`setPayMethodAction`（切渠道）|
| `app/api/pay/callback/[channel]/route.ts` | 渠道异步通知落点（验签→解析→结算→应答）|
| `lib/runtime-config.ts` | `RuntimeSettings.payment` + `getPaymentConfig`（收款账户 / 渠道开关 / 密钥）|
| `app/(dashboard)/dashboard/association/settings/` | 系统设置「收款 / 支付」卡（账户 / 开关 / 密钥 / 回调地址）|

## 4. 接入清单（上线真实支付要做的事）

### ① 渠道下单 — `lib/payments/index.ts` 各 provider 的 `initiate`
- **支付宝**：`alipay.trade.precreate` → 取 `qr_code` 填进 `qrcode.qrContent`。密钥从 `getPaymentConfig()` 读（`alipayAppId` / `alipayPrivateKey`）。
- **微信**：Native 下单（v3）→ 取 `code_url`。商户号 `wechatMchId`、APIv3 密钥 `wechatApiKey`。
- **银行对公/对私**：无需下单，`collectionAccount(type)` 已从后台读账户；保持转账+备注核销即可（或接银企直连）。

### ② 验签 — `app/api/pay/callback/[channel]/route.ts` 的 `verifySignature`
当前恒返回 `false`（安全默认）。按渠道实现：
- **支付宝**：去掉 `sign`/`sign_type`，按 key 排序拼接，用支付宝公钥 RSA2 验签。
- **微信**：用微信平台证书验 `Wechatpay-Signature`（`timestamp\nnonce\nbody\n`），并用 APIv3 密钥解密 `resource` 取 `out_trade_no`/`trade_state`（见 `parseNotify` 的 TODO）。
- 验签通过后函数返回 `true`，成功通知即自动 `settleByOutTradeNo` 结算。

### ③ 配置 — 平台「系统设置 → 收款 / 支付」
- 填**对公/对私收款账户**（户名/账号/开户行）→ 收银台银行转账实时展示。
- 填**渠道密钥**（支付宝 AppID/私钥、微信商户号/APIv3）→ 仅服务端、不回显、重填才覆盖。
- **渠道开关**：关掉的渠道前台不展示（`enabledPayMethods`）。
- 把**异步通知地址**填到渠道后台：`https://<域名>/api/pay/callback/alipay`、`.../wechat`。

## 5. 扩展到其它业务（如施工订单收款）
1. `createPayment({ bizType: "construction_order", bizId, amount, commissionPct, … })`；
2. `lib/payments/settle.ts` 的 `switch (pay.bizType)` 加一个分支，结算对应业务单；
3. 在该业务页加「发起收款」入口（参考 `app/(dashboard)/dashboard/association/supplies/order/[id]/page.tsx`）。

收银台、回调、佣金拆分均无需改动。

## 6. 安全要点
- 回调**必须验签**；`verifySignature` 未实现前默认拒绝，伪造的 `TRADE_SUCCESS` 不会结算。
- 结算 `settlePayment` **幂等**（已 paid 直接返回），回调重投不会重复结算。
- 金额、佣金、`payee_amount` 一律服务端计算，不信任前端传值。
- 密钥仅服务端使用、不回显（`maskSecret`）、走 `.runtime-settings.json`（已 gitignore），不入库不入仓。
