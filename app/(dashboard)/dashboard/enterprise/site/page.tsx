import Link from "next/link";
import { ExternalLink, Globe2, Save, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { SettingsCard, FormRow, Input, Textarea } from "@/components/dashboard/section";
import { getSession } from "@/lib/auth/session";
import { getEnterpriseBySlugOrId } from "@/lib/data/enterprises-source";
import { listLeadsByEnterprise } from "@/lib/data/leads";
import { listCasesByEnterprise } from "@/lib/data/cases";
import { listTeamByEnterprise } from "@/lib/data/team";
import { saveSiteAction } from "./actions";
import { CasesManager } from "./CasesManager";
import { TeamManager } from "./TeamManager";

export const metadata = { title: "我的子站 · 企业工作台" };

export default async function SitePage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; cok?: string; cerr?: string; tok?: string; terr?: string }> }) {
  const { ok, err, cok, cerr, tok, terr } = await searchParams;
  const session = await getSession();
  const ent = session?.enterpriseId ? await getEnterpriseBySlugOrId(session.enterpriseId) : undefined;
  const leads = session?.enterpriseId ? listLeadsByEnterprise(session.enterpriseId) : [];
  const cases = session?.enterpriseId ? listCasesByEnterprise(session.enterpriseId) : [];
  const team = session?.enterpriseId ? listTeamByEnterprise(session.enterpriseId) : [];

  const slug = ent?.slug ?? "";
  const signed = leads.filter((l) => l.status === "signed").length;

  return (
    <EnterpriseShell
      title="我的子站"
      subtitle={ent ? `${slug}.xyjzxh.com · 协会认证企业子站` : "未绑定企业"}
      actions={
        slug ? (
          <Link href={`/biz/${slug}`} target="_blank" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" /> 打开预览
          </Link>
        ) : null
      }
    >
      {ok && (
        <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-[13px]"><b>已保存！</b>子站资料已更新，<Link href={`/biz/${slug}`} target="_blank" className="underline">打开子站</Link> 即可看到最新内容。</div>
        </div>
      )}
      {err && (
        <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" /><div className="text-[13px]">保存失败：未找到绑定企业。</div>
        </div>
      )}
      {cok && (
        <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>案例已添加！</b>已展示在您的子站案例区。</div>
        </div>
      )}
      {cerr && (
        <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" /><div className="text-[13px]">案例添加失败：请填写标题并上传封面图。</div>
        </div>
      )}
      {tok && (
        <div className="mb-5 rounded-2xl border border-accent-tea/30 bg-[#e6f7f1] text-accent-tea p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0" /><div className="text-[13px]"><b>成员已添加！</b>已展示在您的子站团队区。</div>
        </div>
      )}
      {terr && (
        <div className="mb-5 rounded-2xl border border-cat-decor/30 bg-cat-decor-soft text-cat-decor p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" /><div className="text-[13px]">成员添加失败：请填写姓名与职务。</div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { l: "累计线索", v: leads.length, c: "text-cat-decor" },
          { l: "已签单", v: signed, c: "text-accent-tea" },
          { l: "口碑评价", v: ent?.reviews ?? 0, c: "text-cat-build" },
          { l: "评分", v: (ent?.rating ?? 0).toFixed(1), c: "text-cat-design" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-background p-5">
            <div className="text-[11px] text-muted-foreground tracking-wider uppercase">{s.l}</div>
            <div className={`mt-1 text-[28px] font-semibold tracking-tight ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {!ent ? (
        <div className="rounded-2xl border border-border bg-background p-10 text-center text-[14px] text-muted-foreground">当前账号未绑定企业，无法编辑子站。</div>
      ) : (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <form action={saveSiteAction} className="lg:col-span-2 space-y-4">
            <SettingsCard
              title="子站资料"
              desc="以下内容即时同步到您的协会认证子站（hero 标语、简介、联系方式、业务标签）"
              action={
                <button type="submit" className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 active:scale-95 transition-transform">
                  <Save className="h-3.5 w-3.5" /> 保存
                </button>
              }
            >
              <FormRow label="子域名" hint="如需变更子域名请联系协会，避免已有链接失效">
                <div className="flex items-center gap-2">
                  <Input defaultValue={slug} name="__slug_readonly" />
                  <span className="text-[13px] text-muted-foreground shrink-0">.xyjzxh.com</span>
                </div>
              </FormRow>
              <FormRow label="品牌全称" required><Input name="name" defaultValue={ent.name} /></FormRow>
              <FormRow label="品牌简称" hint="子站 logo 与导航显示"><Input name="brand" defaultValue={ent.hero.brand} /></FormRow>
              <FormRow label="主标语" hint="出现在子站首页 hero 大标题"><Input name="tagline" defaultValue={ent.hero.tagline} /></FormRow>
              <FormRow label="一句话简介"><Textarea name="short" defaultValue={ent.short} /></FormRow>
              <FormRow label="联系电话"><Input name="tel" defaultValue={ent.contact.tel} /></FormRow>
              <FormRow label="联系地址"><Input name="addr" defaultValue={ent.contact.addr} /></FormRow>
              <FormRow label="业务标签" hint="逗号分隔，最多 8 个，如：家装,整装,全包">
                <Input name="tags" defaultValue={ent.tags.join("，")} />
              </FormRow>
            </SettingsCard>
          </form>

          <div className="space-y-4">
            <div className="rounded-2xl bg-foreground text-background p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cat-build/30 blur-2xl" />
              <Globe2 className="relative h-7 w-7 text-accent-yellow" />
              <div className="relative mt-3 text-[16px] font-semibold">子站地址</div>
              <div className="relative mt-2 text-[13px] text-background/80 break-all">{slug}.xyjzxh.com</div>
              <Link href={`/biz/${slug}`} target="_blank" className="relative mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-accent-yellow text-foreground text-[12px] font-medium">
                打开子站 <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <Sparkles className="h-6 w-6 text-cat-decor" />
              <div className="mt-3 text-[15px] font-semibold">让子站更丰满</div>
              <ul className="mt-3 space-y-2 text-[12px] text-muted-foreground leading-5">
                <li>· 完善主标语与简介，提升首屏说服力</li>
                <li>· 业务标签影响子站展示与 AI 估价匹配</li>
                <li>· 案例与团队展示随交付项目与评价积累逐步开放</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <CasesManager cases={cases.map((c) => ({ id: c.id, title: c.title, cover: c.cover, area: c.area, tag: c.tag }))} />
        </div>

        <div className="mt-4">
          <TeamManager team={team.map((m) => ({ id: m.id, name: m.name, role: m.role, exp: m.exp, photo: m.photo }))} />
        </div>
        </>
      )}
    </EnterpriseShell>
  );
}
