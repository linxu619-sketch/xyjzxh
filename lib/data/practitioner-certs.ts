import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   从业者证书库（个人资料 · 资质/证书证明）
   ------------------------------------------------------------
   来源：注册带入(registration) / 本人上传(upload) / 协会培训发证(training)。
   供本人在「个人资料」管理，供用人企业在派工调阅（仅证书 + 实名核验状态，不含身份证原件）。
   ============================================================ */

export type CertSource = "upload" | "registration" | "training";
export type CertVerify = "pending" | "verified";

export type PractitionerCert = {
  id: number;
  phone: string;
  title: string;
  imageUrl: string;
  source: CertSource;
  issuer: string;
  issued: string;
  verifyStatus: CertVerify;
  createdAt: number;
};

type Row = {
  id: number; practitioner_phone: string | null; title: string | null; image_url: string | null;
  source: string | null; issuer: string | null; issued: string | null; verify_status: string | null; created_at: number | null;
};
function rowTo(r: Row): PractitionerCert {
  return {
    id: r.id, phone: r.practitioner_phone ?? "", title: r.title ?? "", imageUrl: r.image_url ?? "",
    source: (r.source as CertSource) ?? "upload", issuer: r.issuer ?? "", issued: r.issued ?? "",
    verifyStatus: (r.verify_status as CertVerify) ?? "pending", createdAt: r.created_at ?? 0,
  };
}

export function listCertsByPhone(phone: string): PractitionerCert[] {
  const p = (phone || "").trim();
  if (!p) return [];
  const rows = getDb().prepare("SELECT * FROM practitioner_certs WHERE practitioner_phone = ? ORDER BY created_at DESC").all(p) as Row[];
  return rows.map(rowTo);
}

export function countCertsByPhone(phone: string): number {
  const p = (phone || "").trim();
  if (!p) return 0;
  return (getDb().prepare("SELECT COUNT(*) AS c FROM practitioner_certs WHERE practitioner_phone = ?").get(p) as { c: number }).c;
}

export function addCert(input: {
  phone: string; title: string; imageUrl: string;
  source?: CertSource; issuer?: string; issued?: string; verifyStatus?: CertVerify;
}): number | null {
  const phone = (input.phone || "").trim();
  const title = (input.title || "").trim();
  if (!phone || !title || !input.imageUrl) return null;
  const info = getDb().prepare(
    "INSERT INTO practitioner_certs (practitioner_phone,title,image_url,source,issuer,issued,verify_status,created_at) VALUES (?,?,?,?,?,?,?,?)",
  ).run(phone, title, input.imageUrl, input.source ?? "upload", input.issuer ?? "", input.issued ?? "", input.verifyStatus ?? "pending", Date.now());
  return Number(info.lastInsertRowid);
}

// 删除（仅限本人；非 registration 锁定项可删）
export function deleteCert(id: number, phone: string): void {
  getDb().prepare("DELETE FROM practitioner_certs WHERE id = ? AND practitioner_phone = ?").run(id, (phone || "").trim());
}

// 协会培训发证：培训完成后写入同一证书库（来源=training、发证方=协会、已核验）。预留接口，待发证流程接入。
export function issueTrainingCert(input: { phone: string; title: string; imageUrl: string; issued?: string }): number | null {
  return addCert({
    phone: input.phone, title: input.title, imageUrl: input.imageUrl,
    source: "training", issuer: "信阳市建筑装饰装修协会", issued: input.issued ?? "", verifyStatus: "verified",
  });
}

// 注册带入：把注册时上传的「资格证书」幂等导入证书库（来源=registration、已随入会审核核验）。
export function ensureRegistrationCert(phone: string, certImageUrl: string | undefined): void {
  const p = (phone || "").trim();
  if (!p || !certImageUrl) return;
  const exists = getDb().prepare("SELECT 1 FROM practitioner_certs WHERE practitioner_phone = ? AND source = 'registration'").get(p);
  if (exists) return;
  addCert({ phone: p, title: "资格证书（注册提交）", imageUrl: certImageUrl, source: "registration", issuer: "", issued: "", verifyStatus: "verified" });
}
