import "server-only";
import { createPublicClient } from "@/lib/supabase/server";
import { getCatalogVehicles, type VehicleCardData } from "@/lib/data/vehicles";
import type {
  LandingPageTypeEnum,
  VehicleCategoryEnum,
  FuelTypeEnum,
  TransmissionEnum,
} from "@/types/database.types";

export interface LandingPageDetail {
  type: LandingPageTypeEnum;
  title: string;
  h1: string;
  introContent: string | null;
  metaDescription: string | null;
  faq: { question: string; answer: string }[];
  vehicles: VehicleCardData[];
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPageDetail | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("landing_pages")
      .select("type, title, h1, intro_content, meta_description, faq, filter_json")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (!data) return null;

    const filterJson = (data.filter_json ?? {}) as {
      category?: VehicleCategoryEnum;
      fuel_type?: FuelTypeEnum;
      transmission?: TransmissionEnum;
    };
    const vehicles = await getCatalogVehicles({
      category: filterJson.category,
      fuelType: filterJson.fuel_type,
      transmission: filterJson.transmission,
    });

    return {
      type: data.type,
      title: data.title,
      h1: data.h1,
      introContent: data.intro_content,
      metaDescription: data.meta_description,
      faq: (data.faq as { question: string; answer: string }[]) ?? [],
      vehicles,
    };
  } catch {
    return null;
  }
}

/** Slugs de landings activas, para el sitemap. Como el resto de la capa de
 *  datos, nunca lanza: si Supabase falla el sitemap sale sin ellas. */
export async function getActiveLandingSlugs(): Promise<string[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("landing_pages")
      .select("slug")
      .eq("is_active", true);
    return (data ?? []).map((l) => l.slug);
  } catch {
    return [];
  }
}

/** Landings activas separadas por tipo, para los bloques de enlaces del pie. */
export async function getFooterLandings(): Promise<{
  categorias: { slug: string; title: string }[];
  ciudades: { slug: string; title: string }[];
}> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("landing_pages")
      .select("slug, title, type")
      .eq("is_active", true)
      .order("slug");
    const filas = data ?? [];
    return {
      categorias: filas.filter((l) => l.type === "category").map(({ slug, title }) => ({ slug, title })),
      ciudades: filas.filter((l) => l.type === "city").map(({ slug, title }) => ({ slug, title })),
    };
  } catch {
    return { categorias: [], ciudades: [] };
  }
}
