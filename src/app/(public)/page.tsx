import { getCurrentBrand } from "@/lib/brand";
import { getFeaturedVehicles } from "@/lib/data/vehicles";
import { buildWhatsAppLink, RENTING_DEFAULTS } from "@/lib/constants";
import { Container, Section } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

export const revalidate = 3600;

const TRUST_ITEMS = [
  "Sin entrada, 0€",
  "Seguro a todo riesgo incluido",
  "Mantenimiento incluido",
  "Asistencia 24h",
  "Gestión en 48h",
  "Asesoría personal",
];

const WHY_ITEMS = [
  {
    title: "Sin sorpresas en la cuota",
    body: "Una única cuota mensual fija: seguro, mantenimiento, neumáticos e impuesto de circulación incluidos.",
  },
  {
    title: "Sin entrada ni permanencia oculta",
    body: "Empiezas a rodar sin desembolso inicial, con las condiciones claras desde el primer día.",
  },
  {
    title: "Gestión rápida",
    body: "Estudiamos tu solicitud y tramitamos la documentación en 48 horas.",
  },
  {
    title: "Asesoría personal por WhatsApp",
    body: "Te acompañamos en todo el proceso, de la elección del coche a la entrega de llaves.",
  },
  {
    title: "Catálogo amplio y actualizado",
    body: "Gasolina, diésel, híbridos y eléctricos de las principales marcas.",
  },
  {
    title: "Renueva cuando quieras",
    body: "Al final del contrato, cambias de coche sin preocuparte de venderlo.",
  },
];

const FAQ_ITEMS = [
  {
    q: "¿Qué incluye la cuota mensual?",
    a: "Seguro a todo riesgo, mantenimiento, asistencia en carretera 24h, impuesto de circulación y cambio de neumáticos.",
  },
  {
    q: "¿Necesito dar una entrada?",
    a: "No. Todos los coches del catálogo se ofrecen sin entrada inicial.",
  },
  {
    q: `¿A cuántos kilómetros al año equivale?`,
    a: `Los precios se calculan para contratos de ${RENTING_DEFAULTS.contractMonths} meses y ${RENTING_DEFAULTS.annualKm.toLocaleString("es-ES")} km/año; podemos adaptar el kilometraje según tu uso.`,
  },
  {
    q: "¿Puedo cancelar antes de tiempo?",
    a: "Cada caso se estudia de forma individual; contacta con nosotros por WhatsApp y te asesoramos sin compromiso.",
  },
];

export default async function HomePage() {
  const brand = await getCurrentBrand();
  const featured = await getFeaturedVehicles(6);

  return (
    <>
      <Section className="pt-16 sm:pt-24">
        <Container className="flex flex-col items-start gap-6">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            +10.000 clientes en renting
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Renting de coches para particulares sin complicaciones
          </h1>
          <p className="max-w-xl text-lg text-muted">{brand.description}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/catalogo">Ver catálogo</ButtonLink>
            <ButtonLink
              href={buildWhatsAppLink("Hola, me gustaría más información sobre renting.")}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              Solicitar oferta
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-border-subtle bg-surface/50 py-8">
        <Container>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted sm:grid-cols-3 lg:grid-cols-6">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Los más solicitados</h2>
            <ButtonLink href="/catalogo" variant="ghost" className="px-0 hover:bg-transparent">
              Ver todo →
            </ButtonLink>
          </div>
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center text-muted">
              El catálogo se está cargando — vuelve pronto para ver los coches destacados.
            </div>
          )}
        </Container>
      </Section>

      <Section className="bg-surface/50">
        <Container>
          <h2 className="mb-10 text-2xl font-semibold tracking-tight sm:text-3xl">
            ¿Por qué elegir {brand.name}?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_ITEMS.map((item) => (
              <div key={item.title}>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="max-w-3xl">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="divide-y divide-border-subtle">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {item.q}
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border-subtle bg-surface/50 text-center">
        <Container className="flex flex-col items-center gap-6">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            ¿Listo para estrenar tu nuevo coche?
          </h2>
          <ButtonLink
            href={buildWhatsAppLink("Hola, me gustaría más información sobre renting.")}
            target="_blank"
            rel="noopener noreferrer"
            variant="whatsapp"
          >
            Hablar por WhatsApp
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
