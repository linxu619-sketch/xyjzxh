import { Container } from "@/components/container";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "登录 · 信阳市建筑装饰装修协会" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  return (
    <Container className="py-12 md:py-20 max-w-5xl">
      <LoginForm initial={searchParams} />
    </Container>
  );
}
