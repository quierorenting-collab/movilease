import "server-only";
import { headers } from "next/headers";

/**
 * Un solo proyecto/base de datos sirve dos dominios: movilease.es (la marca
 * premium, bajo la futura S.L.) y quierorenting.es (marca de captación ya
 * existente). Comparten catálogo y lógica de negocio; solo cambian nombre y
 * descripción según el host de la petición.
 */
export const BRANDS = {
  "movilease.es": {
    name: "MoviLease",
    domain: "movilease.es",
    description:
      "Renting de coches para particulares sin complicaciones. Sin entrada, todo incluido, gestión en 48h.",
  },
  "quierorenting.es": {
    name: "QuieroRenting",
    domain: "quierorenting.es",
    description:
      "Renting de coches para particulares desde 264€/mes. Sin entrada, seguro incluido, gestión en 48h.",
  },
} as const;

export type BrandDomain = keyof typeof BRANDS;
export type Brand = (typeof BRANDS)[BrandDomain];

export const DEFAULT_BRAND_DOMAIN: BrandDomain = "movilease.es";

export function resolveBrand(host: string | null | undefined): Brand {
  if (!host) return BRANDS[DEFAULT_BRAND_DOMAIN];
  const normalized = host.split(":")[0].replace(/^www\./, "").toLowerCase();
  return (BRANDS as Record<string, Brand | undefined>)[normalized] ?? BRANDS[DEFAULT_BRAND_DOMAIN];
}

/** Solo se puede llamar desde Server Components/Actions/Route Handlers. */
export async function getCurrentBrand(): Promise<Brand> {
  const headersList = await headers();
  return resolveBrand(headersList.get("host"));
}
