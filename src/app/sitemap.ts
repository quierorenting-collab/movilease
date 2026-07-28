import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/**
 * Sitemap estático de las páginas fijas, sobre el dominio canónico
 * (SITE_URL). Las URLs dinámicas (vehículos, categorías, ciudades, blog) y un
 * sitemap propio por dominio (movilease.es / quierorenting.es) se resuelven
 * en la Fase 5 junto al resto de SEO avanzado.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/catalogo", "/comparador", "/calculadora", "/blog", "/contacto", "/sobre-nosotros"];

  return staticPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
