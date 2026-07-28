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
  {
    n: "01",
    title: "Elige tu coche",
    body: "Explora el catálogo y selecciona el modelo que mejor se adapta a ti. Filtra por marca, precio o tipo.",
  },
  {
    n: "02",
    title: "Solicita sin compromiso",
    body: "Envíanos tu solicitud por WhatsApp. Sin papeleo, sin visitas al concesionario, sin letra pequeña.",
  },
  {
    n: "03",
    title: "Gestionamos todo",
    body: "Tramitamos la financiación, el seguro y todos los trámites en menos de 48 horas laborables.",
  },
  {
    n: "04",
    title: "Disfruta tu vehículo",
    body: "Recibes el coche nuevo en tu dirección. Cuota fija mensual. Todo incluido. Sin sorpresas.",
  },
];

const COMPARISON = [
  { feature: "Entrada inicial",            movilease: "0 €",           dealer: "20-30 % del precio" },
  { feature: "Seguro a todo riesgo",        movilease: "Incluido",      dealer: "Aparte (+1.200 €/año)" },
  { feature: "Mantenimiento",               movilease: "Incluido",      dealer: "Por tu cuenta" },
  { feature: "Impuestos y gestiones",       movilease: "Incluidos",     dealer: "Por tu cuenta" },
  { feature: "Tiempo de gestión",           movilease: "48 horas",      dealer: "Semanas" },
  { feature: "Renovar coche cada 3 años",   movilease: "Sí, sin coste", dealer: "Vender y recomprar" },
  { feature: "Riesgo de depreciación",      movilease: "Cero",          dealer: "Asumes la pérdida" },
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
    .slice(0, 8);

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
      {/* ══ HERO — cinematic ══════════════════════════════ */}
      <section className="relative flex h-screen min-h-[760px] items-end overflow-hidden bg-[#080808]">
        <HeroImage />
        <HeroContent />
      </section>

      {/* ══ STATS — white, huge numbers ═══════════════════ */}
      <section className="relative bg-white py-28 sm:py-36">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid grid-cols-2 gap-14 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-[#EDEEF0]">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="text-center sm:px-8">
                <p
                  className="font-bold text-[#0A0A0A]"
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  <AnimatedCounter
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                    duration={2.2}
                  />
                </p>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9CA3AF]">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ OFERTAS — dark cinematic ══════════════════════ */}
      {dedupedOffers.length > 0 && (
        <section
          id="ofertas"
          className="ambient-blue-top relative overflow-hidden bg-[#080808] py-32 sm:py-44"
        >
          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal className="mb-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label mb-5">Disponibilidad limitada</p>
                <h2 className="display-md text-white">
                  Ofertas
                  <br />
                  <span className="text-[#0068FF]">exclusivas.</span>
                </h2>
              </div>
              <a
                href={buildWhatsAppLink("Hola, me interesan las ofertas exclusivas.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/30 transition-colors hover:text-white sm:flex"
              >
                Consultar todas
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
            </Reveal>

            <RevealGroup
              stagger={0.08}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {dedupedOffers.map((vehicle) => (
                <RevealItem key={vehicle.id}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-white/6 bg-gradient-to-b from-[#101010] to-[#0A0A0A] transition-all duration-500 hover:border-[#0068FF]/25 hover:shadow-[0_20px_60px_rgba(0,104,255,0.12)]">
                    <div className="relative aspect-[4/3] overflow-hidden">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                      <div className="absolute left-4 top-4">
                        <span className="rounded-full bg-[#0068FF] px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-lg shadow-[#0068FF]/30">
                          Oferta
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/30">
                        {vehicle.brandName}
                      </p>
                      <p
                        className="mt-1 text-[19px] font-bold leading-tight text-white"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                      >
                        {vehicle.modelName}
                      </p>
                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.18em] text-white/20">desde</p>
                          <p
                            className="text-[24px] font-bold leading-none text-white"
                            style={{ fontFamily: "var(--font-space-grotesk)" }}
                          >
                            {vehicle.priceLabel}
                            <span className="ml-1 text-[11px] font-normal text-white/25">/mes</span>
                          </p>
                        </div>
                        <a
                          href={buildWhatsAppLink(
                            `Hola, me interesa la oferta del ${vehicle.brandName} ${vehicle.modelName}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-[#0068FF]/40 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#0068FF] transition-all duration-300 hover:border-[#0068FF] hover:bg-[#0068FF] hover:text-white hover:shadow-lg hover:shadow-[#0068FF]/25"
                        >
                          Lo quiero
                        </a>
                      </div>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ══ PROCESO — premium storytelling ════════════════ */}
      <section id="por-que" className="bg-white py-32 sm:py-44">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-24 max-w-2xl">
            <p className="section-label mb-5">El proceso</p>
            <h2 className="display-md text-[#0A0A0A]">
              Tan fácil como
              <br />
              <span className="text-[#0068FF]">cuatro pasos.</span>
            </h2>
          </Reveal>

          <div className="relative grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Connector line (desktop) */}
            <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-[#0068FF]/40 via-[#E5E7EB] to-[#E5E7EB] lg:block" />

            {HOW_STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.12} className="relative">
                {/* Step dot */}
                <div className="relative z-10 mb-8 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-sm">
                  <span
                    className="text-[15px] font-bold text-[#0068FF]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {step.n}
                  </span>
                </div>
                <h3
                  className="text-[19px] font-bold text-[#0A0A0A]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {step.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.7] text-[#6B7280]">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMPARISON — MoviLease vs Concesionario ═══════ */}
      <section className="bg-[#FAFAFA] py-32 sm:py-44">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <Reveal className="mb-20 text-center">
            <p className="section-label mb-5">La diferencia</p>
            <h2 className="display-md text-[#0A0A0A]">
              ¿Por qué renting
              <br />
              y no comprar?
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <div
              className="overflow-hidden rounded-3xl bg-white"
              style={{ boxShadow: "var(--shadow-float)" }}
            >
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-[#F0F1F3] bg-[#FAFBFC] px-6 py-5 sm:px-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF]">
                  Comparativa
                </span>
                <span
                  className="w-[100px] text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#0068FF] sm:w-[140px]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  MoviLease
                </span>
                <span className="w-[100px] text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#C4C9D0] sm:w-[140px]">
                  Compra
                </span>
              </div>

              {/* Rows */}
              {COMPARISON.map((row) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-[#F7F8F9] px-6 py-5 transition-colors last:border-0 hover:bg-[#FAFBFF] sm:px-10"
                >
                  <span className="text-[13.5px] font-medium text-[#374151]">{row.feature}</span>
                  <span className="flex w-[100px] items-center justify-center gap-1.5 sm:w-[140px]">
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0">
                      <circle cx="8" cy="8" r="8" fill="#0068FF" fillOpacity="0.1" />
                      <path
                        d="M5 8.2l2 2 4-4.4"
                        stroke="#0068FF"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[12px] font-semibold text-[#0A0A0A]">{row.movilease}</span>
                  </span>
                  <span className="w-[100px] text-center text-[12px] text-[#9CA3AF] sm:w-[140px]">
                    {row.dealer}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.25} className="mt-12 text-center">
            <a
              href={buildWhatsAppLink("Hola, quiero saber cuánto me ahorro con renting.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Calcular mi ahorro
            </a>
          </Reveal>
        </div>
      </section>

      {/* ══ MARCAS ════════════════════════════════════════ */}
      <section id="marcas" className="bg-white py-32 sm:py-44">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label mb-5">Catálogo por marcas</p>
              <h2 className="display-md text-[#0A0A0A]">
                Todas las marcas.
                <br />
                Un solo lugar.
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="group hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9CA3AF] transition-colors hover:text-[#0068FF] sm:flex"
            >
              Catálogo completo
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
          </Reveal>

          {premiumBrands.length > 0 && (
            <>
              <Reveal className="mb-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C4C9D0]">
                  Marcas premium
                </p>
              </Reveal>
              <RevealGroup
                stagger={0.07}
                className="mb-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
              <Reveal className="mb-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C4C9D0]">
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

      {/* ══ DESTACADOS ════════════════════════════════════ */}
      {dedupedFeatured.length > 0 && (
        <section id="catalogo" className="bg-[#FAFAFA] py-32 sm:py-44">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal className="mb-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label mb-5">Selección de la semana</p>
                <h2 className="display-md text-[#0A0A0A]">
                  Los más
                  <br />
                  solicitados.
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="group hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#9CA3AF] transition-colors hover:text-[#0068FF] sm:flex"
              >
                Ver todos
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </Link>
            </Reveal>

            <RevealGroup
              stagger={0.06}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {dedupedFeatured.map((vehicle) => (
                <RevealItem key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.2} className="mt-16 text-center">
              <Link href="/catalogo" className="btn-primary">
                Explorar todo el catálogo
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══ TESTIMONIOS ═══════════════════════════════════ */}
      <section className="bg-white py-32 sm:py-44">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-20">
            <p className="section-label mb-5">Clientes reales</p>
            <h2 className="display-md text-[#0A0A0A]">
              Confianza
              <br />
              demostrada.
            </h2>
          </Reveal>

          <RevealGroup stagger={0.08} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <RevealItem key={t.name}>
                <div
                  className="flex h-full flex-col rounded-2xl bg-white p-9 transition-all duration-400 hover:-translate-y-1.5"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="mb-7 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <svg key={i} viewBox="0 0 12 12" fill="#0068FF" className="h-3.5 w-3.5">
                        <path d="M6 0l1.5 4h4.5l-3.5 2.5 1.5 4L6 8.5 2 10.5l1.5-4L0 4h4.5z" />
                      </svg>
                    ))}
                  </div>
                  <p className="flex-1 text-[15px] leading-[1.75] text-[#374151]">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-8 flex items-center gap-3.5 border-t border-[#F5F6F8] pt-6">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0068FF]/10 to-[#0068FF]/5 text-[13px] font-bold text-[#0068FF]"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
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

      {/* ══ FAQ ═══════════════════════════════════════════ */}
      <section id="faq" className="bg-[#FAFAFA] py-32 sm:py-44">
        <div className="mx-auto max-w-4xl px-6 sm:px-10">
          <Reveal className="mb-20">
            <p className="section-label mb-5">FAQ</p>
            <h2 className="display-md text-[#0A0A0A]">
              Preguntas
              <br />
              frecuentes.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div
              className="rounded-3xl bg-white px-8 py-4 sm:px-12"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <FAQAccordion items={FAQ_ITEMS} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ CTA FINAL — dark cinematic ════════════════════ */}
      <section className="ambient-blue relative overflow-hidden bg-[#080808] py-40 sm:py-56">
        <Reveal className="relative z-10 mx-auto max-w-5xl px-6 text-center sm:px-10">
          <p className="section-label mb-8">MoviLease — Smart Mobility Platform</p>
          <h2 className="display-lg text-white">
            El futuro pertenece
            <br />
            a quienes se mueven
            <br />
            <span className="text-[#0068FF]">mejor.</span>
          </h2>
          <p className="mx-auto mt-10 max-w-md text-[14px] leading-relaxed text-white/30">
            Sin entrada · Gestión en 48 h · Todo incluido
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={buildWhatsAppLink("Hola, me gustaría información sobre renting de coches.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Hablar por WhatsApp
            </a>
            <Link href="/catalogo" className="btn-ghost">
              Explorar catálogo
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
