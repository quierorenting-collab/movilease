import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

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
}: {
  title: string;
  description: string;
  /** Ruta canónica, empezando por "/" (sin dominio ni querystring). */
  path: string;
  images?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  /**
   * Declarar `openGraph` a mano desactiva el descubrimiento automático de
   * app/opengraph-image.tsx, así que la imagen se referencia explícitamente.
   */
  const ogImages = images ?? [`${SITE_URL}/opengraph-image`];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: "MoviLease",
      url,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
