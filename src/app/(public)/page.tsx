import Link from "next/link";
import { getFeaturedVehicles, getOfferVehicles } from "@/lib/data/vehicles";
import { buildWhatsAppLink } from "@/lib/constants";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { HeroImage } from "@/components/home/HeroImage";
import { HeroContent } from "@/components/home/HeroContent";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { Reveal, RevealGroup, RevealItem, AnimatedCounter } from "@/components/ui/Reveal";

export const revalidate = 3600;

const STATS = [
  { value: 10000, prefix: "+", suffix: "",  decimals: 0, label: "Clientes satisfechos" },
  { value: 4.9,   prefix: "",  suffix: "",  decimals: 1, label: "Valoración Google" },
  { value: 30,    prefix: "+", suffix: "",  decimals: 0, label: "Marcas disponibles" },
  { value: 48,    prefix: "",  suffix: "h", decimals: 0, label: "Entrega garantizada" },
];

const WHY_ITEMS = [
  { num: "01", title: "Cuota todo incluido",  body: "Seguro a todo riesgo, mantenimiento, asistencia 24h e impuesto de circulación. Sin sorpresas al final del mes." },
  { num: "02", title: "Sin entrada, 0 €",     body: "Empieza a conducir tu coche nuevo sin ningún desembolso inicial. Sin comprometer tu liquidez." },
  { num: "03", title: "Gestión en 48 h",      body: "Tramitamos tu solicitud y tienes respuesta en menos de 48 horas laborables. Rápido y transparente." },
  { num: "04", title: "Renueva sin límites",  body: "Al vencer el contrato, cambia de modelo. Nosotros gestionamos la devolución y la entrega del nuevo." },
];

const TESTIMONIALS = [
  { stars: 5, text: "Super agradecido con el trato recibido. Un profesional recomendable 100×100.", name: "Manuel V.", info: "Madrid · Renault Symbioz" },
  { stars: 5, text: "Todo muy fácil y rápido. El proceso fue completamente transparente y sin letra pequeña.", name: "Vanessa G.", info: "Barcelona · VW Taigo" },
  { stars: 5, text: "Excelente trato y profesionalidad. Recomendable al 100%. Repetiría sin dudarlo.", name: "Daniel P.", info: "Valencia · Hyundai Tucson" },
  { stars: 5, text: "Satisfacción total. Buen trato y profesionalidad del comercial. Todo perfecto.", name: "José Carlos M.", info: "Sevilla · MG ZS" },
  { stars: 5, text: "Súper atento en todo el proceso. Me ayudaron a elegir el coche ideal. Muy recomendable.", name: "Lucía M.", info: "Zaragoza · Citroën C4" },
  { stars: 5, text: "Excelente servicio. Me ayudaron a encontrar el coche perfecto para mi familia.", name: "Jorge V.", info: "Bilbao · Renault Austral" },
];

const FAQ_ITEMS = [
  { q: "¿Qué incluye la cuota mensual?",    a: "Seguro a todo riesgo, mantenimiento, asistencia en carretera 24h, impuesto de circulación y cambio de neumáticos. Una cuota fija sin sorpresas." },
  { q: "¿Necesito dar una entrada?",         a: "No. Todos los coches del catálogo se ofrecen sin entrada inicial. 0 € de desembolso al comenzar." },
  { q: "¿A cuántos kilómetros al año?",      a: "Los precios se calculan para contratos de 36 meses y 15.000 km/año. Adaptamos el kilometraje a tu uso real." },
  { q: "¿Cuánto tarda la aprobación?",       a: "En menos de 48 horas laborables tramitamos tu solicitud y te damos respuesta. La entrega se realiza en 7–15 días." },
  { q: "¿Puedo cancelar antes de tiempo?",   a: "Cada caso se estudia de forma individual. Contáctanos por WhatsApp y te asesoramos sin compromiso." },
  { q: "¿Es solo para particulares?",        a: "Principalmente sí, aunque también tramitamos renting para autónomos y pequeñas empresas. Consúltanos tu caso." },
];

const BRANDS = ["Volkswagen", "Renault", "SEAT", "Hyundai", "Toyota", "Mazda", "Kia", "Peugeot", "Citroën", "Audi", "Ford", "Nissan", "Skoda", "Opel", "Jeep", "Cupra", "BMW", "Mercedes"];

export default async function HomePage() {
  const [featured, offers] = await Promise.all([
    getFeaturedVehicles(200),
    getOfferVehicles(16),
  ]);

  const seenModels = new Set<string>();
  const dedupedFeatured = featured.filter((v) => {
    if (seenModels.has(v.modelSlug)) return false;
    seenModels.add(v.modelSlug);
    return true;
  });

  const seenOfferModels = new Set<string>();
  const dedupedOffers = offers.filter((v) => {
    if (seenOfferModels.has(v.modelSlug)) return false;
    seenOfferModels.add(v.modelSlug);
    return true;
  });

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative flex h-screen min-h-[700px] items-end overflow-hidden bg-[#020608]">
        <HeroImage />
        <HeroContent />
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="border-b border-white/5 bg-[#061B3F]">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid grid-cols-2 divide-x divide-white/5 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col justify-center px-6 py-16 first:pl-0 last:pr-0 sm:py-20">
                <p
                  className="font-bold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}
                >
                  <AnimatedCounter
                    value={s.value}
                    prefix={s.prefix}
                    suffix={s.suffix}
                    decimals={s.decimals}
                    duration={2}
                  />
                </p>
                <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-white/30">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDS MARQUEE ───────────────────────────────── */}
      <section className="overflow-hidden border-b border-white/5 bg-[#04101F] py-10">
        <p className="mb-7 text-center text-[9px] uppercase tracking-[0.3em] text-white/20">
          Marcas disponibles en catálogo
        </p>
        <div className="marquee-track gap-14 px-0">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span
              key={i}
              className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/20"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {brand}
              <span className="ml-14 mr-0 text-white/8">·</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── OFERTAS EXCLUSIVAS ────────────────────────────── */}
      {dedupedOffers.length > 0 && (
        <section id="ofertas" className="bg-[#04101F] py-48">
          <div className="mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal className="mb-20 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0068FF]">
                  Disponibilidad limitada
                </p>
                <h2
                  className="font-bold text-white"
                  style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2.6rem, 5.5vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.0 }}
                >
                  Ofertas<br />exclusivas
                </h2>
              </div>
              <a
                href={buildWhatsAppLink("Hola, me interesan las ofertas exclusivas.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden text-[10px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white sm:block"
              >
                Ver todas →
              </a>
            </Reveal>

            <RevealGroup
              stagger={0.06}
              className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {dedupedOffers.map((vehicle) => (
                <RevealItem key={vehicle.id}>
                  <div className="group relative h-full overflow-hidden bg-[#04101F]">
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
                        <div className="flex h-full items-center justify-center text-6xl font-bold text-white/4">
                          {vehicle.brandName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Badge */}
                      <div className="absolute left-4 top-4">
                        <span className="bg-[#0068FF] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white">
                          Oferta
                        </span>
                      </div>

                      {/* Name on image */}
                      <div className="absolute bottom-0 left-0 p-5">
                        <p
                          className="text-[17px] font-bold leading-tight text-white"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {vehicle.brandName} {vehicle.modelName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-5">
                      <div>
                        <p
                          className="font-bold text-[#0068FF]"
                          style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)" }}
                        >
                          {vehicle.priceLabel}
                          <span className="ml-1 text-xs font-normal text-white/30">/mes</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-white/30 line-clamp-1">{vehicle.version}</p>
                      </div>
                      <a
                        href={buildWhatsAppLink(`Hola, me interesa la oferta del ${vehicle.brandName} ${vehicle.modelName}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-[#0068FF]/40 px-4 py-2.5 text-[9px] uppercase tracking-[0.16em] text-[#0068FF] transition-all duration-300 hover:border-[#0068FF] hover:bg-[#0068FF] hover:text-white"
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

      {/* ── CATÁLOGO ──────────────────────────────────────── */}
      <section id="catalogo" className="bg-[#061B3F] py-48">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-20 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0068FF]">
                Todos los vehículos
              </p>
              <h2
                className="font-bold text-white"
                style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2.6rem, 5.5vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.0 }}
              >
                {dedupedFeatured.length} modelos<br />disponibles
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="hidden text-[10px] uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white sm:block"
            >
              Catálogo completo →
            </Link>
          </Reveal>

          {dedupedFeatured.length > 0 ? (
            <Reveal duration={0.7} y={20}>
              <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {dedupedFeatured.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </Reveal>
          ) : (
            <p className="py-24 text-center text-white/20">Catálogo cargando…</p>
          )}
        </div>
      </section>

      {/* ── POR QUÉ — Editorial ───────────────────────────── */}
      <section id="por-que" className="bg-[#020608] py-48">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-24">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0068FF]">
              Por qué elegirnos
            </p>
            <h2
              className="max-w-lg font-bold text-white"
              style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2.6rem, 5.5vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.0 }}
            >
              Una cuota.<br />Todo incluido.
            </h2>
          </Reveal>

          <div className="divide-y divide-white/5">
            {WHY_ITEMS.map((item) => (
              <Reveal key={item.num} y={16}>
                <div className="flex items-start gap-10 py-10 sm:gap-20 sm:py-12">
                  <span
                    className="shrink-0 font-bold leading-none text-white/6"
                    style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(4rem, 7vw, 6.5rem)" }}
                  >
                    {item.num}
                  </span>
                  <div className="flex flex-1 flex-col gap-3 pt-1 sm:flex-row sm:items-start sm:justify-between sm:gap-16">
                    <h3
                      className="text-xl font-semibold text-white sm:text-2xl"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/38 sm:max-w-sm">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ───────────────────────────────────── */}
      <section className="bg-[#04101F] py-48">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="mb-20">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0068FF]">Clientes</p>
            <h2
              className="font-bold text-white"
              style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2.6rem, 5.5vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.0 }}
            >
              Lo que dicen<br />de nosotros
            </h2>
          </Reveal>

          <RevealGroup
            stagger={0.07}
            className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {TESTIMONIALS.map((t) => (
              <RevealItem key={t.name}>
                <div className="flex h-full flex-col bg-[#04101F] p-8 transition-colors duration-300 hover:bg-[#061B3F]">
                  {/* Stars */}
                  <div className="mb-6 flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <svg key={i} viewBox="0 0 12 12" fill="#0068FF" className="h-3 w-3">
                        <path d="M6 0l1.5 4h4.5l-3.5 2.5 1.5 4L6 8.5 2 10.5l1.5-4L0 4h4.5z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="flex-1 text-[15px] leading-relaxed text-white/55">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="mt-8 flex items-center gap-3 border-t border-white/5 pt-6">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0068FF]/10 text-xs font-bold text-[#0068FF]">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{t.name}</p>
                      <p className="text-[11px] text-white/30">{t.info}</p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section id="faq" className="bg-[#020608] py-48">
        <div className="mx-auto max-w-4xl px-6 sm:px-10">
          <Reveal className="mb-20">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0068FF]">FAQ</p>
            <h2
              className="font-bold text-white"
              style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2.6rem, 5.5vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.0 }}
            >
              Preguntas<br />frecuentes
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <FAQAccordion items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#061B3F] py-52">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse 70% 70% at 60% 50%, rgba(0,104,255,0.25) 0%, transparent 70%)" }}
        />

        <Reveal className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 text-center sm:px-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0068FF]">
            MOVILEASE® — Smart Mobility Platform
          </p>
          <h2
            className="font-bold text-white"
            style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(2.8rem, 7vw, 6.5rem)", letterSpacing: "-0.03em", lineHeight: 1.0 }}
          >
            El futuro pertenece<br />a quienes se mueven<br />
            <span className="text-[#0068FF]">mejor.</span>
          </h2>

          <p className="text-sm text-white/35">
            Sin entrada · Gestión en 48 h · Todo incluido
          </p>

          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
            <a
              href={buildWhatsAppLink("Hola, me gustaría información sobre renting de coches.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25d366] px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-all hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Hablar por WhatsApp
            </a>
            <Link
              href="/catalogo"
              className="border border-white/20 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              Explorar catálogo
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
