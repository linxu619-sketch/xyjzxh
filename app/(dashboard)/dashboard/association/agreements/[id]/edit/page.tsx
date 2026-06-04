import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Sparkles } from "lucide-react";
import { AssociationShell } from "@/components/dashboard/shell";
import { Badge } from "@/components/ui/badge";
import { getAgreementTemplate } from "@/lib/data/agreements-source";
import { EditorClient } from "./EditorClient";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tpl = getAgreementTemplate(id);
  if (!tpl) notFound();

  return (
    <AssociationShell
      title={`编辑 · ${tpl.title}`}
      subtitle={`${tpl.code} · v${tpl.version} · 当前 ${tpl.status}`}
      actions={
        <>
          <Badge tone="yellow"><Pencil className="h-3 w-3 mr-1 inline" />草稿编辑</Badge>
          <Badge tone="brand"><Sparkles className="h-3 w-3 mr-1 inline" />AI 法律审查</Badge>
        </>
      }
    >
      <Link href={`/dashboard/association/agreements/${tpl.id}`} className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回协议详情
      </Link>

      <div className="mb-4 rounded-2xl bg-cat-decor-soft p-4 text-[12px] text-cat-decor flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
        <div className="leading-5">
          编辑完成后点 <b>「保存草稿」</b>，然后回详情页提交法务审核。
          建议先用 <b>「AI 风险扫描」</b> 自查一遍 PIPL / 民法典 / 电子签名法合规性。
        </div>
      </div>

      <EditorClient
        templateId={tpl.id}
        initialContent={tpl.content}
        initialHighlights={tpl.highlights}
      />
    </AssociationShell>
  );
}
