import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Power, ShieldCheck, Building2, UserRound, Users2, Crown, Check, KeyRound, Trash2, Save } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getAccountByPhone, type AccountStatus } from "@/lib/data/accounts";
import { getApplicationByAppId, type IdVerifyStatus } from "@/lib/data/applications";
import { tierLadder, normalizeTier, quotaOf, type TierTrack } from "@/lib/data/member-tier";
import { capsOfAccount } from "@/lib/data/member-caps";
import { setAccountStatusAction, setMemberTierAction, updateAccountProfileAction, setAccountPasswordAction, deleteAccountAction, setMemberCapsAction } from "../actions";
import { Store } from "lucide-react";
import { GuardedActionModal } from "@/components/dashboard/guarded-action-modal";

const VERIFY_LABEL: Record<IdVerifyStatus, string> = { verified: "已实名核验", failed: "核验未通过", unverified: "待实名核验" };
const VERIFY_TONE: Record<IdVerifyStatus, "tea" | "decor" | "yellow"> = { verified: "tea", failed: "decor", unverified: "yellow" };

const ST_LABEL: Record<AccountStatus, string> = { active: "正常", pending: "审核中", rejected: "已停用" };
const ST_TONE: Record<AccountStatus, "tea" | "yellow" | "decor"> = { active: "tea", pending: "yellow", rejected: "decor" };
const ROLE_LABEL: Record<string, string> = { enterprise: "企业会员", individual: "个人会员", customer: "业主" };
const ROLE_ICON: Record<string, React.ComponentType<{ className?: string }>> = { enterprise: Building2, individual: UserRound, customer: Users2 };
function mask(p: string) { return p; }  // 用户管理显示完整手机号
function fmt(ms: number) { if (!ms) return "—"; const d = new Date(ms); const p = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; }

export const metadata = { title: "用户详情 · 协会工作台" };

export default async function UserDetail({ params, searchParams }: { params: Promise<{ phone: string }>; searchParams: Promise<{ err?: string; t?: string }> }) {
  const { phone } = await params;
  const { err, t } = await searchParams;
  const a = getAccountByPhone(decodeURIComponent(phone));
  if (!a) notFound();
  const Icon = ROLE_ICON[a.role] ?? UserRound;
  // 两套互不相干的等级梯队：企业=治理梯队 / 个人=专业梯队；业主无等级
  const track: TierTrack | null = a.role === "enterprise" ? "enterprise" : a.role === "individual" ? "practitioner" : null;
  const ladder = track ? tierLadder(track) : [];
  const tier = track ? normalizeTier(track, a.tier) : null;
  const trackLabel = track === "enterprise" ? "治理梯队" : track === "practitioner" ? "专业梯队" : "";
  // 会员能力（等级默认 + 单会员覆盖）：开店开关 + 店铺额度
  const caps = track ? capsOfAccount(a) : null;
  const tierQuota = tier ? quotaOf(tier) : 0;
  // 回链入会申请：展示实名信息摘要 + 跳完整申请与证照
  const appRec = a.appId ? getApplicationByAppId(a.appId) : undefined;
  const pl = (appRec?.payload ?? {}) as Record<string, unknown>;
  const pv = (k: string) => String(pl[k] ?? "").trim();
  const idName = pv("legalName") || pv("realName");
  const idNo = pv("legalIdcard") || pv("idcard");
  const idCredit = pv("creditCode");

  return (
    <AssociationShell title="用户详情" subtitle={`${ROLE_LABEL[a.role] ?? a.role} · ${a.name || "(未填名称)"}`}>
      <Link href={`/dashboard/association/users?tab=${a.role}`} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回用户列表
      </Link>

      <div className="rounded-2xl border border-border bg-background p-5 md:p-6 max-w-2xl">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <span className="h-14 w-14 rounded-2xl bg-surface inline-flex items-center justify-center"><Icon className="h-6 w-6 text-muted-foreground" /></span>
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-semibold">{a.name || "(未填名称)"}</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">{ROLE_LABEL[a.role] ?? a.role} · {mask(a.phone)}</div>
          </div>
          <Badge tone={ST_TONE[a.status]}>{ST_LABEL[a.status]}</Badge>
        </div>

        <dl className="mt-5 space-y-3 text-[13px]">
          <Row k="账号手机号" v={mask(a.phone)} />
          <Row k="用户类型" v={ROLE_LABEL[a.role] ?? a.role} />
          <Row k="账号状态" v={ST_LABEL[a.status]} />
          {a.memberRef && <Row k="会员档案" v={a.memberRef} />}
          {tier && <Row k="会员等级" v={<span className="inline-flex items-center gap-1.5"><Crown className="h-3.5 w-3.5 text-accent-yellow" />{tier}<span className="text-[11px] text-muted-foreground">· {trackLabel} · 商城上架 {quotaOf(tier) === Infinity ? "不限" : quotaOf(tier)} 款</span></span>} />}
          <Row k="注册时间" v={fmt(a.createdAt)} />
        </dl>

        {appRec && a.role !== "customer" && (
          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" /> 实名信息
              <Badge tone={VERIFY_TONE[appRec.idVerifyStatus]} className="ml-1">{VERIFY_LABEL[appRec.idVerifyStatus]}</Badge>
            </div>
            <dl className="space-y-2.5 text-[13px]">
              {idName && <Row k={a.role === "enterprise" ? "法定代表人" : "真实姓名"} v={idName} />}
              {idNo && <Row k={a.role === "enterprise" ? "法人身份证号" : "身份证号"} v={idNo} />}
              {idCredit && <Row k="统一社会信用代码" v={idCredit} />}
            </dl>
            <Link href={`/dashboard/association/members/${appRec.id}`} className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-brand font-medium hover:underline">
              查看完整入会申请与证照 / 实名核验 →
            </Link>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> 账号操作</div>
          <div className="flex flex-wrap gap-2">
            {a.status === "active" ? (
              <GuardedActionModal
                action={setAccountStatusAction}
                hidden={{ phone: a.phone, status: "rejected", redirect: `/dashboard/association/users/${encodeURIComponent(a.phone)}` }}
                trigger={<><Power className="h-4 w-4" /> 停用该账号</>}
                triggerClassName="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"
                title="停用账号"
                description={`停用后「${a.name || a.phone}」将无法登录使用。请输入管理员密码确认。`}
                confirmLabel={<><Power className="h-4 w-4" /> 确认停用</>}
                confirmClassName="h-10 px-5 rounded-full bg-cat-decor text-white text-[13px] font-medium inline-flex items-center gap-1.5"
                errored={err === "status"}
              />
            ) : (
              <form action={setAccountStatusAction}>
                <input type="hidden" name="phone" value={a.phone} />
                <input type="hidden" name="status" value="active" />
                <input type="hidden" name="redirect" value={`/dashboard/association/users/${encodeURIComponent(a.phone)}`} />
                <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Power className="h-4 w-4" /> 启用该账号</button>
              </form>
            )}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">停用后该账号无法登录使用;入会申请的审核请到「会员审核」。</p>
        </div>

        {track && (
          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-[12px] text-muted-foreground mb-1 inline-flex items-center gap-1.5"><Crown className="h-3.5 w-3.5 text-accent-yellow" /> 会员等级 · {trackLabel}</div>
            <p className="text-[11px] text-muted-foreground mb-3">{track === "enterprise" ? "企业按治理地位分档,等级越高商城配额越大、决策权越重。" : "个人按专业资历分档,与企业梯队互不相干。"}点选下方等级即调整。</p>
            <div className="flex flex-wrap gap-2">
              {ladder.map((m) => {
                const cur = m.tier === tier;
                const quotaTxt = m.quota === Infinity ? "不限" : `${m.quota} 款`;
                if (cur) {
                  return (
                    <span key={m.tier} className="h-9 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 border bg-foreground text-background border-foreground" title={m.perks.join(" / ")}>
                      <Check className="h-3.5 w-3.5" />{m.tier}
                      <span className="text-[11px] text-background/60">· {quotaTxt}</span>
                    </span>
                  );
                }
                return (
                  <GuardedActionModal
                    key={m.tier}
                    action={setMemberTierAction}
                    hidden={{ phone: a.phone, tier: m.tier }}
                    trigger={<>{m.tier}<span className="text-[11px] text-muted-foreground">· {quotaTxt}</span></>}
                    triggerClassName="h-9 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5 border bg-background border-border hover:bg-surface"
                    title="调整会员等级"
                    description={`将「${a.name || a.phone}」的等级调整为「${m.tier}」(${quotaTxt})。等级影响商城配额 / 决策权,需管理员密码确认。`}
                    confirmLabel={<><Check className="h-4 w-4" /> 确认调整</>}
                    confirmClassName="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"
                    errored={err === "tier" && t === m.tier}
                  />
                );
              })}
            </div>
            {tier && (() => { const meta = ladder.find((m) => m.tier === tier); return meta ? (
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {meta.perks.map((p) => <li key={p} className="inline-flex items-center gap-1"><Check className="h-3 w-3 text-accent-tea" />{p}</li>)}
              </ul>
            ) : null; })()}
          </div>
        )}

        {/* 会员能力（店铺）：等级默认 + 单会员覆盖 */}
        {track && caps && (
          <div className="mt-6 pt-5 border-t border-border">
            <div className="text-[12px] text-muted-foreground mb-1 inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5 text-cat-build" /> 会员能力 · 店铺</div>
            <p className="text-[11px] text-muted-foreground mb-3">
              默认：企业会员随等级允许开店，<b className="text-foreground">个人会员默认禁止开店</b>（需协会单独开通）。可对该会员单独覆盖。当前：开店 <b className={caps.canOpenStore ? "text-accent-tea" : "text-cat-decor"}>{caps.canOpenStore ? "允许" : caps.storeDisabledByAdmin ? "禁止" : "未开通"}</b>{caps.canOpenStore && <> · 额度 <b className="text-foreground">{caps.storeQuota === Infinity ? "不限" : caps.storeQuota}</b> 款{caps.storeQuotaOverridden ? "（已覆盖）" : "（随等级）"}</>}。
            </p>
            <form action={setMemberCapsAction} className="space-y-3">
              <input type="hidden" name="phone" value={a.phone} />
              <div>
                <div className="text-[12px] font-medium mb-1.5">开店</div>
                <div className="flex gap-2 flex-wrap">
                  {track === "enterprise" ? (
                    <>
                      <label className="flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border text-[13px] cursor-pointer has-[:checked]:border-accent-tea has-[:checked]:bg-[#e6f7f1]">
                        <input type="radio" name="capStore" value="default" defaultChecked={a.capStore !== 0} className="accent-accent-tea" /> 默认（随等级·允许）
                      </label>
                      <label className="flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border text-[13px] cursor-pointer has-[:checked]:border-cat-decor has-[:checked]:bg-cat-decor-soft">
                        <input type="radio" name="capStore" value="0" defaultChecked={a.capStore === 0} className="accent-cat-decor" /> 禁止开店
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border text-[13px] cursor-pointer has-[:checked]:border-cat-decor has-[:checked]:bg-cat-decor-soft">
                        <input type="radio" name="capStore" value="default" defaultChecked={a.capStore !== 1} className="accent-cat-decor" /> 默认（个人会员·禁止）
                      </label>
                      <label className="flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-border text-[13px] cursor-pointer has-[:checked]:border-accent-tea has-[:checked]:bg-[#e6f7f1]">
                        <input type="radio" name="capStore" value="1" defaultChecked={a.capStore === 1} className="accent-accent-tea" /> 允许开店
                      </label>
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-medium mb-1.5">店铺上架额度</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input name="capStoreQuota" type="number" min={0} defaultValue={a.capStoreQuota ?? ""} placeholder={`随等级（当前 ${tierQuota === Infinity ? "不限" : `${tierQuota} 款`}）`} className="h-10 w-56 rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30" />
                  <span className="text-[11px] text-muted-foreground">留空 = 随等级</span>
                </div>
              </div>
              <button className="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> 保存能力</button>
            </form>
          </div>
        )}

        {/* 账号资料管理（超管可改）*/}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-muted-foreground mb-3 inline-flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> 账号资料</div>
          <form action={updateAccountProfileAction} className="flex items-center gap-2 flex-wrap">
            <input type="hidden" name="phone" value={a.phone} />
            <input name="name" defaultValue={a.name} placeholder="姓名 / 名称" className="h-10 w-56 rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30" />
            <button className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> 保存姓名</button>
          </form>

          {a.role === "enterprise" ? (
            <div className="mt-3">
              <GuardedActionModal
                action={setAccountPasswordAction}
                hidden={{ phone: a.phone }}
                trigger={<><KeyRound className="h-4 w-4" /> 重置登录密码</>}
                triggerClassName="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface"
                title="重置该账号登录密码"
                description={`将为「${a.name || a.phone}」设置新登录密码。重置他人密码需管理员密码确认。`}
                fields={<input name="password" type="text" required minLength={6} placeholder="新登录密码（≥6 位）" className="h-10 w-full rounded-xl border border-border bg-background px-3 text-[13px] outline-none focus:border-foreground/30" />}
                confirmLabel={<><KeyRound className="h-4 w-4" /> 确认重置</>}
                confirmClassName="h-10 px-5 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"
                errored={err === "reset"}
              />
            </div>
          ) : (
            <p className="mt-3 text-[11px] text-muted-foreground inline-flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> {a.role === "customer" ? "业主" : "个人会员"}用短信验证码登录,无需密码。</p>
          )}
        </div>

        {/* 删除账号（高危）*/}
        <div className="mt-6 pt-5 border-t border-border">
          <div className="text-[12px] text-cat-decor mb-3 inline-flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5" /> 高危操作</div>
          <GuardedActionModal
            action={deleteAccountAction}
            hidden={{ phone: a.phone }}
            trigger={<><Trash2 className="h-4 w-4" /> 删除该账号</>}
            triggerClassName="h-10 px-5 rounded-full border border-cat-decor/40 text-cat-decor text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-cat-decor-soft"
            title="删除账号"
            description={`确认删除账号「${a.name || a.phone}」？删除后从数据库移除,不可恢复。请输入管理员密码确认。`}
            confirmLabel={<><Trash2 className="h-4 w-4" /> 确认删除</>}
            confirmClassName="h-10 px-5 rounded-full bg-cat-decor text-white text-[13px] font-medium inline-flex items-center gap-1.5"
            errored={err === "del"}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">删除后该账号从数据库移除,不可恢复(会员档案 / 入会申请不受影响)。</p>
        </div>
      </div>
    </AssociationShell>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="text-muted-foreground w-24 shrink-0">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
