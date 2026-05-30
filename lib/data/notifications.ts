// 站内信 mock · 用户 dashboard 顶部铃铛红点驱动数据
// 落地 Supabase 时迁移到 notifications 表

export type NotificationCategory =
  | "agreement_revoked"
  | "agreement_new_version"
  | "agreement_published"
  | "review_request"
  | "audit_event";

export type Notification = {
  id: string;
  recipientType: "customer" | "practitioner" | "enterprise" | "association_staff";
  recipientId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  link?: string;
  createdAt: string;
  readAt?: string;
};

// 演示数据
export const NOTIFICATIONS: Notification[] = [
  {
    id: "N-001",
    recipientType: "association_staff",
    recipientId: "as-001",
    category: "agreement_revoked",
    title: "刘女士已撤回 AI 对话授权",
    body: "撤回原因：不再使用 AI 功能。受影响业务：AI 助手停止使用。",
    link: "/dashboard/association/agreements",
    createdAt: "5 分钟前",
  },
  {
    id: "N-002",
    recipientType: "association_staff",
    recipientId: "as-001",
    category: "agreement_published",
    title: "《用户隐私政策 v1.1.0》已发布",
    body: "已自动向 1,824 名签署旧版本的用户发送重签通知，30 天内未签将影响账号。",
    link: "/dashboard/association/agreements/tpl-cust-privacy",
    createdAt: "今天 09:00",
  },
  {
    id: "N-003",
    recipientType: "customer",
    recipientId: "C00284",
    category: "agreement_new_version",
    title: "协议升级 · 待重签",
    body: "《用户隐私政策》已升级到 v1.1.0，需要您重新阅读并签字。剩余 12 天。",
    link: "/dashboard/resign",
    createdAt: "今天 09:00",
  },
];

export function notificationsFor(recipientType: Notification["recipientType"], recipientId: string): Notification[] {
  return NOTIFICATIONS.filter((n) => n.recipientType === recipientType && (recipientId === "*" || n.recipientId === recipientId));
}

export function unreadCount(recipientType: Notification["recipientType"], recipientId: string): number {
  return notificationsFor(recipientType, recipientId).filter((n) => !n.readAt).length;
}
