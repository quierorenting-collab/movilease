import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getModelBySlugWithVehicles } from "@/lib/data/vehicles";
import { getLandingPageBySlug } from "@/lib/data/landing";
import { FUEL_TYPE_LABELS, TRANSMISSION_LABELS, buildWhatsAppLink } from "@/lib/constants";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { LeadForm } from "@/components/forms/LeadForm";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export const revalidate = 1800;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;

  const model = await getModelBySlugWithVehicles(slug);
  if (model) {
    return {
      title: `Renting ${model.brandName} ${model.model.name}`,
      description:
        model.model.description ??
        `Renting de ${model.brandName} ${model.model.name} para particulares, sin entrada y todo incluido.`,
    };
  }

  const landing = await getLandingPageBySlug(slug);
  if (landing) {
    return { title: landing.title, description: landing.metaDescription ?? undefined };
  }

  return {};
}

export default async function SlugResolverPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const model = await getModelBySlugWithVehicles(slug);
  if (model) return <ModelPage model={model} />;

  const landing = await getLandingPageBySlug(slug);
  if (landing) return <LandingPage landing={landing} />;

  notFound();
}

/* ─────────────────────────── helpers ─────────────────────────── */

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function CheckIcon() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0068FF]/10">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M2.5 7.5L5.5 10.5L11.5 3.5"
          stroke="#0068FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/* ─────────────────────────── model view ─────────────────────────── */

function ModelPage({ model }: { model: NonNullable<Awaited<ReturnType<typeof getModelBySlugWithVehicles>>> }) {
  const cheapest = model.vehicles[0];
  const heroImage = model.model.coverImageUrl || cheapest?.imageUrl;
  const fuels = unique(model.vehicles.map((v) => FUEL_TYPE_LABELS[v.fuelType]));
  const transmissions = unique(model.vehicles.map((v) => TRANSMISSION_LABELS[v.transmission]));
  const services = cheapest?.includedServices ?? [];

  const chips = [
    `${model.vehicles.length} ${model.vehicles.length === 1 ? "versión" : "versiones"}`,
    ...fuels,
    ...transmissions,
  ];

  return (
    <>
      {/* ── Hero producto ── */}
      <section className="surface-black ambient-blue-top relative overflow-hidden pt-32 pb-20">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <p className="section-label">{model.brandName}</p>
              <h1 className="display-lg mt-4 text-white">{model.model.name}</h1>
              {model.model.description && (
                <p className="mt-5 max-w-xl leading-relaxed text-white/70">
                  {model.model.description}
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              {cheapest && (
                <div className="mt-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    Desde
                  </p>
                  <p
                    className="mt-1 text-5xl font-bold text-[#0068FF] sm:text-6xl"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {cheapest.priceLabel}
                    <span className="ml-2 text-lg font-medium text-white/70">/mes</span>
                  </p>
                </div>
              )}
            </Reveal>

            <Reveal delay={0.15} y={36}>
              <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl"
                style={{ boxShadow: "0 40px 80px -20px rgba(0, 0, 0, 0.7)" }}
              >
                {heroImage ? (
                  <>
                    <Image
                      src={heroImage}
                      alt={`${model.brandName} ${model.model.name}`}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </>
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#141414] to-[#0E0E0E] text-7xl font-bold text-white/70"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {model.brandName.charAt(0)}
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Versiones ── */}
      {model.vehicles.length > 0 && (
        <section className="surface-graphite py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal>
              <p className="section-label">Configuraciones</p>
              <h2 className="display-md mt-4 text-white">Versiones disponibles</h2>
            </Reveal>

            <RevealGroup stagger={0.08} className="mt-12 space-y-4">
              {model.vehicles.map((vehicle) => {
                const specs = [
                  FUEL_TYPE_LABELS[vehicle.fuelType],
                  TRANSMISSION_LABELS[vehicle.transmission],
                  vehicle.horsepower ? `${vehicle.horsepower} CV` : null,
                  vehicle.consumptionValue
                    ? `${vehicle.consumptionValue} ${vehicle.consumptionUnit ?? ""}`.trim()
                    : null,
                  vehicle.seats ? `${vehicle.seats} plazas` : null,
                ].filter(Boolean) as string[];

                return (
                  <RevealItem key={vehicle.id}>
                    <div className="card-dark flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6">
                      <div className="relative h-[80px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-white/[0.04]">
                        {vehicle.imageUrl ? (
                          <Image
                            src={vehicle.imageUrl}
                            alt={`${model.brandName} ${model.model.name} ${vehicle.version}`}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/70">
                            {model.brandName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white">{vehicle.version}</p>
                        <p className="mt-1 text-sm text-white/70">{specs.join(" · ")}</p>
                      </div>

                      <div className="flex flex-col items-start gap-4 sm:items-end">
                        <p
                          className="text-2xl font-bold text-[#0068FF]"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {vehicle.priceLabel}
                          <span className="ml-1 text-sm font-medium text-white/70">/mes</span>
                        </p>
                        <a
                          href={buildWhatsAppLink(
                            `Hola, me interesa el renting del ${model.brandName} ${model.model.name} ${vehicle.version} (${vehicle.priceLabel}/mes). ¿Me podéis dar más información?`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-[#0068FF]/40 px-5 py-2 text-sm font-semibold text-[#0068FF] transition-colors duration-300 hover:bg-[#0068FF] hover:text-white"
                        >
                          Me interesa
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path
                              d="M3 8H13M13 8L9 4M13 8L9 12"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ── Servicios incluidos ── */}
      {services.length > 0 && (
        <section className="surface-dark py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal>
              <p className="section-label">Todo incluido</p>
              <h2 className="display-md mt-4 text-white">Qué incluye tu cuota</h2>
            </Reveal>

            <RevealGroup
              stagger={0.05}
              className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {services.map((service) => (
                <RevealItem key={service}>
                  <div className="glass flex items-center gap-4 rounded-2xl px-5 py-4">
                    <CheckIcon />
                    <span className="text-sm font-medium text-white/70">{service}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ── Lead form ── */}
      <section className="surface-black ambient-blue relative overflow-hidden py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="section-label">Solicita información</p>
              <h2 className="display-md mt-4 text-white">¿Te interesa este modelo?</h2>
              <p className="mt-5 max-w-md leading-relaxed text-white/70">
                Déjanos tus datos y te contactamos por WhatsApp en menos de 24h con una
                propuesta a tu medida.
              </p>

              <ul className="mt-10 space-y-5">
                {[
                  "Respuesta en menos de 24 horas",
                  "Sin entrada inicial y todo incluido en una cuota",
                  "Asesoramiento sin compromiso",
                ].map((bullet) => (
                  <li key={bullet} className="flex items-center gap-4">
                    <CheckIcon />
                    <span className="text-sm text-white/75">{bullet}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur">
                <LeadForm modelId={model.model.id} vehicleId={cheapest?.id} source="vehicle_page" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── landing view ─────────────────────────── */

function LandingPage({ landing }: { landing: NonNullable<Awaited<ReturnType<typeof getLandingPageBySlug>>> }) {
  return (
    <>
      {/* ── Hero ── */}
      <section className="surface-black ambient-blue-top relative overflow-hidden pt-32 pb-20">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal>
            <p className="section-label">Renting</p>
            <h1 className="display-lg mt-4 max-w-4xl text-white">{landing.h1}</h1>
            {landing.introContent && (
              <p className="mt-6 max-w-2xl leading-relaxed text-white/70">
                {landing.introContent}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Vehículos ── */}
      <section className="surface-graphite py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          {landing.vehicles.length > 0 ? (
            <>
              <Reveal>
                <h2
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Vehículos disponibles
                </h2>
              </Reveal>
              <RevealGroup
                stagger={0.06}
                className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {landing.vehicles.map((vehicle) => (
                  <RevealItem key={vehicle.id}>
                    <VehicleCard vehicle={vehicle} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          ) : (
            <Reveal>
              <div className="rounded-3xl border border-dashed border-white/10 p-14 text-center text-white/70">
                Estamos ampliando el catálogo de esta categoría — vuelve pronto.
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      {landing.faq.length > 0 && (
        <section className="surface-dark py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.6fr]">
              <Reveal>
                <p className="section-label">FAQ</p>
                <h2 className="display-md mt-4 text-white">Preguntas frecuentes</h2>
              </Reveal>
              <Reveal delay={0.1}>
                <div
                  className="rounded-3xl bg-white px-8 py-4"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <FAQAccordion
                    items={landing.faq.map((item) => ({ q: item.question, a: item.answer }))}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA final ── */}
      <section className="surface-black ambient-blue relative overflow-hidden py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center sm:px-10">
          <Reveal>
            <h2 className="display-md mx-auto max-w-2xl text-white">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/70">
              Cuéntanos qué coche necesitas y te ayudamos a encontrar la mejor cuota de renting.
            </p>
            <div className="mt-10">
              <a
                href={buildWhatsAppLink(
                  "Hola, estoy buscando un coche de renting y me gustaría recibir asesoramiento."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Hablar con un asesor
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
