import "server-only";
import type { Session } from "@/lib/auth/session";
import { listApplications } from "@/lib/data/applications";
import { listReports } from "@/lib/data/reports";
import { listMediations } from "@/lib/data/mediations";
import { listLeadsByEnterprise } from "@/lib/data/leads";
import { listByStatus, reconcileBuyer } from "@/lib/data/supplies-source";
import { listOrdersByEnterprise } from "@/lib/data/orders-source";
import { ORDER_DEMO } from "@/lib/data/orders";

/**
 * 当前登录身份的「总待办数」——用于移动端底部栏「我的」tab 红点。
 * 与两个门户首页登录态快捷入口的红点口径保持一致。
 * 审核中(pending)账号与从业者(无待办)返回 0。
 */
export function countTodos(session: Session | null): number {
  if (!session || session.pending) return 0;
  const role = session.role === "system_admin" ? "association" : session.role;

  if (role === "association") {
    return (
      listApplications("pending").length +
      listReports("pending").length +
      listMediations("pending").length +
      listByStatus("pending").length
    );
  }

  if (role === "enterprise" && session.enterpriseId) {
    const eid = session.enterpriseId;
    return (
      listLeadsByEnterprise(eid).filter((l) => l.status === "new").length +
      listOrdersByEnterprise(eid).filter((o) => o.stage !== "accepted").length +
      reconcileBuyer("enterprise", eid).overdueCount
    );
  }

  if (role === "customer") {
    const p = ORDER_DEMO;
    return (
      p.acceptance.filter((a) => a.status === "ready").length +
      p.changeOrders.filter((c) => c.status === "pending" && c.approverChain.find((x) => x.role === "业主" && !x.result)).length +
      p.payments.filter((pay) => !pay.paidAt && new Date(pay.due) <= new Date("2026-06-30")).length
    );
  }

  return 0; // practitioner：暂无统一待办口径
}
