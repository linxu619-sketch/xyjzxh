import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AiDock } from "@/components/ai-dock";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookie = await cookies();
  const faceRaw = cookie.get("xy_face")?.value;
  const face = faceRaw === "xh" ? "xh" : "consumer";

  return (
    <>
      <SiteHeader face={face} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <AiDock />
    </>
  );
}
