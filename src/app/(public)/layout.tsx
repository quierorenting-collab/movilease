import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ComparisonBar } from "@/components/vehicles/ComparisonBar";
import { LeadPopup } from "@/components/home/LeadPopup";
import { CookieBanner } from "@/components/home/CookieBanner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="contenido" className="flex-1 pt-0">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
      <ComparisonBar />
      <LeadPopup />
      <CookieBanner />
    </>
  );
}
