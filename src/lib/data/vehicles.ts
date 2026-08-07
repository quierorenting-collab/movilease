import "server-only";
import { createClient } from "@/lib/supabase/server";
import { formatPriceFromCents } from "@/lib/utils";
import { getBrandLogoUrl } from "@/lib/brand-logos";
import type {
  EnvironmentalLabelEnum,
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
  /**
   * Precio en céntimos, para filtrar por tope sin reparsear la etiqueta.
   * Opcional: hay orígenes de tarjeta que no lo traen.
   */
  monthlyPriceCents?: number;
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
      monthlyPriceCents: v.monthly_price_cents,
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

export interface VehicleGalleryImage {
  url: string;
  alt: string | null;
}

export interface VehiclePricingRow {
  contractMonths: number;
  annualKm: number;
  monthlyPriceCents: number;
  priceLabel: string;
}

export interface VehicleDetailData {
  id: string;
  version: string;
  versionSlug: string;
  priceLabel: string;
  monthlyPriceCents: number;
  contractMonths: number;
  annualKm: number;
  horsepower: number | null;
  consumptionValue: number | null;
  consumptionUnit: string | null;
  seats: number | null;
  doors: number | null;
  fuelType: FuelTypeEnum;
  transmission: TransmissionEnum;
  category: VehicleCategoryEnum;
  environmentalLabel: EnvironmentalLabelEnum | null;
  colors: string[] | null;
  bodyType: string | null;
  equipment: string[];
  includedServices: string[];
  shortDescription: string | null;
  description: string | null;
  imageUrl: string | null;
  images: VehicleGalleryImage[];
  pricingTiers: VehiclePricingRow[];
}

export interface ModelDetail {
  model: { id: string; name: string; slug: string; description: string | null; coverImageUrl: string | null };
  brandName: string;
  vehicles: VehicleDetailData[];
}

const VEHICLE_DETAIL_COLUMNS =
  "id, version, version_slug, monthly_price_cents, contract_months, annual_km, horsepower, " +
  "consumption_value, consumption_unit, seats, doors, fuel_type, transmission, category, " +
  "environmental_label, colors, body_type, equipment, main_image_url, included_services, " +
  "short_description, description";

type VehicleDetailRow = {
  id: string;
  version: string;
  version_slug: string;
  monthly_price_cents: number;
  contract_months: number;
  annual_km: number;
  horsepower: number | null;
  consumption_value: number | null;
  consumption_unit: string | null;
  seats: number | null;
  doors: number | null;
  fuel_type: FuelTypeEnum;
  transmission: TransmissionEnum;
  category: VehicleCategoryEnum;
  environmental_label: EnvironmentalLabelEnum | null;
  colors: string[] | null;
  body_type: string | null;
  equipment: string[];
  main_image_url: string | null;
  included_services: string[];
  short_description: string | null;
  description: string | null;
};

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
        .select(VEHICLE_DETAIL_COLUMNS)
        .eq("model_id", model.id)
        .eq("is_active", true)
        .order("monthly_price_cents"),
    ]);

    const vehicleRows = (vehicles ?? []) as unknown as VehicleDetailRow[];
    const vehicleIds = vehicleRows.map((v) => v.id);
    const [{ data: images }, { data: pricing }] =
      vehicleIds.length > 0
        ? await Promise.all([
            supabase
              .from("vehicle_images")
              .select("vehicle_id, storage_path, alt_text, sort_order")
              .in("vehicle_id", vehicleIds)
              .order("sort_order"),
            supabase
              .from("vehicle_pricing")
              .select("vehicle_id, contract_months, annual_km, monthly_price_cents")
              .in("vehicle_id", vehicleIds)
              .order("contract_months")
              .order("annual_km"),
          ])
        : [{ data: [] }, { data: [] }];

    const imagesByVehicle = new Map<string, VehicleGalleryImage[]>();
    for (const img of images ?? []) {
      const list = imagesByVehicle.get(img.vehicle_id) ?? [];
      list.push({ url: img.storage_path, alt: img.alt_text });
      imagesByVehicle.set(img.vehicle_id, list);
    }

    const pricingByVehicle = new Map<string, VehiclePricingRow[]>();
    for (const row of pricing ?? []) {
      const list = pricingByVehicle.get(row.vehicle_id) ?? [];
      list.push({
        contractMonths: row.contract_months,
        annualKm: row.annual_km,
        monthlyPriceCents: row.monthly_price_cents,
        priceLabel: formatPriceFromCents(row.monthly_price_cents),
      });
      pricingByVehicle.set(row.vehicle_id, list);
    }

    return {
      model: {
        id: model.id,
        name: model.name,
        slug: model.slug,
        description: model.description,
        coverImageUrl: model.cover_image_url,
      },
      brandName: brand?.name ?? "",
      // La version con ficha completa (galeria real) encabeza la pagina del
      // modelo aunque no sea la mas barata; entre versiones igual de
      // completas, gana la mas barata.
      vehicles: [...vehicleRows]
        .sort((a, b) => {
          const aHasGallery = (imagesByVehicle.get(a.id) ?? []).length > 0;
          const bHasGallery = (imagesByVehicle.get(b.id) ?? []).length > 0;
          if (aHasGallery !== bHasGallery) return aHasGallery ? -1 : 1;
          return a.monthly_price_cents - b.monthly_price_cents;
        })
        .map((v) => {
          const gallery = imagesByVehicle.get(v.id) ?? [];
          return {
            id: v.id,
            version: v.version,
            versionSlug: v.version_slug,
            priceLabel: formatPriceFromCents(v.monthly_price_cents),
            monthlyPriceCents: v.monthly_price_cents,
            contractMonths: v.contract_months,
            annualKm: v.annual_km,
            horsepower: v.horsepower,
            consumptionValue: v.consumption_value,
            consumptionUnit: v.consumption_unit,
            seats: v.seats,
            doors: v.doors,
            fuelType: v.fuel_type,
            transmission: v.transmission,
            category: v.category,
            environmentalLabel: v.environmental_label,
            colors: v.colors,
            bodyType: v.body_type,
            equipment: v.equipment,
            includedServices: v.included_services,
            shortDescription: v.short_description,
            description: v.description,
            imageUrl: v.main_image_url,
            images: gallery.length > 0 ? gallery : v.main_image_url ? [{ url: v.main_image_url, alt: null }] : [],
            pricingTiers: pricingByVehicle.get(v.id) ?? [],
          };
        }),
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

export interface BrandSummary {
  brandName: string;
  vehicleCount: number;
  cheapestPriceLabel: string;
  featuredImageUrl: string | null;
  logoUrl: string | null;
  isPremium: boolean;
}

export interface VehiclesByBrand {
  brands: BrandSummary[];
  vehiclesByBrand: Record<string, VehicleCardData[]>;
}

const PREMIUM_BRANDS = new Set(["BMW", "Mercedes", "Audi", "Tesla", "Volvo", "Lexus", "Porsche"]);

export async function getVehiclesByBrand(): Promise<VehiclesByBrand> {
  const all = await getCatalogVehicles({});

  const map: Record<string, VehicleCardData[]> = {};
  for (const v of all) {
    if (!v.brandName) continue;
    if (!map[v.brandName]) map[v.brandName] = [];
    map[v.brandName].push(v);
  }

  const brands: BrandSummary[] = Object.entries(map)
    .map(([name, vehicles]) => ({
      brandName: name,
      vehicleCount: vehicles.length,
      cheapestPriceLabel: vehicles[0]?.priceLabel ?? "",
      featuredImageUrl: vehicles.find((v) => v.imageUrl)?.imageUrl ?? null,
      logoUrl: getBrandLogoUrl(name),
      isPremium: PREMIUM_BRANDS.has(name),
    }))
    .sort((a, b) => a.brandName.localeCompare(b.brandName));

  return { brands, vehiclesByBrand: map };
}

/**
 * Otros modelos de la misma marca, para enlazar desde una ficha.
 *
 * La ficha no enlazaba a ningún modelo de su propia marca: quien entraba
 * buscando "renting seat ibiza" no tenía forma de llegar al resto de SEAT sin
 * volver al catálogo, y el rastreador tampoco.
 */
export async function getSameBrandModels(
  brandName: string,
  excludeSlug: string,
  limit = 4
): Promise<VehicleCardData[]> {
  try {
    const { vehiclesByBrand } = await getVehiclesByBrand();
    const delaMarca = vehiclesByBrand[brandName] ?? [];

    const vistos = new Set<string>([excludeSlug]);
    const unicos: VehicleCardData[] = [];
    for (const v of delaMarca) {
      if (!v.modelSlug || vistos.has(v.modelSlug)) continue;
      vistos.add(v.modelSlug);
      unicos.push(v);
      if (unicos.length >= limit) break;
    }
    return unicos;
  } catch {
    return [];
  }
}

/** Nombre real de la marca a partir del slug en minúsculas (SEAT, no Seat). */
export async function getBrandDisplayName(slugMinusculas: string): Promise<string | null> {
  try {
    const { brands } = await getVehiclesByBrand();
    return brands.find((b) => b.brandName.toLowerCase() === slugMinusculas)?.brandName ?? null;
  } catch {
    return null;
  }
}
