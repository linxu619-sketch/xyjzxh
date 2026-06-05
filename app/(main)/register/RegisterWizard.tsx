"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Loader2, ExternalLink,
} from "lucide-react";
import { SingleUpload, MultiUpload } from "./uploads";
import { submitApplicationAction } from "./actions";

type Tpl = { id: string; title: string; version: string };
type Role = "enterprise" | "practitioner" | "customer";

const INPUT = "w-full h-11 rounded-xl border border-border bg-background px-3.5 text-[14px] outline-none focus:border-foreground/30";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium">{label}{required && <span className="text-cat-decor ml-0.5">*</span>}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const STEPS = ["填写资料", "签署协议", "确认提交"];

export function RegisterWizard({ role, agreements }: { role: Role; agreements: Tpl[] }) {
  const isCustomer = role === "customer";
  const [step, setStep] = useState(1);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [f, setF] = useState<Record<string, string>>({ entType: "建筑施工", profession: "设计师" });
  const set = (k: string, v: string) => setF((d) => ({ ...d, [k]: v }));

  const [files, setFiles] = useState<Record<string, string[]>>({});
  const setFile = (k: string, names: string[]) => setFiles((d) => ({ ...d, [k]: names }));

  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const allAgreed = agreements.length === 0 || agreements.every((a) => agreed[a.id]);

  function step1Error(): string {
    if (role === "enterprise") {
      if (!f.entName?.trim()) return "请填写企业全称";
      if (!f.creditCode?.trim()) return "请填写统一社会信用代码";
      if (!f.legalName?.trim()) return "请填写法定代表人姓名";
      if (!f.legalIdcard?.trim()) return "请填写法人身份证号";
      if (!f.contactName?.trim()) return "请填写联系人姓名";
      if (!f.contactPhone?.trim()) return "请填写联系人手机";
      if (!f.password || f.password.length < 6) return "请设置登录密码（≥6 位）";
    } else if (role === "practitioner") {
      if (!f.realName?.trim()) return "请填写真实姓名";
      if (!f.phone?.trim()) return "请填写手机号";
      if (!f.idcard?.trim()) return "请填写身份证号";
    } else {
      if (!f.nickname?.trim()) return "请填写称呼";
      if (!f.phone?.trim()) return "请填写手机号";
    }
    return "";
  }

  function next() {
    if (step === 1) {
      const e = step1Error();
      if (e) { setErr(e); return; }
    }
    if (step === 2 && !allAgreed) { setErr(`请勾选全部 ${agreements.length} 份协议`); return; }
    setErr("");
    setStep((s) => Math.min(3, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prev() { setErr(""); setStep((s) => Math.max(1, s - 1)); }

  async function submit() {
    setErr(""); setSubmitting(true);
    const filePayload: Record<string, string> = {};
    for (const [k, v] of Object.entries(files)) if (v.length) filePayload[k] = v.join("; ");
    try {
      await submitApplicationAction({ role, payload: { ...f, ...filePayload } });
    } catch (e) {
      // redirect() 会抛 NEXT_REDIRECT，由框架处理；其它才是真错误
      if (e && typeof e === "object" && "digest" in e && String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
      setErr(`提交失败：${String(e)}`); setSubmitting(false);
    }
  }

  return (
    <div>
      {/* 步骤指示 */}
      <ol className="grid grid-cols-3 gap-2 mb-7">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step, active = n === step;
          return (
            <li key={label} className="text-center">
              <button
                type="button"
                onClick={() => n < step && setStep(n)}
                disabled={n >= step}
                className={`mx-auto h-8 w-8 rounded-full inline-flex items-center justify-center text-[12px] font-semibold ${
                  done ? "bg-accent-tea text-white" : active ? "bg-foreground text-background ring-4 ring-foreground/10" : "bg-surface text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : n}
              </button>
              <div className={`mt-1.5 text-[11px] ${active || done ? "font-semibold" : "text-muted-foreground"}`}>{label}</div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-3xl border border-border bg-background p-5 md:p-8">
        {/* 第 1 步 */}
        {step === 1 && (
          <div className="space-y-5">
            {role === "enterprise" && <EnterpriseFields f={f} set={set} setFile={setFile} />}
            {role === "practitioner" && <PractitionerFields f={f} set={set} setFile={setFile} />}
            {role === "customer" && <CustomerFields f={f} set={set} />}
          </div>
        )}

        {/* 第 2 步 */}
        {step === 2 && (
          <div>
            <h2 className="text-[18px] font-semibold mb-1">签署必签协议（{agreements.length} 份）</h2>
            <p className="text-[12px] text-muted-foreground mb-4">逐份勾选；点「查看全文」可在新窗口阅读。全部同意后进入下一步。</p>
            <ul className="space-y-2">
              {agreements.map((a) => (
                <li key={a.id} className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5">
                  <input id={`a-${a.id}`} type="checkbox" checked={!!agreed[a.id]} onChange={() => setAgreed((c) => ({ ...c, [a.id]: !c[a.id] }))} className="accent-cat-decor h-4 w-4 shrink-0" />
                  <label htmlFor={`a-${a.id}`} className="text-[13px] flex-1 min-w-0 cursor-pointer">{a.title}<span className="text-[11px] text-muted-foreground ml-1.5">v{a.version}</span></label>
                  <Link href={`/register/agreements?role=${role}`} target="_blank" className="shrink-0 text-[11px] text-brand inline-flex items-center gap-0.5 hover:underline">查看全文 <ExternalLink className="h-2.5 w-2.5" /></Link>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setAgreed(Object.fromEntries(agreements.map((a) => [a.id, true])))} className="mt-3 text-[12px] text-brand hover:underline">全部已读并同意</button>
          </div>
        )}

        {/* 第 3 步 */}
        {step === 3 && (
          <div>
            <h2 className="text-[18px] font-semibold mb-1">确认提交</h2>
            <p className="text-[12px] text-muted-foreground mb-4">请核对信息无误后提交，协会秘书处将在 1-3 个工作日内审核。</p>
            <div className="rounded-2xl bg-surface p-5 text-[13px] space-y-2">
              {summaryRows(role, f, files).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">{k}</span>
                  <span className="text-right break-all">{v || "—"}</span>
                </div>
              ))}
              <div className="flex justify-between gap-4 pt-1 border-t border-border">
                <span className="text-muted-foreground shrink-0">协议</span>
                <span className="text-right text-accent-tea inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />已签 {agreements.length} 份</span>
              </div>
            </div>
          </div>
        )}

        {err && <div className="mt-4 text-[12px] text-cat-decor">{err}</div>}

        {/* 导航 */}
        <div className="mt-6 flex items-center justify-between gap-2 pt-5 border-t border-border">
          <button type="button" onClick={prev} disabled={step === 1} className="h-11 px-4 rounded-full text-[13px] text-muted-foreground hover:text-foreground disabled:opacity-40 inline-flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 上一步</button>
          <span className="text-[11px] text-muted-foreground hidden md:block">第 {step} / 3 步</span>
          {step < 3 ? (
            <button type="button" onClick={next} className="h-11 px-6 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-brand active:scale-95 transition-transform">下一步 <ArrowRight className="h-3.5 w-3.5" /></button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="h-11 px-6 rounded-full bg-accent-tea text-white text-[13px] font-medium inline-flex items-center gap-1.5 disabled:opacity-60 active:scale-95 transition-transform">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {submitting ? "提交中…" : isCustomer ? "完成注册" : "提交入会申请"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 text-[12px] text-muted-foreground text-center">
        已有账号？<Link href={`/login?role=${role}`} className="text-brand">立即登录</Link>
      </div>
    </div>
  );
}

type FP = { f: Record<string, string>; set: (k: string, v: string) => void };
type FU = FP & { setFile: (k: string, names: string[]) => void };

function EnterpriseFields({ f, set, setFile }: FU) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="企业全称" required><input className={INPUT} placeholder="如：信阳 xxx 装饰有限公司" value={f.entName ?? ""} onChange={(e) => set("entName", e.target.value)} /></Field>
        <Field label="统一社会信用代码" required><input className={INPUT} placeholder="18 位" value={f.creditCode ?? ""} onChange={(e) => set("creditCode", e.target.value)} /></Field>
        <Field label="企业类型" required>
          <select className={INPUT} value={f.entType ?? "建筑施工"} onChange={(e) => set("entType", e.target.value)}><option>建筑施工</option><option>装饰装修</option><option>设计公司</option></select>
        </Field>
        <Field label="法定代表人姓名" required><input className={INPUT} placeholder="与营业执照一致" value={f.legalName ?? ""} onChange={(e) => set("legalName", e.target.value)} /></Field>
        <Field label="法人身份证号" required><input className={INPUT} placeholder="18 位，用于实名核验" value={f.legalIdcard ?? ""} onChange={(e) => set("legalIdcard", e.target.value)} /></Field>
        <Field label="期望子域名"><div className="flex items-center gap-2"><input className={`${INPUT} flex-1`} placeholder="如 huatai" value={f.subdomain ?? ""} onChange={(e) => set("subdomain", e.target.value)} /><span className="text-[13px] text-muted-foreground">.xyjzxh.com</span></div></Field>
        <Field label="联系人姓名" required><input className={INPUT} value={f.contactName ?? ""} onChange={(e) => set("contactName", e.target.value)} /></Field>
        <Field label="联系人手机" required><input type="tel" className={INPUT} placeholder="11 位手机号（即登录账号）" value={f.contactPhone ?? ""} onChange={(e) => set("contactPhone", e.target.value)} /></Field>
        <Field label="设置登录密码" required><input type="password" autoComplete="new-password" className={INPUT} placeholder="≥6 位，用于企业账号登录" value={f.password ?? ""} onChange={(e) => set("password", e.target.value)} /></Field>
        <Field label="主营地区"><input className={INPUT} placeholder="如 浉河区" value={f.region ?? ""} onChange={(e) => set("region", e.target.value)} /></Field>
      </div>

      <Field label="公司简介">
        <textarea rows={3} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] leading-6 outline-none focus:border-foreground/30" placeholder="如：深耕信阳家装 12 年，擅长现代极简整装，主材环保 E0、施工全程协会监管…" value={f.entIntro ?? ""} onChange={(e) => set("entIntro", e.target.value)} />
        <div className="mt-1.5 text-[11px] text-muted-foreground">一两句到一段，介绍主营业务、优势与代表项目 —— 通过后用于企业子站展示与协会认证页。</div>
      </Field>

      <div className="pt-2 space-y-4">
        <div className="text-[13px] font-semibold">资质材料</div>
        <div className="flex flex-wrap gap-4">
          <SingleUpload label="营业执照副本（横版）" required aspect="297 / 210" className="w-[70vw] max-w-[230px]" onChange={(n) => setFile("营业执照", n ? [n] : [])} />
          <SingleUpload label="法人身份证 · 人像面" required aspect="85.6 / 54" className="w-[44vw] max-w-[180px]" onChange={(n) => setFile("身份证人像面", n ? [n] : [])} />
          <SingleUpload label="法人身份证 · 国徽面" required aspect="85.6 / 54" className="w-[44vw] max-w-[180px]" onChange={(n) => setFile("身份证国徽面", n ? [n] : [])} />
        </div>
        <MultiUpload label="资质证书" hint="建筑业 / 装饰装修 / 设计等资质，可多张，最多 10 张" max={10} onChange={(ns) => setFile("资质证书", ns)} />
        <MultiUpload label="近 2 年代表项目业绩（可选）" hint="项目照片 / 合同 / 验收单等，可多张，最多 10 张" max={10} onChange={(ns) => setFile("项目业绩", ns)} />
      </div>
    </>
  );
}

function PractitionerFields({ f, set, setFile }: FU) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="真实姓名" required><input className={INPUT} placeholder="与身份证一致" value={f.realName ?? ""} onChange={(e) => set("realName", e.target.value)} /></Field>
        <Field label="专业 / 工种" required>
          <select className={INPUT} value={f.profession ?? "设计师"} onChange={(e) => set("profession", e.target.value)}><option>设计师</option><option>项目经理</option><option>监理</option><option>独立工长</option><option>造价 / 预算</option><option>软装设计师</option><option>其他专业个人</option></select>
        </Field>
        <Field label="手机号" required><input type="tel" className={INPUT} placeholder="11 位手机号" value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="身份证号" required><input className={INPUT} placeholder="18 位" value={f.idcard ?? ""} onChange={(e) => set("idcard", e.target.value)} /></Field>
        <Field label="从业年限"><input type="number" className={INPUT} placeholder="例：8" value={f.years ?? ""} onChange={(e) => set("years", e.target.value)} /></Field>
      </div>

      <Field label="个人简介">
        <textarea rows={3} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] leading-6 outline-none focus:border-foreground/30" placeholder="如：8 年室内设计经验，擅长现代极简与原木风，代表作品金茂悦府、御景湾别墅…" value={f.bio ?? ""} onChange={(e) => set("bio", e.target.value)} />
        <div className="mt-1.5 text-[11px] text-muted-foreground">介绍专业方向、年限与代表作品 / 项目 —— 通过后用于个人主页与电子名片。</div>
      </Field>

      <div className="pt-2 space-y-4">
        <div className="text-[13px] font-semibold">实名与资质材料</div>
        <div className="flex flex-wrap gap-4">
          <SingleUpload label="身份证 · 人像面" required aspect="85.6 / 54" className="w-[44vw] max-w-[180px]" onChange={(n) => setFile("身份证人像面", n ? [n] : [])} />
          <SingleUpload label="身份证 · 国徽面" required aspect="85.6 / 54" className="w-[44vw] max-w-[180px]" onChange={(n) => setFile("身份证国徽面", n ? [n] : [])} />
        </div>
        <MultiUpload label="资格证书" hint="二建 / 设计师证 / 监理 / 安全员等，可多张，最多 10 张" max={10} onChange={(ns) => setFile("资格证书", ns)} />
        <MultiUpload label="代表作品 / 项目证明（设计师建议）" hint="可多张，最多 10 张" max={10} onChange={(ns) => setFile("代表作品", ns)} />
      </div>
    </>
  );
}

function CustomerFields({ f, set }: FP) {
  const intents = (f.intents ?? "").split(",").filter(Boolean);
  function toggleIntent(t: string) {
    const has = intents.includes(t);
    const nx = has ? intents.filter((x) => x !== t) : [...intents, t];
    set("intents", nx.join(","));
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="您的称呼" required><input className={INPUT} placeholder="如 刘女士" value={f.nickname ?? ""} onChange={(e) => set("nickname", e.target.value)} /></Field>
        <Field label="所在城市"><input className={INPUT} placeholder="如 信阳市浉河区" value={f.city ?? ""} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="手机号" required><input type="tel" className={INPUT} placeholder="11 位手机号" value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
      </div>
      <Field label="意向">
        <div className="flex flex-wrap gap-2">
          {["家装", "工装", "买保险", "找设计", "咨询调解"].map((t) => (
            <button type="button" key={t} onClick={() => toggleIntent(t)} className={`rounded-full px-3.5 py-1.5 text-[13px] border ${intents.includes(t) ? "bg-foreground text-background border-foreground" : "bg-surface text-muted-foreground border-transparent"}`}>{t}</button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function summaryRows(role: Role, f: Record<string, string>, files: Record<string, string[]>): [string, string][] {
  const count = (k: string) => (files[k]?.length ? `${files[k].length} 张` : "未上传");
  if (role === "enterprise") {
    return [
      ["企业全称", f.entName], ["信用代码", f.creditCode], ["企业类型", f.entType],
      ["法定代表人", f.legalName], ["法人身份证号", f.legalIdcard], ["子域名", f.subdomain ? `${f.subdomain}.xyjzxh.com` : ""],
      ["联系人", `${f.contactName ?? ""} ${f.contactPhone ?? ""}`], ["主营地区", f.region],
      ["营业执照", count("营业执照")], ["法人身份证", `${files["身份证人像面"]?.length ? "人像面✓" : "人像面✗"} ${files["身份证国徽面"]?.length ? "国徽面✓" : "国徽面✗"}`],
      ["资质证书", count("资质证书")], ["项目业绩", count("项目业绩")],
    ];
  }
  if (role === "practitioner") {
    return [
      ["姓名", f.realName], ["专业 / 工种", f.profession], ["手机号", f.phone], ["身份证号", f.idcard], ["从业年限", f.years ? `${f.years} 年` : ""],
      ["身份证", `${files["身份证人像面"]?.length ? "人像面✓" : "人像面✗"} ${files["身份证国徽面"]?.length ? "国徽面✓" : "国徽面✗"}`],
      ["资格证书", count("资格证书")], ["代表作品", count("代表作品")],
    ];
  }
  return [["称呼", f.nickname], ["城市", f.city], ["手机号", f.phone], ["意向", f.intents]];
}
