import Link from "next/link";
import {
  Building2, Lock, Bell, Plug, Database, ShieldCheck, KeyRound,
  AlertTriangle, Sparkles, ExternalLink, BookOpen, Download, Users2,
} from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { SettingsCard, FormRow, Toggle, Input, Textarea } from "@/components/dashboard/section";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/site";
import { readRuntimeSettings, maskSecret } from "@/lib/runtime-config";
import { activeProvider } from "@/lib/ai/chat";
import { SettingsForm } from "./SettingsForm";
import { TestRegulator, TestEqianbao } from "./IntegrationTests";

export const metadata = { title: "系统设置 · 协会工作台" };

export default async function SystemSettings() {
  const settings = await readRuntimeSettings();
  const platform = settings.platform ?? {};
  const ai = settings.ai ?? {};
  const sec = settings.security ?? {};
  const eq = settings.e_qianbao ?? {};
  const reg = settings.regulator ?? {};
  const esign = settings.esign ?? {};
  const provider = await activeProvider();

  const hasDsKey = !!ai.deepseekApiKey;
  const hasEqKey  = !!eq.appKey;
  const hasProvKey = !!reg.provincialApiKey;
  const hasCityKey = !!reg.cityApiKey;
  const regProvOk = !!(reg.enabled && reg.provincialEndpoint && reg.provincialApiKey);
  const regCityOk = !!(reg.cityEndpoint && reg.cityApiKey);
  const eqOk = !!(eq.appId && eq.appKey);

  return (
    <AssociationShell
      title="系统设置"
      subtitle="平台层级配置 · 仅系统管理员与协会超级管理员可修改"
    >
      <SettingsForm>
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
          {/* 左侧 anchor */}
          <nav className="sticky top-16 self-start space-y-1 text-[13px]">
            {[
              { h: "#platform", l: "平台信息", icon: Building2 },
              { h: "#security", l: "账号与安全", icon: Lock },
              { h: "#notify",   l: "通知 / 短信", icon: Bell },
              { h: "#integration", l: "对外集成", icon: Plug },
              { h: "#data",     l: "数据 / 备份", icon: Database },
              { h: "#docs",     l: "平台文档", icon: BookOpen },
              { h: "#danger",   l: "高危操作", icon: AlertTriangle },
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
            {/* 平台信息 */}
            <SettingsCard
              title="平台信息"
              desc="出现在协会主站页头、SEO、子站底部协会标识条等位置"
            >
              <div id="platform" />
              <FormRow label="平台全称" required><Input name="platform.name" defaultValue={platform.name ?? SITE.name} /></FormRow>
              <FormRow label="平台简称"><Input name="platform.shortName" defaultValue={platform.shortName ?? SITE.shortName} /></FormRow>
              <FormRow label="主域名"><Input name="platform.domain" defaultValue={platform.domain ?? SITE.domain} /></FormRow>
              <FormRow label="协会电话"><Input name="platform.tel" defaultValue={platform.tel ?? SITE.tel} /></FormRow>
              <FormRow label="协会邮箱" hint="对外公示与系统通知发件显示用"><Input name="platform.email" type="email" defaultValue={platform.email ?? SITE.email} placeholder="例：xysjzzsxh2025@163.com" /></FormRow>
              <FormRow label="协会地址"><Input name="platform.address" defaultValue={platform.address ?? SITE.address} /></FormRow>
              <FormRow label="标语"><Input name="platform.slogan" defaultValue={platform.slogan ?? SITE.slogan} /></FormRow>
              <FormRow label="副标语"><Textarea name="platform.subSlogan" defaultValue={platform.subSlogan ?? SITE.subSlogan} rows={2} /></FormRow>
              <FormRow label="ICP / 公安备案号"><Input name="platform.icp" defaultValue={platform.icp} placeholder="例：豫 ICP 备 12345678 号 / 豫公网安备 41xxxxx 号" /></FormRow>
            </SettingsCard>

            {/* 账号与安全 */}
            <SettingsCard
              title="账号与安全"
              desc="系统管理员账号永不入库；协会工作人员账号由秘书处统一开通"
              action={<Badge tone="brand">协会超管可改</Badge>}
            >
              <div id="security" />
              <FormRow label="用户管理" hint="业主 / 企业会员 / 个人会员 / 协会工作人员 账号总览与启用停用">
                <Link href="/dashboard/association/users" className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5 w-fit">
                  <Users2 className="h-3.5 w-3.5" /> 打开用户管理
                </Link>
              </FormRow>
              <FormRow label="协会员工密码策略">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between"><span className="text-[13px]">最小长度</span>
                    <select name="security.minPasswordLen" defaultValue={String(sec.minPasswordLen ?? 8)} className="h-9 rounded-lg border border-border px-3 text-[13px]">
                      <option>8</option><option>10</option><option>12</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between"><span className="text-[13px]">必须包含数字 + 字母</span><Toggle defaultChecked /></div>
                  <div className="flex items-center justify-between"><span className="text-[13px]">必须包含符号</span><Toggle /></div>
                  <div className="flex items-center justify-between"><span className="text-[13px]">90 天强制改密</span><Toggle defaultChecked /></div>
                </div>
              </FormRow>
              <FormRow label="登录二次验证" hint="对高权限账号强制启用">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between"><span className="text-[13px]">系统管理员：短信 + 邮箱</span><Toggle defaultChecked /></div>
                  <div className="flex items-center justify-between"><span className="text-[13px]">协会超管：短信</span><Toggle name="security.require2faAdmin" defaultChecked={sec.require2faAdmin ?? true} /></div>
                  <div className="flex items-center justify-between"><span className="text-[13px]">普通员工：短信</span><Toggle name="security.require2faStaff" defaultChecked={sec.require2faStaff ?? false} /></div>
                </div>
              </FormRow>
              <FormRow label="会话有效期">
                <select name="security.sessionTtlDays" defaultValue={String(sec.sessionTtlDays ?? 7)} className="h-11 rounded-xl border border-border px-3 text-[14px]">
                  <option value="1">1 天</option><option value="7">7 天</option><option value="30">30 天</option>
                </select>
              </FormRow>
              <FormRow label="IP 白名单" hint="为空表示不限制">
                <Textarea name="security.ipWhitelist" defaultValue={sec.ipWhitelist} placeholder="一行一个，支持 CIDR，如 192.168.1.0/24" rows={3} />
              </FormRow>
            </SettingsCard>

            {/* 通知 */}
            <SettingsCard title="通知 / 短信网关" desc="生产环境建议接阿里云短信或腾讯云短信">
              <div id="notify" />
              <FormRow label="短信服务商">
                <select className="h-11 rounded-xl border border-border px-3 text-[14px]">
                  <option>阿里云短信</option><option>腾讯云 SMS</option><option>云片网</option><option>关闭</option>
                </select>
              </FormRow>
              <FormRow label="AccessKey ID"><Input placeholder="LTAI5t..." /></FormRow>
              <FormRow label="AccessKey Secret"><Input type="password" placeholder="******" /></FormRow>
              <FormRow label="登录验证码模板"><Input defaultValue="SMS_265214530" /></FormRow>
              <FormRow label="报备通知模板"><Input defaultValue="SMS_265215661" /></FormRow>
              <FormRow label="调解通知模板"><Input defaultValue="SMS_265215662" /></FormRow>
              <FormRow label="启用站内通知"><Toggle defaultChecked /></FormRow>
              <FormRow label="启用微信公众号通知"><Toggle defaultChecked /></FormRow>
            </SettingsCard>

            {/* 集成 · 含 AI 提供方 */}
            <SettingsCard
              title="对外集成"
              desc="与省厅监管、银行、保险、AI、IM 等外部系统的对接"
              action={
                <Badge tone={provider === "demo" ? "yellow" : "tea"}>
                  当前 AI：{provider}
                </Badge>
              }
            >
              <div id="integration" />

              <FormRow
                label={<span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-cat-decor" /> AI 提供方</span>}
                hint="auto = 哪个有 key 用哪个；填了 DeepSeek key 后自动会用 DeepSeek"
              >
                <select name="ai.provider" defaultValue={ai.provider ?? "auto"} className="h-11 rounded-xl border border-border px-3 text-[14px]">
                  <option value="auto">自动 (推荐)</option>
                  <option value="deepseek">强制 DeepSeek</option>
                </select>
              </FormRow>

              <FormRow
                label="DeepSeek API Key"
                hint={
                  <>
                    保存到 <code className="font-mono">.runtime-settings.json</code>（已 gitignore）。
                    {hasDsKey && <> 当前：<code className="font-mono text-accent-tea">{maskSecret(ai.deepseekApiKey)}</code> · <b>留空保持不变</b></>}
                  </>
                }
              >
                <Input
                  name="ai.deepseekApiKey"
                  type="password"
                  placeholder={hasDsKey ? "已配置 · 留空保持不变 · 填入新值则覆盖" : "sk-填入你的 DeepSeek key"}
                  autoComplete="off"
                />
              </FormRow>

              <FormRow label="DeepSeek 模型" hint="V4：flash 性价比 / pro 最强（思考模式自动开启）。旧 V3/R1 将于 2026-07-24 停用，选了也会自动映射到 V4。">
                <select name="ai.deepseekModel" defaultValue={ai.deepseekModel ?? "deepseek-v4-flash"} className="h-11 rounded-xl border border-border px-3 text-[14px]">
                  <option value="deepseek-v4-flash">deepseek-v4-flash (V4 · 性价比 · 推荐)</option>
                  <option value="deepseek-v4-pro">deepseek-v4-pro (V4 · 最高能力)</option>
                  <option value="deepseek-chat">deepseek-chat (旧 V3 · 2026-07-24 停用)</option>
                  <option value="deepseek-reasoner">deepseek-reasoner (旧 R1 · 2026-07-24 停用)</option>
                </select>
              </FormRow>

              <FormRow label="DeepSeek Base URL" hint="走代理 / 私有部署时改这里">
                <Input name="ai.deepseekBaseUrl" defaultValue={ai.deepseekBaseUrl} placeholder="https://api.deepseek.com" />
              </FormRow>

              {/* 数据库：本地 SQLite，无需配置 */}
              <FormRow
                label={<span className="inline-flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-accent-tea" /> 数据库</span>}
                hint="本平台使用本地 SQLite（零配置，数据文件 data/app.db），无需填写任何连接信息；将来上线多人访问时再迁移到服务器数据库。"
              >
                <Badge tone="tea"><Database className="h-2.5 w-2.5 mr-1 inline" /> 本地 SQLite · 已就绪</Badge>
              </FormRow>

              <FormRow
                label={<span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 监管平台 · 河南省建设行业</span>}
                hint="工装报备数据自动同步至省厅 · 信阳已实现一网通办"
              >
                <div className="space-y-2">
                  <Input
                    name="regulator.provincialEndpoint"
                    defaultValue={reg.provincialEndpoint}
                    placeholder="https://jianzhu.henan.gov.cn/api/report/sync"
                  />
                  <Input
                    name="regulator.provincialApiKey"
                    type="password"
                    placeholder={hasProvKey ? "已配置 · 留空保持不变" : "API Key（HMAC 签名）"}
                    autoComplete="off"
                  />
                  <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                    <label className="inline-flex items-center gap-2 text-[12px]">
                      <input type="checkbox" name="regulator.enabled" defaultChecked={reg.enabled ?? false} className="accent-brand" />
                      启用监管同步
                    </label>
                    {regProvOk ? (
                      <Badge tone="tea"><ShieldCheck className="h-2.5 w-2.5 mr-1 inline" /> 已配置</Badge>
                    ) : (
                      <Badge tone="yellow">未配置 · 报备走本地</Badge>
                    )}
                    <TestRegulator target="provincial" disabled={!regProvOk} />
                  </div>
                </div>
              </FormRow>

              <FormRow
                label={<span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent-tea" /> 监管平台 · 信阳市住建局</span>}
                hint="本地化报备 · 抽检数据上报"
              >
                <div className="space-y-2">
                  <Input
                    name="regulator.cityEndpoint"
                    defaultValue={reg.cityEndpoint}
                    placeholder="https://xinyang.zjzc.gov.cn/api/..."
                  />
                  <Input
                    name="regulator.cityApiKey"
                    type="password"
                    placeholder={hasCityKey ? "已配置 · 留空保持不变" : "API Key"}
                    autoComplete="off"
                  />
                  <div className="flex items-center justify-end mt-1 flex-wrap gap-2">
                    {regCityOk ? (
                      <Badge tone="tea">已配置</Badge>
                    ) : (
                      <Badge tone="yellow">未配置</Badge>
                    )}
                    <TestRegulator target="city" disabled={!regCityOk} />
                  </div>
                </div>
              </FormRow>

              <FormRow
                label={<span className="inline-flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-cat-decor" /> 电子签 · e签宝</span>}
                hint="协议签署用 · 司法可采性 · 留空使用协会原生签"
              >
                <div className="space-y-2">
                  <Input
                    name="e_qianbao.appId"
                    defaultValue={eq.appId}
                    placeholder="appId（开放平台 → 应用管理）"
                  />
                  <Input
                    name="e_qianbao.appKey"
                    type="password"
                    placeholder={hasEqKey ? "已配置 · 留空保持不变" : "appKey（HMAC 签名）"}
                    autoComplete="off"
                  />
                  <Input
                    name="e_qianbao.baseUrl"
                    defaultValue={eq.baseUrl}
                    placeholder="https://smlopenapi.esign.cn"
                  />
                  <Input
                    name="e_qianbao.callbackUrl"
                    defaultValue={eq.callbackUrl}
                    placeholder={`https://${SITE.domain}/api/esign/callback`}
                  />
                  <select name="esign.provider" defaultValue={esign.provider ?? "native"} className="h-11 w-full rounded-xl border border-border px-3 text-[14px]">
                    <option value="native">协会原生（本地哈希 + 公章 PDF）</option>
                    <option value="e_qianbao">强制使用 e签宝</option>
                    <option value="demo">Demo 模式</option>
                  </select>
                  <div className="flex items-center justify-end mt-1 flex-wrap gap-2">
                    {eqOk ? (
                      <Badge tone="tea">已配置</Badge>
                    ) : (
                      <Badge tone="yellow">未配置 · 走原生签</Badge>
                    )}
                    <TestEqianbao disabled={!eqOk} />
                  </div>
                </div>
              </FormRow>
              <FormRow label="对象存储"><select className="h-11 rounded-xl border border-border px-3 text-[14px]"><option>阿里云 OSS</option><option>腾讯云 COS</option><option>七牛云</option><option>自建</option></select></FormRow>
              <FormRow label="企业微信群机器人 webhook"><Input placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..." /></FormRow>

              <FormRow label="测试连通性">
                <a
                  href="/ai/advisor"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background text-[12px] font-medium"
                >
                  <KeyRound className="h-3 w-3" /> 在 AI 小协 试聊（验证 key 是否生效）
                  <ExternalLink className="h-3 w-3" />
                </a>
              </FormRow>
            </SettingsCard>

            {/* 数据 / 备份 */}
            <SettingsCard title="数据 / 备份">
              <div id="data" />
              <FormRow label="数据库类型"><Input defaultValue="本地 SQLite（data/app.db）" /></FormRow>
              <FormRow label="每日自动备份"><div className="flex items-center justify-between"><span className="text-[13px]">每天 03:00 全量 + 增量</span><Toggle defaultChecked /></div></FormRow>
              <FormRow label="备份保留天数"><Input defaultValue="30" /></FormRow>
              <FormRow label="导出数据"><div className="flex flex-wrap gap-2">
                <button type="button" className="h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">导出会员 (CSV)</button>
                <button type="button" className="h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">导出报备 (CSV)</button>
                <button type="button" className="h-9 px-4 rounded-full bg-foreground text-background text-[12px] font-medium">导出调解卷宗 (PDF 打包)</button>
              </div></FormRow>
            </SettingsCard>

            {/* 平台文档 */}
            <SettingsCard title="平台文档" desc="平台说明书,分内部完整版与对外会员版,均可在线预览或下载 Word">
              <div id="docs" />
              <FormRow label="完整版（内部）" hint="含模块完成度、四端使用说明、核心业务闭环、运维与上线要点、演示账号">
                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard/association/docs" className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> 在线预览
                  </Link>
                  <a href="/docs/xyjzxh-platform-guide.doc" download="信阳建装平台说明书.doc" className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface">
                    <Download className="h-3.5 w-3.5" /> 下载 Word
                  </a>
                </div>
              </FormRow>
              <FormRow label="会员版（对外）" hint="聚焦平台价值、各角色用法与协会保障；适合发给会员或公开,不含内部信息">
                <div className="flex flex-wrap gap-2">
                  <Link href="/dashboard/association/docs?v=member" className="h-10 px-4 rounded-full bg-foreground text-background text-[13px] font-medium inline-flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> 在线预览
                  </Link>
                  <a href="/docs/xyjzxh-member-guide.doc" download="信阳建装会员使用指南.doc" className="h-10 px-4 rounded-full border border-border text-[13px] font-medium inline-flex items-center gap-1.5 hover:bg-surface">
                    <Download className="h-3.5 w-3.5" /> 下载 Word
                  </a>
                </div>
              </FormRow>
            </SettingsCard>

            {/* 高危 */}
            <SettingsCard title="高危操作" desc="只有「系统管理员」可执行；请二次确认后再操作">
              <div id="danger" />
              <FormRow label="清空所有 AI 会话记录" hint="不影响业务数据">
                <button type="button" className="h-10 px-4 rounded-full border border-cat-decor text-cat-decor text-[12px] font-medium">立即清空</button>
              </FormRow>
              <FormRow label="重置一名协会员工密码" hint="发送临时密码至其手机号">
                <div className="flex gap-2">
                  <Input placeholder="手机号" />
                  <button type="button" className="h-11 px-5 rounded-xl bg-cat-decor text-white text-[13px] font-medium shrink-0">重置</button>
                </div>
              </FormRow>
              <FormRow label="封禁一个企业子站" hint="子站 503，企业账号自动锁定">
                <div className="flex gap-2">
                  <Input placeholder="子域名前缀（如 mingjia）" />
                  <button type="button" className="h-11 px-5 rounded-xl bg-cat-decor text-white text-[13px] font-medium shrink-0">封禁</button>
                </div>
              </FormRow>
            </SettingsCard>
          </div>
        </div>
      </SettingsForm>
    </AssociationShell>
  );
}
