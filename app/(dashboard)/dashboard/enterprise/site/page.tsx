import Link from "next/link";
import { ExternalLink, Eye, Palette, Globe2, Upload, Sparkles } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { SettingsCard, FormRow, Input, Textarea, Toggle } from "@/components/dashboard/section";

export const metadata = { title: "我的子站 · 企业工作台" };

export default function SitePage() {
  return (
    <EnterpriseShell
      title="我的子站"
      subtitle="mingjia.xyjzxh.com · 上次更新 5 分钟前 · 本月访客 9,284"
      actions={
        <Link href="/biz/mingjia" target="_blank" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
          <ExternalLink className="h-3.5 w-3.5" /> 打开预览
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { l: "本月访客", v: "9,284", c: "text-cat-build" },
          { l: "表单提交", v: 184, c: "text-cat-decor" },
          { l: "转化率", v: "1.98%", c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SettingsCard title="子域名 · 品牌" desc="子站访问地址、品牌色与文案配置">
            <FormRow label="子域名" required hint="A-Z 0-9 - 限制，启用后需 24h 生效">
              <div className="flex items-center gap-2">
                <Input defaultValue="mingjia" />
                <span className="text-[13px] text-muted-foreground shrink-0">.xyjzxh.com</span>
              </div>
            </FormRow>
            <FormRow label="品牌全称" required><Input defaultValue="信阳名家装饰工程有限公司" /></FormRow>
            <FormRow label="品牌简称"><Input defaultValue="名家装饰" /></FormRow>
            <FormRow label="主标语" hint="出现在子站 hero"><Input defaultValue="为家而设计 · 699 元/㎡ 整装" /></FormRow>
            <FormRow label="一句话简介"><Textarea defaultValue="本地 TOP3 整装品牌，699 套餐覆盖 200+ 楼盘。" /></FormRow>
            <FormRow label="主品牌色" hint="影响子站 hero 与按钮">
              <div className="flex items-center gap-2 flex-wrap">
                {["#1456F0","#FF6B35","#8B5CF6","#00A878","#0F172A"].map((c, i) => (
                  <button key={c} className={`h-10 w-10 rounded-xl border-2 ${i === 1 ? "border-foreground" : "border-transparent"}`} style={{ background: c }} />
                ))}
                <Input defaultValue="#FF6B35" />
              </div>
            </FormRow>
          </SettingsCard>

          <SettingsCard title="子站板块开关" desc="只显示企业愿意展示的板块">
            <FormRow label="服务介绍"><Toggle defaultChecked label="显示" /></FormRow>
            <FormRow label="案例展示"><Toggle defaultChecked label="显示" /></FormRow>
            <FormRow label="团队介绍"><Toggle defaultChecked label="显示" /></FormRow>
            <FormRow label="评价摘要"><Toggle defaultChecked label="显示" /></FormRow>
            <FormRow label="AI 估价入口"><Toggle defaultChecked label="嵌入小装" /></FormRow>
            <FormRow label="在线下单"><Toggle defaultChecked label="开放" /></FormRow>
          </SettingsCard>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-foreground text-background p-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-build/30 blur-2xl" />
            <Globe2 className="relative h-7 w-7 text-accent-yellow" />
            <div className="relative mt-3 text-[18px] font-semibold">子站健康度</div>
            <ul className="relative mt-4 space-y-2 text-[12px]">
              <li className="flex justify-between"><span>访客 → 表单</span><span className="text-accent-yellow font-semibold">6.8%</span></li>
              <li className="flex justify-between"><span>表单 → 量房</span><span className="text-accent-yellow font-semibold">42%</span></li>
              <li className="flex justify-between"><span>量房 → 签单</span><span className="text-accent-yellow font-semibold">38%</span></li>
              <li className="flex justify-between"><span>口碑评分</span><span className="text-accent-yellow font-semibold">4.8</span></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <Sparkles className="h-6 w-6 text-cat-decor" />
            <div className="mt-3 text-[15px] font-semibold">AI 小经 · 子站优化建议</div>
            <ul className="mt-3 space-y-2 text-[12px] text-muted-foreground leading-5">
              <li>· 上周末更新 3 套新案例可提升 ~12% 停留时间</li>
              <li>· 服务介绍区可补充「699 套餐含哪些」清单</li>
              <li>· hero 背景图建议替换为本月已交付的茶都商务</li>
            </ul>
            <button className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-foreground text-background text-[12px]">
              <Palette className="h-3 w-3" /> 一键应用
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="text-[12px] tracking-wider uppercase text-muted-foreground">Hero 背景图</div>
            <div className="mt-3 aspect-video rounded-xl bg-cat-decor relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-foreground/30" />
              <div className="absolute bottom-2 left-3 text-white text-[11px]">当前生效</div>
            </div>
            <button className="mt-3 inline-flex w-full justify-center items-center gap-1.5 h-9 rounded-full border border-dashed border-border text-[12px] text-muted-foreground">
              <Upload className="h-3 w-3" /> 替换图片
            </button>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}
