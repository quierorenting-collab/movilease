import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCatalogVehicles, getVehiclesByBrand } from "@/lib/data/vehicles";
import { getPublishedPosts } from "@/lib/data/blog";

export const revalidate = 3600;

/**
 * Antes solo listaba 7 rutas fijas: ninguna de las ~80 fichas de modelo ni de
 * las vistas por marca estaba en el sitemap, así que dependían por completo de
 * que el rastreador las encontrase enlazadas.
 *
 * Las fichas de versión (/[modelo]/[version]) quedan fuera a propósito: se
 * añadirán cuando esa ruta esté publicada.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/catalogo", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/calculadora", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/comparador", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contacto", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/renting-empresas", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/renting-autonomos", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/sobre-nosotros", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/blog", priority: 0.5, changeFrequency: "weekly" as const },
    { path: "/aviso-legal", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/politica-privacidad", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/politica-cookies", priority: 0.2, changeFrequency: "yearly" as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Si Supabase no responde, el sitemap estático sigue sirviéndose igual.
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [vehicles, { brands }, posts] = await Promise.all([
      getCatalogVehicles({}),
      getVehiclesByBrand(),
      getPublishedPosts(200),
    ]);

    const modelSlugs = [...new Set(vehicles.map((v) => v.modelSlug).filter(Boolean))];

    dynamicEntries = [
      ...modelSlugs.map((slug) => ({
        url: `${SITE_URL}/${slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...brands.map((brand) => ({
        url: `${SITE_URL}/catalogo?brand=${encodeURIComponent(brand.brandName.toLowerCase())}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    dynamicEntries = [];
  }

  return [...staticEntries, ...dynamicEntries];
}
