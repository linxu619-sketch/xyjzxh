import Link from "next/link";
import { Container } from "@/components/container";
import { ROLE_META, type Role } from "@/lib/auth";
import { Building2, UserRound, ArrowRight, ShieldCheck, CheckCircle2, HardHat, FileText } from "lucide-react";
import { requiredAgreementsFor, type AgreementTarget } from "@/lib/data/agreements";

export const metadata = { title: "注册 · 信阳市建筑装修协会" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ role?: string; agreed?: string }> }) {
  const { role: r, agreed } = await searchParams;
  const role: Role =
    r === "enterprise" ? "enterprise" :
    r === "practitioner" ? "practitioner" :
    "customer";
  const meta = ROLE_META[role];

  const target: AgreementTarget = role as AgreementTarget;
  const requiredCount = requiredAgreementsFor(target).length;
  const hasAgreed = agreed === "1";

  return (
    <Container className="py-12 md:py-20 max-w-3xl">
      <div className="flex items-center gap-2 mb-6 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href={`/register?role=customer`} className={`shrink-0 px-3.5 h-9 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${role === "customer" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}>
          <UserRound className="h-3.5 w-3.5" /> 我是业主
        </Link>
        <Link href={`/register?role=enterprise`} className={`shrink-0 px-3.5 h-9 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${role === "enterprise" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}>
          <Building2 className="h-3.5 w-3.5" /> 我是企业
        </Link>
        <Link href={`/register?role=practitioner`} className={`shrink-0 px-3.5 h-9 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 ${role === "practitioner" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:bg-surface-2"}`}>
          <HardHat className="h-3.5 w-3.5" /> 我是从业者
        </Link>
        <span className="hidden md:inline-flex ml-auto items-center gap-1 text-[12px] text-muted-foreground shrink-0">
          <ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 协会账号由秘书处开通
        </span>
      </div>

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
         role === "enterprise" ? "申请企业账号" :
         "注册从业者账号"}
      </h1>
      <p className="mt-2 text-[13px] md:text-[14px] text-muted-foreground max-w-xl">{meta.desc}</p>

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
          {!hasAgreed && <ArrowRight className="h-4 w-4 text-cat-decor" />}
        </div>
      </Link>

      <form action="#" className="mt-6 md:mt-8 space-y-5 rounded-3xl border border-border bg-background p-5 md:p-8">
        {role === "enterprise" ? (
          <>
            <Row>
              <Field label="企业全称" required>
                <input className="form-input" placeholder="如：信阳 xxx 装饰有限公司" />
              </Field>
              <Field label="统一社会信用代码" required>
                <input className="form-input" placeholder="18 位" />
              </Field>
            </Row>
            <Row>
              <Field label="企业类型" required>
                <select className="form-input">
                  <option>建筑施工</option>
                  <option>装饰装修</option>
                  <option>设计公司</option>
                  <option>设计师个人</option>
                </select>
              </Field>
              <Field label="期望子域名" required>
                <div className="flex items-center gap-2">
                  <input className="form-input flex-1" placeholder="如 huatai" />
                  <span className="text-[13px] text-muted-foreground">.xyzhxh.org</span>
                </div>
              </Field>
            </Row>
            <Row>
              <Field label="联系人姓名" required><input className="form-input" /></Field>
              <Field label="联系人手机" required><input type="tel" className="form-input" placeholder="11 位手机号" /></Field>
            </Row>
            <Row>
              <Field label="短信验证码" required><input className="form-input" placeholder="6 位" /></Field>
              <Field label="主营地区"><input className="form-input" placeholder="如 浉河区" /></Field>
            </Row>
            <Field label="资质上传">
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center text-[12px] text-muted-foreground">
                拖拽 / 点击上传营业执照、资质证书等附件（提交后由协会秘书处人工审核，1-3 个工作日）
              </div>
            </Field>
          </>
        ) : role === "practitioner" ? (
          <>
            <Row>
              <Field label="真实姓名" required><input className="form-input" placeholder="与身份证一致" /></Field>
              <Field label="工种" required>
                <select className="form-input">
                  <option>工长</option>
                  <option>项目经理</option>
                  <option>设计师</option>
                  <option>监理</option>
                  <option>木工</option>
                  <option>瓦工</option>
                  <option>水电工</option>
                  <option>油漆工</option>
                  <option>安装工</option>
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="手机号" required><input type="tel" inputMode="numeric" className="form-input" placeholder="11 位手机号" /></Field>
              <Field label="短信验证码" required><input className="form-input" inputMode="numeric" placeholder="6 位" /></Field>
            </Row>
            <Row>
              <Field label="身份证号" required><input className="form-input" placeholder="18 位"  /></Field>
              <Field label="工龄"><input type="number" inputMode="numeric" className="form-input" placeholder="例：8" /></Field>
            </Row>
            <Field label="持有证书（可选）">
              <div className="border-2 border-dashed border-border rounded-2xl p-6 text-center text-[12px] text-muted-foreground">
                上传二建 / 安全员 / 木工等证书照片
              </div>
            </Field>
          </>
        ) : (
          <>
            <Row>
              <Field label="您的称呼" required><input className="form-input" placeholder="如 刘女士" /></Field>
              <Field label="所在城市"><input className="form-input" placeholder="如 信阳市浉河区" /></Field>
            </Row>
            <Row>
              <Field label="手机号" required><input type="tel" inputMode="numeric" className="form-input" placeholder="11 位手机号" /></Field>
              <Field label="短信验证码" required><input className="form-input" inputMode="numeric" placeholder="6 位" /></Field>
            </Row>
            <Field label="意向">
              <div className="flex flex-wrap gap-2">
                {["家装", "工装", "买保险", "找设计", "咨询调解"].map((t) => (
                  <label key={t} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-[13px] cursor-pointer">
                    <input type="checkbox" className="accent-brand" /> {t}
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
            ? (role === "enterprise" ? "提交申请" : role === "practitioner" ? "提交注册" : "完成注册")
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
