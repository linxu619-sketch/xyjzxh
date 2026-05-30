import Link from "next/link";
import { Sparkles, MessageCircle, Globe2 } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { Toggle, SettingsCard, FormRow, Input, Textarea } from "@/components/dashboard/section";
import { AI_EMPLOYEES } from "@/lib/site";
import { cn } from "@/lib/cn";

export const metadata = { title: "AI 员工 · 企业工作台" };

const GRAD: Record<string, string> = {
  brand: "from-brand to-brand-600",
  build: "from-cat-build to-brand-600",
  decor: "from-cat-decor to-[#e6531f]",
  design: "from-cat-design to-[#6d3df0]",
  tea: "from-accent-tea to-[#008a63]",
  yellow: "from-[#ffd34d] to-[#ffae00]",
};

// 企业可启用的 4 位（剩余 6 位仅协会可用）
const ENABLED = new Set(["decor", "design", "biz", "ins"]);

export default function EnterpriseAi() {
  return (
    <EnterpriseShell
      title="AI 员工"
      subtitle="本企业可在子站嵌入 4 位 AI · 本月对话 1,320 次 · 转化贡献 18%"
      actions={
        <Link href="/ai" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5" /> 试聊
        </Link>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "本月对话", v: "1,320", c: "text-cat-design" },
          { l: "转化线索", v: 92, c: "text-cat-decor" },
          { l: "平均时长", v: "4.2 分钟", c: "text-cat-build" },
          { l: "满意度", v: "4.7", c: "text-accent-tea" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_EMPLOYEES.map((ai) => {
          const enabled = ENABLED.has(ai.key);
          return (
            <div key={ai.key} className={cn(
              "rounded-2xl border bg-background p-5 transition-opacity",
              enabled ? "border-border" : "border-dashed border-border opacity-50",
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl bg-gradient-to-br shadow",
                  GRAD[ai.color] ?? GRAD.brand,
                )}>
                  {ai.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-semibold">{ai.name} · {ai.role}</div>
                  <div className="text-[11px] text-muted-foreground">{ai.duty}</div>
                </div>
                {enabled ? (
                  <Toggle defaultChecked />
                ) : (
                  <span className="text-[11px] rounded-full bg-surface px-2.5 py-1 text-muted-foreground">协会专属</span>
                )}
              </div>
              {enabled && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div><div className="text-muted-foreground">本月</div><div className="text-[14px] font-semibold mt-0.5">{420 + ai.key.length * 40}</div></div>
                  <div><div className="text-muted-foreground">转化</div><div className="text-[14px] font-semibold text-cat-decor mt-0.5">{(ai.key.length * 4)}</div></div>
                  <div><div className="text-muted-foreground">满意度</div><div className="text-[14px] font-semibold text-accent-tea mt-0.5">4.{6 + ai.key.length % 4}</div></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <SettingsCard
          title="自定义品牌 AI"
          desc={<>基于「小装」克隆一位 <b className="text-foreground">名家小装</b>，使用企业品牌头像、话术与知识库，仅在 mingjia.xyzhxh.org 子站生效</>}
          action={
            <button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> 立即克隆
            </button>
          }
        >
          <FormRow label="名称"><Input defaultValue="名家小装" /></FormRow>
          <FormRow label="头像 / Emoji"><Input defaultValue="🛋" /></FormRow>
          <FormRow label="开场白"><Input defaultValue="您好，我是名家装饰的 AI 助手「名家小装」～" /></FormRow>
          <FormRow label="附加话术 / 禁忌">
            <Textarea
              rows={4}
              defaultValue={"- 提到价格时优先推荐 699 整装套餐\n- 不主动透露竞品名称\n- 处理工期争议时优先安抚情绪"}
            />
          </FormRow>
          <FormRow label="嵌入子站位置">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12px]"><input type="checkbox" defaultChecked className="accent-brand" /> 子站浮窗</label>
              <label className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12px]"><input type="checkbox" defaultChecked className="accent-brand" /> hero 区入口</label>
              <label className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12px]"><input type="checkbox" className="accent-brand" /> 下单页协助</label>
            </div>
          </FormRow>
        </SettingsCard>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-foreground text-background p-5 flex items-start gap-3">
        <Globe2 className="h-5 w-5 text-accent-yellow mt-0.5 shrink-0" />
        <div className="text-[12px] leading-5">
          <b>计费提醒：</b> 高级会员每月 1,000 次免费 AI 对话，超出按 0.1 元 / 次计费；克隆 AI 不额外收费。
        </div>
      </div>
    </EnterpriseShell>
  );
}
