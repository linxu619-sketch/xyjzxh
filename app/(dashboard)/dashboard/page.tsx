import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

// /dashboard 入口：按当前会话角色跳到对应工作台
export default async function DashboardRouter() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  switch (session.role) {
    case "system_admin":
    case "association":
      redirect("/dashboard/association");
    case "enterprise":
      redirect("/dashboard/enterprise");
    case "practitioner":
      redirect("/dashboard/practitioner");
    case "customer":
      redirect("/dashboard/customer");
    default:
      redirect("/login");
  }
}
