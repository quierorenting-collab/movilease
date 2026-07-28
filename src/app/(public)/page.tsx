import Link from "next/link";
import { getCurrentBrand } from "@/lib/brand";
import { getFeaturedVehicles, getOfferVehicles } from "@/lib/data/vehicles";
import { buildWhatsAppLink } from "@/lib/constants";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { HeroCanvas } from "@/components/home/HeroCanvas";

export const revalidate = 3600;

const TRUST_ITEMS = [
  "Sin entrada, 0€",
  "Seguro a todo riesgo incluido",
  "Mantenimiento incluido",
  "Gestión en 48h",
  "+30 marcas disponibles",
  "Toda España",
];

const STATS = [
  { value: "+10.000", label: "clientes" },
  { value: "4.9★",   label: "valoración" },
  { value: "+30",    label: "marcas" },
  { value: "48h",    label: "gestión" },
  { value: "0€",     label: "entrada" },
];

const WHY_ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" strokeLinecap="round" />
      </svg>
    ),
    title: "Gestión en 48 horas",
    body: "Tramitamos tu solicitud y tienes respuesta en menos de 48 horas laborables.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" />
      </svg>
    ),
    title: "Seguro a todo riesgo",
    body: "Todos los vehículos incluyen seguro a todo riesgo sin franquicia adicional.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" />
      </svg>
    ),
    title: "Mantenimiento incluido",
    body: "Revisiones, cambio de neumáticos y reparaciones cubiertas en la cuota.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" />
      </svg>
    ),
    title: "Asistencia 24h",
    body: "Asistencia en carretera disponible las 24 horas, los 365 días del año.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
      </svg>
    ),
    title: "Sin entrada inicial",
    body: "Empieza a disfrutar de tu coche nuevo sin desembolso inicial. 0€ de entrada.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" />
      </svg>
    ),
    title: "Renueva cuando quieras",
    body: "Al finalizar el contrato, cambia de coche sin preocuparte de venderlo.",
  },
];

const TESTIMONIALS = [
  { stars: 5, text: "Super agradecido con el trato recibido, un profesional recomendable 100×100. Sin duda repetiremos.", name: "Manuel V.", info: "Madrid · Renault Symbioz" },
  { stars: 5, text: "Todo muy fácil y rápido. El proceso fue completamente transparente desde el primer momento.", name: "Vanessa G.", info: "Barcelona · VW Taigo" },
  { stars: 5, text: "Excelente trato y profesionalidad. Recomendable al 100%.", name: "Daniel P.", info: "Valencia · Hyundai Tucson" },
  { stars: 5, text: "Satisfacción por el buen trato y profesionalidad del comercial. Todo perfecto.", name: "José Carlos M.", info: "Sevilla · MG ZS" },
  { stars: 5, text: "Súper atento en todo el proceso de cambio de contrato. Muy recomendable.", name: "Lucía M.", info: "Zaragoza · Citroën C4" },
  { stars: 5, text: "Excelente servicio y gestión. Me ayudaron a encontrar el coche perfecto para mi familia.", name: "Jorge V.", info: "Bilbao · Renault Austral" },
];

const FAQ_ITEMS = [
  { q: "¿Qué incluye la cuota mensual?", a: "Seguro a todo riesgo, mantenimiento, asistencia en carretera 24h, impuesto de circulación y cambio de neumáticos. Una cuota fija sin sorpresas." },
  { q: "¿Necesito dar una entrada?", a: "No. Todos los coches del catálogo se ofrecen sin entrada inicial. 0€ de desembolso al comenzar." },
  { q: "¿A cuántos kilómetros al año?", a: "Los precios se calculan para contratos de 36 meses y 15.000 km/año. Podemos adaptar el kilometraje según tu uso real." },
  { q: "¿Cuánto tarda la aprobación?", a: "En menos de 48 horas laborables tramitamos tu solicitud y te damos respuesta. La entrega del vehículo se realiza en 7–15 días." },
  { q: "¿Puedo cancelar antes de tiempo?", a: "Cada caso se estudia de forma individual. Contáctanos por WhatsApp y te asesoramos sin compromiso." },
  { q: "¿Es solo para particulares?", a: "Principalmente sí, aunque también tramitamos renting para autónomos y pequeñas empresas. Consúltanos tu caso." },
];

export default async function HomePage() {
  const brand = await getCurrentBrand();
  const [featured, offers] = await Promise.all([
    getFeaturedVehicles(80),
    getOfferVehicles(8),
  ]);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <HeroCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#061B3F]" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-xl rounded-2xl border border-[#0068FF]/15 bg-[#061B3F]/80 p-8 backdrop-blur-md sm:p-10">
            <span className="inline-block rounded-full bg-[#0068FF]/15 px-3 py-1 text-xs font-semibold text-[#0068FF]">
              Smart Mobility Company
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Movilidad inteligente.{" "}
              <span className="text-[#0068FF]">Libertad para crecer.</span>
            </h1>
            <p className="mt-4 text-base text-[#94b8cc] sm:text-lg">
              Una cuota fija mensual con seguro, mantenimiento y asistencia incluidos. Sin entrada, sin sorpresas.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="rounded-full bg-[#0068FF] px-6 py-3 text-sm font-semibold text-[#061B3F] shadow-lg shadow-[#0068FF]/20 transition-all hover:brightness-110"
              >
                Ver catálogo
              </Link>
              <a
                href={buildWhatsAppLink("Hola, quiero información sobre renting de coches.")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#0068FF]/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:border-[#0068FF]/60 hover:bg-[#0068FF]/5"
              >
                Pedir oferta gratis
              </a>
            </div>
            <p className="mt-5 text-xs text-[#5E6673]">
              ⭐⭐⭐⭐⭐ 4.9 en Google · Gestión en 48h · Toda España
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
      <section className="border-y border-[#0068FF]/10 bg-[#0d2442]/80 py-5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-[#94b8cc]">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0068FF]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-[#0068FF] sm:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>{s.value}</p>
                <p className="mt-1 text-sm text-[#94b8cc]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATÁLOGO ──────────────────────────────────────────────────────── */}
      <section id="catalogo" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Nuestro catálogo
            </h2>
            <Link href="/catalogo" className="text-sm text-[#0068FF] hover:underline">
              Filtrar →
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#0068FF]/20 p-10 text-center text-[#94b8cc]">
              Catálogo cargando — vuelve pronto.
            </div>
          )}
        </div>
      </section>

      {/* ── OFERTAS EXCLUSIVAS ────────────────────────────────────────────── */}
      {offers.length > 0 && (
        <section
          id="ofertas"
          className="py-16 border-t border-[#0068FF]/10"
          style={{
            background: "radial-gradient(ellipse at 50% 0, rgba(0,104,255,0.07) 0%, transparent 70%), #061B3F",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-3">
              <span className="rounded-full bg-[#0068FF]/15 px-3 py-1 text-xs font-semibold text-[#0068FF]">
                Disponibilidad limitada
              </span>
            </div>
            <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Ofertas Exclusivas
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {offers.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="group relative overflow-hidden rounded-2xl border border-[#0068FF]/10 bg-[#0d2442] transition-all hover:-translate-y-1 hover:border-[#0068FF]/30"
                >
                  <div className="relative aspect-[4/3] w-full bg-[#112d52]">
                    {vehicle.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.brandName} ${vehicle.modelName}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl font-bold text-[#112d52]">
                        {vehicle.brandName.charAt(0)}
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-[#0068FF]/20 px-3 py-1 text-xs font-semibold text-[#0068FF] border border-[#0068FF]/30">
                      Oferta exclusiva
                    </span>
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0068FF] animate-pulse" />
                      Disponible
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[#5E6673] uppercase tracking-wide">
                      {vehicle.category} · {vehicle.fuelType}
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      {vehicle.brandName} {vehicle.modelName}
                    </p>
                    <p className="text-sm text-[#94b8cc]">{vehicle.version}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-2xl font-bold text-[#0068FF]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                        {vehicle.priceLabel}
                        <span className="text-sm font-normal text-[#94b8cc]">/mes</span>
                      </p>
                      <a
                        href={buildWhatsAppLink(`Hola, me interesa la oferta del ${vehicle.brandName} ${vehicle.modelName}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#0068FF] px-4 py-2 text-xs font-semibold text-[#061B3F] hover:brightness-110 transition-all"
                      >
                        Lo quiero
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── POR QUÉ ELEGIRNOS ─────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[#0068FF]/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            ¿Por qué elegir {brand.name}?
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#0068FF]/10 bg-[#0d2442] p-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0068FF]/10 text-[#0068FF]">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-[#94b8cc]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALES ─────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[#0068FF]/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-[#0068FF]/10 bg-[#0d2442] p-6">
                <div className="flex gap-0.5 text-[#0068FF]">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#94b8cc]">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0068FF]/15 text-sm font-bold text-[#0068FF]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-[#5E6673]">{t.info}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-[#0068FF]/10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Preguntas frecuentes
          </h2>
          <div className="divide-y divide-[#0068FF]/10">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                  {item.q}
                  <span className="shrink-0 text-[#0068FF] transition-transform group-open:rotate-45 text-lg">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#94b8cc] leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-[#0068FF]/10" style={{ background: "linear-gradient(135deg, #061B3F 0%, #0d2442 50%, #061B3F 100%)" }}>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 text-center sm:px-6">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#0068FF]">MOVILEASE® Smart Mobility Company</p>
          <h2 className="text-2xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            El futuro pertenece a quienes pueden moverse mejor.
          </h2>
          <p className="text-[#94b8cc]">
            Sin entrada · Gestión en 48h · Todo incluido en una cuota fija
          </p>
          <a
            href={buildWhatsAppLink("Hola, me gustaría información sobre renting de coches.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25d366] px-8 py-4 font-semibold text-white shadow-lg shadow-[#25d366]/20 transition-all hover:brightness-110"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hablar por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
