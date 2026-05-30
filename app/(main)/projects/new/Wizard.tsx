"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, FileCheck2, Sparkles, Upload, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

const STEPS = [
  { key: 1, title: "项目基本信息", desc: "名称、类型、地址" },
  { key: 2, title: "施工单位", desc: "企业资质、负责人" },
  { key: 3, title: "图纸与方案", desc: "上传 dwg / pdf" },
  { key: 4, title: "保险与安全", desc: "履约 / 意外险" },
  { key: 5, title: "确认提交", desc: "签字提交省厅" },
];

export function NewProjectWizard() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  if (done) return <Done />;

  return (
    <>
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground mb-4 md:mb-5">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回报备列表
      </Link>

      <div className="flex items-center justify-between gap-3 flex-col md:flex-row md:items-end mb-5 md:mb-8">
        <div>
          <h1 className="text-[24px] md:text-[40px] font-semibold tracking-tight leading-tight">新建工装报备</h1>
          <p className="mt-1.5 md:mt-2 text-[12px] md:text-[14px] text-muted-foreground max-w-xl leading-5 md:leading-6">
            一次填报 · 同步省厅 · 自动归档协会平台 · 平均 24 小时内反馈
          </p>
        </div>
        <Link href="/ai/report" className="inline-flex items-center gap-1.5 h-9 px-3.5 md:px-4 rounded-full bg-foreground text-background text-[11px] md:text-[12px] font-medium active:scale-95 transition-transform">
          <Sparkles className="h-3.5 w-3.5 text-accent-yellow" /> AI 帮我填
        </Link>
      </div>

      {/* Steps · sticky 顶部 on mobile */}
      <div className="sticky top-16 z-30 -mx-5 sm:-mx-8 lg:-mx-12 px-5 sm:px-8 lg:px-12 py-3 bg-background/85 backdrop-blur-xl border-b border-border md:relative md:top-0 md:p-0 md:bg-transparent md:backdrop-blur-none md:border-0 mb-5 md:mb-8">
        <ol className="grid grid-cols-5 gap-2">
          {STEPS.map((s) => {
            const active = s.key === step;
            const passed = s.key < step;
            return (
              <li key={s.key} className="text-center">
                <div className={cn(
                  "mx-auto h-8 md:h-9 w-8 md:w-9 rounded-full flex items-center justify-center text-[12px] md:text-[13px] font-semibold transition-all",
                  passed && "bg-accent-tea text-white",
                  active && "bg-foreground text-background ring-4 ring-foreground/10",
                  !passed && !active && "bg-surface text-muted-foreground",
                )}>
                  {passed ? <CheckCircle2 className="h-3.5 md:h-4 w-3.5 md:w-4" /> : s.key}
                </div>
                <div className={cn("mt-1 md:mt-2 text-[10px] md:text-[12px] font-medium truncate", active ? "text-foreground" : "text-muted-foreground")}>
                  {s.title}
                </div>
                <div className="hidden md:block text-[10px] text-muted-foreground">{s.desc}</div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-3xl border border-border bg-background p-5 md:p-8">
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
        {step === 5 && <Step5 />}

        <div className="mt-6 md:mt-8 flex items-center justify-between pt-5 md:pt-6 border-t border-border gap-2">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="h-11 px-4 md:px-5 rounded-full text-[12px] md:text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-40 active:bg-surface transition-colors"
          >
            上一步
          </button>
          <div className="text-[11px] text-muted-foreground hidden md:block">
            第 {step} / {STEPS.length} 步 · 自动保存
          </div>
          {step < 5 ? (
            <button
              onClick={() => setStep((s) => Math.min(5, s + 1))}
              className="h-11 px-5 md:px-6 rounded-full bg-foreground text-background text-[12px] md:text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-brand active:scale-95 transition-transform"
            >
              下一步 <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setDone(true)}
              className="h-11 px-5 md:px-6 rounded-full bg-accent-tea text-white text-[12px] md:text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              确认提交 <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%; height: 44px; padding: 0 14px;
          border-radius: 12px; border: 1px solid var(--border);
          background: var(--background); font-size: 14px;
        }
        textarea.form-input { height: auto; padding: 12px 14px; line-height: 22px; }
        .form-input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 4px rgba(20,86,240,0.1); }
      `}</style>
    </>
  );
}

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium">{label}{required && <span className="text-cat-decor ml-0.5">*</span>}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
    </label>
  );
}

function Step1() {
  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-semibold">1 / 5 · 项目基本信息</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="项目名称" required>
          <input className="form-input" placeholder="例：金茂悦府 12 栋 1602 户型整装" />
        </Field>
        <Field label="项目类型" required>
          <select className="form-input">
            <option>家装</option>
            <option>工装</option>
            <option>公装</option>
            <option>市政</option>
          </select>
        </Field>
        <Field label="施工面积 (㎡)" required><input type="number" className="form-input" /></Field>
        <Field label="合同价款 (万元)" required><input type="number" className="form-input" /></Field>
        <Field label="计划开工" required><input type="date" className="form-input" /></Field>
        <Field label="计划竣工" required><input type="date" className="form-input" /></Field>
      </div>
      <Field label="项目地址" required>
        <input className="form-input" placeholder="信阳市浉河区 xx 路 xx 号" />
      </Field>
      <Field label="项目摘要" hint="供协会档案与省厅匹配，建议 200 字以内">
        <textarea rows={3} className="form-input" placeholder="主要施工内容、特殊工艺、安全注意事项…" />
      </Field>
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-semibold">2 / 5 · 施工单位</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="施工企业" required>
          <input className="form-input" defaultValue="名家装饰" />
        </Field>
        <Field label="统一社会信用代码"><input className="form-input" placeholder="自动从协会档案带入" /></Field>
        <Field label="项目负责人" required><input className="form-input" placeholder="姓名" /></Field>
        <Field label="负责人联系电话" required><input type="tel" className="form-input" placeholder="11 位手机号" /></Field>
        <Field label="安全员"><input className="form-input" /></Field>
        <Field label="安全员证号"><input className="form-input" placeholder="如 C 证 / B 证" /></Field>
      </div>
      <div className="rounded-xl bg-surface p-4 flex items-start gap-2.5 text-[12px] text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-accent-tea mt-0.5" />
        企业资质自动从协会档案带入；如资质即将到期，请先到 /dashboard/enterprise/settings 续期。
      </div>
    </div>
  );
}

function Step3() {
  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-semibold">3 / 5 · 图纸与方案</h2>
      <Field label="平面布置图 (dwg / pdf)" required>
        <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center text-[13px] text-muted-foreground hover:border-foreground/30">
          <Upload className="h-6 w-6 mx-auto mb-2" />
          拖拽或点击上传，支持多文件，单个文件 ≤ 50MB
        </div>
      </Field>
      <Field label="水电点位图"><div className="border-2 border-dashed border-border rounded-2xl p-6 text-center text-[12px] text-muted-foreground">可选</div></Field>
      <Field label="施工组织方案" required><textarea rows={4} className="form-input" placeholder="工序、材料、用工组织等" /></Field>
      <div className="rounded-xl bg-brand-50 text-brand p-4 text-[12px] flex items-start gap-2">
        <Sparkles className="h-4 w-4 mt-0.5" />
        AI 小报已识别到您上传的方案缺少 "防水验收节点"，是否一键补全？
        <button className="ml-auto rounded-full bg-brand text-white px-3 h-7 text-[11px] font-medium">补全</button>
      </div>
    </div>
  );
}

function Step4() {
  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-semibold">4 / 5 · 保险与安全</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="rounded-2xl border border-border p-4 cursor-pointer hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold">工程履约保证保险</span>
            <input type="checkbox" defaultChecked className="accent-brand" />
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">替代保证金 · 平安产险 · 费率 0.7%</div>
          <div className="mt-2 text-[12px] font-medium">约 ¥2,240</div>
        </label>
        <label className="rounded-2xl border border-border p-4 cursor-pointer hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold">建筑工人团意险</span>
            <input type="checkbox" defaultChecked className="accent-brand" />
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">120 元/人/年 · 国寿财险</div>
          <div className="mt-2 text-[12px] font-medium">人数：<input type="number" defaultValue={12} className="w-20 ml-1 px-2 py-0.5 border border-border rounded-md text-[12px]" /></div>
        </label>
        <label className="rounded-2xl border border-border p-4 cursor-pointer hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold">施工现场公众责任险</span>
            <input type="checkbox" className="accent-brand" />
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">0.4‰ 起 · 太平洋产险</div>
        </label>
        <label className="rounded-2xl border border-border p-4 cursor-pointer hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold">材料运输一切险</span>
            <input type="checkbox" className="accent-brand" />
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">0.6‰ 起 · 中华联合</div>
        </label>
      </div>
      <Field label="风险预案附件"><div className="border-2 border-dashed border-border rounded-2xl p-6 text-center text-[12px] text-muted-foreground">可选 · PDF / DOC</div></Field>
    </div>
  );
}

function Step5() {
  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-semibold">5 / 5 · 确认提交</h2>
      <div className="rounded-2xl bg-surface p-6 text-[13px] space-y-2">
        <Row k="项目名称" v="金茂悦府 12 栋 1602 户型整装" />
        <Row k="类型" v="家装 · 168㎡ · 32 万" />
        <Row k="施工企业" v="名家装饰（E002 · 协会认证）" />
        <Row k="工期" v="2026-05-20 → 2026-08-15（87 天）" />
        <Row k="附件" v="平面图 1 · 方案 1（AI 已预审）" />
        <Row k="保险" v="履约险 + 工人意外险（12 人）" />
      </div>
      <label className="flex items-start gap-2.5 text-[12px] text-muted-foreground">
        <input type="checkbox" defaultChecked className="mt-0.5 accent-brand" />
        <span>我承诺所填信息真实、附件合规，同意将信息同步至河南省建设行业监管平台，并由信阳市建筑装饰装修协会归档。</span>
      </label>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground shrink-0">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function Done() {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-accent-tea text-white flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-[32px] font-semibold tracking-tight">提交成功</h1>
      <p className="mt-3 text-[14px] text-muted-foreground max-w-md mx-auto">
        报备号 <b className="text-foreground">P-2026-0598</b>，预计 24 小时内反馈。可在「我的报备」中追踪进度。
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <Link href="/projects" className="h-11 px-6 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center">返回列表</Link>
        <Link href="/projects/P-2026-0501" className="h-11 px-6 rounded-full border border-border text-[13px] inline-flex items-center"><FileCheck2 className="h-3.5 w-3.5 mr-1.5" />查看示例</Link>
      </div>
    </div>
  );
}
