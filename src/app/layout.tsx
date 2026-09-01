import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { BRANDS, DEFAULT_BRAND_DOMAIN } from "@/lib/brand";
import { SITE_URL } from "@/lib/constants";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
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
  const defaultTitle = `${brand.name} | Renting de Coches para Particulares`;
  const ogImage = `${SITE_URL}/opengraph-image`;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: `%s | ${brand.name}`,
    },
    description: brand.description,
    applicationName: brand.name,
    // Evita que iOS convierta precios y cifras del catálogo en enlaces de llamada
    formatDetection: { telephone: false, address: false, email: false },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName: brand.name,
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
    <html lang="es" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0B2A5E] text-white">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
