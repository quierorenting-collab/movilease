import type { Metadata } from "next";
import { RENTING_DEFAULTS } from "@/lib/constants";
import { RentingCalculator } from "@/components/calculator/RentingCalculator";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { VideoBackdrop } from "@/components/ui/VideoBackdrop";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Calculadora de renting: cuota mensual",
  description:
    "Calcula qué coches entran en tu presupuesto mensual de renting y qué incluye la cuota: seguro, mantenimiento e impuestos.",
  path: "/calculadora",
});

export default function CalculadoraPage() {
  return (
    <>
      <section className="surface-black relative overflow-hidden pt-32 pb-24">
        {/* Foto de fondo (escritorio con vistas). La original es muy luminosa:
            se sirve ya rebajada de brillo desde el propio WebP, porque el velo
            es lo único que hay entre la foto y el texto blanco de encima. */}
        <VideoBackdrop
          poster="/calculadora-bg.webp"
          base="#071A3D"
          veil="linear-gradient(180deg, rgba(7,26,61,0.84) 0%, rgba(12,36,84,0.7) 45%, rgba(7,26,61,0.9) 100%)"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="section-label">Calculadora</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="display-lg mt-4 text-white">¿Cuánto quieres pagar al mes?</h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 text-lg text-white/70">
                Ajusta tu presupuesto mensual y descubre qué coches encajan — todo incluido en una
                sola cuota.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.3} className="mx-auto mt-14 max-w-2xl">
            <RentingCalculator />
          </Reveal>
        </div>
      </section>

      <section className="surface-graphite relative py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="section-label">Todo incluido</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display-md mt-4 text-white">Qué incluye siempre la cuota</h2>
            </Reveal>
          </div>

          <RevealGroup
            stagger={0.06}
            className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {RENTING_DEFAULTS.includedServices.map((service) => (
              <RevealItem key={service}>
                <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
                  <svg
                    className="h-5 w-5 shrink-0 text-[#0068FF]"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 10.5l4 4 8-9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-sm font-medium text-white/80">{service}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
