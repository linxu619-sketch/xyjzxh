import { Container } from "@/components/container";
import { NewProjectWizard } from "./Wizard";

export const metadata = { title: "新建工装报备 · 信阳市建筑装修协会" };

export default function NewProjectPage() {
  return (
    <Container className="py-10 md:py-14 max-w-4xl">
      <NewProjectWizard />
    </Container>
  );
}
