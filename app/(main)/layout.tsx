import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AiDock } from "@/components/ai-dock";
import { GlobalBottomNav } from "@/components/global-bottom-nav";
import { getSession } from "@/lib/auth/session";
import { countTodos } from "@/lib/dashboard/todos";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookie = await cookies();
  const faceRaw = cookie.get("xy_face")?.value;
  const face = faceRaw === "xh" ? "xh" : "consumer";
  const session = await getSession();
  const todo = countTodos(session);

  return (
    <>
      <SiteHeader face={face} authed={!!session} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AiDock />
      {/* 移动端全站固定底栏（桌面端隐藏，桌面用顶部导航 + 悬浮 AI 按钮）；按门面显示消费者/协会两套标签 */}
      <GlobalBottomNav face={face} todo={todo} />
    </>
  );
}
