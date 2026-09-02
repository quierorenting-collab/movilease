import { NextResponse } from "next/server";
import { z } from "zod";
import { getCatalogVehicles } from "@/lib/data/vehicles";

/**
 * Coches del catálogo real que encajan con lo que el visitante ha elegido a
 * botonazos en el asesor.
 *
 * Existe como ruta de API y no como consulta directa desde el widget porque
 * `src/lib/data/vehicles.ts` es `server-only`: el widget es un componente de
 * cliente y no puede importarlo. Es el mismo patrón que
 * `api/favorites/resolve`.
 *
 * Aquí no se inventa nada: se consulta el catálogo y se devuelve lo que haya.
 * Si no hay coches que encajen, se devuelve la lista vacía y el widget ofrece
 * ensanchar la búsqueda o hablar por WhatsApp.
 */

const esquema = z.object({
  maxPriceEuros: z.number().int().positive().max(5000).optional(),
  category: z.enum(["turismo", "suv", "hibrido", "furgoneta", "4x4", "diesel"]).optional(),
  fuelType: z.enum(["gasolina", "hibrido", "electrico", "diesel", "phev"]).optional(),
  transmission: z.enum(["manual", "automatico"]).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = esquema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Filtros no válidos" }, { status: 400 });
  }

  const vehiculos = await getCatalogVehicles(parsed.data);

  // getCatalogVehicles devuelve una fila por VERSIÓN, así que el mismo modelo
  // puede venir dos o tres veces con distinto acabado. Enseñar "SEAT Ibiza"
  // tres veces como si fueran tres opciones distintas queda fatal, así que se
  // deduplica por modelo quedándose con la versión más barata — que es la que
  // llega primero, porque la consulta ordena por cuota ascendente.
  const vistos = new Set<string>();
  const sugerencias = vehiculos
    .filter((v) => {
      if (!v.modelSlug || vistos.has(v.modelSlug)) return false;
      vistos.add(v.modelSlug);
      return true;
    })
    .slice(0, 3)
    .map((v) => ({
      id: v.id,
      modelSlug: v.modelSlug,
      titulo: `${v.brandName} ${v.modelName}`,
      version: v.version,
      precio: v.priceLabel,
      imagen: v.imageUrl,
    }));

  return NextResponse.json({ ok: true, total: vehiculos.length, sugerencias });
}
