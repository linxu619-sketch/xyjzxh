import "server-only";
import { ENTERPRISES, type Enterprise } from "./enterprises";
import { getSupabaseAdmin, getSupabaseAnon } from "@/lib/supabase/server";

/* ============================================================
   企业数据源切换器
   ------------------------------------------------------------
   优先 Supabase（如已配置且 enterprises 表存在），否则用 mock。
   失败时静默回退 mock，保证 UI 不崩溃。
   ============================================================ */

type Row = {
  id: string;
  slug: string;
  name: string;
  category: string;
  district: string | null;
  founded: number | null;
  staff_size: string | null;
  qualification: string[] | null;
  tags: string[] | null;
  short: string | null;
  hero: { brand?: string; tagline?: string } | null;
  contact: { tel?: string; addr?: string } | null;
  rating: number | null;
  reviews: number | null;
  cases: number | null;
  verified: boolean | null;
  featured: boolean | null;
};

function rowToEnterprise(r: Row): Enterprise {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category as Enterprise["category"],
    district: r.district ?? "",
    rating: Number(r.rating ?? 0),
    reviews: r.reviews ?? 0,
    cases: r.cases ?? 0,
    founded: r.founded ?? 0,
    staff: r.staff_size ?? "—",
    qualification: r.qualification ?? [],
    tags: r.tags ?? [],
    short: r.short ?? "",
    hero: {
      brand: r.hero?.brand ?? r.name,
      tagline: r.hero?.tagline ?? "",
    },
    contact: {
      tel: r.contact?.tel ?? "",
      addr: r.contact?.addr ?? "",
    },
    verified: !!r.verified,
    featured: r.featured ?? false,
    color: r.category as "build" | "decor" | "design",
  };
}

let lastSource: "supabase" | "mock" = "mock";

export function lastDataSource() {
  return lastSource;
}

export async function getEnterprises(): Promise<Enterprise[]> {
  const client = (await getSupabaseAnon()) ?? (await getSupabaseAdmin());
  if (!client) {
    lastSource = "mock";
    return ENTERPRISES;
  }
  try {
    const { data, error } = await client
      .from("enterprises")
      .select("id,slug,name,category,district,founded,staff_size,qualification,tags,short,hero,contact,rating,reviews,cases,verified,featured")
      .eq("status", "active");
    if (error || !data) {
      lastSource = "mock";
      return ENTERPRISES;
    }
    lastSource = "supabase";
    return (data as Row[]).map(rowToEnterprise);
  } catch {
    lastSource = "mock";
    return ENTERPRISES;
  }
}

export async function getEnterpriseBySlugOrId(key: string): Promise<Enterprise | undefined> {
  const client = (await getSupabaseAnon()) ?? (await getSupabaseAdmin());
  if (!client) {
    lastSource = "mock";
    return ENTERPRISES.find((e) => e.slug === key || e.id === key);
  }
  try {
    const { data, error } = await client
      .from("enterprises")
      .select("id,slug,name,category,district,founded,staff_size,qualification,tags,short,hero,contact,rating,reviews,cases,verified,featured")
      .or(`slug.eq.${key},id.eq.${key}`)
      .maybeSingle();
    if (error || !data) {
      lastSource = "mock";
      return ENTERPRISES.find((e) => e.slug === key || e.id === key);
    }
    lastSource = "supabase";
    return rowToEnterprise(data as Row);
  } catch {
    lastSource = "mock";
    return ENTERPRISES.find((e) => e.slug === key || e.id === key);
  }
}
