# 前端格式 / 样式规范 UI-STYLE

> **这是格式约定的唯一集中地。** 做任何 UI / 样式 / 布局前先读本文件；每次新的格式决定也只往这里加（不要散落到别处）。
> 业务逻辑 / 架构约定在 `CONVENTIONS.md`；本文件只管「长什么样」。

## 通用
- 界面语言：**简体中文**。
- 图标统一用 `lucide-react`。
- 颜色用现有 token：`brand` / `cat-build` / `cat-decor` / `cat-design` / `accent-tea` / `accent-yellow` / `surface` / `border` / `muted-foreground` 等，不要写死十六进制（除非沿用既有）。
- 卡片/容器默认圆角 `rounded-2xl` / `rounded-3xl`（**图片上传区例外，见下**）。

## 图片上传（用户重点强调，务必遵守）
组件：`app/(main)/register/uploads.tsx` —— `SingleUpload`（单张）/ `MultiUpload`（多张）/ `Lightbox`（放大预览）。
1. **只接受图片格式**：`accept="image/*"`，不收 PDF。
2. **一律方角，不要圆角**：上传框、缩略图都不用 `rounded-*`。
3. **已上传图片点击可放大**：点图弹出全屏 `Lightbox` 预览；角落带「放大」按钮。
4. 单张保留「替换」，多张保留「移除」；左上角「✅已传」标记。
5. **按证件真实长宽比显示框**：

   | 材料 | 真实尺寸 | 比例(aspect) | 框宽 |
   |------|---------|------|------|
   | 身份证（人像面/国徽面，**两个框**） | 85.6×54mm | `85.6 / 54`（横） | ~180px |
   | 营业执照副本（2019 新版横版） | 297×210mm | `297 / 210`（横） | ~230px |
   | 资质证书 | A4 | `297 / 210` | — |
   | 业绩 / 作品 | — | `4 / 3` | — |

6. **多张上传（资质/业绩/资格证书/代表作品）**：缩略图墙 + 「添加」格子，**上限 10 张**；每个缩略图框尺寸与身份证一致（宽 180px、`85.6 / 54`）。
7. **后台查看上传材料**：协会审核详情页用 `app/(dashboard)/dashboard/association/members/[id]/materials.tsx` 渲染——按材料类别给真实长宽比、方角、点击放大 Lightbox。
8. **样例测试图**：`public/samples/`（`id-front/id-back/license/cert/work-1/work-2.svg`，均标注「样例」），供测试展示用，请勿当真实证件。
9. **真实上传与持久化**：上传组件选图后**立即上传**到 `POST /api/upload`（仅图片、≤8MB），存到 `public/uploads/<uuid>.<ext>` 并返回 URL；payload 存的是该 URL，刷新/审核后台都能看到真图。上传中显示菊花、失败提示可重传。`public/uploads/` 已 gitignore。

## 表单 / 注册向导
- 多步流程用**分步向导**：步骤指示器 + 「上一步/下一步」+ 每步必填校验 + 最后一步信息复核再提交；切步骤不丢已填数据（client state 持有）。
- 参考实现：注册/入会 `app/(main)/register/RegisterWizard.tsx`（填写资料 → 签署协议 → 确认提交）。
- 必填项标 `*`（`text-cat-decor`）。

## 可打印 A4 公文（协会出具单据：受理单 / 回执 / 记录）
- 协会出具、需归档或出示的处置页统一做成 **A4 红头公文**，支持直接打印 / 另存 PDF。
- 组件：`components/print/print-doc.tsx` —— `PrintBar`（打印按钮，`window.print()`）、`Letterhead`（协会红头：名称+联系方式+红线+标题+文号/日期）、`DocTable`（带边框 key/value 表）、`SealFooter`（签字/盖章落款）。
- 页面结构：`<div className="no-print">`（返回 + 处置操作按钮 + `PrintBar`）+ `<div className="print-area"><div className="a4-sheet">`（Letterhead + DocTable + 意见栏 + SealFooter）。
- 打印 CSS 在 `globals.css`：`@media print` 用 visibility 隔离只输出 `.print-area`，`.no-print` 隐藏，`.a4-sheet` 为 210mm 纸张。
- 文号规则：`XYJZ-{业务码}-编号`（调解 TJ / 金融 JR / 理赔 LP / 入会 RH；报备用报备号）。
- 两种页面形态：① **文档型页**（调解/报备/理赔/金融受理单）——A4 公文屏幕也显示作预览，操作放 `no-print` 工具栏；② **交互工作台型页**（入会审批 `members/[id]`：有实名核验/审批/证照）——屏幕保留交互(`no-print`)，A4 公文加 `.print-only`（屏幕 `display:none`、打印才显示），不在屏幕上冗余。
- **坑(务必避开)**：`@page{}` **不能嵌套在 `@media print{}` 内**——会被 Lightning CSS(Tailwind v4)判为非法导致**整个 @media print 块被丢弃**、打印 CSS 静默失效。`@page` 必须写在顶层。
- 本项目 **Tailwind v4 不会生成 `print:` 变体**（如 `print:hidden`），打印控制一律用自定义类 `.no-print` / `.print-only` / `.print-area`（都在 globals.css，已验证可编译）。
- 改打印 CSS 后**务必抓编译产物核实**（`/_next/static/chunks/*.css` 里 grep `visibility:hidden`/`print-area`/`no-print`），别只看源码和页面 HTML。
- 已落地 5 类：调解处置单、工装报备受理回执、理赔受理/定损单、金融服务申请受理单、入会申请审批表。**新增协会单据类页面照此办。**

## 列表 / 表格 —— 全平台铁律（用户重点强调，所有列表统一遵守）
> **平台内所有列表都用表格形式：整行可点击 → 进入详情页 → 所有操作都在详情页里做。** 适用于全平台所有门面（消费者门户 / 协会门户 / 企业子站 / 各后台工作台），无一例外。
- **行内绝不放"操作"按钮**：通过 / 驳回 / 编辑 / 删除 / 启用停用 / 上下架 / 状态流转……一律放到**详情页**内。列表只负责「看 + 点进去」。
- **表格形式**：用 `grid` 对齐多列（名称 / 编号 / 时间 / 状态…），整行是 `<Link>` 指向详情页；末列放状态 + `ChevronRight`；移动端可降列只留主信息。`DataTable` 用 `dropActionCol` 砍掉"操作"列；新列表直接别加操作列。
- **消费者门户的卡片墙**（企业 / 商品 / 案例等展示性列表）同样遵守「点整张卡 → 进详情页」；详情页才有「下单 / 报名 / 联系」等操作，卡片上不放操作按钮。
- 参考实现：协会「会员审核 / 报备审批 / 调解 / 用户管理」列表 + 对应 `[id]`（或 `[phone]`）详情页；企业「客户线索」列表 + `leads/[id]` 详情（状态流转：新→沟通→量房→签单/流失）；商城「我的商品 / 采购单」、消费者「找企业 / 建材超市」卡片 → 各自详情页。
- **新增任何列表前先回到这条**：先建详情页路由，再让列表行 `<Link>` 过去，操作写在详情页。
- 处理动作完成后 `redirect` 回详情/列表。
- **顶部统计卡 = 可点筛选器**：列表页顶部的状态统计块（待审/已通过/已驳回等）要可点击，点选即按该状态筛选列表（`?f=<status>`），选中高亮，再点取消；非筛选项（签单率/在册企业等）保持静态或跳转。统一用 `components/dashboard/stat-filters.tsx` 的 `StatFilters`。参考：会员审核 / 报备 / 调解 / 客户线索。

## 移动端
- 门户页移动端底部固定导航（`GlobalBottomNav`，两门面各一套）；后台用汉堡抽屉。
- 触摸目标 ≥ 40px；按钮 `active:scale-[0.97~0.99]` 轻反馈。

---
*新增格式决定 → 加到对应小节；与本文件冲突的旧代码以本文件为准并逐步纠正。*
