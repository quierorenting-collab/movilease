import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { AsesorFlotante } from "@/components/asesor/AsesorFlotante";
import { ComparisonBar } from "@/components/vehicles/ComparisonBar";
import { LeadPopup } from "@/components/home/LeadPopup";
import { CookieBanner } from "@/components/home/CookieBanner";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { getVehiclesByBrand } from "@/lib/data/vehicles";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  /* Las marcas alimentan el desplegable de "Catálogo" del menú. Sólo viaja al
     cliente lo que pinta el panel (nombre, logo y nº de coches), no el
     catálogo entero. */
  const { brands } = await getVehiclesByBrand();
  const navBrands = brands.map((b) => ({
    name: b.brandName,
    count: b.vehicleCount,
    logoUrl: b.logoUrl,
  }));

  return (
    <MotionProvider>
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
    </MotionProvider>
  );
}
