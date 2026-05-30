import "server-only";
import { activeProvider } from "@/lib/ai/chat";
import { streamDeepseek } from "@/lib/ai/providers/deepseek";
import { streamAnthropic } from "@/lib/ai/providers/anthropic";

export type RiskLevel = "low" | "medium" | "high";

export type RiskFinding = {
  level: RiskLevel;
  lawRef: string;
  issue: string;
  suggestion: string;
  quote?: string;
};

/* ============================================================
   AI 协议合规风险扫描
   ------------------------------------------------------------
   返回结构化 JSON · 用 DeepSeek 或 Claude · 失败回退本地规则
   ============================================================ */

const LEGAL_SYSTEM = `你是中国法律合规审查专家，专精互联网合同与个人信息保护。请扫描用户提供的协议正文，列出潜在风险。

**必须重点检查**：
1. 《电子签名法》§13、14 - 可靠电子签名要件
2. 《民法典》§496 - 格式条款显著提示与说明义务
3. 《民法典》§497 - 不合理免责 / 加重对方责任 / 限制对方权利的条款无效
4. 《个人信息保护法》§14 - 处理敏感个人信息须取得单独同意
5. 《个人信息保护法》§15 - 撤回同意机制必须明示
6. 《个人信息保护法》§17、18 - 充分告知处理目的、方式、期限
7. 《个人信息保护法》§38、39 - 跨境传输须单独同意 + 安全评估
8. 《消费者权益保护法》§26 - 不得用格式条款加重消费者责任
9. 《网络安全法》§21、24 - 网络日志留存 ≥6 个月、实名认证
10. 《建筑法》《建设工程质量管理条例》- 质量保证义务不可由合同免除

**输出严格 JSON**，格式如下，不要带其他说明文字：
\`\`\`json
{
  "findings": [
    {
      "level": "high" | "medium" | "low",
      "lawRef": "《民法典》§497",
      "issue": "问题简述（10-30字）",
      "suggestion": "改进建议（20-50字）",
      "quote": "原文摘录（如有 · 不超 30 字）"
    }
  ]
}
\`\`\`

如果协议无明显风险，返回 \`{"findings": []}\`。
最多列出 8 条最重要的。按风险等级排序（high 在前）。`;

export async function scanProtocolRisks(content: string): Promise<RiskFinding[]> {
  const provider = await activeProvider();
  if (provider === "demo") return localFallback(content);

  try {
    const stream =
      provider === "deepseek"
        ? await streamDeepseek({ system: LEGAL_SYSTEM, messages: [{ role: "user", content }], maxTokens: 2048 })
        : await streamAnthropic({ system: LEGAL_SYSTEM, messages: [{ role: "user", content }], maxTokens: 2048 });

    const reader = stream.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
    }
    return parseRisks(buf);
  } catch (e) {
    console.error("[risk-scan] ai 调用失败，回退本地规则：", e);
    return localFallback(content);
  }
}

function parseRisks(raw: string): RiskFinding[] {
  // 提取 JSON 块
  let j = raw.trim();
  const match = j.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) j = match[1].trim();
  // 兜底找第一个 { 到最后一个 }
  const a = j.indexOf("{");
  const b = j.lastIndexOf("}");
  if (a >= 0 && b > a) j = j.slice(a, b + 1);
  try {
    const obj = JSON.parse(j) as { findings?: RiskFinding[] };
    if (!Array.isArray(obj.findings)) return [];
    return obj.findings.filter((f) => f.level && f.issue).slice(0, 8);
  } catch {
    return [];
  }
}

/* ============================================================
   无 AI 时的本地兜底规则 — 简单关键词扫描
   ============================================================ */
function localFallback(content: string): RiskFinding[] {
  const findings: RiskFinding[] = [];
  const t = content.toLowerCase();

  // 跨境
  if (/anthropic|claude|openai|gpt|境外|跨境|海外/i.test(content)) {
    if (!/单独同意|单独签|安全评估/.test(content)) {
      findings.push({
        level: "high",
        lawRef: "《PIPL》§38、39",
        issue: "跨境传输未明确单独同意 / 安全评估",
        suggestion: "在跨境传输章节增加'用户须单独同意'条款并说明已通过国家网信办安全评估",
      });
    }
  }

  // 撤回
  if (!/撤回|撤销|删除|注销/.test(content)) {
    findings.push({
      level: "medium",
      lawRef: "《PIPL》§15",
      issue: "未提及用户撤回同意机制",
      suggestion: "增加'您可随时撤回授权'章节，明确撤回路径与生效时间",
    });
  }

  // 免责
  if (/概不负责|不承担|免除全部责任|永久免责/.test(content)) {
    findings.push({
      level: "high",
      lawRef: "《民法典》§497",
      issue: "存在不合理免责表述",
      suggestion: "将'概不负责'改为'按法律法规承担相应责任'",
      quote: "概不负责",
    });
  }

  // 显著提示
  if (content.length > 500 && !/重点|须知|提示|加粗/.test(content)) {
    findings.push({
      level: "low",
      lawRef: "《民法典》§496",
      issue: "协议较长但缺少重点条款显著提示",
      suggestion: "用 ** 加粗或独立段落标注关键条款",
    });
  }

  // 期限
  if (!/期限|保留|保存/.test(content)) {
    findings.push({
      level: "medium",
      lawRef: "《PIPL》§17",
      issue: "未明确个人信息保存期限",
      suggestion: "增加'信息保留 X 年/合同有效期 + Y 年'",
    });
  }

  // 加重消费者
  if (/全部费用由您承担|无条件接受|不得拒绝|放弃所有权利/.test(content)) {
    findings.push({
      level: "high",
      lawRef: "《消费者权益保护法》§26",
      issue: "存在加重消费者责任的格式条款",
      suggestion: "明确双方权利义务对等",
    });
  }

  // 实名
  if (/(身份证|实名)/.test(content) && !/(明文|哈希|加密|脱敏|不存储)/.test(content)) {
    findings.push({
      level: "medium",
      lawRef: "《PIPL》§14、《网络安全法》§24",
      issue: "处理身份证等敏感信息但未说明存储方式",
      suggestion: "说明身份证号采用 SHA-256 哈希存储，明文不入库",
    });
  }

  return findings.slice(0, 8);
}
