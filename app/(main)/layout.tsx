import { cookies, headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AiDock } from "@/components/ai-dock";
import { GlobalBottomNav } from "@/components/global-bottom-nav";
import { getSession } from "@/lib/auth/session";
import { countTodos } from "@/lib/dashboard/todos";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // 优先读 middleware 注入的请求头 x-face（本次请求生效门面，?face=xh 首跳即正确）；
  // 回退到 cookie（直接访问 / 边缘情况）。
  const [cookie, hdrs] = await Promise.all([cookies(), headers()]);
  const faceRaw = hdrs.get("x-face") ?? cookie.get("xy_face")?.value;
  const face = faceRaw === "xh" ? "xh" : "consumer";
  const session = await getSession();
  const todo = countTodos(session);

  return (
    <>
      <SiteHeader face={face} authed={!!session} todo={todo} />
      <main className="flex-1">{children}</main>
      <SiteFooter face={face} />
      <AiDock face={face} />
      {/* 移动端全站固定底栏（桌面端隐藏，桌面用顶部导航 + 悬浮 AI 按钮）；按门面显示消费者/协会两套标签 */}
      <GlobalBottomNav face={face} todo={todo} />
    </>
  );
}
