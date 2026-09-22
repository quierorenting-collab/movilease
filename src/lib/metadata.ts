import type { Metadata } from "next";
import { SITE_URL, COMPANY } from "@/lib/constants";

/* «Movilease Renting» y no «MoviLease»: a secas coincide con una empresa
   francesa cerrada con la que Google nos confundía. Son 8 caracteres más, así
   que algunos títulos largos pierden la marca antes (ver elegirTitulo). */
const SUFIJO_MARCA = ` | ${COMPANY.name}`;
const LARGO_TITULO = 60;

/**
 * Elige el título que cabe en los ~60 caracteres que enseña Google. Prueba cada
 * candidato con « | Movilease Renting» detrás y, si no cabe, sin él: en una marca que
 * nadie busca todavía pesa más conservar «sin entrada» o el precio que el
 * nombre de la web. Si ninguno cabe, se queda el último, que debe ser el corto.
 */
function elegirTitulo(candidatos: string[]): { texto: string; conMarca: boolean } {
  for (const c of candidatos) {
    if (c.length + SUFIJO_MARCA.length <= LARGO_TITULO) return { texto: c, conMarca: true };
    if (c.length <= LARGO_TITULO) return { texto: c, conMarca: false };
  }
  return { texto: candidatos[candidatos.length - 1], conMarca: false };
}

/**
 * Helper de metadatos por página. Antes ninguna página declaraba canonical ni
 * Open Graph: al compartir un enlace por WhatsApp — el canal principal del
 * negocio — no salía ni título ni imagen, y las variantes con querystring
 * (?brand=…) competían entre sí en el índice.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
  noIndex,
  article,
}: {
  /** Uno o varios títulos, del preferido al más corto (ver elegirTitulo). */
  title: string | string[];
  description: string;
  /** Ruta canónica, empezando por "/" (sin dominio ni querystring). */
  path: string;
  images?: string[];
  noIndex?: boolean;
  /** Artículos del blog: og:type article con sus fechas, en vez de website. */
  article?: { publishedTime?: string | null; modifiedTime?: string | null };
}): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  /**
   * Declarar `openGraph` a mano desactiva el descubrimiento automático de
   * app/opengraph-image.tsx, así que la imagen se referencia explícitamente.
   */
  const ogImages = images ?? [`${SITE_URL}/opengraph-image`];
  const elegido = elegirTitulo(Array.isArray(title) ? title : [title]);
  return {
    // Sin la marca, `absolute` evita que la plantilla del layout la vuelva a poner
    title: elegido.conMarca ? elegido.texto : { absolute: elegido.texto },
    description,
    alternates: { canonical: url },
    openGraph: {
      ...(article
        ? {
            type: "article" as const,
            ...(article.publishedTime ? { publishedTime: article.publishedTime } : {}),
            ...(article.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
          }
        : { type: "website" as const }),
      locale: "es_ES",
      siteName: COMPANY.name,
      url,
      title: elegido.texto,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: elegido.texto,
      description,
      images: ogImages,
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
