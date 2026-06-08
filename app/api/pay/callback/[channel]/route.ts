import { NextRequest, NextResponse } from "next/server";
import { isPayMethod } from "@/lib/payments";
import { settleByOutTradeNo } from "@/lib/payments/settle";
import { getPaymentByOutTradeNo } from "@/lib/data/payments-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 支付渠道异步通知统一落点：POST /api/pay/callback/<channel>
 *   channel: alipay | wechat | bank_corp | bank_personal
 *
 * 真实接入时在 verifySignature / parseNotify 内按渠道实现验签与报文解析。
 * 骨架阶段：未实现真实验签前一律「拒绝结算」，防止伪造回调结算
 * （收银台「确认到账」为当前可用的人工结算路径）。
 */

type Parsed = { outTradeNo: string; success: boolean; channelRef: string };

// 验签（防伪造）。真实环境：
//  - alipay：去掉 sign/sign_type 后按 key 排序拼接，用支付宝公钥 RSA2 验签
//  - wechat：用微信平台证书验 Wechatpay-Signature（timestamp\nnonce\nbody\n）
//  - 银行：按银企直连签名 / 对账文件核销
async function verifySignature(_channel: string, _raw: string, _headers: Headers): Promise<boolean> {
  return false; // 骨架默认不放行；接入真实密钥后在此返回验签结果
}

function parseNotify(channel: string, form: URLSearchParams | null, json: Record<string, string> | null): Parsed {
  if (channel === "alipay" && form) {
    return { outTradeNo: form.get("out_trade_no") || "", success: (form.get("trade_status") || "") === "TRADE_SUCCESS", channelRef: form.get("trade_no") || "" };
  }
  if (channel === "wechat" && json) {
    // 微信 v3：resource 为加密报文，需用 APIv3 密钥解密后取 out_trade_no / trade_state；此处占位
    return { outTradeNo: json.out_trade_no || "", success: (json.trade_state || "") === "SUCCESS", channelRef: json.transaction_id || "" };
  }
  const o: Record<string, string> = json ?? (form ? Object.fromEntries(form) : {});
  return { outTradeNo: o.out_trade_no || o.outTradeNo || "", success: o.success === "true" || o.success === "1", channelRef: o.channel_ref || o.transaction_id || "" };
}

// 渠道要求的应答：支付宝纯文本 success/fail；微信 JSON {code,message}
function ack(channel: string, ok: boolean): NextResponse {
  if (channel === "alipay") return new NextResponse(ok ? "success" : "fail", { status: ok ? 200 : 500 });
  if (channel === "wechat") return NextResponse.json(ok ? { code: "SUCCESS", message: "成功" } : { code: "FAIL", message: "验签或处理失败" }, { status: ok ? 200 : 500 });
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ channel: string }> }) {
  const { channel } = await params;
  if (!isPayMethod(channel)) return NextResponse.json({ ok: false, error: "未知支付渠道" }, { status: 404 });

  const raw = await req.text();
  const ctype = req.headers.get("content-type") || "";
  let form: URLSearchParams | null = null;
  let json: Record<string, string> | null = null;
  if (ctype.includes("application/json")) { try { json = JSON.parse(raw) as Record<string, string>; } catch { /* 非 JSON */ } }
  else { try { form = new URLSearchParams(raw); } catch { /* 非表单 */ } }

  // 1. 验签
  const valid = await verifySignature(channel, raw, req.headers);
  if (!valid) return ack(channel, false); // 骨架：拒绝未验签通知

  // 2. 解析通知报文
  const p = parseNotify(channel, form, json);
  if (!p.outTradeNo || !getPaymentByOutTradeNo(p.outTradeNo)) return ack(channel, false);

  // 3. 支付成功 → 结算业务单（幂等）
  if (p.success) settleByOutTradeNo(p.outTradeNo, p.channelRef || `${channel}-callback`);

  // 4. 按渠道格式应答
  return ack(channel, true);
}

export async function GET() {
  return NextResponse.json({ ok: true, info: "支付回调端点，仅接受渠道 POST 通知" });
}
