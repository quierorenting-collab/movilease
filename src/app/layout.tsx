import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { BRANDS, DEFAULT_BRAND_DOMAIN } from "@/lib/brand";
import { SITE_URL, COMPANY } from "@/lib/constants";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

// El peso 300 no aparece en ningún sitio del proyecto (0 usos de font-light):
// dos archivos de fuente menos que descargar en la primera visita.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0B2A5E",
};

/**
 * Metadatos base del sitio. Antes salian de getCurrentBrand(), que lee
 * headers() para resolver la marca por dominio. headers() es una API
 * dinamica y, usada en el layout raiz, arrastra a TODAS las rutas: ninguna
 * pagina del sitio llegaba a cachearse y cada visita ejecutaba el render
 * completo con sus consultas a Supabase.
 *
 * Hoy quierorenting.es no se sirve desde esta aplicacion, asi que estos dos
 * campos pueden salir de la marca por defecto sin perder nada. El mecanismo
 * multimarca sigue intacto en lib/brand.ts: si algun dia se apunta ese
 * dominio aqui, ESTA es la linea que hay que volver a hacer dinamica, y
 * habra que asumir que el sitio deja de cachearse o resolver la marca de
 * otra forma (por ejemplo, un dominio por despliegue).
 */
export function generateMetadata(): Metadata {
  const brand = BRANDS[DEFAULT_BRAND_DOMAIN];
  const defaultTitle = `${COMPANY.name} | Renting de coches en España`;
  const ogImage = `${SITE_URL}/opengraph-image`;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      /* «Movilease Renting» y no el brand.name «MoviLease»: a secas es también
         el nombre de una empresa francesa cerrada y Google nos mezclaba. */
      template: `%s | ${COMPANY.name}`,
    },
    description: brand.description,
    applicationName: COMPANY.name,
    // Evita que iOS convierta precios y cifras del catálogo en enlaces de llamada
    formatDetection: { telephone: false, address: false, email: false },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: COMPANY.name,
      url: SITE_URL,
      title: defaultTitle,
      description: brand.description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: brand.description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "pI-BaqPscKQ0D8SPEvg0PIfdRcASlcHuXDNh7dNf_w4",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // es-ES y no «es» a secas: la entidad es española, y el idioma con región
    // es una señal más para separarla de la MoviLease francesa.
    <html lang="es-ES" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <head>
        {/* La organización en todas las páginas, no solo en la portada: es la
            que dice razón social, CIF y dirección (ver OrganizationJsonLd). */}
        <OrganizationJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-[#0B2A5E] text-white">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
