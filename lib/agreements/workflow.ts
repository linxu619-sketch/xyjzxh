/* ============================================================
   协议发布工作流 · 状态机
   ============================================================
   draft → in_legal_review → legal_approved → in_secretary_approval
       → secretary_approved → published → archived
   ↑----------------------- rejected (回退到 draft)
   ============================================================ */

export type WorkflowStatus =
  | "draft"
  | "in_legal_review"
  | "legal_approved"
  | "in_secretary_approval"
  | "secretary_approved"
  | "published"
  | "archived"
  | "rejected";

export const WORKFLOW_META: Record<WorkflowStatus, {
  label: string;
  tone: "neutral" | "yellow" | "brand" | "tea" | "decor" | "design";
  nextActions: WorkflowAction[];
  description: string;
}> = {
  draft: {
    label: "草稿",
    tone: "neutral",
    description: "起草中 · 任何人可编辑",
    nextActions: ["submit_legal"],
  },
  in_legal_review: {
    label: "法务审核中",
    tone: "yellow",
    description: "已提交法务审核 · 不可编辑",
    nextActions: ["legal_approve", "legal_reject"],
  },
  legal_approved: {
    label: "法务已通过",
    tone: "brand",
    description: "法务审核通过 · 待秘书长批准",
    nextActions: ["submit_secretary"],
  },
  in_secretary_approval: {
    label: "秘书长审批中",
    tone: "design",
    description: "已提交秘书长审批",
    nextActions: ["secretary_approve", "secretary_reject"],
  },
  secretary_approved: {
    label: "秘书长已批准",
    tone: "brand",
    description: "全部审批通过 · 可发布",
    nextActions: ["publish"],
  },
  published: {
    label: "已发布",
    tone: "tea",
    description: "已生效 · 用户可签 · 升级会触发待重签",
    nextActions: ["archive"],
  },
  archived: {
    label: "已归档",
    tone: "neutral",
    description: "已下架 · 历史记录保留",
    nextActions: [],
  },
  rejected: {
    label: "已驳回",
    tone: "decor",
    description: "审核未通过 · 需修改后重提",
    nextActions: ["resubmit"],
  },
};

export type WorkflowAction =
  | "submit_legal"
  | "legal_approve"
  | "legal_reject"
  | "submit_secretary"
  | "secretary_approve"
  | "secretary_reject"
  | "publish"
  | "archive"
  | "resubmit";

export const ACTION_META: Record<WorkflowAction, {
  label: string;
  requiresRole: ("association_staff" | "system_admin" | "legal")[];
  requiresReason?: boolean;
  variant: "primary" | "danger";
  nextStatus: WorkflowStatus;
}> = {
  submit_legal: {
    label: "提交法务审核",
    requiresRole: ["association_staff", "system_admin"],
    variant: "primary",
    nextStatus: "in_legal_review",
  },
  legal_approve: {
    label: "法务通过",
    requiresRole: ["legal", "system_admin"],
    requiresReason: false,
    variant: "primary",
    nextStatus: "legal_approved",
  },
  legal_reject: {
    label: "法务驳回",
    requiresRole: ["legal", "system_admin"],
    requiresReason: true,
    variant: "danger",
    nextStatus: "rejected",
  },
  submit_secretary: {
    label: "提交秘书长审批",
    requiresRole: ["association_staff", "system_admin"],
    variant: "primary",
    nextStatus: "in_secretary_approval",
  },
  secretary_approve: {
    label: "秘书长批准",
    requiresRole: ["association_staff", "system_admin"],
    requiresReason: false,
    variant: "primary",
    nextStatus: "secretary_approved",
  },
  secretary_reject: {
    label: "秘书长驳回",
    requiresRole: ["association_staff", "system_admin"],
    requiresReason: true,
    variant: "danger",
    nextStatus: "rejected",
  },
  publish: {
    label: "立即发布",
    requiresRole: ["association_staff", "system_admin"],
    variant: "primary",
    nextStatus: "published",
  },
  archive: {
    label: "归档下架",
    requiresRole: ["association_staff", "system_admin"],
    requiresReason: true,
    variant: "danger",
    nextStatus: "archived",
  },
  resubmit: {
    label: "修改后重提",
    requiresRole: ["association_staff", "system_admin"],
    variant: "primary",
    nextStatus: "draft",
  },
};

export type WorkflowEvent = {
  id: string;
  templateId: string;
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  action: WorkflowAction;
  actor: string;
  actorRole: string;
  reason?: string;
  at: string;
};

// Demo 事件流
export const DEMO_WORKFLOW_EVENTS: WorkflowEvent[] = [
  { id: "wf-001", templateId: "tpl-cust-privacy", fromStatus: "draft",
    toStatus: "in_legal_review", action: "submit_legal",
    actor: "陈秘书", actorRole: "secretary", at: "2026-04-22 10:08" },
  { id: "wf-002", templateId: "tpl-cust-privacy", fromStatus: "in_legal_review",
    toStatus: "legal_approved", action: "legal_approve",
    actor: "王律师事务所 · 张律师", actorRole: "legal",
    reason: "符合 PIPL § 14/38 跨境合规要求", at: "2026-04-25 16:24" },
  { id: "wf-003", templateId: "tpl-cust-privacy", fromStatus: "legal_approved",
    toStatus: "in_secretary_approval", action: "submit_secretary",
    actor: "陈秘书", actorRole: "secretary", at: "2026-04-26 09:00" },
  { id: "wf-004", templateId: "tpl-cust-privacy", fromStatus: "in_secretary_approval",
    toStatus: "secretary_approved", action: "secretary_approve",
    actor: "李会长", actorRole: "secretary_general", at: "2026-04-28 14:30" },
  { id: "wf-005", templateId: "tpl-cust-privacy", fromStatus: "secretary_approved",
    toStatus: "published", action: "publish",
    actor: "陈秘书", actorRole: "secretary",
    reason: "正式发布 · 已通知所有已签用户重签", at: "2026-05-01 09:00" },
];

export function getEventsForTemplate(templateId: string): WorkflowEvent[] {
  return DEMO_WORKFLOW_EVENTS.filter((e) => e.templateId === templateId);
}
