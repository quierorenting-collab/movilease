import type { Metadata } from "next";
import { RENTING_DEFAULTS } from "@/lib/constants";
import { Container, Section } from "@/components/ui/Container";
import { RentingCalculator } from "@/components/calculator/RentingCalculator";

export const metadata: Metadata = {
  title: "Calculadora de renting",
  description: "Descubre qué coches encajan en tu presupuesto mensual y qué incluye la cuota.",
};

export default function CalculadoraPage() {
  return (
    <Section className="pt-12">
      <Container className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Calculadora de renting</h1>
        <p className="mt-2 text-muted">
          Ajusta tu presupuesto mensual y descubre qué coches encajan — y qué incluye siempre la cuota.
        </p>

        <div className="mt-8">
          <RentingCalculator />
        </div>

        <h2 className="mt-12 text-xl font-semibold">Qué incluye siempre la cuota</h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RENTING_DEFAULTS.includedServices.map((service) => (
            <li key={service} className="flex items-center gap-2 text-sm text-muted">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {service}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
