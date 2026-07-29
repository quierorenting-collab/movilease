import { SITE_URL, CONTACT } from "@/lib/constants";

/**
 * Datos estructurados. La web no tenía ninguno: Google no podía identificar la
 * organización, ni mostrar las FAQ como resultado enriquecido, ni entender las
 * migas de pan del catálogo.
 */
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
        "@type": "AutoRental",
        "@id": `${SITE_URL}/#organizacion`,
        name: "MoviLease",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.svg`,
        image: `${SITE_URL}/opengraph-image`,
        description:
          "Renting de coches para particulares, autónomos y empresas en toda España. Sin entrada, con seguro y mantenimiento incluidos.",
        telephone: CONTACT.phone,
        email: CONTACT.email,
        areaServed: { "@type": "Country", name: "España" },
        sameAs: [CONTACT.instagram],
        priceRange: "€€",
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
        publisher: { "@id": `${SITE_URL}/#organizacion` },
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
