import { cookies, headers } from "next/headers";
import { Container } from "@/components/container";
import { LoginForm } from "./LoginForm";
import type { Role } from "@/lib/auth";

export const metadata = { title: "登录 · 信阳市建筑装饰装修协会" };

const MEMBER_ROLES: Role[] = ["association", "enterprise", "practitioner"];
const ALL_ROLES: Role[] = ["association", "enterprise", "practitioner", "customer"];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string; next?: string }> }) {
  const { role, next } = await searchParams;
  // 优先读 middleware 注入的 x-face（含 /login?role= 跟随门面）；回退 cookie
  const face = (await headers()).get("x-face") ?? (await cookies()).get("xy_face")?.value;

  // 身份范围：
  // - 显式 ?role=customer  → 只业主（消费者门户登录入口）
  // - 显式 ?role=会员身份   → 协会/企业/从业者（协会门户登录入口，无业主）
  // - 协会门户(face=xh)无参数 → 协会/企业/从业者
  // - 其余（消费者/IP 直连/无上下文）→ 全部四种，绝不收窄成"只有业主"
  let roles: Role[];
  if (role === "customer") roles = ["customer"];
  else if (role && (MEMBER_ROLES as string[]).includes(role)) roles = MEMBER_ROLES;
  else if (face === "xh") roles = MEMBER_ROLES;
  else roles = ALL_ROLES;

  return (
    <Container className="py-12 md:py-20 max-w-5xl">
      <LoginForm roles={roles} initialRole={role} next={next} />
    </Container>
  );
}
