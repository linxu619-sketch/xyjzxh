import Link from "next/link";
import { Sparkles, Activity, Pencil, Power, MessageCircle, BookOpen } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { SettingsCard, Toggle, FormRow } from "@/components/dashboard/section";
import { AI_EMPLOYEES } from "@/lib/site";
import { AI_PROMPTS } from "@/lib/ai/prompts";
import { readRuntimeSettings } from "@/lib/runtime-config";
import { questionCounts } from "@/lib/ai/knowledge-source";
import { cn } from "@/lib/cn";

export const metadata = { title: "AI 配置 · 协会工作台" };

const LEGACY_TO_V4: Record<string, string> = {
  "deepseek-chat": "deepseek-v4-flash",
  "deepseek-reasoner": "deepseek-v4-flash",
};

const GRAD: Record<string, string> = {
  brand: "from-brand to-brand-600",
  build: "from-cat-build to-brand-600",
  decor: "from-cat-decor to-[#e6531f]",
  design: "from-cat-design to-[#6d3df0]",
  tea: "from-accent-tea to-[#008a63]",
  yellow: "from-[#ffd34d] to-[#ffae00]",
};

export default async function AiAdmin() {
  const aiCfg = (await readRuntimeSettings()).ai ?? {};
  const rawModel = aiCfg.deepseekModel || "deepseek-v4-flash";
  const model = LEGACY_TO_V4[rawModel] ?? rawModel;
  // 真实对话量（ai_questions）：本月 + 今日，按员工 key 统计
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const usageMonth = questionCounts(monthStart.getTime());
  const usageToday = questionCounts(todayStart.getTime());
  return (
    <AssociationShell
      title="AI 员工配置"
      subtitle={`全站 ${AI_EMPLOYEES.length} 位 AI · 本月对话 ${usageMonth.total.toLocaleString()} 次 · 今日 ${usageToday.total.toLocaleString()} 次`}
      actions={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/association/ai/knowledge" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> 知识库维护
          </Link>
          <button className="h-9 px-4 rounded-full bg-white/15 border border-white/25 text-white text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-white/25 transition-colors">
            <Activity className="h-3.5 w-3.5" /> 使用分析
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_EMPLOYEES.map((ai) => {
          const p = AI_PROMPTS[ai.key];
          return (
            <div key={ai.key} className="rounded-2xl border border-border bg-background overflow-hidden">
              <div className="flex items-center gap-3 p-5 border-b border-border">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl bg-gradient-to-br shadow-md",
                  GRAD[ai.color] ?? GRAD.brand,
                )}>
                  {ai.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold">{ai.name} · {ai.role}</div>
                  <div className="text-[11px] text-muted-foreground">{ai.duty}</div>
                </div>
                <Toggle defaultChecked />
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-2 text-center text-[11px] border-b border-border">
                <div><div className="text-muted-foreground">今日对话</div><div className="text-[16px] font-semibold mt-0.5">{(usageToday.byKey[ai.key] ?? 0).toLocaleString()}</div></div>
                <div><div className="text-muted-foreground">本月对话</div><div className="text-[16px] font-semibold mt-0.5">{(usageMonth.byKey[ai.key] ?? 0).toLocaleString()}</div></div>
              </div>
              {p && (
                <details className="px-5 py-3 text-[12px]">
                  <summary className="cursor-pointer font-medium inline-flex items-center gap-1.5 list-none">
                    <Pencil className="h-3 w-3" /> 编辑人设 prompt
                  </summary>
                  <textarea defaultValue={p.system.trim()} className="mt-3 w-full h-32 rounded-xl border border-border p-3 text-[11px] font-mono leading-5 outline-none focus:border-foreground/30" />
                </details>
              )}
              <div className="px-5 py-3 border-t border-border flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">模型：{model}</span>
                <button className="text-brand font-medium inline-flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> 试聊
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <SettingsCard title="全局策略" desc="影响所有 AI 员工的安全护栏与计费上限">
          <FormRow label="兜底拒答规则" hint="检测到违法/敏感关键词时返回的标准话术">
            <textarea defaultValue="您好，此问题超出 AI 员工服务范围；如有疑问请联系协会秘书处 0376-000-0000。" rows={3} className="w-full rounded-xl border border-border p-3 text-[13px] outline-none focus:border-foreground/30" />
          </FormRow>
          <FormRow label="单次会话最长" hint="超过自动新开会话">
            <select className="h-11 rounded-xl border border-border px-3 text-[14px]">
              <option>30 分钟</option><option>60 分钟</option><option>不限制</option>
            </select>
          </FormRow>
          <FormRow label="本月 Token 上限" hint="超过自动降级到演示模式">
            <input defaultValue="1000000" className="w-full h-11 rounded-xl border border-border px-4 text-[14px]" />
          </FormRow>
        </SettingsCard>
      </div>
    </AssociationShell>
  );
}
