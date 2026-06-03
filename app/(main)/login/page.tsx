import { cookies } from "next/headers";
import { Container } from "@/components/container";
import { LoginForm } from "./LoginForm";
import type { Role } from "@/lib/auth";

export const metadata = { title: "登录 · 信阳市建筑装饰装修协会" };

const MEMBER_ROLES: Role[] = ["association", "enterprise", "practitioner"];
const ALL_ROLES: Role[] = ["association", "enterprise", "practitioner", "customer"];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const face = (await cookies()).get("xy_face")?.value;

  // 协会/会员侧（xh 门户）只登录 协会/企业/从业者；消费者侧（xyjzxh.com）登录业主。
  let roles: Role[];
  if (role === "customer") roles = ["customer"];
  else if (role && (MEMBER_ROLES as string[]).includes(role)) roles = MEMBER_ROLES;
  else if (face === "xh") roles = MEMBER_ROLES;
  else if (face === "consumer" || face === "tenant") roles = ["customer"];
  else roles = ALL_ROLES;

  return (
    <Container className="py-12 md:py-20 max-w-5xl">
      <LoginForm roles={roles} initialRole={role} />
    </Container>
  );
}
