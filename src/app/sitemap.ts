import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import {
  getCatalogVehicles,
  getVehiclesByBrand,
  getModelLastModified,
} from "@/lib/data/vehicles";
import { getPublishedPosts } from "@/lib/data/blog";
import { getActiveLandings } from "@/lib/data/landing";

export const revalidate = 3600;

/**
 * Antes solo listaba 7 rutas fijas: ninguna de las ~80 fichas de modelo ni de
 * las vistas por marca estaba en el sitemap, así que dependían por completo de
 * que el rastreador las encontrase enlazadas.
 *
 * Las fichas de versión (/[modelo]/[version]) quedan fuera a propósito: se
 * añadirán cuando esa ruta esté publicada.
 *
 * 18/09/2026 — el lastmod dice la verdad o no se pone. Hasta hoy, 113 de las
 * 122 direcciones llevaban la hora en que se generó el fichero, que con
 * revalidate de una hora se renovaba sola aunque no se tocase un coche: un
 * sitemap que dice que todo cambió hace un rato es un sitemap cuyo lastmod
 * Google acaba ignorando, también en las pocas que sí decían la verdad. Ahora
 * las fichas, las landings y los artículos llevan su fecha real, y las páginas
 * fijas —que no tienen fecha en ninguna tabla— salen sin el campo, que es
 * opcional.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/catalogo", priority: 0.9, changeFrequency: "daily" as const },
    /* /asesor no va aqui: son 55 palabras y una conversacion; la pagina se
       declara noIndex. Ofrecer a Google una pagina sin contenido propio solo
       reparte peor el rastreo del resto. */
    { path: "/calculadora", priority: 0.7, changeFrequency: "monthly" as const },
    /* /comparador y /favoritos tampoco: dependen del localStorage del visitante
       y no tienen contenido propio que indexar. Se declaran noIndex y SÍ son
       rastreables desde el 18/09/2026, para que Google pueda leer ese noindex.
       Mismo criterio que /asesor. */
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
    changeFrequency,
    priority,
  }));

  // Si Supabase no responde, el sitemap estático sigue sirviéndose igual.
  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [vehicles, { brands }, posts, landings, fechas] = await Promise.all([
      getCatalogVehicles({}),
      getVehiclesByBrand(),
      getPublishedPosts(200),
      getActiveLandings(),
      getModelLastModified(),
    ]);

    const modelSlugs = [...new Set(vehicles.map((v) => v.modelSlug).filter(Boolean))];
    /* La vista de una marca cambia cuando cambia cualquiera de sus coches. */
    const fechaDeMarca = (brandName: string) => {
      const suyos = vehicles.filter((v) => v.brandName === brandName);
      const fechasMarca = suyos.map((v) => fechas.get(v.modelSlug)).filter(Boolean) as Date[];
      return fechasMarca.length
        ? new Date(Math.max(...fechasMarca.map((f) => f.getTime())))
        : undefined;
    };

    dynamicEntries = [
      ...modelSlugs.map((slug) => ({
        url: `${SITE_URL}/${slug}`,
        lastModified: fechas.get(slug),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt
          ? new Date(post.updatedAt)
          : post.publishedAt
            ? new Date(post.publishedAt)
            : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      // Las landings de categoria y ciudad son paginas indexables por derecho
      // propio: sin esta linea existen pero Google no las descubre.
      ...landings.map((l) => ({
        url: `${SITE_URL}/${l.slug}`,
        lastModified: l.updatedAt ? new Date(l.updatedAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
      ...brands.map((brand) => ({
        url: `${SITE_URL}/catalogo?brand=${encodeURIComponent(brand.brandName.toLowerCase())}`,
        lastModified: fechaDeMarca(brand.brandName),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    dynamicEntries = [];
  }

  return [...staticEntries, ...dynamicEntries];
}
