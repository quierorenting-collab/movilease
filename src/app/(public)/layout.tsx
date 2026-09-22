import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { AsesorFlotante } from "@/components/asesor/AsesorFlotante";
import { ComparisonBar } from "@/components/vehicles/ComparisonBar";
import { LeadPopup } from "@/components/home/LeadPopup";
import { CookieBanner } from "@/components/home/CookieBanner";
import { getVehiclesByBrand } from "@/lib/data/vehicles";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  /* Las marcas alimentan el desplegable de "Catálogo" del menú. Sólo viaja al
     cliente lo que pinta el panel (nombre, logo y nº de coches), no el
     catálogo entero. */
  const { brands } = await getVehiclesByBrand();
  const navBrands = brands.map((b) => ({
    name: b.brandName,
    href: b.href,
    count: b.vehicleCount,
    logoUrl: b.logoUrl,
  }));

  /* MotionProvider ya no envuelve la web pública: desde el 18/09/2026 la
     cabecera, el menú móvil, el banner de cookies y el pop-up animan con CSS,
     así que framer-motion dejó de viajar en el layout —43,9 KB comprimidos en
     las 42 rutas públicas— y solo lo carga la calculadora, que es quien lo
     sigue usando y quien se lo envuelve. */
  return (
    <>
      <Header brands={navBrands} />
      <main id="contenido" className="flex-1 pt-0">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <AsesorFlotante />
      <ComparisonBar />
      <LeadPopup />
      <CookieBanner />
    </>
  );
}
