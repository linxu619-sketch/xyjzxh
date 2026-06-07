import { Container } from "@/components/container";
import { requireLogin } from "@/lib/auth/guard";
import { NewProjectWizard } from "./Wizard";

export const metadata = { title: "新建工装报备 · 信阳市建筑装饰装修协会" };

export default async function NewProjectPage() {
  await requireLogin();
  return (
    <Container className="py-10 md:py-14 max-w-4xl">
      <NewProjectWizard />
    </Container>
  );
}
