import Link from "next/link";
import { Container } from "@/components/container";
import { ROLE_META, type Role } from "@/lib/auth";
import { Building2, UserRound, ArrowRight, ShieldCheck, CheckCircle2, HardHat, FileText, Upload, PenLine } from "lucide-react";
import { requiredAgreementsFor, type AgreementTarget } from "@/lib/data/agreements";
import { submitApplicationAction } from "./actions";

export const metadata = { title: "注册 · 信阳市建筑装饰装修协会" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string; agreed?: string; submitted?: string }> }) {
  const { role: r, agreed, submitted } = await searchParams;
  const role: Role =
    r === "enterprise" ? "enterprise" :
    r === "practitioner" ? "practitioner" :
    "customer";
  const meta = ROLE_META[role];

  const target: AgreementTarget = role as AgreementTarget;
  const requiredCount = requiredAgreementsFor(target).length;
  const hasAgreed = agreed === "1";
  // 入会语境：只在「企业会员 / 个人会员」之间选择；业主属于消费者门户，不出现在入会里
  const isMember = role === "enterprise" || role === "practitioner";

  if (submitted === "1") {
    return (
      <Container className="py-16 md:py-24 max-w-xl text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#e6f7f1] text-accent-tea inline-flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-[26px] md:text-[32px] font-semibold tracking-tight">
          {role === "customer" ? "注册已提交" : "入会申请已提交"}
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground leading-7">
          {role === "customer"
            ? "我们已收到你的注册信息。"
            : "协会秘书处将在 1-3 个工作日内完成审核，结果会通过手机通知你。"}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="h-11 px-6 rounded-full bg-foreground text-background text-[14px] font-medium inline-flex items-center justify-center">返回首页</Link>
          <Link href={`/login?role=${role}`} className="h-11 px-6 rounded-full border border-border text-[14px] font-medium inline-flex items-center justify-center">去登录</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12 md:py-20 max-w-3xl">
      {isMember ? (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href={`/register?role=enterprise`} className={`shrink-0 px-3.5 h-9 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${role === "enterprise" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}>
            <Building2 className="h-3.5 w-3.5" /> 企业会员
          </Link>
          <Link href={`/register?role=practitioner`} className={`shrink-0 px-3.5 h-9 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${role === "practitioner" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}>
            <HardHat className="h-3.5 w-3.5" /> 个人会员
          </Link>
          <span className="hidden md:inline-flex ml-auto items-center gap-1 text-[12px] text-muted-foreground shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 会员资格由秘书处审核开通
          </span>
        </div>
      ) : (
        <div className="mb-6 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <UserRound className="h-3.5 w-3.5" /> 业主账号注册（消费者）
        </div>
      )}

      {/* 3 步进度 */}
      <ol className="grid grid-cols-3 gap-2 mb-6">
        {[
          { n: 1, l: "填写资料", done: true },
          { n: 2, l: "签署协议", done: hasAgreed, active: !hasAgreed },
          { n: 3, l: "实名验证 / 提交", active: hasAgreed },
        ].map((s) => (
          <li key={s.n} className="text-center">
            <div className={`mx-auto h-8 w-8 rounded-full inline-flex items-center justify-center text-[12px] font-semibold ${
              s.done ? "bg-accent-tea text-white" :
              s.active ? "bg-foreground text-background ring-4 ring-foreground/10" :
              "bg-surface text-muted-foreground"
            }`}>
              {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </div>
            <div className={`mt-1.5 text-[11px] ${s.active || s.done ? "font-semibold" : "text-muted-foreground"}`}>{s.l}</div>
          </li>
        ))}
      </ol>

      <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-semibold tracking-tight leading-tight">
        {role === "customer" ? "注册业主账号" :
         role === "enterprise" ? "申请企业会员" :
         "申请个人会员"}
      </h1>
      <p className="mt-2 text-[13px] md:text-[14px] text-muted-foreground max-w-xl">
        {role === "practitioner"
          ? "面向独立设计师、项目经理、监理、独立工长等专业个人。提交实名与专业信息、上传资格证书，由协会秘书处审核。"
          : meta.desc}
      </p>

      {/* 协议签署 banner */}
      <Link
        href={`/register/agreements?role=${role}`}
        className={`mt-5 block rounded-2xl p-4 border-2 active:scale-[0.99] transition-transform ${
          hasAgreed
            ? "bg-[#e6f7f1] border-accent-tea/30"
            : "bg-cat-decor-soft border-cat-decor/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {hasAgreed ? (
            <CheckCircle2 className="h-6 w-6 text-accent-tea shrink-0" />
          ) : (
            <FileText className="h-6 w-6 text-cat-decor shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className={`text-[13px] font-semibold ${hasAgreed ? "text-accent-tea" : "text-cat-decor"}`}>
              {hasAgreed
                ? `已签 ${requiredCount} 份协议 · 可以提交`
                : `需先签署 ${requiredCount} 份必签协议（按法规要求）`}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {hasAgreed ? "存证号 ESB-2026-... 可在我的协议查看" : "入会协议 + 隐私政策 + 数据授权等 · 逐份阅读 + 单独勾选重点条款"}
            </div>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 h-9 px-3.5 rounded-full text-[12px] font-medium text-white ${hasAgreed ? "bg-accent-tea" : "bg-cat-decor"}`}>
            {hasAgreed ? "查看协议" : (<><PenLine className="h-3.5 w-3.5" /> 去逐份签署</>)}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>

      <form action={submitApplicationAction} className="mt-6 md:mt-8 space-y-5 rounded-3xl border border-border bg-background p-5 md:p-8">
        <input type="hidden" name="role" value={role} />
        {role === "enterprise" ? (
          <>
            <Row>
              <Field label="企业全称" required>
                <input name="entName" className="form-input" placeholder="如：信阳 xxx 装饰有限公司" />
              </Field>
              <Field label="统一社会信用代码" required>
                <input name="creditCode" className="form-input" placeholder="18 位" />
              </Field>
            </Row>
            <Row>
              <Field label="企业类型" required>
                <select name="entType" className="form-input">
                  <option>建筑施工</option>
                  <option>装饰装修</option>
                  <option>设计公司</option>
                </select>
              </Field>
              <Field label="期望子域名" required>
                <div className="flex items-center gap-2">
                  <input name="subdomain" className="form-input flex-1" placeholder="如 huatai" />
                  <span className="text-[13px] text-muted-foreground">.xyjzxh.com</span>
                </div>
              </Field>
            </Row>
            <Row>
              <Field label="联系人姓名" required><input name="contactName" className="form-input" /></Field>
              <Field label="联系人手机" required><input name="contactPhone" type="tel" className="form-input" placeholder="11 位手机号" /></Field>
            </Row>
            <Row>
              <Field label="短信验证码" required><input name="smsCode" className="form-input" placeholder="6 位" /></Field>
              <Field label="主营地区"><input name="region" className="form-input" placeholder="如 浉河区" /></Field>
            </Row>
            <Field label="资质材料上传" hint="提交后由协会秘书处人工审核，1-3 个工作日。支持 JPG/PNG/PDF。">
              <div className="space-y-2.5">
                {[
                  { name: "doc_license", label: "营业执照副本", required: true },
                  { name: "doc_idcard", label: "法人身份证（正反面）", required: true },
                  { name: "doc_qual", label: "建筑 / 装饰装修 / 设计 资质证书", required: true },
                  { name: "doc_perf", label: "近 2 年代表项目业绩（可选）" },
                ].map((d) => (
                  <label key={d.name} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-foreground/30 cursor-pointer transition-colors">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted-foreground shrink-0"><Upload className="h-4 w-4" /></span>
                    <span className="text-[13px] flex-1 min-w-0">{d.label}{d.required && <span className="text-cat-decor ml-0.5">*</span>}</span>
                    <input type="file" name={d.name} accept="image/*,.pdf" className="text-[11px] text-muted-foreground max-w-[150px] file:mr-2 file:rounded-full file:border-0 file:bg-foreground file:text-background file:px-3 file:py-1 file:text-[11px] file:cursor-pointer" />
                  </label>
                ))}
              </div>
            </Field>
          </>
        ) : role === "practitioner" ? (
          <>
            <Row>
              <Field label="真实姓名" required><input name="realName" className="form-input" placeholder="与身份证一致" /></Field>
              <Field label="专业 / 工种" required>
                <select name="profession" className="form-input">
                  <option>设计师</option>
                  <option>项目经理</option>
                  <option>监理</option>
                  <option>独立工长</option>
                  <option>造价 / 预算</option>
                  <option>软装设计师</option>
                  <option>其他专业个人</option>
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="手机号" required><input name="phone" type="tel" inputMode="numeric" className="form-input" placeholder="11 位手机号" /></Field>
              <Field label="短信验证码" required><input name="smsCode" className="form-input" inputMode="numeric" placeholder="6 位" /></Field>
            </Row>
            <Row>
              <Field label="身份证号" required><input name="idcard" className="form-input" placeholder="18 位"  /></Field>
              <Field label="工龄"><input name="years" type="number" inputMode="numeric" className="form-input" placeholder="例：8" /></Field>
            </Row>
            <Field label="资格证书上传" hint="设计师证 / 二建 / 监理 / 安全员等，支持多张。提交后协会审核认定。">
              <div className="space-y-2.5">
                {[
                  { name: "cert_main", label: "主项资格证书（如二建 / 设计师证）", required: true },
                  { name: "cert_idcard", label: "本人身份证（正反面）", required: true },
                  { name: "cert_works", label: "代表作品 / 项目证明（设计师建议）" },
                ].map((d) => (
                  <label key={d.name} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-foreground/30 cursor-pointer transition-colors">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-muted-foreground shrink-0"><Upload className="h-4 w-4" /></span>
                    <span className="text-[13px] flex-1 min-w-0">{d.label}{d.required && <span className="text-cat-decor ml-0.5">*</span>}</span>
                    <input type="file" name={d.name} accept="image/*,.pdf" className="text-[11px] text-muted-foreground max-w-[150px] file:mr-2 file:rounded-full file:border-0 file:bg-foreground file:text-background file:px-3 file:py-1 file:text-[11px] file:cursor-pointer" />
                  </label>
                ))}
              </div>
            </Field>
          </>
        ) : (
          <>
            <Row>
              <Field label="您的称呼" required><input name="nickname" className="form-input" placeholder="如 刘女士" /></Field>
              <Field label="所在城市"><input name="city" className="form-input" placeholder="如 信阳市浉河区" /></Field>
            </Row>
            <Row>
              <Field label="手机号" required><input name="phone" type="tel" inputMode="numeric" className="form-input" placeholder="11 位手机号" /></Field>
              <Field label="短信验证码" required><input name="smsCode" className="form-input" inputMode="numeric" placeholder="6 位" /></Field>
            </Row>
            <Field label="意向">
              <div className="flex flex-wrap gap-2">
                {["家装", "工装", "买保险", "找设计", "咨询调解"].map((t) => (
                  <label key={t} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-[13px] cursor-pointer">
                    <input type="checkbox" name="intents" value={t} className="accent-brand" /> {t}
                  </label>
                ))}
              </div>
            </Field>
          </>
        )}

        <button
          type="submit"
          disabled={!hasAgreed}
          className={`h-12 w-full rounded-full font-medium inline-flex items-center justify-center gap-2 transition-all ${
            hasAgreed
              ? "bg-foreground text-background hover:bg-brand active:scale-[0.99]"
              : "bg-muted/30 text-muted-foreground cursor-not-allowed"
          }`}
        >
          {hasAgreed
            ? (role === "customer" ? "完成注册" : "提交入会申请")
            : `请先签署 ${requiredCount} 份必签协议`}
          {hasAgreed && <ArrowRight className="h-4 w-4" />}
        </button>

        <div className="text-[12px] text-muted-foreground text-center">
          已有账号？<Link href={`/login?role=${role}`} className="text-brand">立即登录</Link>
        </div>
      </form>

      <style>{`
        .form-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--background);
          font-size: 14px;
        }
        .form-input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 4px rgba(20,86,240,0.1); }
      `}</style>
    </Container>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium">{label}{required && <span className="text-cat-decor ml-0.5">*</span>}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
