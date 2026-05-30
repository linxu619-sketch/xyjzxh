import { NextRequest, NextResponse } from "next/server";
import { verifyCallback } from "@/lib/agreements/esign/e_qianbao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * e签宝签署完成回调
 *
 * e签宝在以下事件时会回调：
 * - 签署完成（FINISH）
 * - 签署驳回（REJECT）
 * - 流程过期（EXPIRED）
 * - 流程撤销（REVOKE）
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });

  // 签名校验（防伪造）
  const valid = await verifyCallback(headers, rawBody);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "签名校验失败" }, { status: 401 });
  }

  let event: {
    action?: string;
    signFlowId?: string;
    signFlowStatus?: number;
    signers?: Array<{ name: string; mobile: string; signTime: string }>;
  } = {};
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Body 非 JSON" }, { status: 400 });
  }

  /* ============================================================
     生产环境此处应：
     1. 根据 signFlowId 找到 agreement_signatures 记录
     2. 更新 status / pdf_archive_url / esign_serial_no
     3. 写一条 notifications 给用户和协会
     4. 若 status = FINISH，触发后续业务（如开通会员权益）
     ============================================================ */

  console.log("[esign/callback] received event:", JSON.stringify(event).slice(0, 200));

  // e签宝期望响应 { code: 0 } 表示已接收
  return NextResponse.json({ code: 0, message: "received" });
}

// e签宝可能在配置时用 GET 验活
export async function GET() {
  return NextResponse.json({ ok: true, service: "e签宝 callback receiver" });
}
