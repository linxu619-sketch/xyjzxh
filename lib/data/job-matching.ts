import "server-only";
import type { Job } from "@/lib/data/jobs";
import { normalizeProfession } from "@/lib/data/professions";

/* 从业者 ↔ 岗位 双向匹配
   硬条件（决定"适配"）：工种、年龄、经验、工资下限；区域为软加分。
   设计目标：彼此不做无用功——只把从业者能做、够格、够价的岗位标为适配，
   不适配的也给出"差在哪"，便于从业者权衡或完善资料。 */

export type MatchInput = {
  canKinds: string[];
  canDistricts: string[];
  birthYear: number | null;
  expectDaily: number | null;     // 期望日薪下限
  expectDailyMax: number | null;  // 期望日薪上限（null=不封顶）
  years: number;
  city: string;
  gender: string;
  hasCert: boolean | null;
};

export type JobMatch = {
  job: Job;
  suitable: boolean;   // 硬条件全过
  score: number;       // 排序分（越大越靠前）
  reasons: string[];   // ✓ 命中点
  gaps: string[];      // ✗ 不符点 / 待完善
};

export function evalJob(p: MatchInput, job: Job): JobMatch {
  const reasons: string[] = [];
  const gaps: string[] = [];
  let suitable = true;
  let score = 0;

  // 1) 工种（硬）
  const jobKind = normalizeProfession(job.kind);
  const myKinds = p.canKinds.map(normalizeProfession);
  const kindHit = jobKind ? myKinds.includes(jobKind) : true;
  if (kindHit) { reasons.push("工种符"); score += 20; }
  else { suitable = false; gaps.push(`招${job.kind}`); }

  // 2) 年龄（硬；岗位填了才卡。从业者没填出生年→不卡，只提示完善）
  if (job.minAge || job.maxAge) {
    if (p.birthYear && p.birthYear > 1900) {
      const age = new Date().getFullYear() - p.birthYear;
      const lo = job.minAge ?? 0, hi = job.maxAge ?? 200;
      if (age >= lo && age <= hi) reasons.push("年龄符");
      else { suitable = false; gaps.push(`年龄要 ${lo}-${hi}（你${age}）`); }
    } else {
      gaps.push("补出生年更准");
    }
  }

  // 3) 经验（硬）
  if (job.minYears > 0) {
    if (p.years >= job.minYears) reasons.push("经验达标");
    else { suitable = false; gaps.push(`需${job.minYears}年经验`); }
  }

  // 4) 工资（双方日薪范围求交集：有重叠才推）
  if (p.expectDaily || p.expectDailyMax) {
    const pLo = p.expectDaily ?? 0;
    const pHi = p.expectDailyMax ?? Infinity;
    const jLo = job.daily;
    const jHi = job.dailyMax ?? job.daily;
    if (pLo <= jHi && jLo <= pHi) { reasons.push("薪资匹配"); score += Math.min(jHi / 25, 15); }
    else {
      suitable = false;
      if (jHi < pLo) gaps.push(`薪资不足你期望¥${pLo}起`);
      else gaps.push(`薪资高于你期望上限¥${pHi}`);
    }
  }

  // 5) 性别（硬；岗位指定才卡。从业者没填→不卡，提示完善）
  if (job.genderReq) {
    if (p.gender) {
      if (p.gender === job.genderReq) reasons.push("性别符");
      else { suitable = false; gaps.push(`限${job.genderReq}`); }
    } else gaps.push("补性别更准");
  }

  // 6) 持证（硬；岗位要求才卡。明确无证→不推，未填→不卡只提示）
  if (job.needCert) {
    if (p.hasCert === true) reasons.push("持证");
    else if (p.hasCert === false) { suitable = false; gaps.push("需持证"); }
    else gaps.push("需持证·补证书");
  }

  // 7) 区域（软加分）
  const jobDist = (job.district ?? "").trim();
  if (jobDist && (p.canDistricts.includes(jobDist) || p.city === jobDist)) { reasons.push("同区"); score += 30; }

  // 排序加权
  if (job.urgent) score += 12;
  score += Math.min(job.daily / 60, 25);

  return { job, suitable, score, reasons, gaps };
}

export function matchJobs(p: MatchInput, jobs: Job[]): { matched: JobMatch[]; others: JobMatch[] } {
  const all = jobs.map((j) => evalJob(p, j));
  const matched = all.filter((m) => m.suitable).sort((a, b) => b.score - a.score);
  const others = all.filter((m) => !m.suitable).sort((a, b) => b.score - a.score);
  return { matched, others };
}

// 从 Practitioner 记录抽取匹配输入（容错：缺字段走回退）
export function toMatchInput(p: {
  canKinds: string[]; canDistricts: string[]; birthYear: number | null; expectDaily: number | null; expectDailyMax?: number | null; years: number; city: string;
  gender?: string; hasCert?: boolean | null;
}): MatchInput {
  return {
    canKinds: p.canKinds ?? [],
    canDistricts: p.canDistricts ?? [],
    birthYear: p.birthYear ?? null,
    expectDaily: p.expectDaily ?? null,
    expectDailyMax: p.expectDailyMax ?? null,
    years: p.years ?? 0,
    city: p.city ?? "",
    gender: p.gender ?? "",
    hasCert: p.hasCert ?? null,
  };
}
