import "server-only";
import { createClient } from "@/lib/supabase/server";
import { formatPriceFromCents } from "@/lib/utils";
import type {
  FuelTypeEnum,
  TransmissionEnum,
  VehicleCategoryEnum,
} from "@/types/database.types";

export interface VehicleCardData {
  id: string;
  brandName: string;
  modelName: string;
  modelSlug: string;
  version: string;
  priceLabel: string;
  imageUrl: string | null;
  category: VehicleCategoryEnum;
  fuelType: FuelTypeEnum;
  transmission: TransmissionEnum;
  badgeText: string | null;
  isOffer: boolean;
}

const CARD_COLUMNS =
  "id, model_id, version, monthly_price_cents, main_image_url, category, fuel_type, transmission, badge_text, is_offer";

type CardRow = {
  id: string;
  model_id: string;
  version: string;
  monthly_price_cents: number;
  main_image_url: string | null;
  category: VehicleCategoryEnum;
  fuel_type: FuelTypeEnum;
  transmission: TransmissionEnum;
  badge_text: string | null;
  is_offer: boolean;
};

/**
 * Los embeds de PostgREST (`models(...)`) necesitan metadatos de
 * `Relationships` que nuestro Database escrito a mano no tiene todavía (ver
 * nota en database.types.ts). Por eso resolvemos marca/modelo con dos
 * consultas planas + join en memoria, en vez de un select anidado.
 */
async function attachModelsAndBrands(vehicles: CardRow[]): Promise<VehicleCardData[]> {
  if (vehicles.length === 0) return [];
  const supabase = await createClient();

  const modelIds = [...new Set(vehicles.map((v) => v.model_id))];
  const { data: models } = await supabase
    .from("models")
    .select("id, name, slug, brand_id")
    .in("id", modelIds);

  const brandIds = [...new Set((models ?? []).map((m) => m.brand_id))];
  const { data: brands } = await supabase.from("brands").select("id, name").in("id", brandIds);

  const modelsById = new Map((models ?? []).map((m) => [m.id, m]));
  const brandsById = new Map((brands ?? []).map((b) => [b.id, b]));

  return vehicles.map((v) => {
    const model = modelsById.get(v.model_id);
    const brand = model ? brandsById.get(model.brand_id) : undefined;
    return {
      id: v.id,
      brandName: brand?.name ?? "",
      modelName: model?.name ?? "",
      modelSlug: model?.slug ?? "",
      version: v.version,
      priceLabel: formatPriceFromCents(v.monthly_price_cents),
      imageUrl: v.main_image_url,
      category: v.category,
      fuelType: v.fuel_type,
      transmission: v.transmission,
      badgeText: v.badge_text,
      isOffer: v.is_offer,
    };
  });
}

export async function getVehiclesByIds(ids: string[]): Promise<VehicleCardData[]> {
  if (ids.length === 0) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select(CARD_COLUMNS)
      .eq("is_active", true)
      .in("id", ids);

    if (error || !data) return [];
    return attachModelsAndBrands(data as CardRow[]);
  } catch {
    return [];
  }
}

export interface ComparisonVehicle {
  id: string;
  brandName: string;
  modelName: string;
  modelSlug: string;
  version: string;
  imageUrl: string | null;
  priceLabel: string;
  category: VehicleCategoryEnum;
  fuelType: FuelTypeEnum;
  transmission: TransmissionEnum;
  horsepower: number | null;
  consumptionValue: number | null;
  consumptionUnit: string | null;
  seats: number | null;
  doors: number | null;
  includedServices: string[];
}

export async function getComparisonVehicles(ids: string[]): Promise<ComparisonVehicle[]> {
  if (ids.length === 0) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select(
        "id, model_id, version, monthly_price_cents, main_image_url, category, fuel_type, transmission, horsepower, consumption_value, consumption_unit, seats, doors, included_services"
      )
      .eq("is_active", true)
      .in("id", ids);

    if (error || !data) return [];

    const modelIds = [...new Set(data.map((v) => v.model_id))];
    const { data: models } = await supabase
      .from("models")
      .select("id, name, slug, brand_id")
      .in("id", modelIds);
    const brandIds = [...new Set((models ?? []).map((m) => m.brand_id))];
    const { data: brands } = await supabase.from("brands").select("id, name").in("id", brandIds);
    const modelsById = new Map((models ?? []).map((m) => [m.id, m]));
    const brandsById = new Map((brands ?? []).map((b) => [b.id, b]));

    return data.map((v) => {
      const model = modelsById.get(v.model_id);
      const brand = model ? brandsById.get(model.brand_id) : undefined;
      return {
        id: v.id,
        brandName: brand?.name ?? "",
        modelName: model?.name ?? "",
        modelSlug: model?.slug ?? "",
        version: v.version,
        imageUrl: v.main_image_url,
        priceLabel: formatPriceFromCents(v.monthly_price_cents),
        category: v.category,
        fuelType: v.fuel_type,
        transmission: v.transmission,
        horsepower: v.horsepower,
        consumptionValue: v.consumption_value,
        consumptionUnit: v.consumption_unit,
        seats: v.seats,
        doors: v.doors,
        includedServices: v.included_services,
      };
    });
  } catch {
    return [];
  }
}

/** Nunca lanza: si Supabase no está configurado todavía, devuelve []. */
export async function getOfferVehicles(limit = 8): Promise<VehicleCardData[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select(CARD_COLUMNS)
      .eq("is_active", true)
      .eq("is_offer", true)
      .order("monthly_price_cents")
      .limit(limit);
    if (error || !data) return [];
    return attachModelsAndBrands(data as CardRow[]);
  } catch {
    return [];
  }
}

export async function getFeaturedVehicles(limit = 6): Promise<VehicleCardData[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vehicles")
      .select(CARD_COLUMNS)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("monthly_price_cents")
      .limit(limit);

    if (error || !data) return [];
    return attachModelsAndBrands(data as CardRow[]);
  } catch {
    return [];
  }
}

export interface CatalogFilters {
  category?: VehicleCategoryEnum;
  fuelType?: FuelTypeEnum;
  maxPriceEuros?: number;
}

export interface ModelDetail {
  model: { id: string; name: string; slug: string; description: string | null; coverImageUrl: string | null };
  brandName: string;
  vehicles: {
    id: string;
    version: string;
    versionSlug: string;
    priceLabel: string;
    monthlyPriceCents: number;
    horsepower: number | null;
    consumptionValue: number | null;
    consumptionUnit: string | null;
    seats: number | null;
    fuelType: FuelTypeEnum;
    transmission: TransmissionEnum;
    imageUrl: string | null;
    includedServices: string[];
  }[];
}

export async function getModelBySlugWithVehicles(slug: string): Promise<ModelDetail | null> {
  try {
    const supabase = await createClient();
    const { data: model } = await supabase
      .from("models")
      .select("id, name, slug, description, cover_image_url, brand_id")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (!model) return null;

    const [{ data: brand }, { data: vehicles }] = await Promise.all([
      supabase.from("brands").select("name").eq("id", model.brand_id).maybeSingle(),
      supabase
        .from("vehicles")
        .select(
          "id, version, version_slug, monthly_price_cents, horsepower, consumption_value, consumption_unit, seats, fuel_type, transmission, main_image_url, included_services"
        )
        .eq("model_id", model.id)
        .eq("is_active", true)
        .order("monthly_price_cents"),
    ]);

    return {
      model: {
        id: model.id,
        name: model.name,
        slug: model.slug,
        description: model.description,
        coverImageUrl: model.cover_image_url,
      },
      brandName: brand?.name ?? "",
      vehicles: (vehicles ?? []).map((v) => ({
        id: v.id,
        version: v.version,
        versionSlug: v.version_slug,
        priceLabel: formatPriceFromCents(v.monthly_price_cents),
        monthlyPriceCents: v.monthly_price_cents,
        horsepower: v.horsepower,
        consumptionValue: v.consumption_value,
        consumptionUnit: v.consumption_unit,
        seats: v.seats,
        fuelType: v.fuel_type,
        transmission: v.transmission,
        imageUrl: v.main_image_url,
        includedServices: v.included_services,
      })),
    };
  } catch {
    return null;
  }
}

export async function getCatalogVehicles(filters: CatalogFilters = {}): Promise<VehicleCardData[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("vehicles").select(CARD_COLUMNS).eq("is_active", true);

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.fuelType) query = query.eq("fuel_type", filters.fuelType);
    if (filters.maxPriceEuros) {
      query = query.lte("monthly_price_cents", filters.maxPriceEuros * 100);
    }

    const { data, error } = await query.order("monthly_price_cents").limit(300);
    if (error || !data) return [];
    return attachModelsAndBrands(data as CardRow[]);
  } catch {
    return [];
  }
}
