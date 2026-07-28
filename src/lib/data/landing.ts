import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCatalogVehicles, type VehicleCardData } from "@/lib/data/vehicles";
import type { LandingPageTypeEnum, VehicleCategoryEnum, FuelTypeEnum } from "@/types/database.types";

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
    const supabase = await createClient();
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
    };
    const vehicles = await getCatalogVehicles({
      category: filterJson.category,
      fuelType: filterJson.fuel_type,
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
