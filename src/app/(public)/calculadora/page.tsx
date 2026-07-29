import type { Metadata } from "next";
import { RENTING_DEFAULTS } from "@/lib/constants";
import { RentingCalculator } from "@/components/calculator/RentingCalculator";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Calculadora de renting",
  description: "Descubre qué coches encajan en tu presupuesto mensual y qué incluye la cuota.",
};

export default function CalculadoraPage() {
  return (
    <>
      <section className="surface-black ambient-blue-top relative overflow-hidden pt-32 pb-24">
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
