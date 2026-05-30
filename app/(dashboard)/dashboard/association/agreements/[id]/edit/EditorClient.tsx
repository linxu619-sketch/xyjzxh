"use client";

import { MarkdownEditor } from "@/components/agreements/markdown-editor";
import { saveDraftAction, scanRisksClientAction } from "./editor-actions";

export function EditorClient({
  templateId,
  initialContent,
  initialHighlights,
}: {
  templateId: string;
  initialContent: string;
  initialHighlights: string[];
}) {
  return (
    <MarkdownEditor
      initialContent={initialContent}
      initialHighlights={initialHighlights}
      onSave={async (content, highlights) => {
        return saveDraftAction(templateId, content, highlights);
      }}
      onScanRisks={async (content) => {
        return scanRisksClientAction(content);
      }}
    />
  );
}
