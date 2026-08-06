import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getModelBySlugWithVehicles, type VehicleDetailData } from "@/lib/data/vehicles";
import { getLandingPageBySlug } from "@/lib/data/landing";
import {
  FUEL_TYPE_LABELS,
  TRANSMISSION_LABELS,
  ENVIRONMENTAL_LABEL_LABELS,
  CONTACT,
  buildWhatsAppLink,
} from "@/lib/constants";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleGallery } from "@/components/vehicles/VehicleGallery";
import { VehiclePricingTable } from "@/components/vehicles/VehiclePricingTable";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { LeadForm } from "@/components/forms/LeadForm";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  VehicleModelJsonLd,
} from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";

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
    const nombre = `${model.brandName} ${model.model.name}`;
    const desde = cuotaMinima(model);
    const versiones = model.vehicles.length;

    // Descripcion armada con datos reales del coche. Antes eran 70 caracteres
    // genericos: Google los trunca menos, pero tampoco dicen nada que invite a
    // pulsar. El precio y "sin entrada" son lo que decide el clic.
    const partes = [
      desde ? `Renting ${nombre} desde ${desde} €/mes sin entrada.` : `Renting ${nombre} sin entrada.`,
      "Seguro a todo riesgo, mantenimiento e impuestos incluidos.",
      versiones > 1 ? `${versiones} versiones disponibles.` : null,
      "Respuesta en 48 h.",
    ].filter(Boolean);
    let description = partes.join(" ");
    if (description.length > 158) description = description.slice(0, 155).trimEnd() + "…";

    return pageMetadata({
      title: desde ? `Renting ${nombre} desde ${desde} €/mes` : `Renting ${nombre}`,
      description,
      path: `/${slug}`,
      // La foto del coche como imagen al compartir, en vez de la generica
      images: portadaModelo(model) ? [portadaModelo(model)!] : undefined,
    });
  }

  const landing = await getLandingPageBySlug(slug);
  if (landing) {
    return pageMetadata({
      title: landing.title,
      description:
        landing.metaDescription ??
        `${landing.h1}. Renting sin entrada, con seguro y mantenimiento incluidos.`,
      path: `/${slug}`,
    });
  }

  return {};
}

/** Cuota mensual mas baja del modelo, en euros enteros. */
function cuotaMinima(model: Awaited<ReturnType<typeof getModelBySlugWithVehicles>>) {
  if (!model?.vehicles.length) return null;
  const cents = model.vehicles.map((v) => v.monthlyPriceCents).filter((c) => c > 0);
  return cents.length ? Math.round(Math.min(...cents) / 100) : null;
}

/** Primera imagen utilizable del modelo. */
function portadaModelo(model: Awaited<ReturnType<typeof getModelBySlugWithVehicles>>) {
  if (!model) return null;
  return (
    model.model.coverImageUrl ??
    model.vehicles.find((v) => v.imageUrl)?.imageUrl ??
    null
  );
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
  if (landing) return <LandingPage landing={landing} slug={slug} />;

  notFound();
}

/* ─────────────────────────── helpers ─────────────────────────── */

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

function SpecRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0068FF]" />
      <span className="text-[13px] font-medium text-white/80">{value}</span>
      <span className="ml-auto text-[10px] uppercase tracking-[0.1em] text-white/30">{label}</span>
    </div>
  );
}

function ModelPage({ model }: { model: NonNullable<Awaited<ReturnType<typeof getModelBySlugWithVehicles>>> }) {
  const primary: VehicleDetailData | undefined = model.vehicles[0];
  const otherVersions = model.vehicles.slice(1);
  const services = primary?.includedServices ?? [];
  const fullName = `${model.brandName} ${model.model.name}${primary ? ` ${primary.version}` : ""}`.trim();

  const specRows = primary
    ? [
        { label: "Combustible", value: FUEL_TYPE_LABELS[primary.fuelType] },
        { label: "Cambio", value: TRANSMISSION_LABELS[primary.transmission] },
        { label: "Potencia", value: primary.horsepower ? `${primary.horsepower} CV` : null },
        {
          label: "Etiqueta",
          value: primary.environmentalLabel ? ENVIRONMENTAL_LABEL_LABELS[primary.environmentalLabel] : null,
        },
        { label: "Carrocería", value: primary.bodyType },
        { label: "Plazas", value: primary.seats ? `${primary.seats} plazas` : null },
        { label: "Puertas", value: primary.doors ? `${primary.doors} puertas` : null },
        {
          label: "Consumo",
          value: primary.consumptionValue
            ? `${primary.consumptionValue} ${primary.consumptionUnit ?? ""}`.trim()
            : null,
        },
      ]
    : [];

  const marcaSlug = encodeURIComponent(model.brandName.toLowerCase());
  const imagenes = [
    ...(primary?.images ?? []).map((i) => i.url),
    ...(primary?.imageUrl ? [primary.imageUrl] : []),
    ...(model.model.coverImageUrl ? [model.model.coverImageUrl] : []),
  ].filter(Boolean).slice(0, 6);

  return (
    <>
      <VehicleModelJsonLd
        brandName={model.brandName}
        modelName={model.model.name}
        slug={model.model.slug}
        description={
          model.model.description ??
          primary?.shortDescription ??
          `Renting de ${model.brandName} ${model.model.name} sin entrada, con seguro a todo riesgo y mantenimiento incluidos.`
        }
        images={imagenes}
        precios={model.vehicles.map((v) => Math.round(v.monthlyPriceCents / 100))}
        specs={
          primary
            ? {
                combustible: FUEL_TYPE_LABELS[primary.fuelType],
                cambio: TRANSMISSION_LABELS[primary.transmission],
                plazas: primary.seats,
                puertas: primary.doors,
                potencia: primary.horsepower,
              }
            : undefined
        }
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Catálogo", path: "/catalogo" },
          { name: model.brandName, path: `/catalogo?brand=${marcaSlug}` },
          { name: model.model.name, path: `/${model.model.slug}` },
        ]}
      />

      {/* ── Hero producto ── */}
      <section className="surface-black ambient-blue-top relative overflow-hidden pt-32 pb-20">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          {/* Migas visibles: la ficha no tenía ninguna ruta de vuelta ni al
              catálogo ni a la marca, ni para el visitante ni para Google. */}
          <nav aria-label="Ruta de navegación" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-white/70">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/45">/</li>
              <li>
                <Link href="/catalogo" className="transition-colors hover:text-white">
                  Catálogo
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/45">/</li>
              <li>
                <Link
                  href={`/catalogo?brand=${marcaSlug}`}
                  className="transition-colors hover:text-white"
                >
                  {model.brandName}
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/45">/</li>
              <li aria-current="page" className="font-semibold text-white">
                {model.model.name}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal delay={0.05} y={36}>
              {primary ? (
                <VehicleGallery images={primary.images} alt={fullName} />
              ) : (
                <div
                  className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-gradient-to-b from-[#141414] to-[#0E0E0E] text-7xl font-bold text-white/70"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {model.brandName.charAt(0)}
                </div>
              )}
            </Reveal>

            <Reveal>
              <p className="section-label">{model.brandName}</p>
              <h1 className="display-lg mt-4 text-white">
                <span className="block text-[0.45em] font-bold uppercase tracking-[0.18em] text-[#8FBEFF]">
                  Renting {model.brandName}
                </span>{" "}
                {model.model.name}
              </h1>
              {primary && <p className="mt-2 text-lg font-medium text-white/60">{primary.version}</p>}
              {(primary?.shortDescription || model.model.description) && (
                <p className="mt-5 max-w-xl leading-relaxed text-white/70">
                  {primary?.shortDescription || model.model.description}
                </p>
              )}

              {primary && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {[
                    FUEL_TYPE_LABELS[primary.fuelType],
                    TRANSMISSION_LABELS[primary.transmission],
                    primary.horsepower ? `${primary.horsepower} CV` : null,
                    primary.environmentalLabel ? ENVIRONMENTAL_LABEL_LABELS[primary.environmentalLabel] : null,
                  ]
                    .filter(Boolean)
                    .map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70"
                      >
                        {chip}
                      </span>
                    ))}
                </div>
              )}

              {primary?.colors && primary.colors.length > 0 && (
                <p className="mt-4 text-[13px] text-white/50">
                  <span className="text-white/30">Colores disponibles: </span>
                  {primary.colors.join(" · ")}
                </p>
              )}

              {primary && (
                <div className="mt-10 rounded-2xl border border-[#0068FF]/20 bg-[#0068FF]/[0.06] p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Desde</p>
                  <p
                    className="mt-1 text-5xl font-bold text-white sm:text-6xl"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {primary.priceLabel}
                    <span className="ml-2 text-lg font-medium text-white/50">/mes</span>
                  </p>
                  <p className="mt-1 text-[11px] text-white/30">IVA incluido</p>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <a href="#solicitar" className="btn-primary justify-center">
                      Solicitar oferta
                    </a>
                    <a href="#solicitar" className="btn-ghost justify-center">
                      Solicitar información
                    </a>
                    <a
                      href={buildWhatsAppLink(
                        `Hola, me interesa el ${fullName} (${primary.priceLabel}/mes). ¿Me podéis dar más información?`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost justify-center"
                    >
                      WhatsApp
                    </a>
                    <a href={`tel:${CONTACT.phone}`} className="btn-ghost justify-center">
                      Llamar
                    </a>
                  </div>
                </div>
              )}
            </Reveal>
          </div>

          {specRows.some((s) => s.value) && (
            <Reveal delay={0.1} className="mt-14">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {specRows.map((s) => (
                  <SpecRow key={s.label} label={s.label} value={s.value} />
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Cuotas por plazo y kilometraje ── */}
      {primary && primary.pricingTiers.length > 0 && (
        <section className="surface-graphite py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal>
              <p className="section-label">Cuotas mensuales</p>
              <h2 className="display-md mt-4 text-white">Elige tu plazo y kilometraje</h2>
              <p className="mt-3 max-w-xl text-sm text-white/50">IVA incluido en todos los precios.</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <VehiclePricingTable tiers={primary.pricingTiers} highlightMonths={primary.contractMonths} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Equipamiento ── */}
      {primary && primary.equipment.length > 0 && (
        <section className="surface-dark py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal>
              <p className="section-label">Equipamiento</p>
              <h2 className="display-md mt-4 text-white">De serie en este acabado</h2>
            </Reveal>
            <RevealGroup
              stagger={0.03}
              className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {primary.equipment.map((item) => (
                <RevealItem key={item}>
                  <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3">
                    <CheckIcon />
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ── Descripción comercial ── */}
      {primary?.description && (
        <section className="bg-white py-24">
          <div className="mx-auto max-w-3xl px-6 sm:px-10">
            <Reveal>
              <p className="section-label">Sobre este vehículo</p>
              <h2 className="display-md mt-4 text-[#0A0A0A]">{fullName}</h2>
              <p className="mt-6 whitespace-pre-line leading-relaxed text-[#4B5563]">
                {primary.description}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Versiones ── */}
      {otherVersions.length > 0 && (
        <section className="surface-graphite py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal>
              <p className="section-label">Configuraciones</p>
              <h2 className="display-md mt-4 text-white">Versiones disponibles</h2>
            </Reveal>

            <RevealGroup stagger={0.08} className="mt-12 space-y-4">
              {otherVersions.map((vehicle) => {
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
      <section id="solicitar" className="surface-black ambient-blue relative overflow-hidden py-24">
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
                <LeadForm modelId={model.model.id} vehicleId={primary?.id} source="vehicle_page" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─────────────────────────── landing view ─────────────────────────── */

function LandingPage({
  landing,
  slug,
}: {
  landing: NonNullable<Awaited<ReturnType<typeof getLandingPageBySlug>>>;
  slug: string;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", path: "/" },
          { name: "Catálogo", path: "/catalogo" },
          { name: landing.title, path: `/${slug}` },
        ]}
      />
      {landing.faq.length > 0 && (
        <FaqJsonLd items={landing.faq.map((f) => ({ q: f.question, a: f.answer }))} />
      )}

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
