import Link from "next/link";
import {
  Bell, FileSignature, AlertCircle, Sparkles, FileText,
  CheckCircle2, ChevronRight,
} from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { notificationsFor, type NotificationCategory } from "@/lib/data/notifications";

export const metadata = { title: "站内信 · 协会工作台" };

const ICON_MAP: Record<NotificationCategory, React.ComponentType<{ className?: string }>> = {
  agreement_revoked: AlertCircle,
  agreement_new_version: FileSignature,
  agreement_published: CheckCircle2,
  review_request: FileText,
  audit_event: Sparkles,
};

const TONE_MAP: Record<NotificationCategory, "build" | "decor" | "design" | "tea" | "brand"> = {
  agreement_revoked: "decor",
  agreement_new_version: "brand",
  agreement_published: "tea",
  review_request: "design",
  audit_event: "build",
};

const LABEL_MAP: Record<NotificationCategory, string> = {
  agreement_revoked: "授权撤回",
  agreement_new_version: "协议升级",
  agreement_published: "协议发布",
  review_request: "审核请求",
  audit_event: "审计事件",
};

export default async function AssociationNotifications() {
  const list = notificationsFor("association_staff", "as-001");
  const unread = list.filter((n) => !n.readAt);

  return (
    <AssociationShell
      title="站内信"
      subtitle={`${unread.length} 条未读 · 全部 ${list.length} 条`}
    >
      <div className="rounded-3xl border border-border bg-background overflow-hidden">
        {list.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <div className="mt-3 text-[14px] text-muted-foreground">暂无消息</div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((n) => {
              const Icon = ICON_MAP[n.category];
              return (
                <li key={n.id} className="active:bg-surface/60 transition-colors">
                  <Link href={n.link ?? "#"} className="block px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className={`h-10 w-10 rounded-2xl inline-flex items-center justify-center shrink-0 ${
                        n.category === "agreement_revoked" ? "bg-cat-decor-soft text-cat-decor" :
                        n.category === "agreement_published" ? "bg-[#e6f7f1] text-accent-tea" :
                        "bg-brand-50 text-brand"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge tone={TONE_MAP[n.category]} className="!text-[10px]">{LABEL_MAP[n.category]}</Badge>
                          {!n.readAt && <span className="h-2 w-2 rounded-full bg-cat-decor animate-pulse" />}
                          <span className="ml-auto text-[10px] text-muted-foreground">{n.createdAt}</span>
                        </div>
                        <div className="text-[14px] font-semibold leading-5">{n.title}</div>
                        <p className="text-[12px] text-muted-foreground mt-1 leading-5">{n.body}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AssociationShell>
  );
}
