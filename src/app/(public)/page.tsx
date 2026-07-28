import Link from "next/link";
import { getFeaturedVehicles, getOfferVehicles, getVehiclesByBrand } from "@/lib/data/vehicles";
import { buildWhatsAppLink } from "@/lib/constants";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { BrandCard } from "@/components/catalog/BrandCard";
import { HeroImage } from "@/components/home/HeroImage";
import { HeroContent } from "@/components/home/HeroContent";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { Reveal, RevealGroup, RevealItem, AnimatedCounter } from "@/components/ui/Reveal";

export const revalidate = 3600;

const STATS = [
  { value: 10000, prefix: "+",  suffix: "",  decimals: 0, label: "Clientes satisfechos" },
  { value: 4.9,   prefix: "",   suffix: "",  decimals: 1, label: "Valoración Google" },
  { value: 30,    prefix: "+",  suffix: "",  decimals: 0, label: "Marcas disponibles" },
  { value: 48,    prefix: "",   suffix: "h", decimals: 0, label: "Gestión garantizada" },
];

const HOW_STEPS = [
  { n: "01", title: "Elige tu coche",          body: "Explora el catálogo y selecciona el modelo que mejor se adapta a ti. Filtra por marca, precio o tipo." },
  { n: "02", title: "Solicita sin compromiso", body: "Envíanos tu solicitud por WhatsApp o formulario. Sin papeleo, sin visitas al concesionario." },
  { n: "03", title: "Gestionamos todo",         body: "Tramitamos la financiación, el seguro y todos los trámites en menos de 48 horas laborables." },
  { n: "04", title: "Disfruta tu vehículo",    body: "Recibes el coche nuevo en tu dirección. Cuota fija mensual. Todo incluido. Sin sorpresas." },
];

const TESTIMONIALS = [
  { stars: 5, text: "Super agradecido con el trato recibido. Un profesional recomendable 100×100.", name: "Manuel V.", info: "Renault Symbioz" },
  { stars: 5, text: "Todo muy fácil y rápido. El proceso fue completamente transparente y sin letra pequeña.", name: "Vanessa G.", info: "VW Taigo" },
  { stars: 5, text: "Excelente trato y profesionalidad. Recomendable al 100%. Repetiría sin dudarlo.", name: "Daniel P.", info: "Hyundai Tucson" },
  { stars: 5, text: "Satisfacción total. Buen trato y profesionalidad del comercial. Todo perfecto.", name: "José Carlos M.", info: "MG ZS" },
  { stars: 5, text: "Súper atento en todo el proceso. Me ayudaron a elegir el coche ideal.", name: "Lucía M.", info: "Citroën C4" },
  { stars: 5, text: "Excelente servicio. Me ayudaron a encontrar el coche perfecto para mi familia.", name: "Jorge V.", info: "Renault Austral" },
];

const FAQ_ITEMS = [
  { q: "¿Qué incluye la cuota mensual?",   a: "Seguro a todo riesgo, mantenimiento, asistencia en carretera 24h, impuesto de circulación y cambio de neumáticos. Una cuota fija sin sorpresas." },
  { q: "¿Necesito dar una entrada?",        a: "No. Todos los coches del catálogo se ofrecen sin entrada inicial. 0 € de desembolso al comenzar." },
  { q: "¿A cuántos kilómetros al año?",     a: "Los precios se calculan para contratos de 36 meses y 15.000 km/año. Adaptamos el kilometraje a tu uso real." },
  { q: "¿Cuánto tarda la aprobación?",      a: "En menos de 48 horas laborables tramitamos tu solicitud y te damos respuesta." },
  { q: "¿Puedo cancelar antes de tiempo?",  a: "Cada caso se estudia de forma individual. Contáctanos por WhatsApp y te asesoramos sin compromiso." },
  { q: "¿Es solo para particulares?",       a: "Principalmente sí, aunque también tramitamos renting para autónomos y pequeñas empresas." },
];

export default async function HomePage() {
  const [featured, offers, { brands }] = await Promise.all([
    getFeaturedVehicles(200),
    getOfferVehicles(8),
    getVehiclesByBrand(),
  ]);

  const seenModels = new Set<string>();
  const dedupedFeatured = featured
    .filter((v) => {
      if (seenModels.has(v.modelSlug)) return false;
      seenModels.add(v.modelSlug);
      return true;
    })
    .slice(0, 12);

  const seenOfferModels = new Set<string>();
  const dedupedOffers = offers.filter((v) => {
    if (seenOfferModels.has(v.modelSlug)) return false;
    seenOfferModels.add(v.modelSlug);
    return true;
  });

  const premiumBrands = brands.filter((b) => b.isPremium);
  const generalBrands = brands.filter((b) => !b.isPremium);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative flex h-screen min-h-[700px] items-end overflow-hidden bg-[#020608]">
        <HeroImage />
        <HeroContent />
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────── */}
      <div className="border-y border-white/5 bg-[#061B3F]">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="flex flex-col divide-y divide-white/5 sm:flex-row sm:divide-x sm:divide-y-0">
            {[
              "Sin entrada · 0 € inicial",
              "Gestión en 48 h",
              "Todo incluido en la cuota",
              "Entrega a domicilio",
            ].map((text) => (
              <div
                key={text}
                className="flex items-center gap-3 py-4 sm:flex-1 sm:justify-center sm:px-6 sm:py-5"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-[#0068FF]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────── (white) */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-[#E5E7EB]">
            {STATS.map((s) => (
              <Reveal key={s.label} className="text-center sm:px-8">
                <p
                  className="font-bold text-[#0A0A0A]"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "clamp(2.4rem, 5vw, 4.5rem)",
                    lineHeight: 1,
                  }}
                >
                  <AnimatedCounter
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                    duration={2}
                  />
                </p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#6B7280]">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFERTAS EXCLUSIVAS ──────────────────────────── (dark) */}
      {dedupedOffers.length > 0 && (
        <section id="ofertas" className="bg-[#020608] py-32 sm:py-40">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal className="mb-16 flex items-end justify-between">
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">
                  Disponibilidad limitada
                </p>
                <h2
                  className="font-bold text-white"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  Ofertas exclusivas
                </h2>
              </div>
              <a
                href={buildWhatsAppLink("Hola, me interesan las ofertas exclusivas.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-[10px] uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-white sm:block"
              >
                Ver todas →
              </a>
            </Reveal>

            <RevealGroup
              stagger={0.07}
              className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {dedupedOffers.map((vehicle) => (
                <RevealItem key={vehicle.id}>
                  <div className="group relative h-full overflow-hidden bg-[#020608]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#060f1c]">
                      {vehicle.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={vehicle.imageUrl}
                          alt={`${vehicle.brandName} ${vehicle.modelName}`}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-7xl font-bold text-white/4">
                          {vehicle.brandName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute left-0 top-4">
                        <span className="bg-[#0068FF] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                          Oferta
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                          {vehicle.brandName}
                        </p>
                        <p
                          className="text-[16px] font-bold leading-tight text-white"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {vehicle.modelName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">desde</p>
                        <p
                          className="text-xl font-bold text-[#0068FF]"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {vehicle.priceLabel}
                          <span className="ml-0.5 text-[10px] font-normal text-white/25">/mes</span>
                        </p>
                      </div>
                      <a
                        href={buildWhatsAppLink(
                          `Hola, me interesa la oferta del ${vehicle.brandName} ${vehicle.modelName}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-[#0068FF]/30 px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#0068FF] transition-all hover:border-[#0068FF] hover:bg-[#0068FF] hover:text-white"
                      >
                        Lo quiero
                      </a>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ── CÓMO FUNCIONA ────────────────────────────────── (light gray) */}
      <section id="por-que" className="bg-[#FAFAFA] py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-20">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">
              El proceso
            </p>
            <h2
              className="font-bold text-[#0A0A0A]"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              Tan fácil como
              <br />
              <span className="text-[#0068FF]">cuatro pasos.</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-0 divide-y divide-[#E5E7EB] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {HOW_STEPS.map((step, i) => (
              <Reveal
                key={step.n}
                delay={i * 0.1}
                className="flex flex-col gap-5 py-8 sm:px-10 lg:py-0"
              >
                <span
                  className="font-bold text-[#0068FF]"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                    lineHeight: 1,
                  }}
                >
                  {step.n}
                </span>
                <div>
                  <h3
                    className="text-[17px] font-bold text-[#0A0A0A]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#6B7280]">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARCAS ────────────────────────────────────────── (white) */}
      <section id="marcas" className="bg-white py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-16 flex items-end justify-between">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">
                Catálogo por marcas
              </p>
              <h2
                className="font-bold text-[#0A0A0A]"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                Todas las marcas
                <br />
                en un solo lugar.
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="hidden text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] transition-colors hover:text-[#0068FF] sm:block"
            >
              Ver catálogo completo →
            </Link>
          </Reveal>

          {premiumBrands.length > 0 && (
            <>
              <Reveal className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9CA3AF]">
                  Marcas premium
                </p>
              </Reveal>
              <RevealGroup
                stagger={0.06}
                className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {premiumBrands.map((brand) => (
                  <RevealItem key={brand.brandName}>
                    <BrandCard brand={brand} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}

          {generalBrands.length > 0 && (
            <>
              <Reveal className="mb-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9CA3AF]">
                  Marcas generalistas
                </p>
              </Reveal>
              <RevealGroup
                stagger={0.04}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              >
                {generalBrands.map((brand) => (
                  <RevealItem key={brand.brandName}>
                    <BrandCard brand={brand} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </>
          )}
        </div>
      </section>

      {/* ── VEHÍCULOS DESTACADOS ─────────────────────────── (light gray) */}
      {dedupedFeatured.length > 0 && (
        <section id="catalogo" className="bg-[#FAFAFA] py-32 sm:py-40">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal className="mb-16 flex items-end justify-between">
              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">
                  Vehículos destacados
                </p>
                <h2
                  className="font-bold text-[#0A0A0A]"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  Los más solicitados
                  <br />
                  esta semana.
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="hidden text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] transition-colors hover:text-[#0068FF] sm:block"
              >
                Ver todos →
              </Link>
            </Reveal>

            <RevealGroup
              stagger={0.05}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {dedupedFeatured.map((vehicle) => (
                <RevealItem key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.2} className="mt-12 text-center">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-3 border border-[#0A0A0A] px-10 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A0A0A] transition-all hover:border-[#0068FF] hover:bg-[#0068FF] hover:text-white"
              >
                Ver catálogo completo
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── TESTIMONIOS ──────────────────────────────────── (white) */}
      <section className="bg-white py-32 sm:py-40">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-16">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">
              Clientes reales
            </p>
            <h2
              className="font-bold text-[#0A0A0A]"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              Lo que dicen
              <br />
              nuestros clientes.
            </h2>
          </Reveal>

          <RevealGroup stagger={0.07} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <RevealItem key={t.name}>
                <div
                  className="flex h-full flex-col bg-white p-8 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.05)",
                  }}
                >
                  <div className="mb-6 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <svg key={i} viewBox="0 0 12 12" fill="#0068FF" className="h-3.5 w-3.5">
                        <path d="M6 0l1.5 4h4.5l-3.5 2.5 1.5 4L6 8.5 2 10.5l1.5-4L0 4h4.5z" />
                      </svg>
                    ))}
                  </div>
                  <p className="flex-1 text-[15px] leading-relaxed text-[#374151]">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-[#F3F4F6] pt-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#EFF6FF] text-xs font-bold text-[#0068FF]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#0A0A0A]">{t.name}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{t.info}</p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── (light gray) */}
      <section id="faq" className="bg-[#FAFAFA] py-32 sm:py-40">
        <div className="mx-auto max-w-4xl px-6 sm:px-10">
          <Reveal className="mb-16">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">FAQ</p>
            <h2
              className="font-bold text-[#0A0A0A]"
              style={{
                fontFamily: "var(--font-space-grotesk)",
                fontSize: "clamp(2.2rem, 5vw, 4.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              Preguntas
              <br />
              frecuentes.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <FAQAccordion items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── (dark navy) */}
      <section className="relative overflow-hidden bg-[#061B3F] py-40 sm:py-52">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(0,104,255,0.15) 0%, transparent 70%)",
          }}
        />
        <Reveal className="relative mx-auto max-w-5xl px-6 text-center sm:px-10">
          <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0068FF]">
            MOVILEASE — Smart Mobility Platform
          </p>
          <h2
            className="font-bold text-white"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "clamp(2.4rem, 6.5vw, 6rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
            }}
          >
            El futuro pertenece
            <br />
            a quienes se mueven
            <br />
            <span className="text-[#0068FF]">mejor.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-md text-[14px] leading-relaxed text-white/35">
            Sin entrada · Gestión en 48 h · Todo incluido
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={buildWhatsAppLink("Hola, me gustaría información sobre renting de coches.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] px-10 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Hablar por WhatsApp
            </a>
            <Link
              href="/catalogo"
              className="border border-white/20 px-10 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-white/50 hover:bg-white/8"
            >
              Explorar catálogo
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
