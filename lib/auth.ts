// 演示用账号存根 — 仅前端演示，无实际密码校验。
// 生产请接入 Supabase Auth + 四套用户表（见 db/schema.sql）。

export type Role = "association" | "enterprise" | "practitioner" | "customer";

export const ROLE_META: Record<Role, {
  label: string;
  short: string;
  tone: "brand" | "build" | "decor" | "design";
  dashboard: string;
  devicePriority: "PC" | "移动" | "PC + 移动";
  desc: string;
}> = {
  association: {
    label: "协会工作人员",
    short: "协会",
    tone: "brand",
    dashboard: "/dashboard/association",
    devicePriority: "PC",
    desc: "协会内部账号，负责会员审核、报备审批、内容运营、纠纷调解。",
  },
  enterprise: {
    label: "企业工作人员",
    short: "企业",
    tone: "build",
    dashboard: "/dashboard/enterprise",
    devicePriority: "PC + 移动",
    desc: "在册企业员工账号，可运营子站、接收线索、提交报备、查看数据。",
  },
  practitioner: {
    label: "行业从业者",
    short: "从业者",
    tone: "design",
    dashboard: "/dashboard/practitioner",
    devicePriority: "移动",
    desc: "工长、师傅、独立设计师、监理等个人账号。找活、培训、工伤险、收入证明、协会调解。",
  },
  customer: {
    label: "C 端业主",
    short: "业主",
    tone: "decor",
    dashboard: "/dashboard/customer",
    devicePriority: "移动",
    desc: "业主账号，可下单、写评价、买保险、申请调解、用 AI 助手。",
  },
};
