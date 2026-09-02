import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedVehicles, getOfferVehicles, getVehiclesByBrand } from "@/lib/data/vehicles";
import { buildWhatsAppLink } from "@/lib/constants";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { BrandCard } from "@/components/catalog/BrandCard";
import { HeroVideo } from "@/components/home/HeroVideo";
import { HeroContent } from "@/components/home/HeroContent";
import { FAQAccordion } from "@/components/home/FAQAccordion";
import { LeadForm } from "@/components/forms/LeadForm";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { VideoBackdrop } from "@/components/ui/VideoBackdrop";
import {
  FaqJsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
} from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/metadata";

export const revalidate = 3600;

/**
 * Vídeo de fondo de la sección de ofertas. A false la sección usa la foto del
 * BMW (hero-car.webp) como fondo en vez del vídeo de tráfico — decisión de
 * contenido, no un problema técnico. El vídeo y su script de generación
 * siguen aquí sin tocar por si se retoma más adelante.
 */
const OFERTAS_VIDEO = false;

export const metadata: Metadata = pageMetadata({
  title: "Renting de coches sin entrada | Todo incluido",
  description:
    "Renting de coches para particulares, autónomos y empresas: sin entrada, con seguro a todo riesgo, mantenimiento e impuestos incluidos. Respuesta en 48 h.",
  path: "/",
});

/**
 * La barra de ventajas de la home.
 *
 * Empezó siendo una barra de cifras y ha ido perdiendo todas: primero
 * "+10.000 clientes" y "4,9 en Google", que eran falsas; después el tamaño del
 * catálogo, cierto pero que juega en contra cuando hay pocos coches. Adrián
 * pide ahora ventajas del servicio, y encaja con lo que decide de verdad una
 * contratación de renting: no cuántos coches hay en la lista, sino qué entra
 * en la cuota y quién te coge el teléfono.
 *
 * Ya no usa AnimatedCounter: estos valores no son números. El contador sigue
 * vivo en "Quiénes somos", que sí tiene cifras que contar.
 *
 * Las cuatro son defendibles si alguien pregunta: lo incluido está enumerado
 * más abajo en esta misma página, la cuota más baja es la regla con la que se
 * eligen los precios del catálogo, y las 48 h se repiten en el hero y en la FAQ.
 *
 * La del asesor la señaló Adrián como la ventaja real frente a una gran
 * comercializadora: allí cada llamada la coge otra persona y el cliente repite
 * su caso desde cero. Aquí le atiende siempre el mismo, y eso sí que no lo
 * puede copiar una web con más catálogo.
 */
const VENTAJAS = [
  { titulo: "Todo incluido", detalle: "Seguro, mantenimiento e impuestos" },
  { titulo: "Mejores ofertas", detalle: "Buscamos la cuota más baja" },
  { titulo: "El mismo asesor", detalle: "No hablas con uno distinto cada vez" },
  { titulo: "48 h", detalle: "Respuesta a tu solicitud" },
];

const MARQUEE_BRANDS = [
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Toyota", "Hyundai",
  "Kia", "Renault", "Peugeot", "Citroën", "SEAT", "CUPRA",
  "Škoda", "Ford", "Opel", "Nissan", "MG", "Volvo",
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

/**
 * Todo lo que va dentro de la cuota. Antes esto sólo se contaba de pasada (una
 * respuesta del FAQ y cuatro pastillas en el hero); es el argumento de venta
 * principal del renting, así que va escrito y desarrollado en su propia
 * sección. Los iconos son decorativos: el texto se entiende sin ellos.
 */
const INCLUDED = [
  {
    title: "Coche nuevo",
    body: "Vehículo a estrenar, del año en curso y con la garantía oficial del fabricante. Cero kilómetros de nadie más.",
    icon: (
      <>
        <path d="M3.5 16.5h17V12l-1.8-4.2a2 2 0 0 0-1.8-1.3H7.1a2 2 0 0 0-1.8 1.3L3.5 12v4.5Z" />
        <path d="M4.5 16.5v2a1 1 0 0 0 1 1H7a1 1 0 0 0 1-1v-2m8 0v2a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-2" />
        <path d="M7 13.5h.01M17 13.5h.01" />
      </>
    ),
  },
  {
    title: "Precios transparentes",
    body: "Una única cuota mensual con el IVA ya incluido. Sin comisiones de apertura, sin gastos ocultos y sin letra pequeña.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M15 9.6a3.4 3.4 0 1 0 0 4.8" />
        <path d="M8.4 11h4.4M8.4 13h4.4" />
      </>
    ),
  },
  {
    title: "Sin entrada",
    body: "0 € de desembolso inicial. No inmovilizas ahorros ni pides un préstamo: empiezas a pagar cuando ya tienes el coche.",
    icon: (
      <>
        <path d="M3.5 8.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
        <path d="M3.5 8.5v8a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3" />
        <path d="M20.5 9.5H17a2.5 2.5 0 0 0 0 5h3.5" />
      </>
    ),
  },
  {
    title: "Entrega a domicilio",
    body: "Te llevamos el coche a donde nos digas, en cualquier punto de España, sin coste añadido. No pisas el concesionario.",
    icon: (
      <>
        <path d="M12 21s7-5.6 7-10.5a7 7 0 1 0-14 0C5 15.4 12 21 12 21Z" />
        <circle cx="12" cy="10.4" r="2.5" />
      </>
    ),
  },
  {
    title: "Todo incluido",
    body: "Seguro a todo riesgo, impuesto de circulación, matriculación y gestiones. Tú solo pones el combustible.",
    icon: (
      <>
        <path d="M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6l7-3Z" />
        <path d="M9 12l2.2 2.2L15.5 10" />
      </>
    ),
  },
  {
    title: "Asistencia en carretera",
    body: "24 horas, 365 días al año y en toda Europa. Una avería o un pinchazo dejan de ser tu problema.",
    icon: (
      <>
        <path d="M5 13v-1a7 7 0 0 1 14 0v1" />
        <path d="M5 13a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2Zm14 0a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2Z" />
        <path d="M19 19v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
      </>
    ),
  },
  {
    title: "Cambio de neumáticos",
    body: "Neumáticos nuevos cuando toca, montados y equilibrados. Ni una factura de tu bolsillo por desgaste.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 3.5v5M12 15.5v5M3.5 12h5M15.5 12h5" />
      </>
    ),
  },
  {
    title: "Revisiones y averías",
    body: "Mantenimiento en talleres oficiales y reparaciones cubiertas. Nosotros gestionamos la cita; tú sigues conduciendo.",
    icon: (
      <>
        <path d="M20 5.4a4.5 4.5 0 0 1-5.9 5.9l-7.5 7.5a2 2 0 0 1-2.8-2.8l7.5-7.5A4.5 4.5 0 0 1 17.2 2.6l-2.8 2.8 1.4 2.8 2.8 1.4L20 5.4Z" />
      </>
    ),
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
  { q: "¿Qué incluye la cuota mensual?",   a: "Coche nuevo, seguro a todo riesgo, mantenimiento y revisiones en talleres oficiales, averías, cambio de neumáticos, asistencia en carretera 24 h, impuesto de circulación y matriculación. Una cuota fija con IVA incluido, sin entrada y sin sorpresas." },
  { q: "¿Necesito dar una entrada?",        a: "No. Todos los coches del catálogo se ofrecen sin entrada inicial. 0 € de desembolso al comenzar." },
  { q: "¿A cuántos kilómetros al año?",     a: "Los precios se calculan para contratos de 36 meses y 10.000 km/año. Adaptamos el kilometraje a tu uso real." },
  { q: "¿Cuánto tarda la aprobación?",      a: "En menos de 48 horas laborables tramitamos tu solicitud y te damos respuesta." },
  { q: "¿Puedo cancelar antes de tiempo?",  a: "Cada caso se estudia de forma individual. Contáctanos por WhatsApp y te asesoramos sin compromiso." },
  { q: "¿Es solo para particulares?",       a: "Principalmente sí, aunque también tramitamos renting para autónomos y pequeñas empresas." },
];

export default async function HomePage() {
  const [featured, offers, { brands }] = await Promise.all([
    getFeaturedVehicles(200),
    // Seis, las que marca Adrián: Ibiza, Polo, Taigo, Ebro S400, GLC Coupé y
    // CR-V. Con el tope en cuatro que había antes no llegaban a verse el GLC ni
    // el CR-V, porque la consulta ordena por cuota ascendente y son los dos más
    // caros de la selección.
    getOfferVehicles(6),
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

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <FaqJsonLd items={FAQ_ITEMS} />

      {/* ══ HERO — cinematic ══════════════════════════════ */}
      <section className="relative flex h-screen min-h-[680px] items-center overflow-hidden bg-[#071A3D]">
        <HeroVideo />
        <HeroContent />
      </section>

      {/* ══ STATS — dark graphite, huge numbers ═══════════ */}
      <section className="surface-graphite relative overflow-hidden bg-texture-dark section-y">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <div className="grid grid-cols-2 gap-14 sm:grid-cols-4 sm:gap-0">
            {VENTAJAS.map((v, i) => (
              <Reveal
                key={v.titulo}
                delay={i * 0.08}
                className={`text-center sm:px-8 ${i > 0 ? "sm:border-l sm:border-white/10" : ""}`}
              >
                <p className="display-sm text-white">{v.titulo}</p>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  {v.detalle}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MARQUEE — marcas disponibles ══════════════════ */}
      <section className="surface-black overflow-hidden section-y-sm">
        <Reveal className="mb-10 text-center">
          <p className="section-label">Marcas disponibles</p>
        </Reveal>
        <div className="marquee-track" aria-hidden="true">
          {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="mx-7 whitespace-nowrap text-[15px] font-bold uppercase tracking-[0.28em] text-white/70 sm:mx-10 sm:text-[17px]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {brand}
            </span>
          ))}
        </div>
      </section>

      {/* ══ OFERTAS — fondo claro con la foto del BMW ═════
          Las tarjetas son azul marino oscuro: sobre claro destacan mucho más
          que sobre el azul oscuro anterior, así que el bloque gana presencia
          sin tocar las tarjetas. La foto va detrás de un velo claro, que es
          lo que mantiene legible el texto. */}
      {/* El fondo claro va en la propia sección, no sólo en el backdrop: si la
          foto fallase, el texto en tinta oscura quedaría sobre el azul marino
          del body y sería ilegible.
          Va antes que "Catálogo por marcas": son las 4 ofertas más atractivas
          del momento (Ibiza 80CV, Polo, Taigo, Ebro S400), pensadas como
          gancho inmediato antes de que el visitante explore por marca. */}
      {dedupedOffers.length > 0 && (
        <section id="ofertas" className="relative overflow-hidden bg-[#F4F6FA] section-y">
          <VideoBackdrop
            mp4={OFERTAS_VIDEO ? "/videos/ofertas.mp4" : undefined}
            poster={OFERTAS_VIDEO ? "/videos/ofertas-poster.webp" : "/hero-car.webp"}
            /* Velo fuerte arriba, donde va el titular en tinta oscura, y flojo
               en la banda de las tarjetas, que es donde interesa ver pasar los
               coches. Las tarjetas son opacas: no necesitan velo debajo. */
            veil="linear-gradient(180deg, rgba(244,246,250,0.95) 0%, rgba(244,246,250,0.92) 30%, rgba(244,246,250,0.50) 46%, rgba(244,246,250,0.58) 100%)"
          />

          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal className="section-head flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                {/* .section-label es CSS sin capa y gana a las utilidades de
                    Tailwind, de ahi el estilo en linea. #0068FF sobre este gris
                    azulado se queda en 4,39:1, justo por debajo de AA. */}
                <p className="section-label mb-5" style={{ color: "#0057D6" }}>
                  Disponibilidad limitada
                </p>
                <h2 className="display-md text-[#0A0A0A]">
                  Ofertas
                  <br />
                  <span className="text-[#0057D6]">exclusivas.</span>
                </h2>
              </div>
              <a
                href={buildWhatsAppLink("Hola, me interesan las ofertas exclusivas.")}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden items-center gap-2 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#4B5563] transition-colors hover:text-[#0057D6] sm:flex"
              >
                Consultar todas
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </a>
            </Reveal>

            {/* Tres columnas, no cuatro: son seis ofertas y en rejilla de
                cuatro quedaba una segunda fila con dos huecos. A tres salen
                dos filas llenas y cada foto se ve bastante más grande, que es
                justo lo que hay que enseñar. */}
            <RevealGroup
              stagger={0.08}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {dedupedOffers.map((vehicle) => (
                <RevealItem key={vehicle.id}>
                  {/*
                    La tarjeta era un <div> con un único enlace a WhatsApp:
                    pinchar la foto o el nombre no llevaba a la ficha. Ahora la
                    imagen y el título son un enlace real a /[modelo], con el
                    mismo reparto que VehicleCard (el botón de WhatsApp queda
                    fuera del enlace, no se pueden anidar).
                  */}
                  <div
                    className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#0C2454]/20 bg-gradient-to-b from-[#1B4080] to-[#0C2454] hover:border-[#5AA0FF]/50"
                    style={{ boxShadow: "0 18px 40px rgba(7,26,61,0.22)" }}
                  >
                    <Link
                      href={`/${vehicle.modelSlug}`}
                      className="flex flex-1 flex-col"
                      aria-label={`Ver ficha del ${vehicle.brandName} ${vehicle.modelName}`}
                    >
                      {/*
                        El respaldo va SIEMPRE detrás de la foto, no sólo cuando
                        falta imageUrl: si la foto tarda en llegar o falla (CDN,
                        bloqueador, red), antes se veía la tarjeta azul vacía y
                        parecía que el coche no tenía foto. VehicleCard ya hacía
                        esto con su fondo gris; aquí faltaba.
                      */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1B4080] to-[#15315F]">
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-white/15"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {vehicle.brandName.charAt(0)}
                        </span>
                        {vehicle.imageUrl && (
                          /* next/image en lugar de <img> crudo: sirve WebP/AVIF
                             al tamaño real de la tarjeta en vez de la foto
                             original completa. */
                          <Image
                            src={vehicle.imageUrl}
                            alt={`${vehicle.brandName} ${vehicle.modelName}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4080] via-transparent to-transparent" />
                        <div className="absolute left-4 top-4">
                          <span className="rounded-full bg-[#0068FF] px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#0068FF]/30">
                            Oferta
                          </span>
                        </div>
                      </div>

                      <div className="px-6 pb-2 pt-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                          {vehicle.brandName}
                        </p>
                        <h3
                          className="mt-1 text-[20px] font-bold leading-tight text-white"
                          style={{ fontFamily: "var(--font-space-grotesk)" }}
                        >
                          {vehicle.modelName}
                        </h3>
                      </div>
                    </Link>

                    <div className="mt-auto px-6 pb-5 pt-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-white/75">desde</p>
                          <p
                            className="text-[25px] font-bold leading-none text-white"
                            style={{ fontFamily: "var(--font-space-grotesk)" }}
                          >
                            {vehicle.priceLabel}
                            <span className="ml-1 text-[12px] font-normal text-white/75">/mes</span>
                          </p>
                        </div>
                        <a
                          href={buildWhatsAppLink(
                            `Hola, me interesa la oferta del ${vehicle.brandName} ${vehicle.modelName}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-full bg-[#0068FF] px-5 py-3.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-white shadow-lg shadow-[#0068FF]/25 transition-all duration-300 hover:bg-[#0052CC] hover:shadow-xl hover:shadow-[#0068FF]/35"
                        >
                          Lo quiero
                        </a>
                      </div>

                      <Link
                        href={`/${vehicle.modelSlug}`}
                        className="group/link mt-4 flex min-h-[44px] items-center justify-between gap-2 border-t border-white/12 pt-3.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-[#8FBEFF] transition-colors hover:text-white"
                      >
                        <span className="whitespace-nowrap">Ver ficha</span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 transition-transform duration-300 group-hover/link:translate-x-1"
                        >
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* ══ MARCAS — premium white ════════════════════════ */}
      <section id="marcas" className="relative overflow-hidden bg-[#FAFAFA] bg-texture-light section-y">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="section-head flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-label section-label-on-light mb-5">Catálogo por marcas</p>
              <h2 className="display-md text-[#0A0A0A]">
                Todas las marcas.
                <br />
                Un solo lugar.
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="group hidden items-center gap-2 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[#4B5563] transition-colors hover:text-[#0068FF] sm:flex"
            >
              Catálogo completo
              <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
          </Reveal>

          <RevealGroup
            stagger={0.03}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {brands.map((brand) => (
              <RevealItem key={brand.brandName}>
                <BrandCard brand={brand} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ══ DESTACADOS — dark graphite con vídeo de fondo ══
          Coches en un parking en penumbra: encaja con "los más solicitados",
          pero a brillo bajo para que sean las tarjetas (con los coches reales
          del catálogo) las que se vean bien, no el vídeo. */}
      {dedupedFeatured.length > 0 && (
        <section id="catalogo" className="surface-graphite relative overflow-hidden section-y">
          <VideoBackdrop
            mp4="/videos/destacados.mp4"
            webm="/videos/destacados.webm"
            poster="/videos/destacados-poster.webp"
            base="#16407F"
            filter="brightness(1.05) saturate(0.95) contrast(1.02)"
            veil="linear-gradient(180deg, rgba(45,105,200,0.4) 0%, rgba(25,68,135,0.5) 45%, rgba(19,58,120,0.7) 100%)"
          />
          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
            <Reveal className="section-head flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-label mb-5">Selección de la semana</p>
                <h2 className="display-md text-white">
                  Los más
                  <br />
                  solicitados.
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="group hidden items-center gap-2 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-white sm:flex"
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

      {/* ══ PROCESO — premium white contrast ══════════════ */}
      <section id="por-que" className="relative overflow-hidden bg-white bg-texture-light section-y">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="section-head max-w-2xl">
            <p className="section-label section-label-on-light mb-5">El proceso</p>
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
                  className="text-[20px] font-bold text-[#0A0A0A]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.72] text-[#4B5563]">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ INCLUIDO — qué entra en la cuota ══════════════ */}
      <section id="incluido" className="relative overflow-hidden bg-[#FAFAFA] bg-texture-light section-y">
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="section-head max-w-2xl">
            <p className="section-label section-label-on-light mb-5">Qué incluye tu cuota</p>
            <h2 className="display-md text-[#0A0A0A]">
              Ocho cosas dentro.
              <br />
              <span className="text-[#0068FF]">Ninguna sorpresa fuera.</span>
            </h2>
            <p className="mt-7 text-[16px] leading-[1.72] text-[#4B5563]">
              El renting no es un alquiler pelado: en la misma cuota fija va el coche
              y todo lo que cuesta tenerlo. Esto es exactamente lo que pagas cada mes.
            </p>
          </Reveal>

          <RevealGroup
            stagger={0.05}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {INCLUDED.map((item) => (
              <RevealItem key={item.title}>
                <div
                  className="card-lift flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-7"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0068FF]/10 text-[#0068FF]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-6 w-6"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <h3
                    className="text-[18px] font-bold leading-tight text-[#0A0A0A]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-[1.7] text-[#4B5563]">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2} className="mt-14 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/calculadora" className="btn-primary">
              Calcular mi cuota
            </Link>
            <a
              href={buildWhatsAppLink("Hola, quiero saber qué incluye exactamente la cuota.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-white"
            >
              Preguntar por WhatsApp
            </a>
          </Reveal>
        </div>
      </section>

      {/* ══ COMPARISON — dark glass table con vídeo de fondo ══
          Vista aérea nocturna de tráfico en una rotonda: movimiento sin
          protagonismo de un coche o marca concreta, encaja con "¿por qué
          renting y no comprar?" (movilidad, no producto). Mismo velo oscuro
          que ya usa surface-carbon para que la tabla siga siendo el foco. */}
      <section className="surface-carbon relative overflow-hidden section-y">
        <VideoBackdrop
          mp4="/videos/porque-renting.mp4"
          poster="/videos/porque-renting-poster.webp"
          base="#16407F"
          filter="brightness(0.95) saturate(0.9) contrast(1.02)"
          veil="linear-gradient(160deg, rgba(42,98,190,0.6) 0%, rgba(22,64,127,0.68) 55%, rgba(11,42,94,0.82) 100%)"
        />
        <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10">
          <Reveal className="section-head text-center">
            <p className="section-label mb-5">La diferencia</p>
            <h2 className="display-md text-white">
              ¿Por qué renting
              <br />
              y no comprar?
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur">
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-white/[0.08] bg-white/[0.02] px-4 py-5 sm:gap-4 sm:px-10">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/90">
                  Comparativa
                </span>
                <span
                  className="w-[84px] text-center text-[12px] font-bold uppercase tracking-[0.12em] text-[#5AA0FF] sm:w-[140px]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  MoviLease
                </span>
                <span className="w-[84px] text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 sm:w-[140px]">
                  Compra
                </span>
              </div>

              {/* Rows */}
              {COMPARISON.map((row) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-white/5 px-4 py-5 transition-colors last:border-0 hover:bg-white/[0.03] sm:gap-4 sm:px-10"
                >
                  <span className="text-[14.5px] font-medium text-white/95">{row.feature}</span>
                  <span className="flex w-[84px] items-center justify-center gap-1.5 sm:w-[140px]">
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0">
                      <circle cx="8" cy="8" r="8" fill="#0068FF" fillOpacity="0.15" />
                      <path
                        d="M5 8.2l2 2 4-4.4"
                        stroke="#0068FF"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[13px] font-semibold text-white">{row.movilease}</span>
                  </span>
                  <span className="w-[84px] text-center text-[13px] text-white/90 sm:w-[140px]">
                    {row.dealer}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.25} className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/calculadora" className="btn-primary">
              Calcular mi cuota
            </Link>
            <a
              href={buildWhatsAppLink("Hola, quiero saber cuánto me ahorro con renting.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Preguntar por WhatsApp
            </a>
          </Reveal>
        </div>
      </section>



      {/* ══ TESTIMONIOS — fondo azul claro, tarjetas oscuras ══
          Mismo recurso que la sección de ofertas: las tarjetas oscuras
          destacan mucho más sobre claro, así que el bloque gana presencia sin
          tocarlas. El titular pasa a tinta porque el fondo ya no es oscuro. */}
      <section className="relative overflow-hidden bg-[#E8F1FD] section-y">
        <VideoBackdrop
          poster="/testimonios-bg.webp"
          base="#E8F1FD"
          veil="linear-gradient(180deg, rgba(232,241,253,0.5) 0%, rgba(232,241,253,0.34) 45%, rgba(232,241,253,0.55) 100%)"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10">
          <Reveal className="section-head">
            <p className="section-label section-label-on-light mb-5">Clientes reales</p>
            <h2 className="display-md text-[#0A0A0A]">
              Confianza
              <br />
              demostrada.
            </h2>
          </Reveal>

          <RevealGroup stagger={0.08} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <RevealItem key={t.name}>
                <div className="card-dark flex h-full flex-col p-9">
                  <div className="mb-7 flex gap-1">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <svg key={i} viewBox="0 0 12 12" fill="#0068FF" className="h-3.5 w-3.5">
                        <path d="M6 0l1.5 4h4.5l-3.5 2.5 1.5 4L6 8.5 2 10.5l1.5-4L0 4h4.5z" />
                      </svg>
                    ))}
                  </div>
                  <p className="flex-1 text-[16px] leading-[1.75] text-white/80">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-8 flex items-center gap-3.5 border-t border-white/5 pt-6">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0068FF]/20 to-[#0068FF]/5 text-[13px] font-bold text-[#0068FF]"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">{t.name}</p>
                      <p className="text-[12.5px] text-white/75">{t.info}</p>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ══ FAQ — dark with light accordion card ══════════
          Mismo clip que el hero (avenida al atardecer), reutilizado tal
          cual — sin volver a procesarlo — a brillo bajo para que la tarjeta
          blanca del acordeón siga siendo lo que se lee. */}
      <section id="faq" className="surface-dark relative overflow-hidden section-y">
        <VideoBackdrop
          mp4="/videos/hero.mp4"
          poster="/videos/hero-poster.webp"
          base="#10306B"
          filter="brightness(0.85) saturate(0.9) contrast(1.02)"
          veil="linear-gradient(180deg, rgba(19,58,120,0.5) 0%, rgba(16,48,107,0.62) 45%, rgba(11,42,94,0.8) 100%)"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10">
          <Reveal className="section-head">
            <p className="section-label mb-5">FAQ</p>
            <h2 className="display-md text-white">
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
          {/* Salida para quien llega hasta el final de la FAQ sin resolver lo
              suyo: ahí ya sabemos que tiene una duda concreta, y el asesor la
              atiende sin que tenga que dejar el teléfono por delante. */}
          <Reveal delay={0.15}>
            <p className="mt-8 text-center text-[15px] text-white/70">
              ¿Tu duda no está aquí?{" "}
              <Link href="/asesor" className="font-semibold text-[#5AA0FF] underline underline-offset-4">
                Habla con nuestro asesor
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ CTA FINAL — copy + formulario ═════════════════
          Antes esta sección solo ofrecía WhatsApp: quien no quiere abrir un
          chat (o navega desde escritorio) se quedaba sin forma de contactar
          sin salir de la home. Ahora el formulario está aquí mismo. */}
      {/* Era la unica seccion grande sin imagen, y es la de mas intencion:
          la carretera al atardecer acompana el "empieza aqui". Velo azul
          marino fuerte porque encima va texto blanco y el formulario. */}
      <section
        id="solicitar"
        className="ambient-blue relative overflow-hidden bg-[#071A3D] section-y"
      >
        <VideoBackdrop
          poster="/img/carretera-atardecer.webp"
          base="#071A3D"
          veil="linear-gradient(180deg, rgba(7,26,61,0.90) 0%, rgba(9,30,70,0.84) 38%, rgba(7,26,61,0.93) 100%)"
        />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-14 px-6 sm:px-10 lg:grid-cols-[1fr_460px] lg:items-center lg:gap-20">
          <Reveal>
            {/* Azul mas claro que --blue-light: sobre la zona del sol de la
                foto, #5AA0FF se queda en 3,99:1 y no llega a AA a 11px. */}
            <p className="section-label mb-6" style={{ color: "#8FBEFF" }}>
              Empieza aquí
            </p>
            <h2 className="display-sm max-w-md text-white">
              Dinos qué coche quieres y te lo{" "}
              <span className="text-[#5AA0FF]">calculamos gratis.</span>
            </h2>
            <p className="mt-7 max-w-md text-[16px] leading-[1.72] text-white/80">
              Un asesor real revisa tu caso y te manda una propuesta con la cuota
              cerrada. Sin llamadas comerciales insistentes y sin compromiso.
            </p>

            <ul className="mt-9 flex flex-col gap-3.5">
              {[
                "Sin entrada: 0 € de desembolso inicial",
                "Seguro a todo riesgo, mantenimiento e impuestos incluidos",
                "Respuesta en menos de 48 horas laborables",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-white/80">
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="mt-1 h-4 w-4 shrink-0"
                  >
                    <circle cx="8" cy="8" r="8" fill="#5AA0FF" fillOpacity="0.2" />
                    <path
                      d="M5 8.2l2 2 4-4.4"
                      stroke="#8FBEFF"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-8 sm:flex-row sm:items-center">
              <p className="text-[14px] text-white/70 sm:mr-2">¿Prefieres escribirnos?</p>
              <a
                href={buildWhatsAppLink("Hola, me gustaría información sobre renting de coches.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp btn-sm w-fit"
              >
                Hablar por WhatsApp
              </a>
              <Link
                href="/catalogo"
                className="flex min-h-[40px] w-fit items-center text-[13px] font-bold uppercase tracking-[0.1em] text-white/75 underline underline-offset-4 transition-colors hover:text-white"
              >
                Ver catálogo
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="shadow-float rounded-3xl border border-white/12 bg-white/[0.04] p-7 backdrop-blur-xl sm:p-9">
              <h3
                className="text-[21px] font-bold text-white"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Pide tu propuesta
              </h3>
              <p className="mb-7 mt-2 text-[14px] text-white/70">
                Dos datos y listo. El resto es opcional.
              </p>
              <LeadForm source="landing_page" submitLabel="Quiero mi propuesta gratis" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
