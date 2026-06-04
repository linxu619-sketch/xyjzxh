import "server-only";
import { getDb } from "@/lib/db/sqlite";
import {
  AGREEMENT_TEMPLATES, AGREEMENT_SIGNATURES,
  type AgreementTemplate, type AgreementSignature, type AgreementTarget, type SignerType,
} from "@/lib/data/agreements";

/* 协议数据源：本地 SQLite（失败/空回退静态）。静态数组仅作种子源。 */

type TRow = {
  id: string; code: string | null; title: string | null; category: string | null; target: string | null; version: string | null;
  status: string | null; required: number | null; requires_separate_consent: number | null; requires_resign_on_change: number | null;
  min_read_seconds: number | null; effective_at: string | null; expires_at: string | null; drafted_by: string | null;
  reviewed_by: string | null; approved_by: string | null; approved_at: string | null; content: string | null; highlights: string | null; changelog: string | null;
};

function tplRow(r: TRow): AgreementTemplate {
  let highlights: string[] = [];
  try { const v = JSON.parse(r.highlights ?? "[]"); if (Array.isArray(v)) highlights = v.map(String); } catch { /**/ }
  return {
    id: r.id, code: r.code ?? "", title: r.title ?? "", category: (r.category as AgreementTemplate["category"]) ?? "membership",
    target: (r.target as AgreementTarget) ?? "public", version: r.version ?? "1.0.0",
    status: (r.status as AgreementTemplate["status"]) ?? "published", required: !!r.required,
    requiresSeparateConsent: !!r.requires_separate_consent, requiresResignOnChange: !!r.requires_resign_on_change,
    minReadSeconds: r.min_read_seconds ?? 0, effectiveAt: r.effective_at ?? "", expiresAt: r.expires_at ?? undefined,
    draftedBy: r.drafted_by ?? "", reviewedBy: r.reviewed_by ?? undefined, approvedBy: r.approved_by ?? undefined,
    approvedAt: r.approved_at ?? undefined, content: r.content ?? "", highlights, changelog: r.changelog ?? undefined,
  };
}

export function listAgreementTemplates(): AgreementTemplate[] {
  try {
    const rows = getDb().prepare("SELECT * FROM agreements ORDER BY created_at DESC").all() as TRow[];
    return rows.length ? rows.map(tplRow) : AGREEMENT_TEMPLATES;
  } catch { return AGREEMENT_TEMPLATES; }
}

export function getAgreementTemplate(id: string): AgreementTemplate | undefined {
  return listAgreementTemplates().find((t) => t.id === id || t.code === id);
}

export function requiredAgreementsFor(target: AgreementTarget): AgreementTemplate[] {
  return listAgreementTemplates().filter((t) => t.status === "published" && (t.target === target || t.target === "public") && t.required);
}

export function allAgreementsFor(target: AgreementTarget): AgreementTemplate[] {
  return listAgreementTemplates().filter((t) => t.status === "published" && (t.target === target || t.target === "public"));
}

export function listSignatures(): AgreementSignature[] {
  try {
    const rows = getDb().prepare("SELECT data FROM agreement_signatures ORDER BY created_at DESC").all() as { data: string }[];
    if (rows.length) return rows.map((r) => JSON.parse(r.data) as AgreementSignature);
  } catch { /* fall through */ }
  return AGREEMENT_SIGNATURES;
}

export function signaturesByUser(signerType: SignerType, signerId: string): AgreementSignature[] {
  return listSignatures().filter((s) => s.signerType === signerType && s.signerId === signerId);
}
