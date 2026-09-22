import { SITE_URL, CONTACT } from "@/lib/constants";

/**
 * Datos estructurados. La web no tenía ninguno: Google no podía identificar la
 * organización, ni mostrar las FAQ como resultado enriquecido, ni entender las
 * migas de pan del catálogo.
 */
/**
 * La organización solo se declara entera en la portada. En el resto de páginas
 * un `{ "@id": … }` suelto no dice ni el nombre: la prueba de resultados
 * enriquecidos daba el vendedor de las fichas y el autor de los artículos como
 * vacíos. Con tipo, nombre y url cada página se entiende sola.
 */
const ORGANIZACION = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organizacion`,
  name: "MoviLease",
  url: SITE_URL,
};

function Script({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Contenido propio y estático: no hay entrada de usuario que escapar.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        /* Organization y no AutoRental: AutoRental es un negocio local y Google
           le pide dirección, que aquí no se publica. Tampoco lleva priceRange,
           que es propio de negocio local.

           Logo en PNG cuadrado de 512 px: Google no admite SVG para el logo de
           la organización y pide al menos 112 px. */
        ...ORGANIZACION,
        logo: `${SITE_URL}/logo-cuadrado.png`,
        image: `${SITE_URL}/opengraph-image`,
        description:
          "Renting de coches para particulares, autónomos y empresas en toda España. Sin entrada, con seguro y mantenimiento incluidos.",
        telephone: CONTACT.phone,
        email: CONTACT.email,
        areaServed: { "@type": "Country", name: "España" },
        sameAs: [CONTACT.instagram],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: CONTACT.phone,
          email: CONTACT.email,
          availableLanguage: ["es"],
        },
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#web`,
        url: SITE_URL,
        name: "MoviLease",
        inLanguage: "es-ES",
        publisher: ORGANIZACION,
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; path: string }[] }) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
        })),
      }}
    />
  );
}

export function ItemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: { name: string; path: string }[];
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          url: `${SITE_URL}${item.path}`,
        })),
      }}
    />
  );
}

/**
 * Ficha de modelo: Product con AggregateOffer porque un mismo modelo tiene
 * varias versiones a distinto precio. El precio es la cuota MENSUAL, así que va
 * como UnitPriceSpecification con unitCode MON: declararlo como precio a secas
 * haría que Google mostrase "264 €" como si fuera el precio del coche.
 */
export function VehicleModelJsonLd({
  brandName,
  modelName,
  slug,
  description,
  images,
  precios,
  specs,
}: {
  brandName: string;
  modelName: string;
  slug: string;
  description: string;
  images: string[];
  /** Cuota mensual en euros de cada versión. */
  precios: number[];
  specs?: {
    combustible?: string;
    cambio?: string;
    plazas?: number | null;
    puertas?: number | null;
    potencia?: number | null;
  };
}) {
  const validos = precios.filter((p) => Number.isFinite(p) && p > 0).sort((a, b) => a - b);
  /* Las fotos de public/ llegaban como "/coches-nuevos/…": Google pide URLs
     absolutas en `image`, y en el JSON-LD no hay metadataBase que las complete
     como sí pasa con og:image. La portada, además, salía dos veces porque es
     también la primera foto de la galería. */
  const imagenes = [...new Set(images.map((u) => (u.startsWith("/") ? `${SITE_URL}${u}` : u)))];
  const propiedades = [
    specs?.combustible && { name: "Combustible", value: specs.combustible },
    specs?.cambio && { name: "Cambio", value: specs.cambio },
    specs?.plazas && { name: "Plazas", value: String(specs.plazas) },
    specs?.puertas && { name: "Puertas", value: String(specs.puertas) },
    specs?.potencia && { name: "Potencia", value: `${specs.potencia} CV` },
  ].filter(Boolean) as { name: string; value: string }[];

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${SITE_URL}/${slug}#producto`,
        name: `${brandName} ${modelName}`,
        category: "Renting de vehículos",
        brand: { "@type": "Brand", name: brandName },
        ...(imagenes.length ? { image: imagenes } : {}),
        description,
        url: `${SITE_URL}/${slug}`,
        ...(propiedades.length
          ? {
              additionalProperty: propiedades.map((p) => ({
                "@type": "PropertyValue",
                name: p.name,
                value: p.value,
              })),
            }
          : {}),
        ...(validos.length
          ? {
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "EUR",
                lowPrice: validos[0],
                highPrice: validos[validos.length - 1],
                offerCount: validos.length,
                availability: "https://schema.org/InStock",
                url: `${SITE_URL}/${slug}`,
                seller: ORGANIZACION,
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: validos[0],
                  priceCurrency: "EUR",
                  unitCode: "MON",
                  /* Sin billingDuration a proposito. Estaba fijo en 36 meses y el
                     precio que lo acompana es la cuota base del vehiculo, que en 39
                     de los 48 coches es de 60 meses. Aqui solo llegan importes, no
                     plazos, asi que no se puede emitir el real. unitCode MON e
                     billingIncrement 1 ya dicen que la cuota es mensual, que es lo
                     unico cierto para todos. */
                  billingIncrement: 1,
                },
              },
            }
          : {}),
      }}
    />
  );
}

/** Página de contacto, "quiénes somos", etc. */
export function WebPageJsonLd({
  tipo,
  nombre,
  descripcion,
  path,
}: {
  tipo: "ContactPage" | "AboutPage" | "CollectionPage" | "WebPage";
  nombre: string;
  descripcion: string;
  path: string;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": tipo,
        name: nombre,
        description: descripcion,
        url: `${SITE_URL}${path === "/" ? "" : path}`,
        inLanguage: "es-ES",
        isPartOf: { "@id": `${SITE_URL}/#web` },
        publisher: ORGANIZACION,
      }}
    />
  );
}

/** Artículo del blog. */
export function ArticleJsonLd({
  title,
  slug,
  excerpt,
  image,
  publishedAt,
  updatedAt,
}: {
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title.slice(0, 110),
        ...(excerpt ? { description: excerpt } : {}),
        /* Google no muestra un artículo como resultado enriquecido sin imagen, y
           ninguno de los artículos tiene portada propia: se usa la de la web. */
        image: [image ?? `${SITE_URL}/opengraph-image`],
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        ...(updatedAt ? { dateModified: updatedAt } : {}),
        inLanguage: "es-ES",
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
        author: ORGANIZACION,
        publisher: ORGANIZACION,
      }}
    />
  );
}
