import "server-only";
import { createPublicClient } from "@/lib/supabase/server";
import {
  getCatalogVehicles,
  getVehiclesByBrand,
  getVehiclesByModelSlugs,
  type VehicleCardData,
} from "@/lib/data/vehicles";
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
      fuel_type?: FuelTypeEnum | FuelTypeEnum[];
      transmission?: TransmissionEnum;
      model_slugs?: string[];
      brand?: string;
    };
    /* Landing de marca: sus coches salen de la misma consulta que el menú y el
       pie (getVehiclesByBrand, cacheada por render), no de una nueva. Una marca
       sin coches activos da 404, igual que un modelo sin coches: una página
       «Renting Škoda» sin un Škoda es justo lo que no puede encontrarse quien
       llega desde Google. La fila no se toca y vuelve sola con el stock. */
    if (filterJson.brand) {
      const deLaMarca = (await getVehiclesByBrand()).vehiclesByBrand[filterJson.brand] ?? [];
      if (!deLaMarca.length) return null;
      /* Una tarjeta por modelo, la de su versión más barata (llegan ordenadas
         por cuota), como en la vista de marca del catálogo: dos Kamiq o dos
         Octavia seguidos hacen dudar a quien compara. Las demás versiones
         están en la ficha de cada modelo. */
      const vistos = new Set<string>();
      const unoPorModelo = deLaMarca.filter((v) => {
        if (vistos.has(v.modelSlug)) return false;
        vistos.add(v.modelSlug);
        return true;
      });
      return {
        type: data.type,
        title: data.title,
        h1: data.h1,
        introContent: data.intro_content,
        metaDescription: data.meta_description,
        faq: (data.faq as { question: string; answer: string }[]) ?? [],
        vehicles: unoPorModelo,
      };
    }
    /* Una lista de modelos escrita a mano es el único filtro posible cuando lo
       que agrupa a esos coches no está en ninguna columna: la entrega en 5-15
       días la marca el proveedor, no el vehículo. Sale de la misma constante
       que usa la portada, así que las dos listas no se pueden desincronizar. */
    const vehicles = filterJson.model_slugs?.length
      ? await getVehiclesByModelSlugs(filterJson.model_slugs)
      : await getCatalogVehicles({
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
  return (await getActiveLandings()).map((l) => l.slug);
}

/** Igual, pero con la fecha del último cambio para el lastmod del sitemap, y
 *  la marca en las landings de marca: el sitemap deja fuera la de una marca
 *  que se ha quedado sin coches, porque esa landing responde 404. */
export async function getActiveLandings(): Promise<
  { slug: string; updatedAt: string | null; brand: string | null }[]
> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("landing_pages")
      .select("slug, updated_at, created_at, filter_json")
      .eq("is_active", true);
    return (data ?? []).map((l) => ({
      slug: l.slug,
      updatedAt: l.updated_at ?? l.created_at ?? null,
      brand: (l.filter_json as { brand?: string } | null)?.brand ?? null,
    }));
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
      .select("slug, title, type, filter_json")
      .eq("is_active", true)
      .order("slug");
    const filas = data ?? [];
    /* Las de marca son filas de tipo "category" (el enum de la base no tiene
       otro valor y cambiarlo pide una migración), pero no son categorías: el
       pie ya las enlaza en su bloque de marcas. */
    const esDeMarca = (l: { filter_json: unknown }) =>
      Boolean((l.filter_json as { brand?: string } | null)?.brand);
    return {
      categorias: filas
        .filter((l) => l.type === "category" && !esDeMarca(l))
        .map(({ slug, title }) => ({ slug, title })),
      ciudades: filas.filter((l) => l.type === "city").map(({ slug, title }) => ({ slug, title })),
    };
  } catch {
    return { categorias: [], ciudades: [] };
  }
}

/**
 * Landings de categoría con su filtro, para enlazarlas desde cada ficha. Solo
 * las que filtran algo: /renting-barato no tiene filtro y encajaría con todos.
 */
export interface CategoryLanding {
  slug: string;
  title: string;
  category?: VehicleCategoryEnum;
  fuelTypes?: FuelTypeEnum[];
  transmission?: TransmissionEnum;
}

export async function getCategoryLandings(): Promise<CategoryLanding[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("landing_pages")
      .select("slug, title, filter_json")
      .eq("is_active", true)
      .eq("type", "category")
      .order("slug");
    return (data ?? []).flatMap((l) => {
      const f = (l.filter_json ?? {}) as {
        category?: VehicleCategoryEnum;
        fuel_type?: FuelTypeEnum | FuelTypeEnum[];
        transmission?: TransmissionEnum;
      };
      if (!f.category && !f.fuel_type && !f.transmission) return [];  // sin filtro encajaría con todos
      return [
        {
          slug: l.slug,
          title: l.title,
          category: f.category,
          fuelTypes: f.fuel_type ? (Array.isArray(f.fuel_type) ? f.fuel_type : [f.fuel_type]) : undefined,
          transmission: f.transmission,
        },
      ];
    });
  } catch {
    return [];
  }
}

/** Las landings en las que sale al menos una versión del modelo. */
export function landingsDelModelo(
  landings: CategoryLanding[],
  versiones: { category: VehicleCategoryEnum; fuelType: FuelTypeEnum; transmission: TransmissionEnum }[]
): CategoryLanding[] {
  return landings.filter((l) =>
    versiones.some(
      (v) =>
        (!l.category || l.category === v.category) &&
        (!l.fuelTypes || l.fuelTypes.includes(v.fuelType)) &&
        (!l.transmission || l.transmission === v.transmission)
    )
  );
}
