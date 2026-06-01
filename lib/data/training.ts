import "server-only";
import { getDb } from "@/lib/db/sqlite";

/* ============================================================
   培训（协会发布课程 → 从业者报名）
   ============================================================ */

export type TrainingStatus = "open" | "closed";

export type Training = {
  id: number;
  title: string;
  category: string;
  instructor: string;
  location: string;
  schedule: string;
  capacity: number;
  fee: string;
  detail: string;
  status: TrainingStatus;
  createdAt: number;
};

export type Enrollment = {
  id: number;
  trainingId: number;
  practitionerPhone: string;
  name: string;
  phone: string;
  createdAt: number;
};

type TRow = {
  id: number; title: string | null; category: string | null; instructor: string | null; location: string | null;
  schedule: string | null; capacity: number | null; fee: string | null; detail: string | null; status: string; created_at: number | null;
};
type ERow = { id: number; training_id: number; practitioner_phone: string | null; name: string | null; phone: string | null; created_at: number | null };

function toT(r: TRow): Training {
  return {
    id: r.id, title: r.title ?? "", category: r.category ?? "", instructor: r.instructor ?? "", location: r.location ?? "",
    schedule: r.schedule ?? "", capacity: r.capacity ?? 0, fee: r.fee ?? "", detail: r.detail ?? "",
    status: (r.status as TrainingStatus) ?? "open", createdAt: r.created_at ?? 0,
  };
}
function toE(r: ERow): Enrollment {
  return { id: r.id, trainingId: r.training_id, practitionerPhone: r.practitioner_phone ?? "", name: r.name ?? "", phone: r.phone ?? "", createdAt: r.created_at ?? 0 };
}

export function listOpenTrainings(): Training[] {
  return (getDb().prepare("SELECT * FROM trainings WHERE status='open' ORDER BY created_at DESC").all() as TRow[]).map(toT);
}
export function listTrainings(status?: TrainingStatus): Training[] {
  const db = getDb();
  const rows = (status ? db.prepare("SELECT * FROM trainings WHERE status=? ORDER BY created_at DESC").all(status) : db.prepare("SELECT * FROM trainings ORDER BY created_at DESC").all()) as TRow[];
  return rows.map(toT);
}
export function getTraining(id: number): Training | undefined {
  const r = getDb().prepare("SELECT * FROM trainings WHERE id=?").get(id) as TRow | undefined;
  return r ? toT(r) : undefined;
}
export function createTraining(input: { title: string; category: string; instructor?: string; location?: string; schedule?: string; capacity?: number; fee?: string; detail?: string }): number {
  const info = getDb().prepare(
    "INSERT INTO trainings (title,category,instructor,location,schedule,capacity,fee,detail,status,created_at) VALUES (?,?,?,?,?,?,?,?, 'open', ?)",
  ).run(input.title, input.category, input.instructor ?? "协会", input.location ?? "", input.schedule ?? "", input.capacity ?? 0, input.fee ?? "免费", input.detail ?? "", Date.now());
  return Number(info.lastInsertRowid);
}
export function setTrainingStatus(id: number, status: TrainingStatus) {
  getDb().prepare("UPDATE trainings SET status=? WHERE id=?").run(status, id);
}

/* ---- 报名 ---- */
export function listEnrollmentsByTraining(trainingId: number): Enrollment[] {
  return (getDb().prepare("SELECT * FROM training_enrollments WHERE training_id=? ORDER BY created_at DESC").all(trainingId) as ERow[]).map(toE);
}
export function listEnrollmentsByPractitioner(phone: string): Enrollment[] {
  return (getDb().prepare("SELECT * FROM training_enrollments WHERE practitioner_phone=? ORDER BY created_at DESC").all(phone) as ERow[]).map(toE);
}
export function countEnrolled(trainingId: number): number {
  return (getDb().prepare("SELECT COUNT(*) AS c FROM training_enrollments WHERE training_id=?").get(trainingId) as { c: number }).c;
}
export function hasEnrolled(trainingId: number, phone: string): boolean {
  if (!phone) return false;
  return !!getDb().prepare("SELECT 1 FROM training_enrollments WHERE training_id=? AND practitioner_phone=?").get(trainingId, phone);
}
export function enroll(input: { trainingId: number; phone: string; name: string }): number {
  const info = getDb().prepare(
    "INSERT INTO training_enrollments (training_id,practitioner_phone,name,phone,created_at) VALUES (?,?,?,?,?)",
  ).run(input.trainingId, input.phone, input.name, input.phone, Date.now());
  return Number(info.lastInsertRowid);
}
