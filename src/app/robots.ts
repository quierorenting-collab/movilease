import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* /favoritos y /comparador ya NO se bloquean, aunque no se indexen.
           Los dos declaran «noindex, follow» en su HTML, y para leer esa
           instrucción Google tiene que poder entrar: bloqueados por robots se
           quedaba sin leerla y podía indexarlos igual, sin descripción. El
           comparador además está enlazado desde el pie de todas las páginas.
           Con el bloqueo fuera, Google entra, lee el noindex, no los indexa y
           sigue los enlaces internos que llevan dentro. */
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
