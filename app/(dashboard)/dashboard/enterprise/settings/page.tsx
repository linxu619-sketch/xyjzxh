import { Save, Building2, KeyRound, Bell, Trash2, CreditCard } from "lucide-react";
import { EnterpriseShell } from "@/components/dashboard/shell";
import { SettingsCard, FormRow, Toggle, Input, Textarea } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "企业设置 · 企业工作台" };

export default function EnterpriseSettings() {
  return (
    <EnterpriseShell
      title="企业设置"
      subtitle="仅 owner 与管理员可修改"
      actions={<button className="h-9 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5"><Save className="h-3.5 w-3.5" /> 保存全部</button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        <nav className="sticky top-6 self-start space-y-1 text-[13px]">
          {[
            { h: "#company", l: "企业资料", icon: Building2 },
            { h: "#account", l: "账号 / 密码", icon: KeyRound },
            { h: "#notify",  l: "通知偏好",  icon: Bell },
            { h: "#billing", l: "会费 / 账单", icon: CreditCard },
            { h: "#danger",  l: "高危操作",   icon: Trash2 },
          ].map((it) => {
            const Ic = it.icon;
            return (
              <a key={it.h} href={it.h} className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground">
                <Ic className="h-3.5 w-3.5" /> {it.l}
              </a>
            );
          })}
        </nav>

        <div className="space-y-6">
          <SettingsCard title="企业资料" desc="协会档案与子站基础信息">
            <div id="company" />
            <FormRow label="企业全称" required><Input defaultValue="信阳名家装饰工程有限公司" /></FormRow>
            <FormRow label="统一社会信用代码" required><Input defaultValue="91410100MA9XXXXXXX" /></FormRow>
            <FormRow label="主营类别"><select className="h-11 rounded-xl border border-border px-3 text-[14px]"><option>建筑施工</option><option selected>装饰装修</option><option>设计公司</option><option>设计师个人</option></select></FormRow>
            <FormRow label="成立年份"><Input defaultValue="2012" /></FormRow>
            <FormRow label="员工规模"><select className="h-11 rounded-xl border border-border px-3 text-[14px]"><option>10 人以内</option><option>10-30 人</option><option>30-50 人</option><option>50-100 人</option><option selected>100-200 人</option><option>200-500 人</option><option>500+ 人</option></select></FormRow>
            <FormRow label="主营区域"><Input defaultValue="羊山新区 / 浉河区" /></FormRow>
            <FormRow label="资质证书" hint="变更后请同步协会秘书处复审">
              <div className="space-y-2 text-[13px]">
                {["建筑装修装饰壹级", "ISO9001"].map((q) => (
                  <div key={q} className="rounded-xl bg-surface px-4 py-3 flex items-center justify-between">
                    <span>{q}</span>
                    <Badge tone="tea">有效</Badge>
                  </div>
                ))}
                <button className="h-9 px-4 rounded-full border border-dashed border-border text-[12px] text-muted-foreground">+ 上传新资质</button>
              </div>
            </FormRow>
            <FormRow label="企业简介"><Textarea defaultValue="本地 TOP3 整装品牌，699 套餐覆盖 200+ 楼盘。" /></FormRow>
          </SettingsCard>

          <SettingsCard title="账号 / 密码">
            <div id="account" />
            <FormRow label="登录手机号" required hint="变更需短信验证"><Input defaultValue="138****1001" /></FormRow>
            <FormRow label="登录密码"><div className="flex gap-2"><Input type="password" defaultValue="123456" /><button className="h-11 px-4 rounded-xl bg-foreground text-background text-[13px] font-medium shrink-0">更新</button></div></FormRow>
            <FormRow label="二次验证"><div className="flex items-center justify-between"><span className="text-[13px]">登录时发送短信</span><Toggle defaultChecked /></div></FormRow>
            <FormRow label="API Key" hint="供 ERP / 微信小程序对接调用">
              <div className="flex gap-2"><Input defaultValue="sk_ent_mingjia_3f8a2****" /><button className="h-11 px-4 rounded-xl bg-surface text-[13px] shrink-0">重新生成</button></div>
            </FormRow>
          </SettingsCard>

          <SettingsCard title="通知偏好">
            <div id="notify" />
            <FormRow label="新线索"><div className="flex items-center justify-between"><span className="text-[13px]">微信 + 短信</span><Toggle defaultChecked /></div></FormRow>
            <FormRow label="报备状态变更"><div className="flex items-center justify-between"><span className="text-[13px]">微信</span><Toggle defaultChecked /></div></FormRow>
            <FormRow label="保单到期"><div className="flex items-center justify-between"><span className="text-[13px]">提前 30/7/1 天提醒</span><Toggle defaultChecked /></div></FormRow>
            <FormRow label="协会活动"><div className="flex items-center justify-between"><span className="text-[13px]">仅站内</span><Toggle /></div></FormRow>
          </SettingsCard>

          <SettingsCard title="会费 / 账单">
            <div id="billing" />
            <FormRow label="当前会籍">
              <div className="rounded-xl bg-foreground text-background p-4 flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-semibold">高级会员</div>
                  <div className="text-[11px] text-background/70 mt-0.5">到期：2027-04-30 · 自动续费</div>
                </div>
                <span className="text-[18px] font-semibold">¥4,800/年</span>
              </div>
            </FormRow>
            <FormRow label="开票信息"><Textarea defaultValue="抬头：信阳名家装饰工程有限公司\n税号：91410100MA9XXXXXXX\n开户行：中国建设银行信阳分行 411xxxxxxxx" /></FormRow>
            <FormRow label="AI 计费">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">本月用量 1,320 / 1,000 次，超出 320 次</span>
                <span className="font-semibold">¥32.00</span>
              </div>
            </FormRow>
          </SettingsCard>

          <SettingsCard title="高危操作" desc="操作不可逆，请二次确认">
            <div id="danger" />
            <FormRow label="退出协会" hint="子站立即下线，账号锁定，已有线索 90 天后删除">
              <button className="h-10 px-4 rounded-full border border-cat-decor text-cat-decor text-[12px] font-medium">申请退会</button>
            </FormRow>
            <FormRow label="迁移子域名" hint="需协会审核">
              <div className="flex gap-2"><Input placeholder="新子域名" /><button className="h-11 px-4 rounded-xl bg-cat-decor text-white text-[13px] font-medium shrink-0">提交</button></div>
            </FormRow>
          </SettingsCard>
        </div>
      </div>
    </EnterpriseShell>
  );
}
